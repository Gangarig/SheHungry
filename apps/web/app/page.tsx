'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { friendlyError, loadDiscoveryData, recordSwipe, signIn, type Restaurant, type SignInProvider, type SwipeDecision } from '../lib/discovery';
import { requireSupabaseClient } from '../lib/supabase';

const previewLimit = 2;
const previewKey = 'shehungry.previewed';
function previewedIds() { try { return new Set<string>(JSON.parse(sessionStorage.getItem(previewKey) ?? '[]')); } catch { return new Set<string>(); } }
function rememberPreview(id: string) { const ids = previewedIds(); ids.add(id); try { sessionStorage.setItem(previewKey, JSON.stringify([...ids])); } catch { /* Browsing still works. */ } }

export default function DiscoveryPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]), [user, setUser] = useState<{ id: string } | null>(null), [loading, setLoading] = useState(true), [busy, setBusy] = useState(false), [authOpen, setAuthOpen] = useState(false), [infoOpen, setInfoOpen] = useState(false), [notice, setNotice] = useState(''), [drag, setDrag] = useState(0);
  const start = useRef<{ x:number; y:number } | null>(null), locked = useRef(false);
  const restaurant = restaurants[0];
  const reload = useCallback(async () => {
    setLoading(true);
    try { const data = await loadDiscoveryData(); const previewed = previewedIds(); setRestaurants(data.restaurants.filter((place) => !previewed.has(place.id))); setUser(data.user); if (data.user) { setAuthOpen(false); setBusy(false); } }
    catch (error) { setNotice(friendlyError(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    void reload();
    const { data: listener } = requireSupabaseClient().auth.onAuthStateChange((_event, session) => { if (session?.user && !session.user.is_anonymous) void reload(); });
    return () => listener.subscription.unsubscribe();
  }, [reload]);
  const decide = useCallback(async (decision: SwipeDecision) => {
    if (!restaurant || locked.current) return;
    if (!user) { if (previewedIds().size >= previewLimit) { setAuthOpen(true); return; } rememberPreview(restaurant.id); setRestaurants((current) => current.filter((place) => place.id !== restaurant.id)); return; }
    locked.current = true; setBusy(true); setNotice('');
    try { await recordSwipe(restaurant.id, decision, crypto.randomUUID()); setRestaurants((current) => current.filter((place) => place.id !== restaurant.id)); }
    catch (error) { setNotice(friendlyError(error)); }
    finally { locked.current = false; setBusy(false); }
  }, [restaurant, user]);
  useEffect(() => {
    const onKey = (event:KeyboardEvent) => { if (authOpen || infoOpen || event.target instanceof HTMLButtonElement) return; if (event.key === 'ArrowUp') setInfoOpen(true); if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); void decide(event.key === 'ArrowRight' ? 'like' : 'skip'); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, [authOpen, decide, infoOpen]);
  async function authenticate(provider:SignInProvider) { setBusy(true); setNotice(''); try { await signIn(provider); } catch (error) { setNotice(friendlyError(error)); setBusy(false); } }
  function onStart(event:React.PointerEvent<HTMLElement>) { if (!busy && !infoOpen && event.button === 0) { start.current = { x:event.clientX, y:event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); } }
  function onEnd(event:React.PointerEvent<HTMLElement>) { const point = start.current; start.current = null; setDrag(0); if (!point) return; const dx = event.clientX - point.x, dy = event.clientY - point.y; if (dy < -90 && Math.abs(dy) > Math.abs(dx)) { setInfoOpen(true); return; } if (Math.abs(dx) > 90 && Math.abs(dx) > Math.abs(dy)) void decide(dx > 0 ? 'like' : 'skip'); }
  if (loading) return <main className="full-state" aria-live="polite">Finding a good table…</main>;
  if (!restaurant) return <main className="full-state">{notice || 'No more picks right now.'}</main>;
  return <main className="swipe-app">
    {notice && <p className="toast" role="status">{notice}</p>}
    <article className={`swipe-card${restaurant.imageUrl ? '' : ' swipe-card--art'}`} style={{ transform:`translateX(${drag}px) rotate(${drag / 28}deg)` }} onPointerDown={onStart} onPointerMove={(event) => { if (start.current && Math.abs(event.clientX - start.current.x) > Math.abs(event.clientY - start.current.y)) setDrag(event.clientX - start.current.x); }} onPointerUp={onEnd} onPointerCancel={() => { start.current = null; setDrag(0); }}>
      {restaurant.imageUrl && <img src={restaurant.imageUrl} alt="" />}<div className="swipe-card__shade" /><div className="swipe-card__copy"><p>{restaurant.neighbourhood ?? 'Vienna'}</p><h1>{restaurant.name}</h1><span>{restaurant.cuisines.join(' · ') || 'Curated pick'}</span></div>
    </article>
    <div className="sr-only"><button onClick={() => void decide('skip')}>Skip {restaurant.name}</button><button onClick={() => void decide('like')}>Save {restaurant.name}</button><button onClick={() => setInfoOpen(true)}>Show details</button></div>
    {infoOpen && <section className="info-sheet" role="dialog" aria-label={`${restaurant.name} details`} onPointerDown={(event) => { start.current = { x:event.clientX, y:event.clientY }; }} onPointerUp={(event) => { if (start.current && event.clientY - start.current.y > 70) setInfoOpen(false); start.current = null; }}><span className="sheet-handle" /><p>{restaurant.neighbourhood ?? 'Vienna'}</p><h2>{restaurant.name}</h2><strong>{restaurant.cuisines.join(' · ') || 'Curated pick'}</strong>{restaurant.description && <p>{restaurant.description}</p>}{restaurant.address && <small>{restaurant.address}</small>}</section>}
    {authOpen && <section className="auth-gate" role="dialog" aria-modal="true" aria-labelledby="sign-in-title"><div><p className="wordmark">she<span>hungry</span></p><h2 id="sign-in-title">Keep discovering.</h2><p>Sign in to make every next swipe yours.</p><button className="google" disabled={busy} onClick={() => void authenticate('google')}><b>G</b> Continue with Google</button><button className="apple" disabled={busy} onClick={() => void authenticate('apple')}> Continue with Apple</button></div></section>}
  </main>;
}
