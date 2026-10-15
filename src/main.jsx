import React,{createContext,useContext,useEffect,useMemo,useState,useRef}from'react';
import{createRoot}from'react-dom/client';
import{BrowserRouter,Routes,Route,Link,NavLink,useLocation,useParams}from'react-router-dom';
import{Menu,X,ArrowRight,ZoomIn,Search,Plus,Trash2,Save,Upload,ExternalLink,LogOut,ShieldCheck,Settings2,PanelTop,Image as ImageIcon,Eye,EyeOff,Phone}from'lucide-react';
import{api,imageOf,shortDate,slugify}from'./lib';
import{DEMO_CATEGORIES,DEMO_PRODUCTS,DEMO_NEWS}from'./data';
import'./style.css';

const DEFAULT_SETTINGS={
 company_name_cn:'东莞市泰瑞凯德机械有限公司',company_name_en:'DONGGUAN TYRKAID MACHINERY CO., LTD.',brand_name:'TYRKAID',brand_subtitle:'MACHINERY',logo_url:'',logo_fit:'contain',logo_max_width:290,logo_max_height:96,favicon_url:'https://www.tyrkaid.com/wp-content/uploads/2024/03/cropped-TK22.png',
 header_tagline:'专注一站式橡塑胶混炼设备成套解决方案23年',header_products_text:'主营产品：开炼机、密炼机、压延机、双锥过滤出片机、胶片冷却设备',service_hotline_label:'服务热线',service_hotline_1:'0769-22985360',service_hotline_2:'135-8081-4896',hotline_sticky_enabled:true,
 hero_kicker:'橡胶 · 塑料 · 硅胶混炼设备',hero_title:'稳定设备，成就高效生产。',hero_subtitle:'Tyrkaid 专注橡胶、塑料及硅胶混炼设备的设计与制造，覆盖实验室研发、中试验证及工业化生产场景。',hero_image_url:'',hero_primary_text:'查看产品中心',hero_primary_link:'/products',hero_secondary_text:'了解 Tyrkaid',hero_secondary_link:'/about',
 home_automation_kicker:'AUTOMATION',home_automation_title:'自动化与成套解决方案',home_automation_text:'围绕混炼、上料、出片、冷却、输送与控制环节进行设备联动和流程优化，让生产节拍更稳定、操作更直观、维护更方便。',home_automation_image_url:'',
 about_page_title:'关于 Tyrkaid',about_page_intro:'来自中国东莞的橡胶、塑料与硅胶加工设备制造商。',about_eyebrow:'DONGGUAN TYRKAID MACHINERY CO., LTD.',about_title:'专注橡胶、塑料与硅胶混炼技术。',about_body:'Tyrkaid 专注于橡胶、塑料及硅胶混炼设备的设计、研发与制造。产品覆盖开放式炼胶机、密炼机、压延设备、切胶设备及相关辅助系统，可满足实验室研发、中试验证与工业化生产等不同场景。\n\n公司位于中国制造业重镇广东东莞。我们将制造经验与工程应用相结合，从设备结构、工艺配置到维护便利性持续优化，重点关注运行稳定性、生产效率、节能表现与长期可维护性。\n\n针对不同材料体系、产能规模和工艺要求，Tyrkaid 可提供针对性的设备配置建议与应用支持，帮助客户从选型到落地更高效地推进项目。',about_image_url:'',
 contact_page_title:'联系我们',contact_page_intro:'Dongguan Tyrkaid Machinery Co., Ltd.',contact_address:'中国广东省东莞市高埗镇高埗中心中路1号1栋101室',contact_phone:'+86-13806015010',contact_email:'sales@tyrkaid.com',contact_whatsapp:'',contact_support_title:'产品支持',contact_support_body:'您可以在产品中心查看设备分类、具体型号、技术说明及产品图片；公司动态与技术内容请前往公司新闻栏目。',
 footer_description:'专注橡胶、塑料与硅胶混炼加工设备，为实验研发与工业生产提供稳定、实用、可持续的设备解决方案。',footer_copyright:'Dongguan Tyrkaid Machinery Co., Ltd. 保留所有权利。'
};
const DEFAULT_NAV=[{id:1,label:'首页',path:'/',sort_order:1,visible:true},{id:2,label:'产品中心',path:'/products',sort_order:2,visible:true},{id:3,label:'关于我们',path:'/about',sort_order:3,visible:true},{id:4,label:'公司新闻',path:'/news',sort_order:4,visible:true},{id:5,label:'联系我们',path:'/contact',sort_order:5,visible:true}];
const Ctx=createContext({});
const useData=()=>useContext(Ctx);
const optimizeImageFile=async(file)=>{
 try{
  if(!file||!/^image\/(jpeg|png|webp)$/i.test(file.type))return file;
  if(file.size<220*1024)return file;
  const bitmap=await createImageBitmap(file);
  const maxSide=1800;
  const scale=Math.min(1,maxSide/Math.max(bitmap.width,bitmap.height));
  const width=Math.max(1,Math.round(bitmap.width*scale));
  const height=Math.max(1,Math.round(bitmap.height*scale));
  const canvas=document.createElement('canvas');
  canvas.width=width;canvas.height=height;
  const ctx=canvas.getContext('2d',{alpha:true});
  ctx.drawImage(bitmap,0,0,width,height);
  bitmap.close?.();
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',0.82));
  if(!blob||blob.size>=file.size*0.97)return file;
  const base=(file.name||'image').replace(/\.[^.]+$/,'');
  return new File([blob],`${base}.webp`,{type:'image/webp',lastModified:file.lastModified||Date.now()});
 }catch{return file}
};
function DataProvider({children}){
 const fallback={categories:DEMO_CATEGORIES,products:DEMO_PRODUCTS,news:DEMO_NEWS,settings:DEFAULT_SETTINGS,navigation:DEFAULT_NAV};
 const[data,setData]=useState(fallback),[loading,setLoading]=useState(true),[booted,setBooted]=useState(false),[error,setError]=useState('');
 async function refresh(){setLoading(true);try{const d=await api('/api/catalog');if(!Array.isArray(d?.categories)||!Array.isArray(d?.products)||!Array.isArray(d?.news))throw new Error('产品目录数据格式异常');setData({categories:d.categories,products:d.products,news:d.news,settings:{...DEFAULT_SETTINGS,...(d.settings||{})},navigation:Array.isArray(d.navigation)&&d.navigation.length?d.navigation:DEFAULT_NAV});setError('')}catch(e){setData(fallback);setError('数据库/API 尚未连接，当前显示演示数据。')}finally{setLoading(false);setBooted(true)}}
 useEffect(()=>{refresh()},[]);
 const effectiveSettings={...DEFAULT_SETTINGS,...(data.settings||{})};
 useEffect(()=>{const href=effectiveSettings.favicon_url||'/favicon.svg';let link=document.querySelector("link[rel~='icon']");if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link)}link.href=href},[effectiveSettings.favicon_url]);
 return <Ctx.Provider value={{...data,categories:data.categories||[],products:data.products||[],news:data.news||[],settings:effectiveSettings,navigation:data.navigation||DEFAULT_NAV,loading,booted,error,refresh}}>{children}</Ctx.Provider>
}
function Logo({settings:given}){
 const ctx=useData(),s=given||ctx.settings||DEFAULT_SETTINGS;
 const fit=['contain','cover','fill','center','frame'].includes(s.logo_fit)?s.logo_fit:'contain';
 const maxW=Math.max(140,Math.min(Number(s.logo_max_width)||220,300));
 const maxH=Math.max(48,Math.min(Number(s.logo_max_height)||72,92));
 const logoStyle={'--logo-max-w':`${maxW}px`,'--logo-max-h':`${maxH}px`};
 return <Link className={'logo '+(s.logo_url?'logo-has-image logo-fit-'+fit:'logo-text-fallback')} style={logoStyle} to="/">
  {s.logo_url
   ? <span className="logo-image-box"><img className="logo-image" src={s.logo_url} alt={s.brand_name||s.company_name_cn} loading="eager" decoding="async" fetchPriority="high" onError={e=>{e.currentTarget.style.visibility='hidden'}}/></span>
   : <><span className="logo-mark tyrkaid-mark">{(s.brand_name||'T').slice(0,1)}</span><span className="logo-type">{s.brand_name||'TYRKAID'}<small>{s.brand_subtitle||'MACHINERY'}</small></span></>}
 </Link>
}
function Header(){
 const[open,setOpen]=useState(false),loc=useLocation(),{navigation,settings}=useData();
 useEffect(()=>setOpen(false),[loc.pathname]);
 const nav=[...navigation].filter(x=>x.visible!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0));
 const phone=settings.service_hotline_1;
 return <header className="site-header karee-header">
  <div className="container karee-nav-shell">
   <Logo/>
   <button className="mobile-toggle" type="button" aria-label={open?"关闭导航菜单":"打开导航菜单"} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
   <nav id="main-navigation" className={open?'nav karee-nav open':'nav karee-nav'}>
    {nav.map(n=><NavLink key={n.id||n.path} to={n.path}>{n.label}</NavLink>)}
   </nav>
   <div className="karee-header-actions">
    {phone&&<a className="header-phone" href={'tel:'+phone.replace(/[^0-9+]/g,'')}><Phone size={15}/><span>{phone}</span></a>}
   </div>
  </div>
 </header>
}function Footer(){
 const{settings}=useData();
 return <footer className="footer karee-footer">
  <div className="container karee-footer-main">
   <div className="karee-footer-brand"><Logo/><p>{settings.footer_description}</p></div>
   <div><h4>产品与公司</h4><Link to="/products">产品中心</Link><Link to="/about">关于我们</Link><Link to="/news">公司新闻</Link></div>
   <div><h4>联系方式</h4>{settings.contact_phone&&<a href={'tel:'+settings.contact_phone.replace(/\s/g,'')}>{settings.contact_phone}</a>}{settings.contact_email&&<a href={'mailto:'+settings.contact_email}>{settings.contact_email}</a>}<span>{settings.contact_address}</span></div>
  </div>
  <div className="container footer-bottom">© {new Date().getFullYear()} {settings.footer_copyright}</div>
 </footer>
}function Layout({children}){const{loading,error}=useData();return <><Header/>{error&&<div className="error-bar">{error}</div>}{loading?<main className="container loading">加载中…</main>:children}<Footer/></>}
function Art(){return <div className="equipment-art"><svg viewBox="0 0 500 370"><ellipse cx="258" cy="323" rx="173" ry="16" fill="#b9c5cb" opacity=".35"/><rect x="93" y="157" width="310" height="142" rx="12" fill="#38596a"/><rect x="109" y="174" width="195" height="105" rx="7" fill="#d9e2e3"/><rect x="321" y="176" width="64" height="92" rx="5" fill="#1d3949"/><path d="M152 157V90h197v67" fill="#c9d5d8"/><rect x="171" y="78" width="158" height="62" rx="7" fill="#3d5f6f"/></svg><span>产品图片</span></div>}
function Visual({item,priority=false}){const src=imageOf(item);return src?<img className="product-img" src={src} alt={item.name} loading={priority?'eager':'lazy'} decoding="async" fetchPriority={priority?'high':'auto'}/>:<Art/>}
function ProductCard({item,priority=false}){
 return <Link className="product-card karee-product-card" to={'/products/'+item.slug}>
  <div className="product-media"><Visual item={item} priority={priority}/></div>
  <div className="product-card-body">
   <span className="karee-overline">INDUSTRIAL EQUIPMENT · {item.model}</span>
   <h3>{item.name}</h3>
   <p>{item.summary}</p>
   <span className="karee-view-link">查看详情 <ArrowRight size={15}/></span>
  </div>
 </Link>
}function NewsCard({item}){
 return <Link className="news-card karee-news-card" to={'/news/'+item.slug}>
  <div className="news-cover">{item.cover_url?<img src={item.cover_url} alt={item.title} loading="lazy" decoding="async"/>:<div className="news-placeholder"><span>TYRKAID</span><strong>NEWS</strong></div>}</div>
  <div className="news-body"><span className="karee-overline">{shortDate(item.published_at)}</span><h3>{item.title}</h3><p>{item.excerpt}</p><span className="karee-view-link">阅读全文 <ArrowRight size={15}/></span></div>
 </Link>
}function Home(){
 const{categories,products,news,settings}=useData();
 const featured=products.filter(x=>x.featured).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).slice(0,6);
 const categoryImage=c=>{
  const p=products.find(x=>Number(x.category_id)===Number(c.id)&&imageOf(x));
  return p?imageOf(p):'';
 };
 return <main className="karee-home">
  <section className="karee-hero">
   <div className="container karee-hero-grid">
    <div className="karee-hero-copy">
     <span className="karee-overline">{settings.hero_kicker||'TYRKAID MACHINERY'}</span>
     <h1>{settings.hero_title}</h1>
     <p>{settings.hero_subtitle}</p>
     <div className="karee-hero-actions">
      {settings.hero_primary_text&&<Link className="karee-btn primary" to={settings.hero_primary_link||'/products'}>{settings.hero_primary_text}<ArrowRight size={16}/></Link>}
      {settings.hero_secondary_text&&<Link className="karee-btn secondary" to={settings.hero_secondary_link||'/about'}>{settings.hero_secondary_text}</Link>}
     </div>
    </div>
    <div className="karee-hero-media">{settings.hero_image_url?<img src={settings.hero_image_url} alt={settings.hero_title} loading="eager" decoding="async" fetchPriority="high"/>:<Art/>}</div>
   </div>
  </section>

  <section className="karee-section">
   <div className="container">
    <div className="karee-section-head"><span className="karee-overline">OUR COLLECTIONS</span><h2>按产品系列浏览</h2></div>
    <div className="karee-category-grid">
     {categories.map(c=><Link className="karee-category-card" key={c.id} to={'/categories/'+c.slug}>
      <div className="karee-category-image">{categoryImage(c)?<img src={categoryImage(c)} alt={c.name} loading="lazy" decoding="async"/>:<Art/>}</div>
      <div><h3>{c.name}</h3><span>查看系列 <ArrowRight size={15}/></span></div>
     </Link>)}
    </div>
   </div>
  </section>

  <section className="karee-section karee-selected">
   <div className="container">
    <div className="karee-section-head split"><div><span className="karee-overline">SELECTED PRODUCTS</span><h2>精选设备</h2></div><Link className="karee-text-link" to="/products">全部产品 <ArrowRight size={15}/></Link></div>
    <div className="karee-product-grid">{featured.map((p,i)=><ProductCard key={p.id} item={p} priority={i<2}/>)}</div>
   </div>
  </section>

  <section className="karee-brand-band">
   <div className="container karee-brand-grid">
    <div><span className="karee-overline">ABOUT TYRKAID</span><h2>{settings.about_title}</h2><p>{(settings.about_body||'').split(/\n\n+/)[0]}</p><Link className="karee-text-link light" to="/about">了解我们 <ArrowRight size={15}/></Link></div>
    <div className="karee-brand-media">{settings.about_image_url?<img src={settings.about_image_url} alt={settings.about_title} loading="lazy" decoding="async"/>:<Art/>}</div>
   </div>
  </section>

  <section className="karee-section">
   <div className="container">
    <div className="karee-section-head split"><div><span className="karee-overline">LATEST NEWS</span><h2>公司动态</h2></div><Link className="karee-text-link" to="/news">全部新闻 <ArrowRight size={15}/></Link></div>
    <div className="karee-news-grid">{news.slice(0,3).map(n=><NewsCard key={n.id} item={n}/>)}</div>
   </div>
  </section>
 </main>
}function PageHead({title,text,kicker='TYRKAID'}){
 return <div className="page-head karee-page-head"><div className="container"><span className="karee-overline">{kicker}</span><h1>{title}</h1>{text&&<p>{text}</p>}</div></div>
}function Products(){
 const{categories,products}=useData();
 const[q,setQ]=useState(''),[cat,setCat]=useState('all');
 const list=products.filter(p=>(cat==='all'||String(p.category_id)===cat)&&(`${p.model} ${p.name} ${p.summary}`.toLowerCase().includes(q.toLowerCase())));
 return <Layout>
  <PageHead kicker="PRODUCT CENTER" title="产品中心" text="浏览设备系列、型号与技术资料，快速找到适合工艺需求的方案。"/>
  <section className="karee-section">
   <div className="container karee-products-layout">
    <aside className="karee-filter-panel">
     <h3>产品分类</h3>
     <button className={cat==='all'?'selected':''} onClick={()=>setCat('all')}>全部产品</button>
     {categories.map(c=><button key={c.id} className={cat===String(c.id)?'selected':''} onClick={()=>setCat(String(c.id))}>{c.name}</button>)}
    </aside>
    <div className="karee-catalog">
     <div className="karee-catalog-tools"><div className="search"><Search size={17}/><input placeholder="搜索型号或产品名称" value={q} onChange={e=>setQ(e.target.value)}/></div><span>{list.length} 个产品</span></div>
     <div className="karee-product-grid">{list.map((p,i)=><ProductCard key={p.id} item={p} priority={i<3}/>)}</div>
    </div>
   </div>
  </section>
 </Layout>
}function Category(){
 const{slug}=useParams(),{categories,products}=useData();
 const c=categories.find(x=>x.slug===slug);
 if(!c)return <NotFound/>;
 const list=products.filter(x=>Number(x.category_id)===Number(c.id));
 return <Layout><PageHead kicker="PRODUCT RANGE" title={c.name} text={c.summary}/><section className="karee-section"><div className="container karee-product-grid">{list.map((p,i)=><ProductCard key={p.id} item={p} priority={i<3}/>)}</div></section></Layout>
}function ProductDetail(){
 const{slug}=useParams(),{products,categories}=useData();
 const p=products.find(x=>x.slug===slug);
 const[active,setActive]=useState(0),[zoom,setZoom]=useState(false);
 if(!p)return <NotFound/>;
 const c=categories.find(x=>Number(x.id)===Number(p.category_id));
 const imgs=Array.isArray(p.images)?p.images.filter(Boolean):[];
 const safeActive=Math.min(active,Math.max(imgs.length-1,0));
 return <Layout>
  <main className="karee-detail">
   <section className="container karee-detail-top">
    <div className="karee-gallery">
     <div className="karee-gallery-main" onClick={()=>imgs[safeActive]&&setZoom(true)}>
      {imgs[safeActive]?<img src={imgs[safeActive]} alt={`${p.name} - 图片 ${safeActive+1}`} loading="eager" decoding="async" fetchPriority="high"/>:<Art/>}
      {imgs[safeActive]&&<span className="karee-zoom"><ZoomIn size={15}/> 查看大图</span>}
     </div>
     {imgs.length>0&&<div className="karee-gallery-thumbs">{imgs.map((x,i)=><button type="button" key={`${x}-${i}`} className={i===safeActive?'active':''} onClick={()=>setActive(i)} aria-label={`查看第 ${i+1} 张产品图`}><img src={x} alt={`${p.name} 缩略图 ${i+1}`} loading="lazy" decoding="async"/></button>)}</div>}
     {imgs.length>1&&<div className="karee-image-count">{safeActive+1} / {imgs.length} images</div>}
    </div>
    <div className="karee-detail-copy">
     <span className="karee-overline">{c?.name||'PRODUCT'}</span>
     <h1>{p.name}</h1>
     <p className="karee-detail-lead">{p.summary}</p>
     <div className="karee-detail-meta">
      <div><span>产品系列</span><strong>{c?.name||'—'}</strong></div>
      <div><span>产品型号</span><strong>{p.model||'—'}</strong></div>
      <div><span>产品支持</span><strong>可按工艺需求配置</strong></div>
     </div>
     <a className="karee-detail-jump" href="#overview">查看产品详情 <ArrowRight size={15}/></a>
    </div>
   </section>

   <nav className="karee-detail-tabs container"><a href="#overview">产品概览</a><a href="#specifications">技术参数</a>{imgs.length>1&&<a href="#product-images">产品图片</a>}</nav>

   <section id="overview" className="karee-detail-section"><div className="container karee-detail-narrow"><span className="karee-overline">ABOUT THIS PRODUCT</span><h2>产品概览</h2>{(p.description||p.summary||'').split(/\n\n+/).map((x,i)=><p key={i}>{x}</p>)}</div></section>

   <section id="specifications" className="karee-detail-section muted"><div className="container karee-detail-narrow"><span className="karee-overline">PRODUCT INFORMATION</span><h2>技术参数</h2><div className="karee-spec-table">{Object.entries(p.specs||{}).map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></div></section>

   {imgs.length>1&&<section id="product-images" className="karee-detail-section"><div className="container"><span className="karee-overline">EXPLORE THE DETAILS</span><h2>更多产品图片</h2><p className="karee-detail-intro">从不同角度查看设备结构与细节。</p><div className="karee-detail-images">{imgs.slice(1).map((x,i)=><button type="button" key={x+i} onClick={()=>{setActive(i+1);setZoom(true)}}><img src={x} alt={`${p.name} 详情图片 ${i+2}`} loading="lazy" decoding="async"/></button>)}</div></div></section>}

   {zoom&&imgs[safeActive]&&<div className="lightbox" onClick={()=>setZoom(false)}><button type="button" aria-label="关闭大图"><X/></button><img src={imgs[safeActive]} alt={p.name} decoding="async"/></div>}
  </main>
 </Layout>
}function News(){const{news}=useData();return <Layout><PageHead title="公司新闻" text="了解 Tyrkaid 企业动态、设备更新与技术资讯。"/><section className="section"><div className="container news-grid">{news.map(n=><NewsCard key={n.id} item={n}/>)}</div></section></Layout>}
function Article(){const{slug}=useParams(),{news}=useData();const n=news.find(x=>x.slug===slug);if(!n)return <NotFound/>;return <Layout><article className="container article"><div className="article-heading"><span className="eyebrow">{shortDate(n.published_at)}</span><h1>{n.title}</h1><p>{n.excerpt}</p></div>{n.cover_url&&<img className="article-cover" src={n.cover_url} alt={n.title} loading="lazy" decoding="async"/>}<div className="article-text">{n.body}</div></article></Layout>}
function About(){const{settings}=useData();return <Layout><PageHead title={settings.about_page_title} text={settings.about_page_intro}/><section className="section"><div className="container about-grid"><div><span className="eyebrow">{settings.about_eyebrow}</span><h2>{settings.about_title}</h2>{(settings.about_body||'').split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>)}</div>{settings.about_image_url?<img className="about-custom-image" src={settings.about_image_url} alt={settings.about_title} loading="lazy" decoding="async"/>:<Art/>}</div></section><section className="section section-muted"><div className="container advantage-grid"><div className="advantage-card"><span>01</span><h3>制造经验</h3><p>长期深耕橡胶与高分子材料加工设备，持续积累制造与应用经验。</p></div><div className="advantage-card"><span>02</span><h3>应用支持</h3><p>根据材料、产能及工艺需求提供设备选型与配置建议。</p></div><div className="advantage-card"><span>03</span><h3>服务能力</h3><p>围绕安装、调试、操作与维护提供持续技术支持。</p></div></div></section></Layout>}
function Contact(){const{settings}=useData();return <Layout><PageHead title={settings.contact_page_title} text={settings.contact_page_intro}/><section className="section"><div className="container contact-grid"><div className="contact-panel"><h2>联系信息</h2>{settings.contact_address&&<p><strong>地址</strong><br/>{settings.contact_address}</p>}{settings.contact_phone&&<p><strong>电话</strong><br/><a href={'tel:'+settings.contact_phone.replace(/\s/g,'')}>{settings.contact_phone}</a></p>}{settings.contact_email&&<p><strong>邮箱</strong><br/><a href={'mailto:'+settings.contact_email}>{settings.contact_email}</a></p>}{settings.contact_whatsapp&&<p><strong>WhatsApp</strong><br/>{settings.contact_whatsapp}</p>}</div><div className="contact-panel"><h2>{settings.contact_support_title}</h2><p>{settings.contact_support_body}</p><Link className="btn btn-accent" to="/products">进入产品中心 <ArrowRight size={17}/></Link></div></div></section></Layout>}
function NotFound(){return <Layout><main className="container not-found"><h1>页面不存在</h1><Link to="/">返回首页</Link></main></Layout>}
function Field({label,value,onChange,multiline=false,type='text',required=false,rows=4,placeholder=''}){return <label className="field">{label}{multiline?<textarea rows={rows} value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} required={required}/>:<input type={type} value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} required={required}/>}</label>}
function Admin(){const[checked,setChecked]=useState(false),[ok,setOk]=useState(false),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState('');useEffect(()=>{api('/api/auth/session').then(x=>setOk(x.authenticated)).catch(()=>{}).finally(()=>setChecked(true))},[]);async function login(e){e.preventDefault();try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username,password})});setOk(true);setErr('')}catch(e){setErr(e.message)}}if(!checked)return <div className="admin-shell">正在验证登录状态…</div>;if(!ok)return <div className="admin-shell"><form className="admin-login" onSubmit={login}><Logo/><ShieldCheck size={34}/><h1>后台登录</h1><p>仅限授权的网站管理员登录。</p>{err&&<div className="form-error">{err}</div>}<Field label="用户名" value={username} onChange={setUsername} required/><Field label="密码" type="password" value={password} onChange={setPassword} required/><button className="btn btn-accent">登录 <ArrowRight size={17}/></button><Link to="/">← 返回网站</Link></form></div>;return <Dashboard onLogout={()=>setOk(false)}/>}
function ImageUploader({label,value,previewMap,onUploaded,upload,folder='site'}){return <div className="field"><span>{label}</span><div className="upload"><Upload size={17}/> 选择并上传图片<input type="file" accept="image/*" onChange={e=>{upload(e.target.files,(urls)=>onUploaded(urls[0]),folder);e.target.value=''}}/></div>{value&&<div className="setting-image-preview"><img src={previewMap[value]||value}/><button type="button" onClick={()=>onUploaded('')}><Trash2 size={15}/> 移除</button></div>}</div>}
function SiteSettingsEditor({value,onChange,onSave,busy,previewMap,upload,navigation}){const s={...DEFAULT_SETTINGS,...value};const set=(k,v)=>onChange({...s,[k]:v});return <form className="visual-editor" onSubmit={e=>{e.preventDefault();onSave(s)}}><div className="visual-editor-fields"><div className="editor-title"><div><span className="eyebrow">网站装修</span><h2>可视化编辑网站内容</h2></div><button className="btn btn-accent" disabled={busy}><Save size={17}/>{busy?'保存中…':'立即保存'}</button></div><div className="settings-group"><h3>公司与品牌</h3><div className="form-grid"><Field label="公司中文名称" value={s.company_name_cn} onChange={v=>set('company_name_cn',v)}/><Field label="公司英文名称" value={s.company_name_en} onChange={v=>set('company_name_en',v)}/><Field label="品牌名称" value={s.brand_name} onChange={v=>set('brand_name',v)}/><Field label="品牌副标题" value={s.brand_subtitle} onChange={v=>set('brand_subtitle',v)}/></div><ImageUploader label="Logo" value={s.logo_url} previewMap={previewMap} onUploaded={v=>set('logo_url',v)} upload={upload}/>
<div className="logo-display-controls">
  <label className="field">Logo 显示方式
    <select value={s.logo_fit||'contain'} onChange={e=>set('logo_fit',e.target.value)}>
      <option value="contain">适应（完整显示）</option>
      <option value="frame">全框（尽量放大完整显示）</option>
      <option value="cover">填充（可能轻微裁切）</option>
      <option value="center">居中（原比例居中）</option>
      <option value="fill">拉伸（铺满区域）</option>
    </select>
  </label>
  <div className="form-grid">
    <Field label="Logo 最大宽度（px）" type="number" value={s.logo_max_width||220} onChange={v=>set('logo_max_width',Math.max(140,Math.min(Number(v)||220,300)))}/>
    <Field label="Logo 最大高度（px）" type="number" value={s.logo_max_height||72} onChange={v=>set('logo_max_height',Math.max(48,Math.min(Number(v)||72,92)))}/>
  </div>
  <small className="setting-help">建议桌面端宽 200–240px、高 64–78px。系统会自动限制范围，避免挤压宣传语与服务热线。</small>
</div><ImageUploader label="网站小图标（Favicon / 浏览器标签图标）" value={s.favicon_url} previewMap={previewMap} onUploaded={v=>set('favicon_url',v)} upload={upload}/><div className="favicon-helper"><small>建议上传正方形 PNG/SVG，推荐 256×256 或 512×512。</small></div><div className="form-grid"><Field label="顶部主宣传语" value={s.header_tagline} onChange={v=>set('header_tagline',v)}/><Field label="服务热线标题" value={s.service_hotline_label} onChange={v=>set('service_hotline_label',v)}/></div><Field label="主营产品说明" value={s.header_products_text} onChange={v=>set('header_products_text',v)} multiline/><div className="form-grid"><Field label="服务热线 1" value={s.service_hotline_1} onChange={v=>set('service_hotline_1',v)}/><Field label="服务热线 2" value={s.service_hotline_2} onChange={v=>set('service_hotline_2',v)}/></div><label className="check-line"><input type="checkbox" checked={s.hotline_sticky_enabled!==false} onChange={e=>set('hotline_sticky_enabled',e.target.checked)}/> 首页滚动时持续显示服务热线</label></div><div className="settings-group"><h3>首页 Banner</h3><Field label="顶部小标题" value={s.hero_kicker} onChange={v=>set('hero_kicker',v)}/><Field label="Banner 主标题" value={s.hero_title} onChange={v=>set('hero_title',v)}/><Field label="Banner 说明" value={s.hero_subtitle} onChange={v=>set('hero_subtitle',v)} multiline rows={4}/><ImageUploader label="Banner 图片" value={s.hero_image_url} previewMap={previewMap} onUploaded={v=>set('hero_image_url',v)} upload={upload}/><div className="form-grid"><Field label="主按钮文字" value={s.hero_primary_text} onChange={v=>set('hero_primary_text',v)}/><Field label="主按钮链接" value={s.hero_primary_link} onChange={v=>set('hero_primary_link',v)}/><Field label="次按钮文字" value={s.hero_secondary_text} onChange={v=>set('hero_secondary_text',v)}/><Field label="次按钮链接" value={s.hero_secondary_link} onChange={v=>set('hero_secondary_link',v)}/></div></div><div className="settings-group"><h3>关于我们</h3><div className="form-grid"><Field label="页面标题" value={s.about_page_title} onChange={v=>set('about_page_title',v)}/><Field label="页面简介" value={s.about_page_intro} onChange={v=>set('about_page_intro',v)}/></div><Field label="关于我们大标题（白色）" value={s.about_eyebrow} onChange={v=>set('about_eyebrow',v)}/><Field label="正文标题" value={s.about_title} onChange={v=>set('about_title',v)}/><Field label="关于我们正文" value={s.about_body} onChange={v=>set('about_body',v)} multiline rows={10}/><ImageUploader label="关于我们图片" value={s.about_image_url} previewMap={previewMap} onUploaded={v=>set('about_image_url',v)} upload={upload}/></div><div className="settings-group"><h3>联系我们</h3><div className="form-grid"><Field label="页面标题" value={s.contact_page_title} onChange={v=>set('contact_page_title',v)}/><Field label="页面简介" value={s.contact_page_intro} onChange={v=>set('contact_page_intro',v)}/><Field label="联系电话" value={s.contact_phone} onChange={v=>set('contact_phone',v)}/><Field label="联系邮箱" value={s.contact_email} onChange={v=>set('contact_email',v)}/><Field label="WhatsApp" value={s.contact_whatsapp} onChange={v=>set('contact_whatsapp',v)}/></div><Field label="公司地址" value={s.contact_address} onChange={v=>set('contact_address',v)} multiline/><Field label="右侧模块标题" value={s.contact_support_title} onChange={v=>set('contact_support_title',v)}/><Field label="右侧模块说明" value={s.contact_support_body} onChange={v=>set('contact_support_body',v)} multiline/></div><div className="settings-group"><h3>页脚</h3><Field label="页脚公司简介" value={s.footer_description} onChange={v=>set('footer_description',v)} multiline/><Field label="版权文字" value={s.footer_copyright} onChange={v=>set('footer_copyright',v)}/></div><button className="btn btn-accent" disabled={busy}><Save size={17}/>{busy?'保存中…':'立即保存'}</button></div><aside className="live-preview"><div className="preview-label"><Eye size={16}/> 实时预览</div><div className="preview-browser"><div className="preview-header preview-masthead"><div className={'preview-logo '+(s.logo_url?'has-image logo-fit-'+(s.logo_fit||'contain'):'')}>{s.logo_url?<img src={previewMap[s.logo_url]||s.logo_url}/>:<><b>{s.brand_name?.slice(0,1)||'T'}</b><span>{s.brand_name}<small>{s.brand_subtitle}</small></span></>}</div><div className="preview-header-copy"><b>{s.header_tagline}</b><small>{s.header_products_text}</small></div><div className="preview-hotline"><span>{s.service_hotline_label||'服务热线'}</span><b>{s.service_hotline_1}</b></div></div><div className="preview-nav-row">{[...navigation].filter(x=>x.visible!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).slice(0,6).map(n=><span key={n.id||n.path}>{n.label}</span>)}</div><div className="preview-hero"><div><small>{s.hero_kicker}</small><h3>{s.hero_title}</h3><p>{s.hero_subtitle}</p><button type="button">{s.hero_primary_text||'按钮'}</button></div>{s.hero_image_url?<img src={previewMap[s.hero_image_url]||s.hero_image_url}/>:<div className="preview-placeholder"><ImageIcon/></div>}</div><div className="preview-about"><div><small>关于我们</small><h4>{s.about_title}</h4><p>{(s.about_body||'').slice(0,110)}{(s.about_body||'').length>110?'…':''}</p></div>{s.about_image_url?<img src={previewMap[s.about_image_url]||s.about_image_url}/>:<div className="preview-placeholder"><ImageIcon/></div>}</div><div className="preview-contact"><h4>{s.contact_page_title}</h4><p>{s.contact_address}</p><p>{s.contact_phone} · {s.contact_email}</p></div></div></aside></form>}

function AdminDashboard({rows,setTab}){
 const products=Array.isArray(rows.products)?rows.products:[];
 const categories=Array.isArray(rows.categories)?rows.categories:[];
 const news=Array.isArray(rows.news)?rows.news:[];
 const featured=products.filter(p=>p.featured);
 const published=news.filter(n=>n.status==='published');
 const drafts=news.filter(n=>n.status!=='published');
 const withImages=products.filter(p=>Array.isArray(p.images)&&p.images.length>0);
 const missingImages=products.filter(p=>!Array.isArray(p.images)||!p.images.length);
 const missingSummary=products.filter(p=>!(p.summary||'').trim());
 const completeness=products.length?Math.round(((products.length-missingImages.length-missingSummary.length/2)/products.length)*100):100;
 const safeCompleteness=Math.max(0,Math.min(100,completeness));
 const recentProducts=[...products].sort((a,b)=>String(b.updated_at||b.created_at||'').localeCompare(String(a.updated_at||a.created_at||''))).slice(0,5);
 const recentNews=[...news].sort((a,b)=>String(b.updated_at||b.published_at||'').localeCompare(String(a.updated_at||a.published_at||''))).slice(0,5);
 const fmtDate=v=>v?String(v).slice(0,10):'—';
 return <div className="dashboard-home">
  <div className="dashboard-welcome">
   <div><span className="eyebrow">TYRKAID CMS</span><h2>内容管理概览</h2><p>快速查看产品、新闻和网站内容状态。</p></div>
   <div className="dashboard-quick-actions">
    <button className="btn btn-accent" type="button" onClick={()=>setTab('products')}><Plus size={16}/> 新增产品</button>
    <button className="btn btn-ghost" type="button" onClick={()=>setTab('news')}><Plus size={16}/> 发布新闻</button>
   </div>
  </div>

  <div className="dashboard-stat-grid">
   <button type="button" className="dashboard-stat" onClick={()=>setTab('products')}><span>产品总数</span><strong>{products.length}</strong><small>{featured.length} 个推荐到首页</small></button>
   <button type="button" className="dashboard-stat" onClick={()=>setTab('categories')}><span>产品分类</span><strong>{categories.length}</strong><small>当前有效分类</small></button>
   <button type="button" className="dashboard-stat" onClick={()=>setTab('news')}><span>新闻总数</span><strong>{news.length}</strong><small>{published.length} 已发布 · {drafts.length} 草稿</small></button>
   <button type="button" className="dashboard-stat" onClick={()=>setTab('site')}><span>内容完整度</span><strong>{safeCompleteness}%</strong><small>{missingImages.length} 个产品缺少图片</small></button>
  </div>

  <div className="dashboard-panels">
   <section className="dashboard-panel">
    <div className="dashboard-panel-head"><div><span className="eyebrow">内容分析</span><h3>产品内容健康</h3></div><button type="button" onClick={()=>setTab('products')}>管理产品</button></div>
    <div className="health-meter"><div style={{width:`${safeCompleteness}%`}}/></div>
    <div className="health-grid">
     <div><strong>{withImages.length}</strong><span>已有产品图</span></div>
     <div><strong>{missingImages.length}</strong><span>缺少产品图</span></div>
     <div><strong>{missingSummary.length}</strong><span>缺少简短介绍</span></div>
     <div><strong>{featured.length}</strong><span>首页推荐</span></div>
    </div>
   </section>

   <section className="dashboard-panel">
    <div className="dashboard-panel-head"><div><span className="eyebrow">新闻状态</span><h3>发布概览</h3></div><button type="button" onClick={()=>setTab('news')}>管理新闻</button></div>
    <div className="news-status-bars">
     <div><span>已发布</span><b>{published.length}</b><i><em style={{width:`${news.length?published.length/news.length*100:0}%`}}/></i></div>
     <div><span>草稿</span><b>{drafts.length}</b><i><em style={{width:`${news.length?drafts.length/news.length*100:0}%`}}/></i></div>
    </div>
   </section>
  </div>

  <div className="dashboard-panels dashboard-recent">
   <section className="dashboard-panel">
    <div className="dashboard-panel-head"><div><span className="eyebrow">最近更新</span><h3>产品</h3></div></div>
    {recentProducts.length?<div className="recent-list">{recentProducts.map(p=><button type="button" key={p.id} onClick={()=>setTab('products')}><span><strong>{p.model}</strong> {p.name}</span><small>{fmtDate(p.updated_at||p.created_at)}</small></button>)}</div>:<div className="empty">暂无产品。</div>}
   </section>
   <section className="dashboard-panel">
    <div className="dashboard-panel-head"><div><span className="eyebrow">最近更新</span><h3>新闻</h3></div></div>
    {recentNews.length?<div className="recent-list">{recentNews.map(n=><button type="button" key={n.id} onClick={()=>setTab('news')}><span><strong>{n.status==='published'?'已发布':'草稿'}</strong> {n.title}</span><small>{fmtDate(n.updated_at||n.published_at)}</small></button>)}</div>:<div className="empty">暂无新闻。</div>}
   </section>
  </div>
 </div>
}

function MediaLibrary({upload,busy,setBusy,setMsg}){
 const[items,setItems]=useState([]),[selected,setSelected]=useState([]),[folder,setFolder]=useState('all'),[query,setQuery]=useState(''),[uploadFolder,setUploadFolder]=useState('products'),[loading,setLoading]=useState(true);
 async function load(){setLoading(true);try{const d=await api('/api/admin/media');setItems(Array.isArray(d.items)?d.items:[])}catch(e){setMsg('图片库加载失败：'+e.message)}finally{setLoading(false)}}
 useEffect(()=>{load()},[]);
 const filtered=items.filter(x=>(folder==='all'||x.folder===folder)&&(!query||x.name.toLowerCase().includes(query.toLowerCase())||x.path.toLowerCase().includes(query.toLowerCase())));
 const removable=filtered.filter(x=>!x.in_use),selectedSet=new Set(selected);
 const fmt=n=>n>=1024*1024?(n/1024/1024).toFixed(1)+' MB':n>=1024?(n/1024).toFixed(0)+' KB':n+' B';
 function toggle(path){setSelected(v=>v.includes(path)?v.filter(x=>x!==path):[...v,path])}
 function selectAll(){const paths=removable.map(x=>x.path);setSelected(v=>paths.every(p=>v.includes(p))?v.filter(x=>!paths.includes(x)):[...new Set([...v,...paths])])}
 async function remove(){if(!selected.length)return;const count=selected.length;if(!confirm(`确定删除选中的 ${count} 张未使用图片？删除后 GitHub 会产生一次提交并触发 Cloudflare 重新部署。`))return;setBusy(true);try{const d=await api('/api/admin/media',{method:'DELETE',body:JSON.stringify({paths:selected})});setSelected([]);setMsg(`已删除 ${d.deleted?.length||0} 张图片${d.blocked?.length?`，另有 ${d.blocked.length} 张仍在使用，已自动跳过。`:''}`);await load()}catch(e){setMsg('删除失败：'+e.message)}finally{setBusy(false)}}
 function add(files){upload(files,async()=>{setMsg('图片已上传到 GitHub；图片库已刷新。');await load()},uploadFolder)}
 return <div className="media-library"><div className="media-toolbar"><div className="media-filter"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索图片文件名"/></div><select value={folder} onChange={e=>setFolder(e.target.value)}><option value="all">全部分类</option><option value="products">产品图片</option><option value="news">新闻图片</option><option value="site">网站装修图片</option></select><button type="button" className="btn btn-ghost" onClick={load}>刷新</button></div><div className="media-actions"><div className="media-upload-group"><select value={uploadFolder} onChange={e=>setUploadFolder(e.target.value)}><option value="products">上传到产品图片</option><option value="news">上传到新闻图片</option><option value="site">上传到网站装修图片</option></select><div className="upload"><Upload size={17}/> 上传图片<input type="file" multiple accept="image/*" onChange={e=>{add(e.target.files);e.target.value=''}}/></div></div><div className="media-batch"><button type="button" onClick={selectAll} disabled={!removable.length}>选择当前未使用图片</button><span>已选 {selected.length} 张</span><button type="button" className="danger-button" onClick={remove} disabled={!selected.length||busy}><Trash2 size={15}/> 批量删除</button></div></div><p className="media-note">“使用中”的图片受到保护，不能在图片库直接删除。请先从对应产品、新闻或网站装修中移除并保存，再回来删除。</p>{loading?<div className="empty">正在读取 GitHub 图片库…</div>:filtered.length?<div className="media-grid">{filtered.map(x=><article className={'media-card '+(x.in_use?'is-used':'')} key={x.path}><label className="media-check"><input type="checkbox" checked={selectedSet.has(x.path)} disabled={x.in_use} onChange={()=>toggle(x.path)}/></label><div className="media-thumb"><img src={'/api/admin/media?file='+encodeURIComponent(x.path)} alt={x.name}/></div><div className="media-meta"><strong title={x.name}>{x.name}</strong><span>{x.folder==='products'?'产品图片':x.folder==='news'?'新闻图片':'网站装修'} · {fmt(x.size)}</span>{x.in_use?<div className="media-used"><b>使用中</b>{x.used_by.map(v=><small key={v}>{v}</small>)}</div>:<em>未使用，可删除</em>}</div></article>)}</div>:<div className="empty">没有找到符合条件的图片。</div>}</div>
}
function Dashboard({onLogout}){const[tab,setTab]=useState('dashboard'),[rows,setRows]=useState({categories:[],products:[],news:[],settings:DEFAULT_SETTINGS,navigation:DEFAULT_NAV}),[editing,setEditing]=useState(null),[siteDraft,setSiteDraft]=useState(DEFAULT_SETTINGS),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[previewMap,setPreviewMap]=useState({}),siteLoadedRef=useRef(false),siteSaveTimerRef=useRef(null);const{refresh}=useData();async function load(){try{const d=await api('/api/admin/items?type=products');const merged={...d,settings:{...DEFAULT_SETTINGS,...(d.settings||{})},navigation:Array.isArray(d.navigation)&&d.navigation.length?d.navigation:DEFAULT_NAV};setRows(merged);setSiteDraft(merged.settings);siteLoadedRef.current=true}catch(e){setMsg(e.message)}}useEffect(()=>{load()},[]);
useEffect(()=>{
 if(!siteLoadedRef.current)return;
 clearTimeout(siteSaveTimerRef.current);
 siteSaveTimerRef.current=setTimeout(async()=>{
  try{
   await api('/api/admin/items?type=settings',{method:'PUT',body:JSON.stringify(siteDraft)});
   setRows(r=>({...r,settings:siteDraft}));
   setMsg('网站装修已自动保存。');
   refresh().catch(()=>{});
  }catch(e){setMsg('自动保存失败：'+e.message)}
 },700);
 return()=>clearTimeout(siteSaveTimerRef.current);
},[siteDraft]);
const blank={categories:{name:'',slug:'',summary:'',sort_order:0},products:{model:'',name:'',slug:'',category_id:'',summary:'',description:'',specs:{},images:[],featured:false,sort_order:0},news:{title:'',slug:'',excerpt:'',body:'',cover_url:'',status:'draft',published_at:new Date().toISOString()},navigation:{label:'',path:'/',sort_order:(rows.navigation?.length||0)+1,visible:true}};const update=(k,v)=>setEditing(x=>({...x,[k]:v}));async function save(e){e.preventDefault();setBusy(true);try{const p={...editing};if(!p.slug&&tab!=='navigation')p.slug=slugify(p.model?`${p.model}-${p.name}`:p.title||p.name);const method=p.id?'PUT':'POST';await api('/api/admin/items?type='+tab,{method,body:JSON.stringify(p)});setEditing(null);setMsg('保存成功。');await Promise.all([load(),refresh()])}catch(e){setMsg('保存失败：'+e.message)}finally{setBusy(false)}}async function saveSettings(s){setBusy(true);try{await api('/api/admin/items?type=settings',{method:'PUT',body:JSON.stringify(s)});setMsg('网站设置已保存，前台已更新。');await Promise.all([load(),refresh()])}catch(e){setMsg('保存失败：'+e.message)}finally{setBusy(false)}}async function del(x){if(!confirm('确定删除？'))return;try{await api(`/api/admin/items?type=${tab}&id=${x.id}`,{method:'DELETE'});await Promise.all([load(),refresh()]);setMsg('已删除。')}catch(e){setMsg(e.message)}}async function upload(files,onDone,folder){if(!files?.length)return;const originalFiles=[...files];setBusy(true);setMsg('正在优化并上传图片…');try{const fileList=await Promise.all(originalFiles.map(optimizeImageFile)),localPreviews=fileList.map(f=>URL.createObjectURL(f));const fd=new FormData();fileList.forEach(f=>fd.append('files',f));fd.append('folder',folder);const d=await api('/api/admin/upload',{method:'POST',body:fd});const pairs={};d.urls.forEach((u,i)=>{if(localPreviews[i])pairs[u]=localPreviews[i]});setPreviewMap(m=>({...m,...pairs}));onDone(d.urls);setMsg('图片已上传。后台立即显示预览；Cloudflare 自动部署完成后正式图片地址生效。')}catch(e){setMsg('上传失败：'+e.message)}finally{setBusy(false)}}async function uploadField(files,field,folder){upload(files,urls=>{if(field==='images')update(field,[...(editing.images||[]),...urls]);else update(field,urls[0])},folder)}async function logout(){await api('/api/auth/logout',{method:'POST'}).catch(()=>{});onLogout()}const menu=[['dashboard','首页',null],['products','产品',null],['categories','产品分类',null],['news','新闻',null],['site','网站装修',Settings2],['media','图片库',ImageIcon],['navigation','导航菜单',PanelTop]];const list=rows[tab]||[];const title={dashboard:'首页',products:'产品管理',categories:'产品分类',news:'新闻管理',site:'网站装修',media:'图片库',navigation:'导航菜单'}[tab];return <div className="admin-layout"><aside className="admin-sidebar"><Logo settings={siteDraft}/><div className="admin-menu"><span>后台管理</span>{menu.map(([k,n,Icon])=><button key={k} className={tab===k?'active':''} onClick={()=>{setTab(k);setEditing(null)}}>{Icon&&<Icon size={15}/>}<span className="menu-name">{n}</span>{!['site','dashboard'].includes(k)&&<span>{Array.isArray(rows[k])?rows[k].length:''}</span>}</button>)}</div><Link to="/" target="_blank"><ExternalLink size={16}/> 查看网站</Link><button className="admin-signout" onClick={logout}><LogOut size={16}/> 退出登录</button></aside><section className="admin-content"><div className="admin-top"><div><span className="eyebrow">后台管理</span><h1>{title}</h1></div>{['products','categories','news','navigation'].includes(tab)&&<button className="btn btn-accent" onClick={()=>setEditing(structuredClone(blank[tab]))}><Plus size={17}/> 新增</button>}</div>{msg&&<div className="admin-message">{msg}</div>}{tab==='dashboard'?<AdminDashboard rows={rows} setTab={setTab}/>:tab==='site'?<SiteSettingsEditor value={siteDraft} onChange={setSiteDraft} onSave={saveSettings} busy={busy} previewMap={previewMap} upload={(files,cb,folder)=>upload(files,cb,folder)} navigation={rows.navigation||DEFAULT_NAV}/>:tab==='media'?<MediaLibrary upload={(files,cb,folder)=>upload(files,cb,folder)} busy={busy} setBusy={setBusy} setMsg={setMsg}/>:editing?<form className="editor" onSubmit={save}><div className="editor-title"><h2>{editing.id?'编辑':'新增'}内容</h2><button type="button" onClick={()=>setEditing(null)}>取消 <X size={14}/></button></div>{tab==='categories'&&<><Field label="分类名称" value={editing.name} onChange={v=>update('name',v)} required/><Field label="URL 标识（Slug）" value={editing.slug} onChange={v=>update('slug',v)}/><Field label="简介" value={editing.summary} onChange={v=>update('summary',v)} multiline/><Field label="显示排序" type="number" value={editing.sort_order} onChange={v=>update('sort_order',Number(v))}/></>}{tab==='navigation'&&<><Field label="菜单名称" value={editing.label} onChange={v=>update('label',v)} required/><Field label="链接路径" value={editing.path} onChange={v=>update('path',v)} placeholder="例如 /products" required/><Field label="排序" type="number" value={editing.sort_order} onChange={v=>update('sort_order',Number(v))}/><label className="check-line"><input type="checkbox" checked={editing.visible!==false} onChange={e=>update('visible',e.target.checked)}/>{editing.visible!==false?<Eye size={15}/>:<EyeOff size={15}/>} 前台显示</label></>}{tab==='products'&&<><div className="form-grid"><Field label="产品型号" value={editing.model} onChange={v=>update('model',v)} required/><Field label="产品名称" value={editing.name} onChange={v=>update('name',v)} required/></div><label className="field">所属分类<select value={editing.category_id||''} onChange={e=>update('category_id',Number(e.target.value))} required><option value="">请选择</option>{rows.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="URL 标识（Slug）" value={editing.slug} onChange={v=>update('slug',v)}/><Field label="简短介绍" value={editing.summary} onChange={v=>update('summary',v)} multiline/><Field label="产品详细介绍" value={editing.description} onChange={v=>update('description',v)} multiline rows={7}/><label className="field">技术参数（格式：参数名: 参数值）<textarea rows="6" value={Object.entries(editing.specs||{}).map(([k,v])=>`${k}: ${v}`).join('\n')} onChange={e=>update('specs',Object.fromEntries(e.target.value.split('\n').filter(s=>s.includes(':')).map(s=>{const i=s.indexOf(':');return[s.slice(0,i).trim(),s.slice(i+1).trim()]})))}/></label><label className="check-line"><input type="checkbox" checked={!!editing.featured} onChange={e=>update('featured',e.target.checked)}/> 首页推荐</label><Field label="显示排序" type="number" value={editing.sort_order} onChange={v=>update('sort_order',Number(v))}/><div className="field">产品图片<div className="upload"><Upload size={17}/> 上传图片<input type="file" multiple accept="image/*" onChange={e=>{uploadField(e.target.files,'images','products');e.target.value=''}}/></div><div className="image-list">{(editing.images||[]).map((u,i)=><div key={u}><img src={previewMap[u]||u}/><button type="button" aria-label={`移除第 ${i+1} 张产品图片`} title="移除图片" onClick={()=>update('images',editing.images.filter((_,j)=>j!==i))}><X size={14}/></button></div>)}</div></div></>}{tab==='news'&&<><Field label="新闻标题" value={editing.title} onChange={v=>update('title',v)} required/><Field label="URL 标识（Slug）" value={editing.slug} onChange={v=>update('slug',v)}/><Field label="摘要" value={editing.excerpt} onChange={v=>update('excerpt',v)} multiline/><Field label="新闻正文" value={editing.body} onChange={v=>update('body',v)} multiline rows={12}/><label className="field">发布状态<select value={editing.status} onChange={e=>update('status',e.target.value)}><option value="draft">草稿</option><option value="published">已发布</option></select></label><Field label="发布日期" type="date" value={(editing.published_at||'').slice(0,10)} onChange={v=>update('published_at',v+'T00:00:00Z')}/><div className="field">封面图片<div className="upload"><Upload size={17}/> 上传封面<input type="file" accept="image/*" onChange={e=>{uploadField(e.target.files,'cover_url','news');e.target.value=''}}/></div>{editing.cover_url&&<div className="image-list"><div><img src={previewMap[editing.cover_url]||editing.cover_url}/></div></div>}</div></>}<button disabled={busy} className="btn btn-accent"><Save size={17}/>{busy?'处理中…':'保存'}</button></form>:<div className="admin-table">{list.length?<table><thead><tr><th>名称</th><th>信息</th><th>操作</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td><strong>{x.model||x.label||x.name||x.title}</strong></td><td>{tab==='navigation'?`${x.path} · ${x.visible?'显示':'隐藏'}`:(x.name||x.slug||x.status)}</td><td className="actions"><button onClick={()=>setEditing(structuredClone(x))}>编辑</button><button className="danger" type="button" aria-label={`删除 ${x.model||x.label||x.name||x.title||"此项"}`} title="删除" onClick={()=>del(x)}><Trash2 size={15}/></button></td></tr>)}</tbody></table>:<div className="empty">暂无内容。</div>}</div>}</section></div>}
function RoutedApp(){const{booted}=useData();if(!booted)return <div className="site-boot" role="status" aria-live="polite"><span>TYRKAID</span><small>正在加载网站内容…</small></div>;return <Routes><Route path="/" element={<><Header/><Home/><Footer/></>}/><Route path="/products" element={<Products/>}/><Route path="/products/:slug" element={<ProductDetail/>}/><Route path="/categories/:slug" element={<Category/>}/><Route path="/news" element={<News/>}/><Route path="/news/:slug" element={<Article/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes>}
function App(){return <DataProvider><RoutedApp/></DataProvider>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
