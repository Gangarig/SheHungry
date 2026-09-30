import type { Session } from '@supabase/supabase-js';
import { requireSupabaseClient } from './supabase';

export type SwipeDecision = 'like' | 'skip';
export type SignInProvider = 'google' | 'apple';
export const signInProviders = (process.env.NEXT_PUBLIC_AUTH_PROVIDERS ?? '')
  .split(',').map((provider) => provider.trim())
  .filter((provider): provider is SignInProvider => provider === 'google' || provider === 'apple');
export const captchaSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const catalogueCacheMs = 5 * 60_000;
let catalogueCache: { rows: RestaurantRow[]; at: number } | null = null;
let nextMutationAt = 0;

type RestaurantRow = {
  id: string; name: string; latitude: number; longitude: number;
  cuisine_types: string[] | null; image_url: string | null; rating: number | null;
  price_level: number | null; address: string | null; neighbourhood: string | null;
  website_url: string | null; description: string | null; tags: string[] | null;
};
export type Restaurant = {
  id: string; name: string; latitude: number; longitude: number; cuisines: string[];
  imageUrl: string | null; rating: number | null; priceLevel: number | null;
  address: string | null; neighbourhood: string | null; websiteUrl: string | null;
  description: string | null; tags: string[];
};
export type DiscoveryData = {
  restaurants: Restaurant[]; allRestaurants: Restaurant[]; favourites: Restaurant[];
  user: { id: string; isGuest: boolean } | null; sessionError: string | null;
};

export function safeWebsiteUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch { return null; }
}

function toRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id, name: row.name, latitude: row.latitude, longitude: row.longitude,
    cuisines: row.cuisine_types ?? [], imageUrl: safeWebsiteUrl(row.image_url), rating: row.rating,
    priceLevel: row.price_level, address: row.address, neighbourhood: row.neighbourhood,
    websiteUrl: safeWebsiteUrl(row.website_url), description: row.description, tags: row.tags ?? [],
  };
}

export function friendlyError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error
    ? String(error.message) : '';
  if (/anonymous.*disabled|anonymous.*not.*enabled/i.test(message))
    return 'Guest access is not available yet. You can browse the places below; saving will return when guest access is enabled.';
  if (/captcha|verification_required/i.test(message))
    return 'Complete the security check to start saving places.';
  if (/rate|too many|429|rate_limited/i.test(message))
    return 'A few too many requests arrived at once. Please wait a minute, then try again.';
  if (/fetch|network|offline|timeout/i.test(message))
    return 'We could not reach the service. Check your connection and try again.';
  return 'We could not complete that request. Please try again in a moment.';
}

function limitClientMutation() {
  const now = Date.now();
  if (now < nextMutationAt) throw new Error('rate_limited');
  nextMutationAt = now + 600;
}

let sessionRequest: Promise<Session> | null = null;
export function ensureGuestSession(captchaToken?: string): Promise<Session> {
  if (sessionRequest) return sessionRequest;
  sessionRequest = (async () => {
    const client = requireSupabaseClient();
    const { data: existing, error: existingError } = await client.auth.getSession();
    if (existingError) throw existingError;
    if (existing.session) return existing.session;
    if (captchaSiteKey && !captchaToken) throw new Error('verification_required');
    const { data, error } = await client.auth.signInAnonymously({
      options: captchaToken ? { captchaToken } : undefined,
    });
    if (error) throw error;
    if (!data.session) throw new Error('Could not start a guest session.');
    return data.session;
  })().finally(() => { sessionRequest = null; });
  return sessionRequest;
}

export async function loadDiscoveryData(captchaToken?: string): Promise<DiscoveryData> {
  const client = requireSupabaseClient();
  let session: Session | null = null;
  let sessionError: string | null = null;
  try { session = await ensureGuestSession(captchaToken); }
  catch (error) { sessionError = friendlyError(error); }

  const cached = catalogueCache && Date.now() - catalogueCache.at < catalogueCacheMs ? catalogueCache.rows : null;
  const [catalogueResult, historyResult, favouritesResult] = await Promise.all([
    cached ? Promise.resolve({ data: cached, error: null }) : client.from('restaurants')
      .select('id, name, latitude, longitude, cuisine_types, image_url, rating, price_level, address, neighbourhood, website_url, description, tags')
      .eq('provider', 'manual').like('provider_place_id', 'vienna-%').order('name').abortSignal(AbortSignal.timeout(20_000)),
    session ? client.from('swipes').select('restaurant_id').abortSignal(AbortSignal.timeout(20_000)) : Promise.resolve({ data: [], error: null }),
    session ? client.from('favourites').select('restaurant_id, created_at').order('created_at', { ascending: false }).abortSignal(AbortSignal.timeout(20_000)) : Promise.resolve({ data: [], error: null }),
  ]);
  if (catalogueResult.error) throw catalogueResult.error;
  if (historyResult.error) throw historyResult.error;
  if (favouritesResult.error) throw favouritesResult.error;
  const rows = (catalogueResult.data ?? []) as RestaurantRow[];
  if (!cached) catalogueCache = { rows, at: Date.now() };
  const allRestaurants = rows.map(toRestaurant);
  const byId = new Map(allRestaurants.map((restaurant) => [restaurant.id, restaurant]));
  const seen = new Set((historyResult.data ?? []).map((row) => row.restaurant_id));
  const favourites = (favouritesResult.data ?? []).map((row) => byId.get(row.restaurant_id))
    .filter((restaurant): restaurant is Restaurant => Boolean(restaurant));
  return {
    restaurants: allRestaurants.filter((restaurant) => !seen.has(restaurant.id)), allRestaurants, favourites,
    user: session ? { id: session.user.id, isGuest: Boolean(session.user.is_anonymous) } : null, sessionError,
  };
}

export async function recordSwipe(restaurantId: string, decision: SwipeDecision, requestId: string) {
  limitClientMutation();
  const { data, error } = await requireSupabaseClient().rpc('record_swipe', {
    p_restaurant_id: restaurantId, p_decision: decision, p_request_id: requestId,
  }).abortSignal(AbortSignal.timeout(20_000));
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { isFavourite: Boolean(result?.is_favourite) };
}

export async function removeFavourite(restaurantId: string) {
  limitClientMutation();
  const { error } = await requireSupabaseClient().from('favourites').delete().eq('restaurant_id', restaurantId)
    .abortSignal(AbortSignal.timeout(20_000));
  if (error) throw error;
}

export async function exportMyData() {
  const { data, error } = await requireSupabaseClient().rpc('export_my_data').abortSignal(AbortSignal.timeout(20_000));
  if (error) throw error;
  return data;
}

export async function deleteMyAccount() {
  const client = requireSupabaseClient();
  const { data, error } = await client.functions.invoke('delete-account', { body: { confirmation: 'DELETE' } });
  if (error || data?.error) throw error ?? new Error(data.error);
  await client.auth.signOut({ scope: 'local' });
}

export async function connectProvider(provider: SignInProvider) {
  if (!signInProviders.includes(provider)) throw new Error('This sign-in option is not available.');
  const client = requireSupabaseClient();
  const { data, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH?.replace(/^\/+|\/+$/g, '') ?? '';
  const options = { redirectTo: `${window.location.origin}/${basePath ? `${basePath}/` : ''}` };
  // Linking preserves the guest's user ID and saved places.
  const result = data.session?.user.is_anonymous
    ? await client.auth.linkIdentity({ provider, options })
    : await client.auth.signInWithOAuth({ provider, options });
  if (result.error) throw result.error;
}
