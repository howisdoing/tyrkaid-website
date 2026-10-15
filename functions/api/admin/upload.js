import {json,validSession} from '../../_lib/auth.js';

const API='https://api.github.com';
const ROOT='public/uploads';
const headers=env=>({
 Authorization:`Bearer ${env.GITHUB_TOKEN}`,
 Accept:'application/vnd.github+json',
 'X-GitHub-Api-Version':'2022-11-28',
 'User-Agent':'Cloudflare-Catalog-Admin'
});
const cleanSegment=(v,{file=false}={})=>{
 let s=String(v||'').trim().replace(/[\/\\\0-\x1f\x7f]+/g,'-').replace(/^\.+$/,'').replace(/\s+/g,'-').replace(/^-+|-+$/g,'');
 if(!s)s=file?'image':'folder';return s.slice(0,120);
};
const normalizeFolder=v=>{
 let s=String(v||'products').replace(/^\/+/,'').replace(/^public\/uploads\/?/,'').replace(/^uploads\/?/,'');
 const parts=s.split('/').filter(Boolean).filter(x=>x!=='.'&&x!=='..').map(x=>cleanSegment(x));
 if(!['products','news','site'].includes(parts[0]))parts.unshift('products');
 return parts.join('/');
};
const cleanRelative=v=>String(v||'').split(/[\/\\]+/).filter(Boolean).filter(x=>x!=='.'&&x!=='..').map((x,i,a)=>cleanSegment(x,{file:i===a.length-1})).join('/');

async function gh(env,path,options={}){
 const extra={...(options.headers||{})};if(options.body&&!extra['Content-Type'])extra['Content-Type']='application/json';
 const r=await fetch(`${API}/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}${path}`,{...options,headers:{...headers(env),...extra}});
 if(!r.ok){const e=await r.json().catch(()=>({}));throw new Error(e.message||`GitHub API failed (${r.status})`)}return r;
}
async function branchInfo(env){
 const branch=env.GITHUB_BRANCH||'main';
 const ref=await (await gh(env,`/git/ref/heads/${encodeURIComponent(branch)}`)).json();
 const commit=await (await gh(env,`/git/commits/${ref.object.sha}`)).json();
 return {branch,commitSha:ref.object.sha,treeSha:commit.tree.sha};
}
const toB64=bytes=>{let bin='';const arr=new Uint8Array(bytes);for(let i=0;i<arr.length;i+=0x8000)bin+=String.fromCharCode(...arr.subarray(i,i+0x8000));return btoa(bin)};

export async function onRequestPost({request,env}){
 if(!(await validSession(request,env)))return json({error:'Unauthorized'},401);
 if(!env.GITHUB_TOKEN||!env.GITHUB_OWNER||!env.GITHUB_REPO)return json({error:'GitHub upload secrets are not configured.'},503);
 try{
  const form=await request.formData(),files=form.getAll('files'),relativePaths=form.getAll('relative_paths').map(String);
  const folder=normalizeFolder(form.get('folder')||'products');
  if(!files.length)return json({error:'No files selected'},400);
  if(files.length>100)return json({error:'单次最多上传 100 张图片，请分批上传。'},400);
  let total=0;for(const file of files){if(!file.type?.startsWith('image/'))throw new Error('Only image files are supported.');if(file.size>5*1024*1024)throw new Error('Single image must be 5 MB or smaller.');total+=file.size}
  if(total>45*1024*1024)throw new Error('单次上传图片总大小请控制在 45 MB 以内。');

  const bi=await branchInfo(env);
  const tree=await (await (await gh(env,`/git/trees/${bi.treeSha}?recursive=1`)).json()).tree||[];
  const exists=new Set(tree.map(x=>x.path));
  const entries=[],urls=[];

  for(let i=0;i<files.length;i++){
   const file=files[i],relative=cleanRelative(relativePaths[i]||'');
   let rel;
   if(relative){
    rel=relative;
   }else{
    const original=cleanSegment(file.name,{file:true});
    rel=`${Date.now()}-${crypto.randomUUID().slice(0,8)}-${original}`;
   }
   let path=`${ROOT}/${folder}/${rel}`.replace(/\/+/g,'/');
   if(exists.has(path)||entries.some(x=>x.path===path)){
    const parts=path.split('/'),name=parts.pop(),dot=name.lastIndexOf('.'),stem=dot>0?name.slice(0,dot):name,ext=dot>0?name.slice(dot):'';
    parts.push(`${stem}-${crypto.randomUUID().slice(0,6)}${ext}`);path=parts.join('/');
   }
   const blob=await (await gh(env,'/git/blobs',{method:'POST',body:JSON.stringify({content:toB64(await file.arrayBuffer()),encoding:'base64'})})).json();
   entries.push({path,mode:'100644',type:'blob',sha:blob.sha});
   urls.push('/'+path.slice('public/'.length));
  }
  const nt=await (await gh(env,'/git/trees',{method:'POST',body:JSON.stringify({base_tree:bi.treeSha,tree:entries})})).json();
  const commit=await (await gh(env,'/git/commits',{method:'POST',body:JSON.stringify({message:`Upload ${files.length} media image${files.length===1?'':'s'} to ${folder}`,tree:nt.sha,parents:[bi.commitSha]})})).json();
  await gh(env,`/git/refs/heads/${encodeURIComponent(bi.branch)}`,{method:'PATCH',body:JSON.stringify({sha:commit.sha,force:false})});
  return json({urls,note:`已在一次 GitHub commit 中上传 ${files.length} 张图片。`});
 }catch(e){return json({error:e.message},500)}
}
