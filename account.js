'use strict';
const q=s=>document.querySelector(s);
let mode='login';
const seller=new URLSearchParams(location.search).get('acesso')==='vendedor';
const msg=s=>{q('#account-message').textContent=s};
if(seller){q('#account-heading').textContent='Área do vendedor';q('[data-mode=signup]').hidden=true;q('#identity-title').textContent='Loja / colaborador';q('[name=email]').placeholder='nomedaloja/colaborador@linha90';q('[name=email]').autocomplete='username';q('#identity-help').hidden=false;}
async function api(action,body){const res=await fetch('/api/account'+(action==='me'?'':'?action='+encodeURIComponent(action)),{method:action==='me'?'GET':'POST',credentials:'same-origin',cache:'no-store',headers:body?{'Content-Type':'application/json'}:undefined,body:body?JSON.stringify(body):undefined});let data;try{data=await res.json()}catch{throw new Error('Serviço de conta indisponível.')}if(!res.ok)throw new Error(data.error||'Não foi possível concluir a solicitação.');return data}
function show(profile){
  q('#auth-area').hidden=!!profile;q('#profile-area').hidden=!profile;q('#unavailable-area').hidden=true;
  if(profile){const canSell=profile.seller||profile.admin;q('#profile-name').textContent=profile.name||'Minha conta';q('#profile-email').textContent=profile.login||profile.email||'';q('#profile-role').textContent=profile.admin?'ADMINISTRADOR':profile.seller?'VENDEDOR · '+profile.storeId:'CLIENTE';q('#admin-link').hidden=!canSell;q('#admin-link').textContent=profile.admin?'Abrir painel de gestão':'Abrir painel da loja';msg(seller&&!canSell?'Esta conta é de cliente. Use o acesso de colaborador para gerenciar uma loja.':'Você está conectado.');}
  else msg(seller?'Entre com o acesso fornecido pela sua loja.':'Entre ou crie a sua conta.');
}
function setMode(next){if(seller&&next==='signup')return;mode=next;for(const b of document.querySelectorAll('[data-mode]'))b.setAttribute('aria-pressed',String(b.dataset.mode===mode));q('#name-label').hidden=mode!=='signup';const name=q('[name=name]');name.required=mode==='signup';q('[name=password]').autocomplete=mode==='signup'?'new-password':'current-password';q('[name=email]').type=seller?'text':'email';q('#account-submit').textContent=mode==='signup'?'Criar conta':'Entrar'}
for(const b of document.querySelectorAll('[data-mode]'))b.addEventListener('click',()=>setMode(b.dataset.mode));
q('#account-form').addEventListener('submit',async e=>{e.preventDefault();const b=q('#account-submit');b.disabled=true;const form=e.currentTarget;const f=new FormData(form);try{const data=await api(mode,{identifier:String(f.get('email')),password:String(f.get('password')),name:String(f.get('name')||''),access:seller?'seller':'customer'});form.reset();if(mode==='signup'){setMode('login');msg('Confira seu e-mail para confirmar o cadastro. Depois, faça login.')}else show(data.profile)}catch(err){msg(err.message)}finally{b.disabled=false}});
q('#google-login').addEventListener('click',async()=>{const b=q('#google-login');b.disabled=true;try{const data=await api('google',{});location.assign(data.url)}catch(err){msg(err.message);b.disabled=false}});
q('#logout').addEventListener('click',async()=>{try{await api('logout',{});show(null)}catch(err){msg(err.message)}});
(async()=>{
  setMode('login');
  const params=new URLSearchParams(location.search),code=params.get('code');
  const hash=new URLSearchParams(location.hash.slice(1));
  const error=params.get('error')||hash.get('error');
  if(code||error||location.hash){params.delete('code');params.delete('error');params.delete('error_description');params.delete('error_code');history.replaceState(null,'',location.pathname+(params.size?'?'+params:''));}
  try{const data=code?await api('oauth',{code}):await api('me');show(data.profile||null);q('#google-login').hidden=seller||!data.providers?.google;if(error)msg('Não foi possível concluir a confirmação ou o acesso. Tente novamente.');}
  catch(err){show(null);msg(err.message);}
})();
