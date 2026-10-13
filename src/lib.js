export const slugify=(s='')=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||`item-${Date.now()}`;
export const shortDate=value=>{if(!value)return'';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})};
export const imageOf=item=>item?.images?.[0]||item?.cover_url||null;
export async function api(path,options={}){const res=await fetch(path,{credentials:'same-origin',...options,headers:{...(options.body instanceof FormData?{}:{'Content-Type':'application/json'}),...(options.headers||{})}});const data=await res.json().catch(()=>({}));if(!res.ok)throw new Error(data.error||`Request failed (${res.status})`);return data}
