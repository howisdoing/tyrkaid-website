export function parseProduct(row){if(!row)return row;return {...row,featured:Boolean(row.featured),specs:safeJson(row.specs_json,{}),images:safeJson(row.images_json,[])}}
export function parseNews(row){return row||null}
const safeJson=(s,fallback)=>{try{return JSON.parse(s||'')}catch{return fallback}};
export async function allCatalog(DB,{includeDrafts=false}={}){const [cats,prods,news]=await Promise.all([
 DB.prepare('SELECT * FROM categories ORDER BY sort_order,id').all(),
 DB.prepare('SELECT * FROM products ORDER BY sort_order,id').all(),
 DB.prepare(`SELECT * FROM news ${includeDrafts?'':"WHERE status='published'"} ORDER BY published_at DESC,id DESC`).all()
]);return {categories:cats.results||[],products:(prods.results||[]).map(parseProduct),news:news.results||[]}}
