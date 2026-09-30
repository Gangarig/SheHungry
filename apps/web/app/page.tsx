'use client';

import { useEffect, useMemo, useState } from 'react';
import { restaurants, type Restaurant } from '@shehungry/core';
import { currentUser, sendMagicLink, signOut, watchAuth } from '../lib/auth';

type Viewer = { label: string; demo: boolean } | null;

export default function Home() {
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<string[]>([]);
  const [viewer, setViewer] = useState<Viewer>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [authOpen, setAuthOpen] = useState(false);
  const restaurant = restaurants[index];
  const savedRestaurants = useMemo(() => restaurants.filter((item) => saved.includes(item.id)), [saved]);

  useEffect(() => {
    void currentUser().then((user) => user && setViewer({ label: user.email ?? 'Signed in', demo: false }));
    return watchAuth((user) => setViewer(user ? { label: user.email ?? 'Signed in', demo: false } : null));
  }, []);

  function next() { setIndex((current) => (current + 1) % restaurants.length); }
  function save(item: Restaurant) {
    if (!viewer) { setAuthOpen(true); return; }
    setSaved((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]);
  }
  async function requestLink(event: React.FormEvent) {
    event.preventDefault();
    try { await sendMagicLink(email); setMessage('Check your inbox for your sign-in link.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not send that link.'); }
  }
  async function leave() { await signOut(); setViewer(null); setSaved([]); }

  return <main>
    <header><a className="brand" href="/">she<span>hungry</span></a><div className="header-actions"><span>{saved.length} saved</span>{viewer ? <button className="link-button" onClick={() => void leave()}>Sign out</button> : <button className="link-button" onClick={() => setAuthOpen(true)}>Sign in</button>}</div></header>
    <section className="intro"><p className="eyebrow">Vienna · demo catalogue</p><h1>What are you hungry for?</h1><p>Twenty fictional places, ready for the product before the real data arrives.</p></section>
    <section className="restaurant-card" aria-live="polite"><div className="card-top"><span>{restaurant.price}</span><span>{index + 1} / {restaurants.length}</span></div><div className="dish-orb">✦</div><p className="eyebrow">{restaurant.neighbourhood}</p><h2>{restaurant.name}</h2><p className="cuisine">{restaurant.cuisine}</p><p>{restaurant.description}</p><div className="signature"><span>Try</span><strong>{restaurant.signatureDish}</strong></div><div className="tags">{restaurant.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><div className="card-actions"><button className="secondary" onClick={next}>Not now</button><button className="primary" onClick={() => save(restaurant)}>{saved.includes(restaurant.id) ? 'Saved ✓' : 'Save place'}</button></div></section>
    {savedRestaurants.length > 0 && <section className="saved"><p className="eyebrow">Your list</p><h2>Saved for later</h2>{savedRestaurants.map((item) => <button key={item.id} onClick={() => setIndex(restaurants.indexOf(item))}>{item.name}<span>{item.cuisine}</span></button>)}</section>}
    {authOpen && <div className="modal-backdrop" role="presentation"><section className="auth-modal" role="dialog" aria-modal="true" aria-labelledby="auth-title"><button className="close" aria-label="Close" onClick={() => setAuthOpen(false)}>×</button><p className="eyebrow">Your SheHungry account</p><h2 id="auth-title">Save your next bite.</h2><p>Enter your email and we’ll send a secure sign-in link.</p><form onSubmit={requestLink}><label>Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><button className="primary" type="submit">Send sign-in link</button></form><button className="demo" onClick={() => { setViewer({ label: 'Demo guest', demo: true }); setAuthOpen(false); }}>Continue in demo mode</button>{message && <p className="message" role="status">{message}</p>}</section></div>}
  </main>;
}
