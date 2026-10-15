import {json,validSession} from '../../_lib/auth.js';
import {allCatalog} from '../../_lib/db.js';

const API='https://api.github.com';
const headers=env=>({
  Authorization:`Bearer ${env.GITHUB_TOKEN}`,
  Accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28',
  'User-Agent':'Cloudflare-Catalog-Admin'
});
const imageExt=/\.(avif|gif|jpe?g|png|svg|webp)$/i;
const cleanPublicPath=path=>path.startsWith('public/')?path.slice(6):path;
const publicUrl=path=>'/'+cleanPublicPath(path).replace(/^\/+/, '');

async function gh(env,path,options={}){
  const extra={...(options.headers||{})};if(options.body&&!extra['Content-Type'])extra['Content-Type']='application/json';const r=await fetch(`${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`,{...options,headers:{...headers(env),...extra}});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||`GitHub API failed (${r.status})`)}
  return r;
}
async function branchInfo(env){
  const branch=env.GITHUB_BRANCH||'main';
  const ref=await (await gh(env,`/git/ref/heads/${encodeURIComponent(branch)}`)).json();
  const commit=await (await gh(env,`/git/commits/${ref.object.sha}`)).json();
  return {branch,commitSha:ref.object.sha,treeSha:commit.tree.sha};
}
function usageMap(catalog){
  const map=new Map(),add=(url,label)=>{if(!url)return;const key=url.startsWith('/')?url:'/'+url;const arr=map.get(key)||[];if(!arr.includes(label))arr.push(label);map.set(key,arr)};
  for(const p of catalog.products||[]){for(const u of p.images||[])add(u,`产品主图：${p.model||p.name}`);for(const u of p.detail_images||[])add(u,`产品详情图：${p.model||p.name}`);}
  for(const n of catalog.news||[])add(n.cover_url,`新闻：${n.title}`);
  const s=catalog.settings||{};
  add(s.logo_url,'网站设置：Logo');add(s.favicon_url,'网站设置：Favicon');add(s.hero_image_url,'网站设置：首页 Banner');add(s.about_image_url,'网站设置：关于我们');
  return map;
}
export async function onRequest({request,env}){
  if(!(await validSession(request,env)))return json({error:'Unauthorized'},401);
  if(!env.GITHUB_TOKEN||!env.GITHUB_OWNER||!env.GITHUB_REPO)return json({error:'GitHub settings are not configured.'},503);
  try{
    const url=new URL(request.url);
    if(request.method==='GET'&&url.searchParams.get('file')){
      const path=url.searchParams.get('file');
      if(!path?.startsWith('public/uploads/'))return json({error:'Invalid image path'},400);
      const r=await gh(env,`/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(env.GITHUB_BRANCH||'main')}`,{headers:{Accept:'application/vnd.github.raw+json'}});
      const h=new Headers();h.set('Content-Type',r.headers.get('Content-Type')||'application/octet-stream');h.set('Cache-Control','private, max-age=60');return new Response(r.body,{status:200,headers:h});
    }
    if(request.method==='GET'){
      const {treeSha}=await branchInfo(env);
      const tree=await (await gh(env,`/git/trees/${treeSha}?recursive=1`)).json();
      const catalog=await allCatalog(env.DB,{includeDrafts:true});
      const used=usageMap(catalog);
      const items=(tree.tree||[]).filter(x=>x.type==='blob'&&x.path.startsWith('public/uploads/')&&imageExt.test(x.path)).map(x=>{
        const url=publicUrl(x.path),folder=x.path.split('/')[2]||'other';
        return {name:x.path.split('/').pop(),path:x.path,sha:x.sha,size:x.size||0,folder,url,used_by:used.get(url)||[],in_use:(used.get(url)||[]).length>0};
      }).sort((a,b)=>a.folder.localeCompare(b.folder)||b.name.localeCompare(a.name));
      return json({items,count:items.length});
    }
    if(request.method==='DELETE'){
      const body=await request.json().catch(()=>({}));
      const requested=Array.isArray(body.paths)?body.paths:[];
      const paths=[...new Set(requested)].filter(p=>typeof p==='string'&&p.startsWith('public/uploads/')&&imageExt.test(p));
      if(!paths.length)return json({error:'No valid images selected'},400);
      const catalog=await allCatalog(env.DB,{includeDrafts:true}),used=usageMap(catalog);
      const blocked=[],deletable=[];
      for(const path of paths){const refs=used.get(publicUrl(path))||[];if(refs.length)blocked.push({path,used_by:refs});else deletable.push(path)}
      if(!deletable.length)return json({ok:true,deleted:[],blocked,note:'所选图片均正在使用，未执行删除。'});
      const {branch,commitSha,treeSha}=await branchInfo(env);
      const newTree=await (await gh(env,'/git/trees',{method:'POST',body:JSON.stringify({base_tree:treeSha,tree:deletable.map(path=>({path,mode:'100644',type:'blob',sha:null}))})})).json();
      const commit=await (await gh(env,'/git/commits',{method:'POST',body:JSON.stringify({message:`Delete ${deletable.length} unused website image${deletable.length>1?'s':''}`,tree:newTree.sha,parents:[commitSha]})})).json();
      await gh(env,`/git/refs/heads/${encodeURIComponent(branch)}`,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
      return json({ok:true,deleted:deletable,blocked,note:'已提交一次批量删除 commit，Cloudflare 将自动重新部署。'});
    }
    return json({error:'Method not allowed'},405);
  }catch(e){return json({error:e.message},500)}
}
