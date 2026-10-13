const enc=new TextEncoder();
const b64url=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const fromB64url=s=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
async function sign(value,secret){const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(value))))}
async function verifySig(value,sig,secret){try{const key=await crypto.subtle.importKey('raw',enc.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);return crypto.subtle.verify('HMAC',key,fromB64url(sig),enc.encode(value))}catch{return false}}
export async function makeSession(username,secret){const payload=b64url(enc.encode(JSON.stringify({u:username,exp:Date.now()+8*60*60*1000})));const sig=await sign(payload,secret);return `${payload}.${sig}`}
export async function validSession(request,env){const cookie=request.headers.get('Cookie')||'';const token=cookie.split(';').map(v=>v.trim()).find(v=>v.startsWith('admin_session='))?.slice('admin_session='.length);if(!token||!env.SESSION_SECRET)return false;const [payload,sig]=token.split('.');if(!payload||!sig||!(await verifySig(payload,sig,env.SESSION_SECRET)))return false;try{const data=JSON.parse(new TextDecoder().decode(fromB64url(payload)));return data.u===env.ADMIN_USERNAME&&Date.now()<data.exp}catch{return false}}
export function sessionCookie(value){return `admin_session=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${8*60*60}`}
export function clearCookie(){return 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'}
export function json(data,status=200,headers={}){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}})}
export function safeEqual(a='',b=''){const x=enc.encode(a),y=enc.encode(b);if(x.length!==y.length)return false;let d=0;for(let i=0;i<x.length;i++)d|=x[i]^y[i];return d===0}
