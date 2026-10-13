import {json,validSession} from '../../_lib/auth.js';
const clean=s=>(s||'image').toLowerCase().replace(/[^a-z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
const toB64=bytes=>{let bin='';const arr=new Uint8Array(bytes);for(let i=0;i<arr.length;i+=0x8000)bin+=String.fromCharCode(...arr.subarray(i,i+0x8000));return btoa(bin)};
export async function onRequestPost({request,env}){
 if(!(await validSession(request,env)))return json({error:'Unauthorized'},401);
 if(!env.GITHUB_TOKEN||!env.GITHUB_OWNER||!env.GITHUB_REPO)return json({error:'GitHub upload secrets are not configured.'},503);
 try{const form=await request.formData();const files=form.getAll('files');const requested=form.get('folder');const folder=['news','products','site'].includes(requested)?requested:'products';if(!files.length)return json({error:'No files selected'},400);const urls=[];
 for(const file of files){if(!file.type?.startsWith('image/'))throw new Error('Only image files are supported.');if(file.size>5*1024*1024)throw new Error('Single image must be 5 MB or smaller.');const name=`${Date.now()}-${crypto.randomUUID().slice(0,8)}-${clean(file.name)}`;const path=`public/uploads/${folder}/${name}`;const api=`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${encodeURIComponent(path).replace(/%2F/g,'/')}`;const resp=await fetch(api,{method:'PUT',headers:{Authorization:`Bearer ${env.GITHUB_TOKEN}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'Cloudflare-Catalog-Admin'},body:JSON.stringify({message:`Upload ${folder} image: ${name}`,content:toB64(await file.arrayBuffer()),branch:env.GITHUB_BRANCH||'main'})});if(!resp.ok){const e=await resp.json().catch(()=>({}));throw new Error(e.message||`GitHub upload failed (${resp.status})`)}urls.push(`/uploads/${folder}/${name}`)}
 return json({urls,note:'图片已经提交到 GitHub。Cloudflare 完成下一次自动部署后，图片地址会正式可访问。'});
 }catch(e){return json({error:e.message},500)}
}
