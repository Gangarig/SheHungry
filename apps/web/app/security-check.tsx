'use client';
import {useEffect,useRef} from 'react';
import {captchaSiteKey} from '../lib/discovery';
type Turnstile={render:(el:HTMLElement,options:Record<string,unknown>)=>string;remove:(id:string)=>void};
declare global {interface Window {turnstile?:Turnstile}}
export function Captcha({onToken}:{onToken:(token:string|undefined)=>void}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{let id:string|undefined;let cancelled=false;const render=()=>{if(!cancelled&&ref.current&&window.turnstile&&!id)id=window.turnstile.render(ref.current,{sitekey:captchaSiteKey,callback:(token:string)=>onToken(token),'expired-callback':()=>onToken(undefined),'error-callback':()=>onToken(undefined)});};
 let script=document.querySelector<HTMLScriptElement>('#turnstile-script');if(!script){script=document.createElement('script');script.id='turnstile-script';script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;document.head.append(script);}script.addEventListener('load',render);render();return()=>{cancelled=true;script?.removeEventListener('load',render);if(id)window.turnstile?.remove(id);};
 },[onToken]);return <div ref={ref} aria-label="Guest security check"/>;
}
