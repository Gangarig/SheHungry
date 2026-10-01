'use client';
import {useCallback,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {loadDiscoveryData,recordSwipe,removeFavourite,exportMyData,deleteMyAccount,connectProvider,signInProviders,captchaSiteKey,friendlyError,type Restaurant,type SwipeDecision} from '../lib/discovery';
import {requireSupabaseClient} from '../lib/supabase';
import {Captcha} from './security-check';

type Panel='saved'|'details'|'account'|'feedback'|null;
function Modal({title,children,onClose}:{title:string;children:ReactNode;onClose:()=>void}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const d=ref.current; d?.showModal();return()=>d?.close();},[]);
 return <dialog ref={ref} className="modal" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}><div className="panel-heading"><h2>{title}</h2><button autoFocus className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button></div>{children}</dialog>;
}
export default function DiscoveryPage(){
 const [catalogue,setCatalogue]=useState<Restaurant[]>([]),[saved,setSaved]=useState<Restaurant[]>([]);
 const [loading,setLoading]=useState(true),[loadError,setLoadError]=useState<string|null>(null),[notice,setNotice]=useState('');
 const [user,setUser]=useState<{id:string;isGuest:boolean}|null>(null),[panel,setPanel]=useState<Panel>(null);
 const [busy,setBusy]=useState(false),[drag,setDrag]=useState(0);
 const [location,setLocation]=useState<{latitude:number;longitude:number}|null>(null);
 const [captchaToken,setCaptchaToken]=useState<string>(),[captchaEpoch,setCaptchaEpoch]=useState(0);
 const [deleteConfirm,setDeleteConfirm]=useState(''),[feedback,setFeedback]=useState(''),[category,setCategory]=useState('idea');
 const locked=useRef(false),start=useRef<number|null>(null),generation=useRef(0);
 const reload=useCallback(async(token?:string)=>{
  const current=++generation.current;setLoading(true);setLoadError(null);
  try{const d=await loadDiscoveryData(token);if(current!==generation.current)return;setCatalogue(d.restaurants);setSaved(d.favourites);setUser(d.user);setNotice(d.sessionError??'');}
  catch(e){if(current===generation.current)setLoadError(friendlyError(e));}
  finally{if(current===generation.current)setLoading(false);}
 },[]);
 useEffect(()=>{void reload();return()=>{generation.current++;};},[reload]);
 const deck=useMemo<Restaurant[]>(()=>{
  if(!location)return catalogue;
  const distance=(r:Restaurant)=>Math.hypot((r.latitude-location.latitude)*111,(r.longitude-location.longitude)*74);
  return [...catalogue].sort((a,b)=>distance(a)-distance(b));
 },[catalogue,location]);
  const restaurant=deck[0];
 const decide=useCallback(async(decision:SwipeDecision)=>{
  if(!restaurant||locked.current||!user)return;
  locked.current=true;setBusy(true);setNotice('');setDrag(0);
  const key=`shehungry.request.${user.id}.${restaurant.id}.${decision}`;
  let requestId=crypto.randomUUID();
  try{const stored=sessionStorage.getItem(key);if(stored)requestId=stored as `${string}-${string}-${string}-${string}-${string}`;else sessionStorage.setItem(key,requestId);}catch{/* Retry identity still works during this call. */}
  try{const result=await recordSwipe(restaurant.id,decision,requestId);
   setSaved(s=>result.isFavourite?[restaurant,...s.filter(r=>r.id!==restaurant.id)]:s.filter(r=>r.id!==restaurant.id));
   setCatalogue(s=>s.filter(r=>r.id!==restaurant.id));try{sessionStorage.removeItem(key);}catch{}
  }catch(e){setNotice(`${friendlyError(e)} Your card is still here; tap again to retry.`);}
  finally{setBusy(false);locked.current=false;}
 },[restaurant,user]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(panel||e.defaultPrevented||(e.target as HTMLElement)?.closest('input,textarea,select,button,a,[contenteditable]'))return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();void decide(e.key==='ArrowRight'?'like':'skip');}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[decide,panel]);
 async function action(fn:()=>Promise<void>){if(locked.current)return;locked.current=true;setBusy(true);setNotice('');try{await fn();}catch(e){setNotice(friendlyError(e));}finally{locked.current=false;setBusy(false);}}
 function locate(){if(!navigator.geolocation){setNotice('Location is not available in this browser.');return;}navigator.geolocation.getCurrentPosition(p=>setLocation({latitude:p.coords.latitude,longitude:p.coords.longitude}),()=>setNotice('Location is unavailable. You can still browse every Vienna pick.'),{enableHighAccuracy:false,timeout:10000,maximumAge:600000});}
 async function download(){const data=await exportMyData();const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='shehungry-my-data.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 const feedbackForm=<form onSubmit={e=>{e.preventDefault();void action(async()=>{if(!user)throw Error('Sign in required');const {error}=await requireSupabaseClient().from('beta_feedback').insert({user_id:user.id,category,message:feedback.trim()});if(error)throw error;setFeedback('');setNotice('Thank you—your feedback was saved for the SheHungry team.');setPanel(null);});}}><p>What worked? What would make finding dinner easier? Only you and the beta team can read your feedback.</p><label>Topic<select value={category} onChange={e=>setCategory(e.target.value)}><option value="idea">Idea</option><option value="bug">Something went wrong</option><option value="restaurant">Restaurant correction</option><option value="other">Other</option></select></label><label>Your feedback<textarea required minLength={5} maxLength={2000} rows={5} value={feedback} onChange={e=>setFeedback(e.target.value)} placeholder="Tell us what you think. Please leave out sensitive personal details."/></label><p className="hint">{feedback.length}/2000 · Up to 5 submissions per day</p><button className="primary-button" disabled={busy||!user}>Send feedback</button></form>;
 return <main className="app">
  <header className="app-header"><a className="brand" href="/">she<span>hungry</span></a><button className="saved" onClick={()=>setPanel('saved')}>Saved <b>{saved.length}</b></button></header>
  <section className="intro"><p className="eyebrow">Vienna · friends beta</p><h1>Follow your appetite.</h1><p>A local list. A little instinct. Your next favourite table.</p></section>
  <div className="filter-bar"><button className="secondary-button" onClick={locate} disabled={busy}>{location?'Nearest first':'Use my location'}</button></div>
  {notice&&<p className="save-notice" role="status">{notice}</p>}
  {!user&&!loading&&!loadError&&<div className="guest-start"><p>Start a guest session to save places. No email needed.</p>{captchaSiteKey&&<Captcha key={captchaEpoch} onToken={setCaptchaToken}/>}<button className="primary-button" disabled={busy||Boolean(captchaSiteKey&&!captchaToken)} onClick={()=>{void reload(captchaToken);setCaptchaToken(undefined);setCaptchaEpoch(e=>e+1);}}>Start saving</button></div>}
  {loading?<section className="state-card" role="status"><h2>Setting your table…</h2></section>:loadError?<section className="state-card" role="alert"><h2>We couldn’t set the table.</h2><p>{loadError}</p><button className="primary-button" onClick={()=>void reload()}>Try again</button></section>:restaurant?<>
   <section className="deck" aria-label="Restaurant discovery"><article className={`card${restaurant.imageUrl?'':' card--fallback'}`} style={{transform:`translateX(${drag}px) rotate(${drag/30}deg)`}}
    onPointerDown={e=>{if(busy||!user||e.button!==0)return;start.current=e.clientX;e.currentTarget.setPointerCapture(e.pointerId);}}
    onPointerMove={e=>{if(start.current!==null)setDrag(e.clientX-start.current);}}
    onPointerUp={e=>{const delta=start.current===null?0:e.clientX-start.current;start.current=null;setDrag(0);if(Math.abs(delta)>96)void decide(delta>0?'like':'skip');}}
    onPointerCancel={()=>{start.current=null;setDrag(0);}}>
    {restaurant.imageUrl?<img className="card-image" src={restaurant.imageUrl} alt="" onError={e=>{e.currentTarget.style.display='none';}}/>:<div className="fallback-art" aria-hidden="true"/>}<div className="card-scrim"/><div className="rating">{restaurant.neighbourhood??'Vienna'}</div><div className="card-bottom"><p className="neighbourhood">{restaurant.neighbourhood??'Vienna'}</p><h2>{restaurant.name}</h2><p className="meta">{restaurant.cuisines.join(' · ')} · {restaurant.priceLevel?'€'.repeat(Math.min(4,restaurant.priceLevel)):'Price not listed'}</p><p className="description">{restaurant.description}</p><div className="tags">{restaurant.tags.slice(0,4).map(t=><span key={t}>{t}</span>)}</div></div>
   </article></section><section className="actions" aria-label="Restaurant decision"><button className="skip" disabled={busy||!user} aria-label={`Skip ${restaurant.name}`} onClick={()=>void decide('skip')}>×</button><button className="details" disabled={busy} onClick={()=>setPanel('details')}>Details</button><button className="like" disabled={busy||!user} aria-label={`Save ${restaurant.name}`} onClick={()=>void decide('like')}>♡</button></section><p className="hint" role="status">{busy?'Saving your choice…':'← skip · → save · drag or use the buttons'}</p>
  </>:<section className="state-card empty"><h2>You’ve seen every pick.</h2><p>Your saved places are ready whenever you are.</p><div className="state-actions"><button className="primary-button" onClick={()=>setPanel('saved')}>See saved places</button><button className="secondary-button" onClick={()=>void reload()}>Refresh list</button></div></section>}
  <footer className="beta-footer"><button onClick={()=>setPanel('feedback')}>Share feedback</button><button onClick={()=>setPanel('account')}>My data</button><a href="/privacy/">Privacy</a><a href="/support/">Support</a><p>Curated picks, not live opening hours. Check directly before visiting.</p></footer>
  {panel&&<Modal title={panel==='saved'?'Saved places':panel==='details'?restaurant?.name??'Details':panel==='feedback'?'Help shape SheHungry':'Your guest data'} onClose={()=>{if(!busy)setPanel(null);}}>
   {notice&&<p role="status" className="save-notice">{notice}</p>}
   {panel==='saved'&&(saved.length?<ul className="saved-list">{saved.map(r=><li key={r.id}><div><strong>{r.name}</strong><span>{r.neighbourhood}</span></div><div className="saved-actions">{r.websiteUrl&&<a href={r.websiteUrl} target="_blank" rel="noreferrer">Visit</a>}<button disabled={busy} aria-label={`Remove ${r.name}`} onClick={()=>void action(async()=>{await removeFavourite(r.id);setSaved(s=>s.filter(x=>x.id!==r.id));})}>Remove</button></div></li>)}</ul>:<p>Save a place with the heart button to keep it here.</p>)}
   {panel==='details'&&restaurant&&<><p>{restaurant.description}</p><p>{restaurant.address}</p>{restaurant.websiteUrl&&<a className="primary-button" href={restaurant.websiteUrl} target="_blank" rel="noreferrer">Visit restaurant website</a>}</>}
   {panel==='feedback'&&feedbackForm}
   {panel==='account'&&<><p>{user?.isGuest?'Your guest session belongs to this browser. Clearing browser data can make your saved places inaccessible.':'Your data is private to your session.'} Location sorting stays on your device.</p>{signInProviders.map(provider=><button className="secondary-button" key={provider} disabled={busy} onClick={()=>void action(()=>connectProvider(provider))}>Continue with {provider==='google'?'Google':'Apple'}</button>)}<p><button className="secondary-button" disabled={busy||!user} onClick={()=>void action(download)}>Download my data</button></p><hr/><h3>Delete my data</h3><p>This permanently removes this identity, swipes, saved places and feedback. You can start fresh afterward.</p><label>Type DELETE to confirm<input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} autoComplete="off"/></label><button className="danger-button" disabled={busy||!user||deleteConfirm!=='DELETE'} onClick={()=>void action(async()=>{await deleteMyAccount();setUser(null);setSaved([]);setCatalogue([]);setDeleteConfirm('');setPanel(null);setNotice('Your identity and data were deleted. Start a new guest session whenever you like.');})}>Delete my data permanently</button></>}
  </Modal>}
 </main>;
}
