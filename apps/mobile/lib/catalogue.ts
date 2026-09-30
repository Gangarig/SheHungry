import { randomUUID } from 'expo-crypto';
import { Linking } from 'react-native';
import { supabase, supabaseConfigurationError } from './supabase';

export type DiscoveryRestaurant = { id:string; name:string; cuisine:string; neighbourhood:string; imageUrl:string|null; description:string; address:string|null };
export type SwipeDecision = 'like' | 'skip';
export type SignInProvider = 'google' | 'apple';
function client() { if (!supabase) throw Error(supabaseConfigurationError ?? 'Connection unavailable'); return supabase; }
const safeUrl = (value:string|null) => { if (!value) return null; try { const url = new URL(value); return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null; } catch { return null; } };

export function friendlyError(error:unknown) {
  const message = error && typeof error === 'object' && 'message' in error ? String(error.message) : '';
  if (/provider.*not.*enabled|unsupported.*provider/i.test(message)) return 'That sign-in option is not ready yet. Please try the other option.';
  if (/rate[_ ]limit|too many/i.test(message)) return 'Please wait a minute before trying again.';
  return 'We could not complete that request. Check your connection and try again.';
}

async function accountSession() {
  const c = client();
  const { data, error } = await c.auth.getSession();
  if (error) throw error;
  if (data.session?.user.is_anonymous) { await c.auth.signOut({ scope: 'local' }); return null; }
  return data.session;
}

export async function loadViennaDiscoveryDeck() {
  const c = client();
  const session = await accountSession();
  const [restaurantsResult, swipesResult] = await Promise.all([
    c.from('restaurants').select('id,name,cuisine_types,image_url,description,address,neighbourhood').eq('provider','manual').like('provider_place_id','vienna-%').order('name'),
    session ? c.from('swipes').select('restaurant_id') : Promise.resolve({ data:[], error:null }),
  ]);
  if (restaurantsResult.error) throw restaurantsResult.error;
  if (swipesResult.error) throw swipesResult.error;
  const seen = new Set((swipesResult.data ?? []).map((swipe) => swipe.restaurant_id));
  const restaurants = ((restaurantsResult.data ?? []) as any[]).map((place):DiscoveryRestaurant => ({
    id:place.id, name:place.name, cuisine:place.cuisine_types?.join(' · ') || 'Curated pick', neighbourhood:place.neighbourhood || 'Vienna', imageUrl:safeUrl(place.image_url), description:place.description || 'A curated Vienna restaurant.', address:place.address,
  }));
  return { restaurants:restaurants.filter((restaurant) => !seen.has(restaurant.id)), user:session ? { id:session.user.id } : null };
}

export const newRequestId = () => randomUUID();
export async function persistSwipe(restaurantId:string, decision:SwipeDecision, requestId:string) {
  const { error } = await client().rpc('record_swipe',{ p_restaurant_id:restaurantId, p_decision:decision, p_request_id:requestId });
  if (error) throw error;
}

export async function signIn(provider:SignInProvider) {
  const { data, error } = await client().auth.signInWithOAuth({ provider, options:{ redirectTo:'shehungry://auth', skipBrowserRedirect:true } });
  if (error) throw error;
  if (!data.url) throw Error('Could not start sign in.');
  await Linking.openURL(data.url);
}

export async function completeOAuthRedirect(url:string) {
  const c = client();
  const parsed = new URL(url);
  const hash = new URLSearchParams(parsed.hash.replace(/^#/, ''));
  const code = parsed.searchParams.get('code');
  if (code) { const { error } = await c.auth.exchangeCodeForSession(code); if (error) throw error; return; }
  const access_token = hash.get('access_token'), refresh_token = hash.get('refresh_token');
  if (!access_token || !refresh_token) throw Error('Sign in was not completed.');
  const { error } = await c.auth.setSession({ access_token, refresh_token });
  if (error) throw error;
}
