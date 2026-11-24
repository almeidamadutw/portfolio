'use strict';
const {randomBytes, createHash} = require('node:crypto');
const COOKIE='__Host-linha90-session', REFRESH='__Host-linha90-refresh', PKCE='__Host-linha90-pkce';
function config(req){
  const url=process.env.SUPABASE_URL||'https://blhtbiogihdwbyntzeib.supabase.co';
  const key=process.env.SUPABASE_PUBLISHABLE_KEY||'sb_publishable_rNEytfVnQQUSMSFbQrMgIg_cD8DEU_K';
  const allowed=[process.env.APP_ORIGIN,'https://linha90.vercel.app',process.env.VERCEL_URL&&'https://'+process.env.VERCEL_URL,process.env.VERCEL_PROJECT_PRODUCTION_URL&&'https://'+process.env.VERCEL_PROJECT_PRODUCTION_URL].filter(Boolean);
  try{const u=new URL(url);const origins=allowed.map(x=>new URL(x)).filter(x=>x.protocol==='https:').map(x=>x.origin);const hostOrigin='https://'+req.headers.host;const origin=origins.includes(hostOrigin)?hostOrigin:origins[0];if(!key||u.protocol!=='https:'||!origin)return null;return{url:u.origin,key,origin}}catch{return null}
}
const cookie=(name,value,maxAge)=>name+'='+encodeURIComponent(value)+'; Path=/; Max-Age='+maxAge+'; HttpOnly; Secure; SameSite=Lax';
function readCookie(req,name){const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(name+'='))?.slice(name.length+1)||'';try{return decodeURIComponent(raw)}catch{return ''}}
const clearCookies=()=>[cookie(COOKIE,'',0),cookie(REFRESH,'',0),cookie(PKCE,'',0)];
function sessionCookies(data){return[cookie(COOKIE,data.access_token,Math.min(3600,Number(data.expires_in)||3600)),cookie(REFRESH,data.refresh_token,30*24*60*60),cookie(PKCE,'',0)]}
async function auth(c,path,{method='GET',body,token}={}){const headers={apikey:c.key,Accept:'application/json'};if(token)headers.Authorization='Bearer '+token;if(body)headers['Content-Type']='application/json';const res=await fetch(c.url+'/auth/v1/'+path,{method,headers,body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});let data={};try{data=await res.json()}catch{}return{ok:res.ok,status:res.status,data}}
function profile(u){
  if(!u?.id||!u.email_confirmed_at)return null;
  const a=u.app_metadata||{}, admin=a.linha90_role==='admin';
  const seller=a.linha90_role==='seller'&&/^[a-z0-9][a-z0-9_-]{0,39}$/.test(a.linha90_store_id||'');
  return{id:u.id,name:String(u.user_metadata?.name||u.user_metadata?.full_name||'').slice(0,80),email:u.email||'',admin,seller,role:admin?'admin':seller?'seller':'customer',storeId:seller?a.linha90_store_id:null,login:seller?String(a.linha90_login||''):u.email||''};
}
function loginEmail(input){
  if(typeof input!=='string'||input.length>254)return null;
  const value=input.trim().toLowerCase();
  const alias=/^([a-z0-9][a-z0-9_-]{0,39})\/([a-z0-9][a-z0-9_-]{0,39})@linha90$/.exec(value);
  if(alias)return{email:alias[1]+'.'+alias[2]+'@vendedores.linha90.invalid',alias:true};
  if(!/^\S+@\S+\.\S+$/.test(value)||value.endsWith('@vendedores.linha90.invalid'))return null;
  return{email:value,alias:false};
}
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');
  const c=config(req);if(!c)return res.status(503).json({error:'Serviço de conta indisponível.'});
  if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Método inválido.'})}
  try{
    let token=readCookie(req,COOKIE);
    if(req.method==='GET'){
      const settings=await auth(c,'settings');
      const providers={google:settings.ok&&settings.data.external?.google===true};
      let r=token?await auth(c,'user',{token}):null;
      if((!token||r?.status===401||r?.status===403)&&readCookie(req,REFRESH)){
        const fresh=await auth(c,'token?grant_type=refresh_token',{method:'POST',body:{refresh_token:readCookie(req,REFRESH)}});
        if(fresh.ok&&fresh.data.access_token&&fresh.data.refresh_token){res.setHeader('Set-Cookie',sessionCookies(fresh.data));return res.status(200).json({profile:profile(fresh.data.user),providers})}
        if(fresh.status>=500)return res.status(503).json({error:'Serviço de conta indisponível.'});
        res.setHeader('Set-Cookie',clearCookies());return res.status(200).json({profile:null,providers});
      }
      if(!token)return res.status(200).json({profile:null,providers});
      if(r.status===401||r.status===403){res.setHeader('Set-Cookie',clearCookies());return res.status(200).json({profile:null,providers})}
      if(!r.ok)return res.status(503).json({error:'Serviço de conta indisponível.'});
      return res.status(200).json({profile:profile(r.data),providers});
    }
    if(req.headers.origin!==c.origin)return res.status(403).json({error:'Origem não autorizada.'});
    if(!String(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'Formato inválido.'});
    const action=req.query?.action, body=req.body||{};
    if(action==='logout'){if(token)await auth(c,'logout?scope=local',{method:'POST',token});res.setHeader('Set-Cookie',clearCookies());return res.status(200).json({ok:true})}
    if(action==='google'){
      const settings=await auth(c,'settings');
      if(!settings.ok||!settings.data.external?.google)return res.status(409).json({error:'O acesso com Google ainda não está disponível. Entre com e-mail e senha.'});
      const verifier=randomBytes(48).toString('base64url'), challenge=createHash('sha256').update(verifier).digest('base64url');
      res.setHeader('Set-Cookie',cookie(PKCE,verifier,600));
      const url=new URL(c.url+'/auth/v1/authorize');
      url.search=new URLSearchParams({provider:'google',redirect_to:c.origin+'/conta.html',code_challenge:challenge,code_challenge_method:'s256'}).toString();
      return res.status(200).json({url:url.href});
    }
    if(action==='oauth'){
      const verifier=readCookie(req,PKCE);
      if(!verifier||typeof body.code!=='string'||!body.code||body.code.length>2048)return res.status(400).json({error:'O acesso com Google expirou. Tente novamente.'});
      const r=await auth(c,'token?grant_type=pkce',{method:'POST',body:{auth_code:body.code,code_verifier:verifier}});
      res.setHeader('Set-Cookie',cookie(PKCE,'',0));
      if(!r.ok||!r.data.access_token||!r.data.refresh_token||!profile(r.data.user))return res.status(401).json({error:'Não foi possível concluir o acesso com Google. Tente novamente.'});
      res.setHeader('Set-Cookie',sessionCookies(r.data));return res.status(200).json({profile:profile(r.data.user)});
    }
    if(!['signup','login'].includes(action))return res.status(400).json({error:'Ação inválida.'});
    const identity=loginEmail(body.identifier||body.email),{password,name}=body;
    if(!identity||typeof password!=='string'||password.length<8||password.length>128)return res.status(400).json({error:'Confira o login e a senha (8 a 128 caracteres).'});
    if(action==='signup'){
      if(identity.alias||typeof name!=='string'||!name.trim()||name.length>80)return res.status(400).json({error:'Informe seu nome e um e-mail válido para criar sua conta.'});
      const r=await auth(c,'signup?redirect_to='+encodeURIComponent(c.origin+'/conta.html'),{method:'POST',body:{email:identity.email,password,data:{name:name.trim()}}});
      if(r.status===429)return res.status(429).json({error:'Muitas tentativas. Tente novamente mais tarde.'});
      if(!r.ok)return res.status(400).json({error:'Não foi possível solicitar o cadastro. Confira os dados.'});
      // Google and public signups never assign seller/admin permissions.
      return res.status(200).json({ok:true});
    }
    const r=await auth(c,'token?grant_type=password',{method:'POST',body:{email:identity.email,password}});
    if(r.status===429)return res.status(429).json({error:'Muitas tentativas. Tente novamente mais tarde.'});
    if(!r.ok||!r.data.access_token||!r.data.refresh_token)return res.status(401).json({error:'Login ou senha inválidos, ou e-mail ainda não confirmado.'});
    const p=profile(r.data.user);
    if(!p)return res.status(403).json({error:'Confirme seu e-mail antes de entrar.'});
    if((identity.alias||body.access==='seller')&&!p.seller&&!p.admin)return res.status(403).json({error:'Esta conta não possui acesso de vendedor.'});
    res.setHeader('Set-Cookie',sessionCookies(r.data));return res.status(200).json({profile:p});
  }catch{return res.status(503).json({error:'Serviço de conta temporariamente indisponível.'})}
};
