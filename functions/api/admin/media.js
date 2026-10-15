import {json,validSession} from '../../_lib/auth.js';
import {allCatalog} from '../../_lib/db.js';

const API='https://api.github.com';
const ROOT='public/uploads';
const imageExt=/\.(avif|gif|jpe?g|png|svg|webp)$/i;
const headers=env=>({
  Authorization:`Bearer ${env.GITHUB_TOKEN}`,
  Accept:'application/vnd.github+json',
  'X-GitHub-Api-Version':'2022-11-28',
  'User-Agent':'Cloudflare-Catalog-Admin'
});
const cleanPublicPath=path=>path.startsWith('public/')?path.slice(6):path;
const publicUrl=path=>'/'+cleanPublicPath(path).replace(/^\/+/,'');

function cleanSegment(v,{file=false}={}){
  let s=String(v||'').trim().replace(/[\/\\\0-\x1f\x7f]+/g,'-').replace(/^\.+$/,'').replace(/\s+/g,'-');
  s=s.replace(/^-+|-+$/g,'');
  if(!s)s=file?'image':'folder';
  return s.slice(0,120);
}
function normalizeFolder(v){
  let s=String(v||'').replace(/^\/+/,'').replace(/^public\/uploads\/?/,'').replace(/^uploads\/?/,'');
  const parts=s.split('/').filter(Boolean).filter(x=>x!=='.'&&x!=='..').map(x=>cleanSegment(x));
  return parts.join('/');
}
function normalizeRepoPath(v){
  const s=String(v||'').replace(/^\/+/,'');
  if(!s.startsWith(ROOT+'/'))return '';
  const rel=s.slice((ROOT+'/').length).split('/').filter(Boolean).filter(x=>x!=='.'&&x!=='..').map((x,i,a)=>cleanSegment(x,{file:i===a.length-1})).join('/');
  return rel?`${ROOT}/${rel}`:'';
}
function dirname(path){const a=path.split('/');a.pop();return a.join('/')}
function basename(path){return path.split('/').pop()||''}
function extname(name){const i=name.lastIndexOf('.');return i>0?name.slice(i):''}
function stripExt(name){const i=name.lastIndexOf('.');return i>0?name.slice(0,i):name}

async function gh(env,path,options={}){
  const extra={...(options.headers||{})};
  if(options.body&&!extra['Content-Type'])extra['Content-Type']='application/json';
  const r=await fetch(`${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`,{...options,headers:{...headers(env),...extra}});
  if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||`GitHub API failed (${r.status})`)}
  return r;
}
async function branchInfo(env){
  const branch=env.GITHUB_BRANCH||'main';
  const ref=await (await gh(env,`/git/ref/heads/${encodeURIComponent(branch)}`)).json();
  const commit=await (await gh(env,`/git/commits/${ref.object.sha}`)).json();
  return {branch,commitSha:ref.object.sha,treeSha:commit.tree.sha};
}
async function fullTree(env,treeSha){
  return (await (await gh(env,`/git/trees/${treeSha}?recursive=1`)).json()).tree||[];
}
async function commitTree(env,{branch,commitSha,treeSha},entries,message){
  if(!entries.length)return null;
  const nt=await (await gh(env,'/git/trees',{method:'POST',body:JSON.stringify({base_tree:treeSha,tree:entries})})).json();
  const commit=await (await gh(env,'/git/commits',{method:'POST',body:JSON.stringify({message,tree:nt.sha,parents:[commitSha]})})).json();
  await gh(env,`/git/refs/heads/${encodeURIComponent(branch)}`,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
  return commit.sha;
}
function usageMap(catalog){
  const map=new Map(),add=(url,label)=>{if(!url)return;const key=url.startsWith('/')?url:'/'+url;const arr=map.get(key)||[];if(!arr.includes(label))arr.push(label);map.set(key,arr)};
  for(const c of catalog.categories||[])add(c.image_url,`产品分类：${c.name}`);
  for(const p of catalog.products||[]){for(const u of p.images||[])add(u,`产品主图：${p.model||p.name}`);for(const u of p.detail_images||[])add(u,`产品详情图：${p.model||p.name}`)}
  for(const n of catalog.news||[])add(n.cover_url,`新闻：${n.title}`);
  const s=catalog.settings||{};
  for(const [k,v] of Object.entries(s))if(typeof v==='string'&&v.startsWith('/uploads/'))add(v,`网站设置：${k}`);
  return map;
}
function replaceDeep(v,map){
  if(typeof v==='string')return map.get(v)||v;
  if(Array.isArray(v))return v.map(x=>replaceDeep(x,map));
  if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,replaceDeep(x,map)]));
  return v;
}
async function updateReferences(DB,pathMap){
  if(!DB||!pathMap.size)return;
  const urlMap=new Map([...pathMap.entries()].map(([a,b])=>[publicUrl(a),publicUrl(b)]));
  const statements=[];
  try{
    const cats=await DB.prepare('SELECT id,image_url FROM categories').all();
    for(const r of cats.results||[]){const next=urlMap.get(r.image_url);if(next)statements.push(DB.prepare('UPDATE categories SET image_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(next,r.id))}
  }catch{}
  const prods=await DB.prepare('SELECT id,images_json FROM products').all();
  for(const r of prods.results||[]){
    let raw;try{raw=JSON.parse(r.images_json||'[]')}catch{continue}
    const next=replaceDeep(raw,urlMap);
    if(JSON.stringify(next)!==JSON.stringify(raw))statements.push(DB.prepare('UPDATE products SET images_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(JSON.stringify(next),r.id));
  }
  const news=await DB.prepare('SELECT id,cover_url FROM news').all();
  for(const r of news.results||[]){const next=urlMap.get(r.cover_url);if(next)statements.push(DB.prepare('UPDATE news SET cover_url=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').bind(next,r.id))}
  try{
    const row=await DB.prepare('SELECT data_json FROM site_settings WHERE id=1').first();
    const raw=JSON.parse(row?.data_json||'{}'),next=replaceDeep(raw,urlMap);
    if(JSON.stringify(next)!==JSON.stringify(raw))statements.push(DB.prepare('UPDATE site_settings SET data_json=?,updated_at=CURRENT_TIMESTAMP WHERE id=1').bind(JSON.stringify(next)));
  }catch{}
  if(statements.length)await DB.batch(statements);
}
function collectFolders(tree){
  const set=new Set(['products','news','site']);
  for(const x of tree){
    if(!x.path?.startsWith(ROOT+'/'))continue;
    const rel=x.path.slice((ROOT+'/').length);
    const parts=rel.split('/');
    if(x.type==='tree')set.add(parts.join('/'));
    else{
      parts.pop();
      for(let i=1;i<=parts.length;i++)set.add(parts.slice(0,i).join('/'));
    }
  }
  return [...set].filter(Boolean).sort((a,b)=>a.localeCompare(b,'zh-CN'));
}
function targetPathForFile(oldPath,targetFolder,newName){
  const folder=normalizeFolder(targetFolder);
  const name=cleanSegment(newName||basename(oldPath),{file:true});
  return `${ROOT}/${folder}/${name}`;
}

export async function onRequest({request,env}){
  if(!(await validSession(request,env)))return json({error:'Unauthorized'},401);
  if(!env.GITHUB_TOKEN||!env.GITHUB_OWNER||!env.GITHUB_REPO)return json({error:'GitHub settings are not configured.'},503);
  try{
    const url=new URL(request.url);
    if(request.method==='GET'&&url.searchParams.get('file')){
      const path=normalizeRepoPath(url.searchParams.get('file'));
      if(!path)return json({error:'Invalid image path'},400);
      const r=await gh(env,`/contents/${path.split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(env.GITHUB_BRANCH||'main')}`,{headers:{Accept:'application/vnd.github.raw+json'}});
      const h=new Headers();h.set('Content-Type',r.headers.get('Content-Type')||'application/octet-stream');h.set('Cache-Control','private, max-age=60');return new Response(r.body,{status:200,headers:h});
    }

    if(request.method==='GET'){
      const bi=await branchInfo(env),tree=await fullTree(env,bi.treeSha);
      const catalog=await allCatalog(env.DB,{includeDrafts:true}),used=usageMap(catalog);
      const items=tree.filter(x=>x.type==='blob'&&x.path.startsWith(ROOT+'/')&&imageExt.test(x.path)).map(x=>{
        const u=publicUrl(x.path),rel=x.path.slice((ROOT+'/').length),parts=rel.split('/'),name=parts.pop(),folderPath=parts.join('/'),root=parts[0]||'other';
        return {name,path:x.path,sha:x.sha,size:x.size||0,folder:root,folder_path:folderPath,url:u,used_by:used.get(u)||[],in_use:(used.get(u)||[]).length>0};
      }).sort((a,b)=>a.folder_path.localeCompare(b.folder_path,'zh-CN')||a.name.localeCompare(b.name,'zh-CN'));
      const folders=collectFolders(tree);
      const category_folders=(catalog.categories||[]).map(c=>({id:c.id,name:c.name,slug:c.slug,folder:`products/${cleanSegment(c.slug||c.name)}`}));
      return json({items,folders,category_folders,count:items.length});
    }

    if(request.method==='DELETE'){
      const body=await request.json().catch(()=>({}));
      const paths=[...new Set(Array.isArray(body.paths)?body.paths:[])].map(normalizeRepoPath).filter(p=>p&&imageExt.test(p));
      if(!paths.length)return json({error:'No valid images selected'},400);
      const catalog=await allCatalog(env.DB,{includeDrafts:true}),used=usageMap(catalog);
      const blocked=[],deletable=[];
      for(const path of paths){const refs=used.get(publicUrl(path))||[];if(refs.length)blocked.push({path,used_by:refs});else deletable.push(path)}
      if(!deletable.length)return json({ok:true,deleted:[],blocked,note:'所选图片均正在使用，未执行删除。'});
      const bi=await branchInfo(env);
      await commitTree(env,bi,deletable.map(path=>({path,mode:'100644',type:'blob',sha:null})),`Delete ${deletable.length} unused website image${deletable.length>1?'s':''}`);
      return json({ok:true,deleted:deletable,blocked});
    }

    if(request.method==='POST'||request.method==='PATCH'){
      const body=await request.json().catch(()=>({})),action=body.action;
      const bi=await branchInfo(env),tree=await fullTree(env,bi.treeSha);
      const byPath=new Map(tree.map(x=>[x.path,x]));
      const entries=[],pathMap=new Map();
      let message='Update media library';

      if(action==='create_folder'){
        const parent=normalizeFolder(body.parent||'products'),name=cleanSegment(body.name);
        if(!name)return json({error:'请输入文件夹名称'},400);
        const folder=`${parent}/${name}`.replace(/^\/+/,'');
        const marker=`${ROOT}/${folder}/.gitkeep`;
        if(byPath.has(marker))return json({error:'文件夹已存在'},409);
        entries.push({path:marker,mode:'100644',type:'blob',content:''});
        message=`Create media folder ${folder}`;
      }else if(action==='sync_categories'){
        const catalog=await allCatalog(env.DB,{includeDrafts:true});
        for(const c of catalog.categories||[]){
          const folder=`products/${cleanSegment(c.slug||c.name)}`,marker=`${ROOT}/${folder}/.gitkeep`;
          const hasAny=tree.some(x=>x.path===marker||x.path.startsWith(`${ROOT}/${folder}/`));
          if(!hasAny)entries.push({path:marker,mode:'100644',type:'blob',content:''});
        }
        if(!entries.length)return json({ok:true,note:'产品分类文件夹已经全部存在。'});
        message='Sync product category media folders';
      }else if(action==='move'||action==='rename'){
        const paths=[...new Set(Array.isArray(body.paths)?body.paths:(body.path?[body.path]:[]))].map(normalizeRepoPath).filter(Boolean);
        if(!paths.length)return json({error:'请选择图片'},400);
        const target=normalizeFolder(body.target_folder||dirname(paths[0]).slice((ROOT+'/').length));
        for(const oldPath of paths){
          const node=byPath.get(oldPath);if(!node||node.type!=='blob'||!imageExt.test(oldPath))continue;
          let name=basename(oldPath);
          if(action==='rename'){
            if(paths.length!==1)return json({error:'单文件重命名一次只能选择一张图片'},400);
            const requested=cleanSegment(body.new_name||name,{file:true});
            const oldExt=extname(name),newExt=extname(requested);
            name=newExt?requested:`${stripExt(requested)}${oldExt}`;
          }
          let dest=targetPathForFile(oldPath,target,name);
          if(dest===oldPath)continue;
          if(byPath.has(dest)&&!paths.includes(dest))return json({error:`目标位置已存在同名文件：${basename(dest)}`},409);
          entries.push({path:dest,mode:'100644',type:'blob',sha:node.sha},{path:oldPath,mode:'100644',type:'blob',sha:null});
          pathMap.set(oldPath,dest);
        }
        message=action==='rename'?`Rename media file ${basename(paths[0])}`:`Move ${pathMap.size} media image${pathMap.size===1?'':'s'}`;
      }else if(action==='batch_rename'){
        const paths=[...new Set(Array.isArray(body.paths)?body.paths:[])].map(normalizeRepoPath).filter(Boolean);
        const prefix=cleanSegment(body.prefix||'image'),start=Math.max(0,Number(body.start)||1);
        if(!paths.length)return json({error:'请选择要批量重命名的图片'},400);
        paths.forEach((oldPath,i)=>{
          const node=byPath.get(oldPath);if(!node||node.type!=='blob'||!imageExt.test(oldPath))return;
          const ext=extname(basename(oldPath)).toLowerCase(),num=String(start+i).padStart(Math.max(2,String(start+paths.length-1).length),'0');
          const dest=`${dirname(oldPath)}/${prefix}-${num}${ext}`;
          if(byPath.has(dest)&&!paths.includes(dest))throw new Error(`目标位置已存在同名文件：${basename(dest)}`);
          if(dest!==oldPath){entries.push({path:dest,mode:'100644',type:'blob',sha:node.sha},{path:oldPath,mode:'100644',type:'blob',sha:null});pathMap.set(oldPath,dest)}
        });
        message=`Batch rename ${pathMap.size} media images`;
      }else if(action==='rename_folder'||action==='move_folder'){
        const oldFolder=normalizeFolder(body.folder);
        if(!oldFolder||['products','news','site'].includes(oldFolder))return json({error:'根目录不能重命名或移动'},400);
        const oldPrefix=`${ROOT}/${oldFolder}/`;
        let newFolder;
        if(action==='rename_folder'){
          const parent=oldFolder.split('/').slice(0,-1).join('/'),name=cleanSegment(body.new_name);
          newFolder=`${parent}/${name}`;
        }else{
          const targetParent=normalizeFolder(body.target_folder||'products');
          if(targetParent===oldFolder||targetParent.startsWith(oldFolder+'/'))return json({error:'不能把文件夹移动到自己或自己的子文件夹中'},400);
          newFolder=`${targetParent}/${basename(oldFolder)}`;
        }
        const newPrefix=`${ROOT}/${newFolder}/`;
        const nodes=tree.filter(x=>x.type==='blob'&&x.path.startsWith(oldPrefix));
        if(!nodes.length)return json({error:'文件夹为空或不存在'},404);
        if(tree.some(x=>x.path.startsWith(newPrefix)&&!x.path.startsWith(oldPrefix)))return json({error:'目标位置已存在同名文件夹'},409);
        for(const node of nodes){
          const dest=newPrefix+node.path.slice(oldPrefix.length);
          entries.push({path:dest,mode:'100644',type:'blob',sha:node.sha},{path:node.path,mode:'100644',type:'blob',sha:null});
          if(imageExt.test(node.path))pathMap.set(node.path,dest);
        }
        message=action==='rename_folder'?`Rename media folder ${oldFolder} to ${newFolder}`:`Move media folder ${oldFolder} to ${newFolder}`;
      }else{
        return json({error:'Invalid media action'},400);
      }

      if(!entries.length)return json({ok:true,note:'没有需要变更的内容。'});
      await commitTree(env,bi,entries,message);
      if(pathMap.size)await updateReferences(env.DB,pathMap);
      return json({ok:true,moved:[...pathMap.entries()].map(([from,to])=>({from,to})),note:'GitHub 已提交变更；正在使用的图片引用已同步更新到 D1。'});
    }

    return json({error:'Method not allowed'},405);
  }catch(e){return json({error:e.message},500)}
}
