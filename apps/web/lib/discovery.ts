import { requireSupabaseClient } from './supabase';

export type SwipeDecision = 'like' | 'skip';
export type SignInProvider = 'google' | 'apple';

type RestaurantRow = {
  id: string; name: string; cuisine_types: string[] | null;
  image_url: string | null; neighbourhood: string | null; description: string | null; address: string | null;
};
export type Restaurant = { id: string; name: string; cuisines: string[]; imageUrl: string | null; neighbourhood: string | null; description: string | null; address: string | null };
export type DiscoveryData = { restaurants: Restaurant[]; user: { id: string } | null };

function safeImageUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch { return null; }
}

function toRestaurant(row: RestaurantRow): Restaurant {
  return {
    id: row.id, name: row.name, cuisines: row.cuisine_types ?? [], imageUrl: safeImageUrl(row.image_url), neighbourhood: row.neighbourhood, description: row.description, address: row.address,
  };
}

export function friendlyError(error: unknown): string {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (/provider.*not.*enabled|unsupported.*provider/i.test(message)) return 'That sign-in option is not ready yet. Please try the other option.';
  if (/rate|too many|429|rate_limited/i.test(message)) return 'Please wait a minute, then try again.';
  if (/fetch|network|offline|timeout/i.test(message)) return 'We could not reach SheHungry. Check your connection and try again.';
  return 'We could not complete that request. Please try again.';
}

async function accountSession() {
  const client = requireSupabaseClient();
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  if (data.session?.user.is_anonymous) {
    await client.auth.signOut({ scope: 'local' });
    return null;
  }
  return data.session;
}

export async function loadDiscoveryData(): Promise<DiscoveryData> {
  const client = requireSupabaseClient();
  const session = await accountSession();
  const [catalogueResult, historyResult] = await Promise.all([
    client.from('restaurants').select('id, name, cuisine_types, image_url, neighbourhood, description, address')
      .eq('provider', 'manual').like('provider_place_id', 'vienna-%').order('name').abortSignal(AbortSignal.timeout(20_000)),
    session ? client.from('swipes').select('restaurant_id').abortSignal(AbortSignal.timeout(20_000)) : Promise.resolve({ data: [], error: null }),
  ]);
  if (catalogueResult.error) throw catalogueResult.error;
  if (historyResult.error) throw historyResult.error;
  const restaurants = ((catalogueResult.data ?? []) as RestaurantRow[]).map(toRestaurant);
  const seen = new Set((historyResult.data ?? []).map((row) => row.restaurant_id));
  return {
    restaurants: restaurants.filter((restaurant) => !seen.has(restaurant.id)),
    user: session ? { id: session.user.id } : null,
  };
}

export async function recordSwipe(restaurantId: string, decision: SwipeDecision, requestId: string) {
  const { data, error } = await requireSupabaseClient().rpc('record_swipe', { p_restaurant_id: restaurantId, p_decision: decision, p_request_id: requestId }).abortSignal(AbortSignal.timeout(20_000));
  if (error) throw error;
  const result = Array.isArray(data) ? data[0] : data;
  return { isFavourite: Boolean(result?.is_favourite) };
}

export async function signIn(provider: SignInProvider) {
  const { error } = await requireSupabaseClient().auth.signInWithOAuth({ provider, options: { redirectTo: window.location.href.split('#')[0] } });
  if (error) throw error;
}
