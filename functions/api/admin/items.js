import {json,validSession} from '../../_lib/auth.js';
import {allCatalog,parseProduct,parseNavigation} from '../../_lib/db.js';
const allowed=new Set(['categories','products','news','settings','navigation']);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
async function body(request){return request.json()}
export async function onRequest({request,env}){
 if(!(await validSession(request,env)))return json({error:'Unauthorized'},401);
 const url=new URL(request.url),type=url.searchParams.get('type');if(!allowed.has(type))return json({error:'Invalid type'},400);
 try{
  if(request.method==='GET')return json(await allCatalog(env.DB,{includeDrafts:true}));
  const p=await body(request);
  if(type==='settings'){
   if(!['POST','PUT'].includes(request.method))return json({error:'Method not allowed'},405);
   await env.DB.prepare("INSERT INTO site_settings(id,data_json,updated_at) VALUES(1,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET data_json=excluded.data_json,updated_at=CURRENT_TIMESTAMP").bind(JSON.stringify(p||{})).run();
   return json(p||{});
  }
  if(request.method==='POST'){
   if(type==='categories'){const r=await env.DB.prepare('INSERT INTO categories(name,slug,summary,sort_order) VALUES(?,?,?,?) RETURNING *').bind(p.name,p.slug,p.summary||'',num(p.sort_order)).first();return json(r,201)}
   if(type==='products'){const r=await env.DB.prepare('INSERT INTO products(model,name,slug,category_id,summary,description,specs_json,images_json,featured,sort_order) VALUES(?,?,?,?,?,?,?,?,?,?) RETURNING *').bind(p.model,p.name,p.slug,num(p.category_id),p.summary||'',p.description||'',JSON.stringify(p.specs||{}),JSON.stringify({main:Array.isArray(p.images)?p.images:[],detail:Array.isArray(p.detail_images)?p.detail_images:[]}),p.featured?1:0,num(p.sort_order)).first();return json(parseProduct(r),201)}
   if(type==='navigation'){const r=await env.DB.prepare('INSERT INTO navigation(label,path,sort_order,visible) VALUES(?,?,?,?) RETURNING *').bind(p.label,p.path,num(p.sort_order),p.visible===false?0:1).first();return json(parseNavigation(r),201)}
   const r=await env.DB.prepare('INSERT INTO news(title,slug,excerpt,body,cover_url,status,published_at) VALUES(?,?,?,?,?,?,?) RETURNING *').bind(p.title,p.slug,p.excerpt||'',p.body||'',p.cover_url||'',p.status||'draft',p.published_at||new Date().toISOString()).first();return json(r,201)
  }
  if(request.method==='PUT'){
   const id=num(p.id);if(!id)return json({error:'Missing id'},400);
   if(type==='categories'){const r=await env.DB.prepare('UPDATE categories SET name=?,slug=?,summary=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *').bind(p.name,p.slug,p.summary||'',num(p.sort_order),id).first();return json(r)}
   if(type==='products'){const r=await env.DB.prepare('UPDATE products SET model=?,name=?,slug=?,category_id=?,summary=?,description=?,specs_json=?,images_json=?,featured=?,sort_order=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *').bind(p.model,p.name,p.slug,num(p.category_id),p.summary||'',p.description||'',JSON.stringify(p.specs||{}),JSON.stringify({main:Array.isArray(p.images)?p.images:[],detail:Array.isArray(p.detail_images)?p.detail_images:[]}),p.featured?1:0,num(p.sort_order),id).first();return json(parseProduct(r))}
   if(type==='navigation'){const r=await env.DB.prepare('UPDATE navigation SET label=?,path=?,sort_order=?,visible=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *').bind(p.label,p.path,num(p.sort_order),p.visible===false?0:1,id).first();return json(parseNavigation(r))}
   const r=await env.DB.prepare('UPDATE news SET title=?,slug=?,excerpt=?,body=?,cover_url=?,status=?,published_at=?,updated_at=CURRENT_TIMESTAMP WHERE id=? RETURNING *').bind(p.title,p.slug,p.excerpt||'',p.body||'',p.cover_url||'',p.status||'draft',p.published_at||new Date().toISOString(),id).first();return json(r)
  }
  if(request.method==='DELETE'){
   if(type==='settings')return json({error:'Settings cannot be deleted'},400);
   const id=num(url.searchParams.get('id'));if(!id)return json({error:'Missing id'},400);
   await env.DB.prepare(`DELETE FROM ${type} WHERE id=?`).bind(id).run();return json({ok:true})
  }
  return json({error:'Method not allowed'},405)
 }catch(e){return json({error:e.message},500)}
}
