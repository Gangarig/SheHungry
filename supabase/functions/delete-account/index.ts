import { createClient } from 'npm:@supabase/supabase-js@2.117.2';

const headers = {
 'Access-Control-Allow-Origin': '*',
 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
 'Access-Control-Allow-Methods': 'POST, OPTIONS',
 'Content-Type': 'application/json', 'Cache-Control': 'no-store',
};
const reply = (status: number, body: unknown) => new Response(JSON.stringify(body), {status, headers});
Deno.serve(async (req: Request) => {
 if(req.method==='OPTIONS') return new Response(null,{status:204,headers});
 if(req.method!=='POST') return reply(405,{error:'Method not allowed'});
 const token=req.headers.get('Authorization')?.match(/^Bearer (.+)$/i)?.[1];
 if(!token) return reply(401,{error:'Sign in before deleting your data'});
 try {
  const body=await req.json();
  if(body?.confirmation!=='DELETE') return reply(400,{error:'Explicit deletion confirmation required'});
  const url=Deno.env.get('SUPABASE_URL')!;
  const admin=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  // Never trust a client-supplied user ID or a merely decoded JWT.
  const {data:{user},error}=await admin.auth.getUser(token);
  if(error||!user) return reply(401,{error:'Your session is no longer valid'});
  const userClient=createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:`Bearer ${token}`}},auth:{persistSession:false}});
  const check=await userClient.rpc('export_my_data');
  if(check.error) return reply(401,{error:'An active session is required'});
  // Hard deletion cascades through sessions, refresh tokens, swipes, favourites
  // and feedback in one DB transaction. RLS also checks session existence, so
  // an old access token cannot regain access during its remaining lifetime.
  const deleted=await admin.auth.admin.deleteUser(user.id);
  if(deleted.error) return reply(500,{error:'Deletion did not complete. Please retry.'});
  return reply(200,{deleted:true});
 } catch {return reply(500,{error:'Could not complete deletion. Please retry.'});}
});
