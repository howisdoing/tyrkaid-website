const safeJson=(s,fallback)=>{try{return JSON.parse(s||'')}catch{return fallback}};
export function parseProduct(row){if(!row)return row;return {...row,featured:Boolean(row.featured),specs:safeJson(row.specs_json,{}),images:safeJson(row.images_json,[])}}
export function parseNews(row){return row||null}
export function parseNavigation(row){return row?{...row,visible:Boolean(row.visible)}:row}
export async function allCatalog(DB,{includeDrafts=false}={}){
 const [cats,prods,news]=await Promise.all([
  DB.prepare('SELECT * FROM categories ORDER BY sort_order,id').all(),
  DB.prepare('SELECT * FROM products ORDER BY sort_order,id').all(),
  DB.prepare(`SELECT * FROM news ${includeDrafts?'':"WHERE status='published'"} ORDER BY published_at DESC,id DESC`).all()
 ]);
 let settings={},navigation=[];
 try{const row=await DB.prepare('SELECT * FROM site_settings WHERE id=1').first();settings=safeJson(row?.data_json,{})}catch{}
 try{const nav=await DB.prepare('SELECT * FROM navigation ORDER BY sort_order,id').all();navigation=(nav.results||[]).map(parseNavigation)}catch{}
 return {categories:cats.results||[],products:(prods.results||[]).map(parseProduct),news:news.results||[],settings,navigation}
}
