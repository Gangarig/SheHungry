import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createClient} from '@supabase/supabase-js';
const env=Object.fromEntries(readFileSync('apps/mobile/.env','utf8').split('\n').filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i),l.slice(i+1).replace(/^['"]|['"]$/g,'')]}));
const url=env.EXPO_PUBLIC_SUPABASE_URL,key=env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const client=()=>createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
const a=client(),b=client(),visitor=client(); const created=[];
const ok=(r)=>{assert.equal(r.error,null,JSON.stringify(r.error)); return r.data;};
try {
 const places=ok(await visitor.from('restaurants').select('id,name'));assert.equal(places.length,24);
 assert.ok((await visitor.from('swipes').select('*')).error);
 const sa=ok(await a.auth.signInAnonymously()).session;created.push(a);
 const sb=ok(await b.auth.signInAnonymously()).session;created.push(b);
 assert.ok(sa.user.is_anonymous&&sb.user.is_anonymous);assert.notEqual(sa.user.id,sb.user.id);
 const rid=places[0].id,requestId=crypto.randomUUID();
 const first=ok(await a.rpc('record_swipe',{p_restaurant_id:rid,p_decision:'like',p_request_id:requestId}));assert.equal(first[0].is_favourite,true);
 const retry=ok(await a.rpc('record_swipe',{p_restaurant_id:rid,p_decision:'like',p_request_id:requestId}));assert.equal(retry[0].swipe_id,first[0].swipe_id);
 assert.equal(ok(await a.from('swipes').select('*')).length,1);
 assert.equal(ok(await b.from('swipes').select('*')).length,0);
 assert.equal(ok(await b.from('favourites').select('*')).length,0);
 assert.ok((await b.from('swipes').insert({user_id:sa.user.id,restaurant_id:rid,decision:'like'})).error);
 assert.ok((await b.from('restaurants').update({name:'test'}).eq('id',rid)).error);
 assert.ok((await a.rpc('record_swipe',{p_restaurant_id:rid,p_decision:'skip',p_request_id:requestId})).error);
 ok(await a.from('beta_feedback').insert({user_id:sa.user.id,category:'idea',message:'Automated acceptance test; deleted during cleanup.'}));
 assert.equal(ok(await b.from('beta_feedback').select('*')).length,0);
 const exp=ok(await a.rpc('export_my_data'));assert.equal(exp.user_id,sa.user.id);assert.equal(exp.feedback.length,1);assert.equal(exp.swipes.length,1);
 for(let i=1;i<60;i++)ok(await a.rpc('record_swipe',{p_restaurant_id:places[i%24].id,p_decision:'skip',p_request_id:crypto.randomUUID()}));
 assert.match((await a.rpc('record_swipe',{p_restaurant_id:rid,p_decision:'skip',p_request_id:crypto.randomUUID()})).error.message,/rate limit/i);
 assert.match((await a.from('swipes').insert({user_id:sa.user.id,restaurant_id:rid,decision:'skip',created_at:'2000-01-01'})).error.message,/rate limit/i);
 const denied=await fetch(url+'/functions/v1/delete-account',{method:'POST',headers:{apikey:key,'Content-Type':'application/json'},body:JSON.stringify({confirmation:'DELETE'})});assert.equal(denied.status,401);
 const deleted=await a.functions.invoke('delete-account',{body:{confirmation:'DELETE'}});ok(deleted);assert.equal(deleted.data.deleted,true);
 assert.equal(ok(await a.from('swipes').select('*')).length,0);
 assert.ok((await a.rpc('record_swipe',{p_restaurant_id:rid,p_decision:'like'})).error);
 assert.ok((await a.rpc('export_my_data')).error);
 console.log('PASS: catalogue, guest identities, atomic saves, idempotent retry, cross-user isolation, direct-write limits, export, feedback privacy, deletion and stale-token rejection');
} finally {
 for(const c of created) { const {data}=await c.auth.getUser(); if(data.user){const r=await c.functions.invoke('delete-account',{body:{confirmation:'DELETE'}});assert.equal(r.error,null,'Test account cleanup failed');} }
}
