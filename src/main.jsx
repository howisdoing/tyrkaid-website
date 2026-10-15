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
 hero_kicker:'橡胶 · 塑料 · 硅胶混炼设备',hero_title:'稳定设备，成就高效生产。',hero_subtitle:'Tyrkaid 专注橡胶、塑料及硅胶混炼设备的设计与制造，覆盖实验室研发、中试验证及工业化生产场景。',hero_image_url:'',hero_layout:'split-right',hero_image_fit:'contain',hero_text_align:'left',hero_text_color:'dark',hero_overlay_opacity:42,hero_image_position:'center',hero_primary_text:'查看产品中心',hero_primary_link:'/products',hero_secondary_text:'了解 Tyrkaid',hero_secondary_link:'/about',
 home_automation_kicker:'AUTOMATION',home_automation_title:'自动化与成套解决方案',home_automation_text:'围绕混炼、上料、出片、冷却、输送与控制环节进行设备联动和流程优化，让生产节拍更稳定、操作更直观、维护更方便。',home_automation_image_url:'',
 about_page_title:'关于 Tyrkaid',about_page_intro:'来自中国东莞的橡胶、塑料与硅胶加工设备制造商。',about_eyebrow:'DONGGUAN TYRKAID MACHINERY CO., LTD.',about_title:'专注橡胶、塑料与硅胶混炼技术。',about_body:'Tyrkaid 专注于橡胶、塑料及硅胶混炼设备的设计、研发与制造。产品覆盖开放式炼胶机、密炼机、压延设备、切胶设备及相关辅助系统，可满足实验室研发、中试验证与工业化生产等不同场景。\n\n公司位于中国制造业重镇广东东莞。我们将制造经验与工程应用相结合，从设备结构、工艺配置到维护便利性持续优化，重点关注运行稳定性、生产效率、节能表现与长期可维护性。\n\n针对不同材料体系、产能规模和工艺要求，Tyrkaid 可提供针对性的设备配置建议与应用支持，帮助客户从选型到落地更高效地推进项目。',about_image_url:'',
 contact_page_title:'联系我们',contact_page_intro:'Dongguan Tyrkaid Machinery Co., Ltd.',contact_address:'中国广东省东莞市高埗镇高埗中心中路1号1栋101室',contact_phone:'+86-13806015010',contact_email:'sales@tyrkaid.com',contact_whatsapp:'',contact_wechat_label:'微信',contact_wechat_qr_url:'',contact_support_title:'产品支持',contact_support_body:'您可以在产品中心查看设备分类、具体型号、技术说明及产品图片；公司动态与技术内容请前往公司新闻栏目。',
 home_sections:[
  {id:'home-hero',type:'hero',enabled:true,label:'首页 Banner',kicker:'',title:'',text:'',tone:'white'},
  {id:'home-categories',type:'categories',enabled:true,label:'产品系列',kicker:'OUR COLLECTIONS',title:'产品系列',text:'',tone:'blue'},
  {id:'home-featured',type:'featured',enabled:true,label:'精选设备',kicker:'SELECTED PRODUCTS',title:'精选设备',text:'',tone:'amber'},
  {id:'home-about',type:'about',enabled:true,label:'关于我们',kicker:'ABOUT TYRKAID',title:'',text:'',tone:'navy'},
  {id:'home-news',type:'news',enabled:true,label:'公司动态',kicker:'LATEST NEWS',title:'公司动态',text:'',tone:'green'}
 ],
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
 const phones=[settings.service_hotline_1,settings.service_hotline_2].filter(Boolean);
 return <>
  <header className="site-header restored-header">
   <div className="masthead">
    <div className="container masthead-inner">
     <Logo/>
     <div className="masthead-copy">
      <strong>{settings.header_tagline}</strong>
      <span>{settings.header_products_text}</span>
     </div>
     <div className="masthead-hotline">
      <Phone size={28}/>
      <div>
       <span>{settings.service_hotline_label||'服务热线'}</span>
       {phones.map(p=><a key={p} href={'tel:'+p.replace(/[^0-9+]/g,'')}>{p}</a>)}
      </div>
     </div>
     {settings.contact_wechat_qr_url&&<div className="masthead-wechat">
      <img src={settings.contact_wechat_qr_url} alt={(settings.contact_wechat_label||'微信')+'二维码'} loading="lazy" decoding="async"/>
      <small>{settings.contact_wechat_label||'微信'}</small>
     </div>}
    </div>
   </div>
   <div className="topbar">
    <div className="container topbar-inner">
     <button className="mobile-toggle" type="button" aria-label={open?"关闭导航菜单":"打开导航菜单"} aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
     <nav id="main-navigation" className={open?'nav restored-nav open':'nav restored-nav'}>
      {nav.map(n=><NavLink key={n.id||n.path} to={n.path}>{n.label}</NavLink>)}
     </nav>
    </div>
   </div>
  </header>
  {(phones.length>0||settings.contact_email||settings.contact_wechat_qr_url)&&<div className="global-contact-float">
   <button type="button" className="contact-float-icon" aria-label="联系方式"><Phone size={20}/></button>
   <div className="contact-float-panel">
    {phones.length>0&&<div className="contact-float-group">
     <small>{settings.service_hotline_label||'服务热线'}</small>
     {phones.map(p=><a key={p} href={'tel:'+p.replace(/[^0-9+]/g,'')}>{p}</a>)}
    </div>}
    {settings.contact_email&&<div className="contact-float-group contact-email-row"><small>邮箱</small><a href={'mailto:'+settings.contact_email}>{settings.contact_email}</a></div>}
    {settings.contact_wechat_qr_url&&<div className="contact-wechat">
     <div className="contact-wechat-copy"><small>{settings.contact_wechat_label||'微信'}</small><span>扫码联系</span></div>
     <img src={settings.contact_wechat_qr_url} alt={(settings.contact_wechat_label||'微信')+'二维码'} loading="lazy" decoding="async"/>
    </div>}
   </div>
  </div>}
 </>
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
 const categoryImage=c=>{const p=products.find(x=>Number(x.category_id)===Number(c.id)&&imageOf(x));return p?imageOf(p):''};
 const fallback=[
  {id:'home-hero',type:'hero',enabled:true,label:'首页 Banner',tone:'white'},
  {id:'home-categories',type:'categories',enabled:true,label:'产品系列',kicker:'OUR COLLECTIONS',title:'产品系列',tone:'blue'},
  {id:'home-featured',type:'featured',enabled:true,label:'精选设备',kicker:'SELECTED PRODUCTS',title:'精选设备',tone:'amber'},
  {id:'home-about',type:'about',enabled:true,label:'关于我们',kicker:'ABOUT TYRKAID',tone:'navy'},
  {id:'home-news',type:'news',enabled:true,label:'公司动态',kicker:'LATEST NEWS',title:'公司动态',tone:'green'}
 ];
 const sections=Array.isArray(settings.home_sections)&&settings.home_sections.length?settings.home_sections:fallback;
 const renderSection=(sec,index)=>{
  if(sec.enabled===false)return null;
  if(sec.type==='hero'){
   const layout=settings.hero_layout||'split-right',overlay=layout==='overlay',imageOnly=layout==='image-only';
   return <section className={'karee-hero editable-hero hero-layout-'+layout+' hero-text-'+(settings.hero_text_align||'left')+' hero-color-'+(settings.hero_text_color||'dark')} key={sec.id||index} style={{'--hero-overlay':Math.max(0,Math.min(80,Number(settings.hero_overlay_opacity)||42))/100}}>
    {overlay&&settings.hero_image_url&&<div className="hero-bg-layer"><img src={settings.hero_image_url} alt="" loading="eager" decoding="async" fetchPriority="high" style={{objectFit:settings.hero_image_fit||'cover',objectPosition:settings.hero_image_position||'center'}}/><span/></div>}
    <div className="container karee-hero-grid">
     {!imageOnly&&<div className="karee-hero-copy">
      <span className="karee-overline">{sec.kicker||settings.hero_kicker||'TYRKAID MACHINERY'}</span>
      <h1>{sec.title||settings.hero_title}</h1>
      <p>{sec.text||settings.hero_subtitle}</p>
      <div className="karee-hero-actions">
       {settings.hero_primary_text&&<Link className="karee-btn primary" to={settings.hero_primary_link||'/products'}>{settings.hero_primary_text}<ArrowRight size={16}/></Link>}
       {settings.hero_secondary_text&&<Link className="karee-btn secondary" to={settings.hero_secondary_link||'/about'}>{settings.hero_secondary_text}</Link>}
      </div>
     </div>}
     {!overlay&&<div className="karee-hero-media">{settings.hero_image_url?<img src={settings.hero_image_url} alt={sec.title||settings.hero_title} loading="eager" decoding="async" fetchPriority="high" style={{objectFit:settings.hero_image_fit||'contain',objectPosition:settings.hero_image_position||'center'}}/>:<Art/>}</div>}
    </div>
   </section>;
  }

  if(sec.type==='categories')return <section className={'karee-section home-dynamic-section home-tone-'+(sec.tone||'blue')} key={sec.id||index}>
   <div className="container">
    <div className="karee-section-head"><span className="karee-overline">{sec.kicker||'OUR COLLECTIONS'}</span><h2>{sec.title||'产品系列'}</h2>{sec.text&&<p className="home-section-intro">{sec.text}</p>}</div>
    <div className="karee-category-grid">
     {categories.map(c=><Link className="karee-category-card" key={c.id} to={'/categories/'+c.slug}>
      <div className="karee-category-image">{categoryImage(c)?<img src={categoryImage(c)} alt={c.name} loading="lazy" decoding="async"/>:<Art/>}</div>
      <div><h3>{c.name}</h3><span>查看系列 <ArrowRight size={15}/></span></div>
     </Link>)}
    </div>
   </div>
  </section>;

  if(sec.type==='featured')return <section className={'karee-section karee-selected home-dynamic-section home-tone-'+(sec.tone||'amber')} key={sec.id||index}>
   <div className="container">
    <div className="karee-section-head split"><div><span className="karee-overline">{sec.kicker||'SELECTED PRODUCTS'}</span><h2>{sec.title||'精选设备'}</h2>{sec.text&&<p className="home-section-intro">{sec.text}</p>}</div><Link className="karee-text-link" to="/products">全部产品 <ArrowRight size={15}/></Link></div>
    <div className="karee-product-grid">{featured.map((p,i)=><ProductCard key={p.id} item={p} priority={i<2}/>)}</div>
   </div>
  </section>;

  if(sec.type==='about')return <section className={'karee-brand-band home-dynamic-section home-tone-'+(sec.tone||'navy')} key={sec.id||index}>
   <div className="container karee-brand-grid">
    <div><span className="karee-overline">{sec.kicker||'ABOUT TYRKAID'}</span><h2>{sec.title||settings.about_title}</h2><p>{sec.text||(settings.about_body||'').split(/\n\n+/)[0]}</p><Link className="karee-text-link light" to="/about">了解我们 <ArrowRight size={15}/></Link></div>
    <div className="karee-brand-media">{settings.about_image_url?<img src={settings.about_image_url} alt={sec.title||settings.about_title} loading="lazy" decoding="async"/>:<Art/>}</div>
   </div>
  </section>;

  if(sec.type==='news')return <section className={'karee-section home-dynamic-section home-tone-'+(sec.tone||'green')} key={sec.id||index}>
   <div className="container">
    <div className="karee-section-head split"><div><span className="karee-overline">{sec.kicker||'LATEST NEWS'}</span><h2>{sec.title||'公司动态'}</h2>{sec.text&&<p className="home-section-intro">{sec.text}</p>}</div><Link className="karee-text-link" to="/news">全部新闻 <ArrowRight size={15}/></Link></div>
    <div className="karee-news-grid">{news.slice(0,3).map(n=><NewsCard key={n.id} item={n}/>)}</div>
   </div>
  </section>;

  if(sec.type==='custom')return <section className={'karee-section home-custom-section home-tone-'+(sec.tone||'gray')} key={sec.id||index}>
   <div className="container home-custom-grid">
    <div className="home-custom-copy"><span className="karee-overline">{sec.kicker||'TYRKAID'}</span><h2>{sec.title||'自定义内容区'}</h2>{sec.text&&<p>{sec.text}</p>}{sec.button_text&&<Link className="karee-btn primary" to={sec.button_link||'/products'}>{sec.button_text}<ArrowRight size={15}/></Link>}</div>
    {sec.image_url&&<div className="home-custom-media"><img src={sec.image_url} alt={sec.title||'自定义内容'} loading="lazy" decoding="async"/></div>}
   </div>
  </section>;
  return null;
 };
 return <main className="karee-home">{sections.map(renderSection)}</main>
}
function PageHead({title,text,kicker='TYRKAID'}){
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
 const detailImgs=Array.isArray(p.detail_images)&&p.detail_images.length?p.detail_images.filter(Boolean):imgs.slice(1);
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

   <nav className="karee-detail-tabs container"><a href="#overview">产品概览</a><a href="#specifications">技术参数</a>{detailImgs.length>0&&<a href="#product-images">产品详情图</a>}</nav>

   <section id="overview" className="karee-detail-section"><div className="container karee-detail-narrow"><span className="karee-overline">ABOUT THIS PRODUCT</span><h2>产品概览</h2>{(p.description||p.summary||'').split(/\n\n+/).map((x,i)=><p key={i}>{x}</p>)}</div></section>

   <section id="specifications" className="karee-detail-section muted"><div className="container karee-detail-narrow"><span className="karee-overline">PRODUCT INFORMATION</span><h2>技术参数</h2><div className="karee-spec-table">{Object.entries(p.specs||{}).map(([k,v])=><div key={k}><span>{k}</span><strong>{v}</strong></div>)}</div></div></section>

   {detailImgs.length>0&&<section id="product-images" className="karee-detail-section"><div className="container"><span className="karee-overline">PRODUCT DETAILS</span><h2>产品详情图</h2><p className="karee-detail-intro">查看设备结构、细节、配置与应用图片。</p><div className="karee-detail-images">{detailImgs.map((x,i)=><button type="button" key={x+i} onClick={()=>{setZoom(false)}}><img src={x} alt={`${p.name} 详情图片 ${i+1}`} loading="lazy" decoding="async"/></button>)}</div></div></section>}

   {zoom&&imgs[safeActive]&&<div className="lightbox" onClick={()=>setZoom(false)}><button type="button" aria-label="关闭大图"><X/></button><img src={imgs[safeActive]} alt={p.name} decoding="async"/></div>}
  </main>
 </Layout>
}function News(){const{news}=useData();return <Layout><PageHead title="公司新闻" text="了解 Tyrkaid 企业动态、设备更新与技术资讯。"/><section className="section"><div className="container news-grid">{news.map(n=><NewsCard key={n.id} item={n}/>)}</div></section></Layout>}
function Article(){const{slug}=useParams(),{news}=useData();const n=news.find(x=>x.slug===slug);if(!n)return <NotFound/>;return <Layout><article className="container article"><div className="article-heading"><span className="eyebrow">{shortDate(n.published_at)}</span><h1>{n.title}</h1><p>{n.excerpt}</p></div>{n.cover_url&&<img className="article-cover" src={n.cover_url} alt={n.title} loading="lazy" decoding="async"/>}<div className="article-text">{n.body}</div></article></Layout>}
function About(){const{settings}=useData();return <Layout><PageHead title={settings.about_page_title} text={settings.about_page_intro}/><section className="section"><div className="container about-grid"><div><span className="eyebrow">{settings.about_eyebrow}</span><h2>{settings.about_title}</h2>{(settings.about_body||'').split(/\n\n+/).map((p,i)=><p key={i}>{p}</p>)}</div>{settings.about_image_url?<img className="about-custom-image" src={settings.about_image_url} alt={settings.about_title} loading="lazy" decoding="async"/>:<Art/>}</div></section><section className="section section-muted"><div className="container advantage-grid"><div className="advantage-card"><span>01</span><h3>制造经验</h3><p>长期深耕橡胶与高分子材料加工设备，持续积累制造与应用经验。</p></div><div className="advantage-card"><span>02</span><h3>应用支持</h3><p>根据材料、产能及工艺需求提供设备选型与配置建议。</p></div><div className="advantage-card"><span>03</span><h3>服务能力</h3><p>围绕安装、调试、操作与维护提供持续技术支持。</p></div></div></section></Layout>}
function Contact(){const{settings}=useData();return <Layout><PageHead title={settings.contact_page_title} text={settings.contact_page_intro}/><section className="section"><div className="container contact-grid"><div className="contact-panel"><h2>联系信息</h2>{settings.contact_address&&<p><strong>地址</strong><br/>{settings.contact_address}</p>}{settings.contact_phone&&<p><strong>电话</strong><br/><a href={'tel:'+settings.contact_phone.replace(/\s/g,'')}>{settings.contact_phone}</a></p>}{settings.contact_email&&<p><strong>邮箱</strong><br/><a href={'mailto:'+settings.contact_email}>{settings.contact_email}</a></p>}{settings.contact_whatsapp&&<p><strong>WhatsApp</strong><br/>{settings.contact_whatsapp}</p>}</div><div className="contact-panel"><h2>{settings.contact_support_title}</h2><p>{settings.contact_support_body}</p><Link className="btn btn-accent" to="/products">进入产品中心 <ArrowRight size={17}/></Link></div></div></section></Layout>}
function NotFound(){return <Layout><main className="container not-found"><h1>页面不存在</h1><Link to="/">返回首页</Link></main></Layout>}
function Field({label,value,onChange,multiline=false,type='text',required=false,rows=4,placeholder=''}){return <label className="field">{label}{multiline?<textarea rows={rows} value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} required={required}/>:<input type={type} value={value??''} placeholder={placeholder} onChange={e=>onChange(e.target.value)} required={required}/>}</label>}


function ProductMediaPicker({open,onClose,onChoose,selected=[]}){
 const[items,setItems]=useState([]),[loading,setLoading]=useState(false),[query,setQuery]=useState(''),[picked,setPicked]=useState([]);
 useEffect(()=>{if(!open)return;setPicked([]);setLoading(true);api('/api/admin/media').then(d=>setItems((d.items||[]).filter(x=>x.folder==='products'))).catch(()=>setItems([])).finally(()=>setLoading(false))},[open]);
 if(!open)return null;
 const existing=new Set(selected||[]);
 const visible=items.filter(x=>!existing.has(x.url)&&(!query||x.name.toLowerCase().includes(query.toLowerCase())));
 const toggle=url=>setPicked(v=>v.includes(url)?v.filter(x=>x!==url):[...v,url]);
 return <div className="media-picker-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
  <div className="media-picker-dialog">
   <div className="media-picker-head"><div><span className="eyebrow">媒体库</span><h3>选择产品图片</h3></div><button type="button" onClick={onClose}><X size={18}/></button></div>
   <div className="media-picker-tools"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索产品图片"/></div><span>已选 {picked.length} 张</span></div>
   {loading?<div className="empty">正在读取媒体库…</div>:visible.length?<div className="media-picker-grid">{visible.map(x=><button type="button" key={x.path} className={picked.includes(x.url)?'selected':''} onClick={()=>toggle(x.url)}>
    <div className="media-picker-thumb"><img src={'/api/admin/media?file='+encodeURIComponent(x.path)} alt={x.name}/></div>
    <small title={x.name}>{x.name}</small>
    <span>{picked.includes(x.url)?'已选择':'选择'}</span>
   </button>)}</div>:<div className="empty">媒体库里没有可选的产品图片。</div>}
   <div className="media-picker-footer"><button type="button" className="btn btn-ghost" onClick={onClose}>取消</button><button type="button" className="btn btn-accent" disabled={!picked.length} onClick={()=>{onChoose(picked);onClose()}}>导入 {picked.length||''} 张</button></div>
  </div>
 </div>
}

function ProductImageGroupEditor({title,help,images,onChange,onUpload,previewMap,mainMode=false}){
 const[picker,setPicker]=useState(false);
 const list=Array.isArray(images)?images:[];
 const move=(i,d)=>{const n=[...list],j=i+d;if(j<0||j>=n.length)return;[n[i],n[j]]=[n[j],n[i]];onChange(n)};
 const remove=i=>onChange(list.filter((_,j)=>j!==i));
 return <div className="product-image-group">
  <div className="product-image-group-head"><div><h3>{title}</h3><p>{help}</p></div><div className="product-image-actions">
   <label className="upload compact-upload"><Upload size={15}/> 上传图片<input type="file" multiple accept="image/*" onChange={e=>{onUpload(e.target.files);e.target.value=''}}/></label>
   <button type="button" className="btn btn-ghost" onClick={()=>setPicker(true)}><ImageIcon size={15}/> 从媒体库选择</button>
  </div></div>
  {list.length?<div className="product-image-sort-grid">{list.map((u,i)=><div className="product-image-sort-card" key={u+i}>
    <div className="product-image-sort-thumb"><img src={previewMap[u]||u} alt={`${title} ${i+1}`}/>{mainMode&&i===0&&<b>主图</b>}{!mainMode&&<b>详情图 {i+1}</b>}</div>
    <div className="product-image-sort-meta"><span>{mainMode?(i===0?'列表 / 首页 / 详情首图':`主图 ${i+1}`):`详情图 ${i+1}`}</span><div>
     <button type="button" disabled={i===0} onClick={()=>move(i,-1)} aria-label="上移">↑</button>
     <button type="button" disabled={i===list.length-1} onClick={()=>move(i,1)} aria-label="下移">↓</button>
     <button type="button" className="danger" onClick={()=>remove(i)} aria-label="删除图片"><Trash2 size={14}/></button>
    </div></div>
   </div>)}</div>:<div className="product-image-empty">暂无图片。可以上传新图片，或从媒体库直接选择。</div>}
  <ProductMediaPicker open={picker} onClose={()=>setPicker(false)} selected={list} onChoose={urls=>onChange([...list,...urls.filter(x=>!list.includes(x))])}/>
 </div>
}

function SpecsEditor({value,onChange}){
 const entries=Object.entries(value||{});
 const rows=entries.length?entries:[['','']];
 const commit=next=>{
  const obj={};
  next.forEach(([k,v])=>{const key=String(k||'').trim();if(key)obj[key]=String(v??'').trim()});
  onChange(obj);
 };
 const setRow=(index,col,val)=>{
  const next=rows.map(r=>[...r]);
  next[index][col]=val;
  commit(next);
 };
 const addRow=()=>commit([...rows,['','']]);
 const removeRow=index=>{
  const next=rows.filter((_,i)=>i!==index);
  commit(next.length?next:[['','']]);
 };
 const parsePlain=text=>{
  return String(text||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(line=>{
   if(line.includes('\t')){
    const cells=line.split('\t').map(x=>x.trim()).filter((x,i,a)=>i<2||x);
    return [cells[0]||'',cells.slice(1).join(' ')||''];
   }
   const i=line.indexOf(':')>=0?line.indexOf(':'):line.indexOf('：');
   if(i>=0)return [line.slice(0,i).trim(),line.slice(i+1).trim()];
   const m=line.split(/\s{2,}/);
   return m.length>=2?[m[0].trim(),m.slice(1).join(' ').trim()]:[line,''];
  });
 };
 const parseHtml=html=>{
  if(!html)return [];
  try{
   const doc=new DOMParser().parseFromString(html,'text/html');
   const trs=[...doc.querySelectorAll('tr')];
   return trs.map(tr=>{
    const cells=[...tr.querySelectorAll('th,td')].map(td=>(td.innerText||td.textContent||'').trim());
    return cells.length>=2?[cells[0],cells.slice(1).join(' ')]:null;
   }).filter(Boolean);
  }catch{return []}
 };
 const paste=e=>{
  const html=e.clipboardData?.getData('text/html')||'';
  const plain=e.clipboardData?.getData('text/plain')||'';
  const parsed=parseHtml(html);
  const next=(parsed.length?parsed:parsePlain(plain)).filter(([k,v])=>k||v);
  if(next.length){
   e.preventDefault();
   commit(next);
  }
 };
 return <div className="field specs-editor">
  <span>技术参数</span>
  <p className="specs-help">可直接粘贴 Excel、WPS、Google Sheets 或网页表格的两列数据。第一列为参数名，第二列为参数值。</p>
  <div className="specs-paste-zone" tabIndex="0" onPaste={paste}>点击这里后直接粘贴表格（Ctrl/Cmd + V）</div>
  <div className="specs-edit-table">
   <div className="specs-edit-head"><span>参数名</span><span>参数值</span><span>操作</span></div>
   {rows.map(([k,v],i)=><div className="specs-edit-row" key={i}>
    <input value={k} placeholder="例如：辊筒尺寸" onChange={e=>setRow(i,0,e.target.value)}/>
    <input value={v} placeholder="例如：160 × 320 mm" onChange={e=>setRow(i,1,e.target.value)}/>
    <button type="button" aria-label={`删除第 ${i+1} 行参数`} onClick={()=>removeRow(i)}><Trash2 size={15}/></button>
   </div>)}
  </div>
  <button type="button" className="specs-add-row" onClick={addRow}><Plus size={15}/> 新增一行</button>
 </div>
}
function Admin(){const[checked,setChecked]=useState(false),[ok,setOk]=useState(false),[username,setUsername]=useState(''),[password,setPassword]=useState(''),[err,setErr]=useState('');useEffect(()=>{api('/api/auth/session').then(x=>setOk(x.authenticated)).catch(()=>{}).finally(()=>setChecked(true))},[]);async function login(e){e.preventDefault();try{await api('/api/auth/login',{method:'POST',body:JSON.stringify({username,password})});setOk(true);setErr('')}catch(e){setErr(e.message)}}if(!checked)return <div className="admin-shell">正在验证登录状态…</div>;if(!ok)return <div className="admin-shell"><form className="admin-login" onSubmit={login}><Logo/><ShieldCheck size={34}/><h1>后台登录</h1><p>仅限授权的网站管理员登录。</p>{err&&<div className="form-error">{err}</div>}<Field label="用户名" value={username} onChange={setUsername} required/><Field label="密码" type="password" value={password} onChange={setPassword} required/><button className="btn btn-accent">登录 <ArrowRight size={17}/></button><Link to="/">← 返回网站</Link></form></div>;return <Dashboard onLogout={()=>setOk(false)}/>}
function ImageUploader({label,value,previewMap,onUploaded,upload,folder='site'}){return <div className="field"><span>{label}</span><div className="upload"><Upload size={17}/> 选择并上传图片<input type="file" accept="image/*" onChange={e=>{upload(e.target.files,(urls)=>onUploaded(urls[0]),folder);e.target.value=''}}/></div>{value&&<div className="setting-image-preview"><img src={previewMap[value]||value}/><button type="button" onClick={()=>onUploaded('')}><Trash2 size={15}/> 移除</button></div>}</div>}
const HOME_SECTION_META={
 hero:{name:'首页 Banner',color:'slate',description:'首屏大图、标题和按钮'},
 categories:{name:'产品系列',color:'blue',description:'展示产品分类入口'},
 featured:{name:'精选设备',color:'amber',description:'展示后台勾选的首页推荐产品'},
 about:{name:'关于我们',color:'navy',description:'公司介绍与品牌图片'},
 news:{name:'公司动态',color:'green',description:'展示最新新闻'},
 custom:{name:'自定义内容',color:'purple',description:'自由文字、图片和按钮'}
};
function newHomeSection(type='custom'){
 const meta=HOME_SECTION_META[type]||HOME_SECTION_META.custom;
 return {id:`home-${type}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,type,enabled:true,label:meta.name,kicker:type==='custom'?'TYRKAID':'',title:type==='custom'?'自定义内容区':'',text:'',tone:meta.color,image_url:'',button_text:'',button_link:'/products'};
}
function HomeSectionBuilder({sections,onChange,previewMap,upload}){
 const list=Array.isArray(sections)?sections:[];
 const[addType,setAddType]=useState('custom');
 const update=(i,key,val)=>onChange(list.map((s,j)=>j===i?{...s,[key]:val}:s));
 const move=(i,d)=>{const j=i+d;if(j<0||j>=list.length)return;const n=list.map(x=>({...x}));[n[i],n[j]]=[n[j],n[i]];onChange(n)};
 const duplicate=i=>{const x=list[i],n={...x,id:`${x.type}-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,label:(x.label||HOME_SECTION_META[x.type]?.name||'区块')+' 副本'};onChange([...list.slice(0,i+1),n,...list.slice(i+1)])};
 const remove=i=>{if(confirm('确定删除这个首页功能区？'))onChange(list.filter((_,j)=>j!==i))};
 const add=()=>onChange([...list,newHomeSection(addType)]);
 return <div className="home-builder">
  <div className="home-builder-head">
   <div><span className="eyebrow">首页模块</span><h3>首页功能区</h3><p>前台将严格按照这里的上下顺序显示。不同颜色只用于后台区分模块。</p></div>
   <div className="home-builder-add"><select value={addType} onChange={e=>setAddType(e.target.value)}>{Object.entries(HOME_SECTION_META).map(([k,v])=><option key={k} value={k}>{v.name}</option>)}</select><button type="button" className="btn btn-accent" onClick={add}><Plus size={15}/> 新建功能区</button></div>
  </div>
  <div className="home-section-list">
   {list.map((sec,i)=>{
    const meta=HOME_SECTION_META[sec.type]||HOME_SECTION_META.custom;
    return <article className={'home-section-editor type-'+meta.color} key={sec.id||i}>
     <div className="home-section-bar">
      <div className="home-section-index"><span>{String(i+1).padStart(2,'0')}</span><div><strong>{sec.label||meta.name}</strong><small>{meta.description}</small></div></div>
      <div className="home-section-actions">
       <label className="home-enabled"><input type="checkbox" checked={sec.enabled!==false} onChange={e=>update(i,'enabled',e.target.checked)}/><span>{sec.enabled!==false?'显示':'隐藏'}</span></label>
       <button type="button" onClick={()=>move(i,-1)} disabled={i===0}>↑</button>
       <button type="button" onClick={()=>move(i,1)} disabled={i===list.length-1}>↓</button>
       <button type="button" onClick={()=>duplicate(i)}>复制</button>
       <button type="button" className="danger" onClick={()=>remove(i)}><Trash2 size={14}/></button>
      </div>
     </div>
     <div className="home-section-editor-body">
      <div className="form-grid">
       <Field label="后台模块名称" value={sec.label||meta.name} onChange={v=>update(i,'label',v)}/>
       <Field label="小标题 / 眉题" value={sec.kicker||''} onChange={v=>update(i,'kicker',v)} placeholder="留空则使用默认值"/>
       <Field label="前台标题" value={sec.title||''} onChange={v=>update(i,'title',v)} placeholder="留空则使用默认值"/>
       <label className="field">模块色调<select value={sec.tone||meta.color} onChange={e=>update(i,'tone',e.target.value)}><option value="white">白色</option><option value="blue">浅蓝</option><option value="amber">暖灰</option><option value="green">浅绿</option><option value="purple">浅紫</option><option value="navy">深色</option><option value="gray">浅灰</option></select></label>
      </div>
      <Field label="模块说明文字" value={sec.text||''} onChange={v=>update(i,'text',v)} multiline rows={3} placeholder="留空则使用该功能区原有内容"/>
      {sec.type==='custom'&&<>
       <ImageUploader label="自定义模块图片" value={sec.image_url||''} previewMap={previewMap} onUploaded={v=>update(i,'image_url',v)} upload={upload}/>
       <div className="form-grid"><Field label="按钮文字" value={sec.button_text||''} onChange={v=>update(i,'button_text',v)}/><Field label="按钮链接" value={sec.button_link||''} onChange={v=>update(i,'button_link',v)}/></div>
      </>}
      {sec.type==='hero'&&<div className="home-section-tip">Banner 的图片和按钮仍在上方“首页 Banner”标签中设置；这里控制它在首页的位置、显示状态和标题覆盖。</div>}
      {sec.type==='featured'&&<div className="home-section-tip">产品来源：产品管理中勾选“首页推荐”的产品。</div>}
      {sec.type==='categories'&&<div className="home-section-tip">内容来源：后台“产品分类”。</div>}
      {sec.type==='news'&&<div className="home-section-tip">内容来源：后台已发布新闻。</div>}
     </div>
    </article>
   })}
  </div>
 </div>
}
function SiteSettingsEditor({value,onChange,onSave,busy,previewMap,upload,navigation}){
 const s={...DEFAULT_SETTINGS,...value};
 const set=(k,v)=>onChange({...s,[k]:v});
 const[t,setT]=useState('brand');
 const[previewMode,setPreviewMode]=useState('desktop');
 const sections=Array.isArray(s.home_sections)&&s.home_sections.length?s.home_sections:DEFAULT_SETTINGS.home_sections;
 const tabs=[
  ['brand','公司与品牌'],['header','顶部 Header'],['hero','首页 Banner'],['home','首页功能区'],['about','关于我们'],['contact','联系我们'],['footer','页脚 Footer']
 ];
 const navPreview=[...navigation].filter(x=>x.visible!==false).sort((a,b)=>(a.sort_order||0)-(b.sort_order||0)).slice(0,6);
 return <form className="site-customizer horizontal-customizer" onSubmit={e=>{e.preventDefault();onSave(s)}}>
  <div className="customizer-topbar">
   <div><span className="eyebrow">网站装修</span><h2>主题自定义</h2><p>顶部切换区域；首页模块可排序、复制、新建和删除。</p></div>
   <div className="customizer-save"><span>{busy?'正在保存…':'修改后请点击保存'}</span><button className="btn btn-accent" disabled={busy}><Save size={16}/>{busy?'保存中…':'保存'}</button></div>
  </div>

  <nav className="customizer-tabs">{tabs.map(([id,label])=><button type="button" key={id} className={t===id?'active':''} onClick={()=>setT(id)}>{label}</button>)}</nav>

  <section className="customizer-tab-panel">
   {t==='brand'&&<div className="customizer-panel-card panel-brand">
    <div className="customizer-panel-title"><span>01</span><div><h3>公司与品牌</h3><p>公司名称、Logo 和浏览器图标。</p></div></div>
    <div className="form-grid"><Field label="公司中文名称" value={s.company_name_cn} onChange={v=>set('company_name_cn',v)}/><Field label="公司英文名称" value={s.company_name_en} onChange={v=>set('company_name_en',v)}/><Field label="品牌名称" value={s.brand_name} onChange={v=>set('brand_name',v)}/><Field label="品牌副标题" value={s.brand_subtitle} onChange={v=>set('brand_subtitle',v)}/></div>
    <div className="customizer-two-col"><ImageUploader label="Logo" value={s.logo_url} previewMap={previewMap} onUploaded={v=>set('logo_url',v)} upload={upload}/><ImageUploader label="浏览器图标 Favicon" value={s.favicon_url} previewMap={previewMap} onUploaded={v=>set('favicon_url',v)} upload={upload}/></div>
    <div className="customizer-inline-settings"><label className="field">Logo 显示方式<select value={s.logo_fit||'contain'} onChange={e=>set('logo_fit',e.target.value)}><option value="contain">适应（完整显示）</option><option value="frame">全框（尽量放大）</option><option value="cover">填充（可能裁切）</option><option value="center">原比例居中</option><option value="fill">拉伸铺满</option></select></label><Field label="最大宽度（px）" type="number" value={s.logo_max_width||220} onChange={v=>set('logo_max_width',Math.max(140,Math.min(Number(v)||220,300)))}/><Field label="最大高度（px）" type="number" value={s.logo_max_height||72} onChange={v=>set('logo_max_height',Math.max(48,Math.min(Number(v)||72,96)))}/></div>
   </div>}

   {t==='header'&&<div className="customizer-panel-card panel-header">
    <div className="customizer-panel-title"><span>02</span><div><h3>顶部 Header</h3><p>宣传语、服务热线、微信二维码和悬浮联系方式。</p></div></div>
    <Field label="顶部主宣传语" value={s.header_tagline} onChange={v=>set('header_tagline',v)}/>
    <Field label="主营产品说明" value={s.header_products_text} onChange={v=>set('header_products_text',v)} multiline rows={3}/>
    <div className="form-grid"><Field label="服务热线标题" value={s.service_hotline_label} onChange={v=>set('service_hotline_label',v)}/><Field label="服务热线 1" value={s.service_hotline_1} onChange={v=>set('service_hotline_1',v)}/><Field label="服务热线 2" value={s.service_hotline_2} onChange={v=>set('service_hotline_2',v)}/><Field label="微信显示名称" value={s.contact_wechat_label||'微信'} onChange={v=>set('contact_wechat_label',v)}/></div>
    <ImageUploader label="顶部 / 悬浮窗微信二维码" value={s.contact_wechat_qr_url} previewMap={previewMap} onUploaded={v=>set('contact_wechat_qr_url',v)} upload={upload}/>
    <label className="customizer-switch"><span><strong>悬浮联系方式</strong><small>在前台页面持续显示联系方式入口</small></span><input type="checkbox" checked={s.hotline_sticky_enabled!==false} onChange={e=>set('hotline_sticky_enabled',e.target.checked)}/></label>
   </div>}

   {t==='hero'&&<div className="customizer-panel-card panel-hero">
    <div className="customizer-panel-title"><span>03</span><div><h3>首页 Banner</h3><p>文字和图片完全独立编辑，可自由切换布局。</p></div></div>
    <div className="banner-layout-controls">
     <label className="field">Banner 布局
      <select value={s.hero_layout||'split-right'} onChange={e=>set('hero_layout',e.target.value)}>
       <option value="split-right">左文字 · 右图片</option>
       <option value="split-left">左图片 · 右文字</option>
       <option value="overlay">文字压在图片上</option>
       <option value="image-only">纯图片</option>
      </select>
     </label>
     <label className="field">图片显示方式
      <select value={s.hero_image_fit||'contain'} onChange={e=>set('hero_image_fit',e.target.value)}>
       <option value="contain">完整显示</option>
       <option value="cover">铺满裁切</option>
      </select>
     </label>
     <label className="field">图片焦点
      <select value={s.hero_image_position||'center'} onChange={e=>set('hero_image_position',e.target.value)}>
       <option value="center">居中</option><option value="left center">靠左</option><option value="right center">靠右</option><option value="center top">靠上</option><option value="center bottom">靠下</option>
      </select>
     </label>
     <label className="field">文字对齐
      <select value={s.hero_text_align||'left'} onChange={e=>set('hero_text_align',e.target.value)}>
       <option value="left">左对齐</option><option value="center">居中</option>
      </select>
     </label>
     <label className="field">文字颜色
      <select value={s.hero_text_color||'dark'} onChange={e=>set('hero_text_color',e.target.value)}>
       <option value="dark">深色</option><option value="light">白色</option>
      </select>
     </label>
     {s.hero_layout==='overlay'&&<Field label="图片遮罩深度（0–80）" type="number" value={s.hero_overlay_opacity??42} onChange={v=>set('hero_overlay_opacity',Math.max(0,Math.min(80,Number(v)||0)))}/>}
    </div>
    <div className="customizer-two-col">
     <div className="banner-text-editor">
      <span className="editor-mini-title">文字内容</span>
      <Field label="顶部小标题" value={s.hero_kicker} onChange={v=>set('hero_kicker',v)}/>
      <Field label="Banner 主标题" value={s.hero_title} onChange={v=>set('hero_title',v)}/>
      <Field label="Banner 说明" value={s.hero_subtitle} onChange={v=>set('hero_subtitle',v)} multiline rows={4}/>
      <div className="form-grid"><Field label="主按钮文字" value={s.hero_primary_text} onChange={v=>set('hero_primary_text',v)}/><Field label="主按钮链接" value={s.hero_primary_link} onChange={v=>set('hero_primary_link',v)}/><Field label="次按钮文字" value={s.hero_secondary_text} onChange={v=>set('hero_secondary_text',v)}/><Field label="次按钮链接" value={s.hero_secondary_link} onChange={v=>set('hero_secondary_link',v)}/></div>
     </div>
     <div className="banner-image-editor">
      <span className="editor-mini-title">图片内容</span>
      <ImageUploader label="Banner 图片" value={s.hero_image_url} previewMap={previewMap} onUploaded={v=>set('hero_image_url',v)} upload={upload}/>
      <p className="banner-editor-help">图片和文字互不绑定。换图片不会改变文字，改文字也不会影响图片。</p>
     </div>
    </div>
   </div>}

   {t==='home'&&<HomeSectionBuilder sections={sections} onChange={v=>set('home_sections',v)} previewMap={previewMap} upload={upload}/>}

   {t==='about'&&<div className="customizer-panel-card panel-about">
    <div className="customizer-panel-title"><span>05</span><div><h3>关于我们</h3><p>页面标题、正文和品牌图片。</p></div></div>
    <div className="form-grid"><Field label="页面标题" value={s.about_page_title} onChange={v=>set('about_page_title',v)}/><Field label="页面简介" value={s.about_page_intro} onChange={v=>set('about_page_intro',v)}/></div>
    <Field label="品牌眉题 / 英文标题" value={s.about_eyebrow} onChange={v=>set('about_eyebrow',v)}/>
    <Field label="正文标题" value={s.about_title} onChange={v=>set('about_title',v)}/>
    <Field label="关于我们正文" value={s.about_body} onChange={v=>set('about_body',v)} multiline rows={10}/>
    <ImageUploader label="关于我们图片" value={s.about_image_url} previewMap={previewMap} onUploaded={v=>set('about_image_url',v)} upload={upload}/>
   </div>}

   {t==='contact'&&<div className="customizer-panel-card panel-contact">
    <div className="customizer-panel-title"><span>06</span><div><h3>联系我们</h3><p>电话、邮箱、地址和支持模块。</p></div></div>
    <div className="form-grid"><Field label="页面标题" value={s.contact_page_title} onChange={v=>set('contact_page_title',v)}/><Field label="页面简介" value={s.contact_page_intro} onChange={v=>set('contact_page_intro',v)}/><Field label="联系电话" value={s.contact_phone} onChange={v=>set('contact_phone',v)}/><Field label="联系邮箱" value={s.contact_email} onChange={v=>set('contact_email',v)}/><Field label="WhatsApp" value={s.contact_whatsapp} onChange={v=>set('contact_whatsapp',v)}/></div>
    <Field label="公司地址" value={s.contact_address} onChange={v=>set('contact_address',v)} multiline rows={3}/>
    <div className="customizer-inline-settings"><Field label="支持模块标题" value={s.contact_support_title} onChange={v=>set('contact_support_title',v)}/><Field label="支持模块说明" value={s.contact_support_body} onChange={v=>set('contact_support_body',v)} multiline rows={3}/></div>
   </div>}

   {t==='footer'&&<div className="customizer-panel-card panel-footer">
    <div className="customizer-panel-title"><span>07</span><div><h3>页脚 Footer</h3><p>页脚公司简介和版权文字。</p></div></div>
    <Field label="页脚公司简介" value={s.footer_description} onChange={v=>set('footer_description',v)} multiline rows={5}/>
    <Field label="版权文字" value={s.footer_copyright} onChange={v=>set('footer_copyright',v)}/>
   </div>}
  </section>

  <section className="customizer-preview-bottom">
   <div className="customizer-preview-toolbar">
    <div><Eye size={15}/><span>实时预览</span></div>
    <div className="preview-device-switch"><button type="button" className={previewMode==='desktop'?'active':''} onClick={()=>setPreviewMode('desktop')}>桌面</button><button type="button" className={previewMode==='mobile'?'active':''} onClick={()=>setPreviewMode('mobile')}>手机</button></div>
   </div>
   <div className={'customizer-preview-stage '+previewMode}>
    <div className="preview-browser customizer-browser">
     <div className="preview-header preview-masthead">
      <div className={'preview-logo '+(s.logo_url?'has-image logo-fit-'+(s.logo_fit||'contain'):'')}>{s.logo_url?<img src={previewMap[s.logo_url]||s.logo_url}/>:<><b>{s.brand_name?.slice(0,1)||'T'}</b><span>{s.brand_name}<small>{s.brand_subtitle}</small></span></>}</div>
      <div className="preview-header-copy"><b>{s.header_tagline}</b><small>{s.header_products_text}</small></div>
      <div className="preview-hotline"><span>{s.service_hotline_label||'服务热线'}</span><b>{s.service_hotline_1}</b></div>
      {s.contact_wechat_qr_url&&<div className="preview-qr"><img src={previewMap[s.contact_wechat_qr_url]||s.contact_wechat_qr_url}/></div>}
     </div>
     <div className="preview-nav-row">{navPreview.map(n=><span key={n.id||n.path}>{n.label}</span>)}</div>
     <div className="builder-preview-sections">
      {sections.filter(x=>x.enabled!==false).map((sec,i)=>{const meta=HOME_SECTION_META[sec.type]||HOME_SECTION_META.custom;return <div className={'builder-preview-section type-'+meta.color} key={sec.id||i}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{sec.title||sec.label||meta.name}</strong><small>{meta.name}</small></div></div>})}
     </div>
     <div className="preview-contact"><h4>{s.contact_page_title}</h4><p>{s.contact_address}</p><p>{s.contact_phone} · {s.contact_email}</p></div>
    </div>
   </div>
  </section>
 </form>
}

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
 const[items,setItems]=useState([]),[folders,setFolders]=useState(['products','news','site']),[categoryFolders,setCategoryFolders]=useState([]),[selected,setSelected]=useState([]),[currentFolder,setCurrentFolder]=useState('products'),[query,setQuery]=useState(''),[loading,setLoading]=useState(true),[moveTarget,setMoveTarget]=useState('products');
 async function load(){
  setLoading(true);
  try{
   const d=await api('/api/admin/media');
   setItems(Array.isArray(d.items)?d.items:[]);
   const fs=Array.isArray(d.folders)&&d.folders.length?d.folders:['products','news','site'];
   setFolders(fs);setCategoryFolders(d.category_folders||[]);
   if(!fs.includes(currentFolder))setCurrentFolder(fs.includes('products')?'products':fs[0]);
  }catch(e){setMsg('媒体库加载失败：'+e.message)}
  finally{setLoading(false)}
 }
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(!folders.includes(moveTarget))setMoveTarget(currentFolder)},[folders,currentFolder]);

 const fmt=n=>n>=1024*1024?(n/1024/1024).toFixed(1)+' MB':n>=1024?(n/1024).toFixed(0)+' KB':n+' B';
 const selectedSet=new Set(selected);
 const currentItems=items.filter(x=>x.folder_path===currentFolder&&(!query||x.name.toLowerCase().includes(query.toLowerCase())||x.path.toLowerCase().includes(query.toLowerCase())));
 const childFolders=folders.filter(f=>{
  if(!f.startsWith(currentFolder+'/'))return false;
  return f.slice(currentFolder.length+1).split('/').length===1;
 });
 const rootLabel=f=>f==='products'?'产品图片':f==='news'?'新闻图片':f==='site'?'网站装修图片':f.split('/').pop();

 function toggle(path){setSelected(v=>v.includes(path)?v.filter(x=>x!==path):[...v,path])}
 function selectAll(){const ps=currentItems.map(x=>x.path);setSelected(v=>ps.length&&ps.every(p=>v.includes(p))?v.filter(x=>!ps.includes(x)):[...new Set([...v,...ps])])}
 async function act(body,success){
  setBusy(true);
  try{const d=await api('/api/admin/media',{method:'POST',body:JSON.stringify(body)});setSelected([]);setMsg(success+(d.note?` ${d.note}`:''));await load()}
  catch(e){setMsg('操作失败：'+e.message)}
  finally{setBusy(false)}
 }
 async function remove(){
  if(!selected.length)return;
  if(!confirm(`确定删除选中的 ${selected.length} 张图片？正在使用的图片会自动跳过。`))return;
  setBusy(true);
  try{const d=await api('/api/admin/media',{method:'DELETE',body:JSON.stringify({paths:selected})});setSelected([]);setMsg(`已删除 ${d.deleted?.length||0} 张图片${d.blocked?.length?`，${d.blocked.length} 张使用中图片已跳过。`:''}`);await load()}
  catch(e){setMsg('删除失败：'+e.message)}
  finally{setBusy(false)}
 }
 function uploadFiles(files,relativePaths=[]){
  if(!files?.length)return;
  upload(files,async()=>{setMsg('图片已上传到当前文件夹。');await load()},currentFolder,relativePaths);
 }
 function uploadFolder(files){
  const arr=[...(files||[])].filter(f=>f.type?.startsWith('image/'));
  const rel=arr.map(f=>f.webkitRelativePath||f.name);
  uploadFiles(arr,rel);
 }
 async function createFolder(){
  const name=prompt('新建文件夹名称：');if(!name)return;
  await act({action:'create_folder',parent:currentFolder,name},'文件夹已创建。');
 }
 async function renameCurrentFolder(){
  if(['products','news','site'].includes(currentFolder))return;
  const old=currentFolder.split('/').pop(),name=prompt('新的文件夹名称：',old);if(!name||name===old)return;
  await act({action:'rename_folder',folder:currentFolder,new_name:name},'文件夹已重命名。');
 }
 async function moveCurrentFolder(){
  if(['products','news','site'].includes(currentFolder))return;
  const candidates=folders.filter(f=>f!==currentFolder&&!f.startsWith(currentFolder+'/'));
  const target=prompt('移动到哪个父文件夹？\n例如：products 或 products/mixing-equipment\n\n可用目录：\n'+candidates.slice(0,30).join('\n'),'products');
  if(!target)return;
  await act({action:'move_folder',folder:currentFolder,target_folder:target},'文件夹已移动。');
 }
 async function renameOne(){
  if(selected.length!==1){setMsg('请只选择一张图片后再重命名。');return}
  const item=items.find(x=>x.path===selected[0]),name=prompt('新的文件名：',item?.name||'');if(!name||name===item?.name)return;
  await act({action:'rename',path:selected[0],new_name:name},'图片已重命名。');
 }
 async function batchRename(){
  if(!selected.length)return;
  const prefix=prompt('批量重命名前缀：\n例如 mixer，结果将是 mixer-01.webp、mixer-02.webp …','product');
  if(!prefix)return;
  const start=Number(prompt('起始编号：','1')||1);
  await act({action:'batch_rename',paths:selected,prefix,start},'已完成批量重命名。');
 }
 async function moveSelected(){
  if(!selected.length)return;
  if(!moveTarget){setMsg('请选择目标文件夹。');return}
  await act({action:'move',paths:selected,target_folder:moveTarget},`已移动到 ${moveTarget}。`);
 }
 async function syncCategoryFolders(){await act({action:'sync_categories'},'产品分类文件夹已同步。')}

 const productFolders=folders.filter(f=>f==='products'||f.startsWith('products/'));
 const otherRoots=['news','site'];
 return <div className="media-manager">
  <aside className="media-folder-sidebar">
   <div className="media-folder-title"><span>媒体库</span><button type="button" onClick={createFolder} title="在当前目录新建子文件夹"><Plus size={15}/></button></div>
   <button type="button" className={currentFolder==='products'?'active root':''} onClick={()=>{setCurrentFolder('products');setSelected([])}}>产品图片</button>
   {productFolders.filter(f=>f!=='products').map(f=>{
    const depth=f.split('/').length-1;
    return <button type="button" key={f} className={currentFolder===f?'active':''} style={{paddingLeft:14+depth*14}} onClick={()=>{setCurrentFolder(f);setSelected([])}}>{f.split('/').pop()}</button>
   })}
   {otherRoots.map(f=><button type="button" key={f} className={currentFolder===f?'active root':''} onClick={()=>{setCurrentFolder(f);setSelected([])}}>{rootLabel(f)}</button>)}
   <button type="button" className="sync-folders" onClick={syncCategoryFolders}>同步产品分类文件夹</button>
  </aside>

  <section className="media-manager-main">
   <div className="media-pathbar">
    <div><span>当前位置</span><strong>{currentFolder}</strong></div>
    <div className="media-folder-ops">
     <button type="button" onClick={createFolder}><Plus size={14}/> 新建子文件夹</button>
     {!['products','news','site'].includes(currentFolder)&&<button type="button" onClick={renameCurrentFolder}>重命名文件夹</button>}
     {!['products','news','site'].includes(currentFolder)&&<button type="button" onClick={moveCurrentFolder}>移动文件夹</button>}
    </div>
   </div>

   {childFolders.length>0&&<div className="media-child-folders">{childFolders.map(f=><button type="button" key={f} onClick={()=>{setCurrentFolder(f);setSelected([])}}><span>📁</span><strong>{f.split('/').pop()}</strong></button>)}</div>}

   <div className="media-toolbar">
    <div className="media-filter"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索当前文件夹图片"/></div>
    <button type="button" className="btn btn-ghost" onClick={load}>刷新</button>
   </div>

   <div className="media-actions media-file-actions">
    <div className="media-upload-group">
     <label className="upload"><Upload size={16}/> 上传图片<input type="file" multiple accept="image/*" onChange={e=>{uploadFiles([...e.target.files]);e.target.value=''}}/></label>
     <label className="upload folder-upload"><Upload size={16}/> 上传整个文件夹<input type="file" multiple webkitdirectory="" directory="" onChange={e=>{uploadFolder(e.target.files);e.target.value=''}}/></label>
    </div>
    <div className="media-batch">
     <button type="button" onClick={selectAll} disabled={!currentItems.length}>全选当前</button>
     <span>已选 {selected.length} 张</span>
     <button type="button" onClick={renameOne} disabled={selected.length!==1}>重命名</button>
     <button type="button" onClick={batchRename} disabled={!selected.length}>批量重命名</button>
     <select value={moveTarget} onChange={e=>setMoveTarget(e.target.value)}>{folders.map(f=><option key={f} value={f}>移动到：{f}</option>)}</select>
     <button type="button" onClick={moveSelected} disabled={!selected.length}>移动图片</button>
     <button type="button" className="danger-button" onClick={remove} disabled={!selected.length||busy}><Trash2 size={14}/> 删除</button>
    </div>
   </div>

   <p className="media-note">移动或重命名“使用中”的图片时，系统会同步修改 D1 中的产品、新闻和网站设置引用，避免前台断图。文件夹由 GitHub 路径管理，不额外占用 D1。</p>

   {loading?<div className="empty">正在读取 GitHub 媒体库…</div>:currentItems.length?<div className="media-grid">{currentItems.map(x=><article className={'media-card '+(x.in_use?'is-used':'')} key={x.path}>
    <label className="media-check"><input type="checkbox" checked={selectedSet.has(x.path)} onChange={()=>toggle(x.path)}/></label>
    <div className="media-thumb"><img src={'/api/admin/media?file='+encodeURIComponent(x.path)} alt={x.name}/></div>
    <div className="media-meta"><strong title={x.name}>{x.name}</strong><span>{fmt(x.size)}</span>{x.in_use?<div className="media-used"><b>使用中</b>{x.used_by.map(v=><small key={v}>{v}</small>)}</div>:<em>未使用</em>}</div>
   </article>)}</div>:<div className="empty">当前文件夹没有图片。</div>}
  </section>
 </div>
}
function Dashboard({onLogout}){const[tab,setTab]=useState('dashboard'),[rows,setRows]=useState({categories:[],products:[],news:[],settings:DEFAULT_SETTINGS,navigation:DEFAULT_NAV}),[editing,setEditing]=useState(null),[siteDraft,setSiteDraft]=useState(DEFAULT_SETTINGS),[msg,setMsg]=useState(''),[busy,setBusy]=useState(false),[previewMap,setPreviewMap]=useState({});const{refresh}=useData();async function load(){try{const d=await api('/api/admin/items?type=products');const merged={...d,settings:{...DEFAULT_SETTINGS,...(d.settings||{})},navigation:Array.isArray(d.navigation)&&d.navigation.length?d.navigation:DEFAULT_NAV};setRows(merged);setSiteDraft(merged.settings)}catch(e){setMsg(e.message)}}
const blank={categories:{name:'',slug:'',summary:'',sort_order:0},products:{model:'',name:'',slug:'',category_id:'',summary:'',description:'',specs:{},images:[],detail_images:[],featured:false,sort_order:0},news:{title:'',slug:'',excerpt:'',body:'',cover_url:'',status:'draft',published_at:new Date().toISOString()},navigation:{label:'',path:'/',sort_order:(rows.navigation?.length||0)+1,visible:true}};const update=(k,v)=>setEditing(x=>({...x,[k]:v}));async function save(e){e.preventDefault();setBusy(true);try{const p={...editing};if(!p.slug&&tab!=='navigation')p.slug=slugify(p.model?`${p.model}-${p.name}`:p.title||p.name);const method=p.id?'PUT':'POST';await api('/api/admin/items?type='+tab,{method,body:JSON.stringify(p)});setEditing(null);setMsg('保存成功。');await Promise.all([load(),refresh()])}catch(e){setMsg('保存失败：'+e.message)}finally{setBusy(false)}}async function saveSettings(s){setBusy(true);try{await api('/api/admin/items?type=settings',{method:'PUT',body:JSON.stringify(s)});setMsg('网站设置已保存，前台已更新。');await Promise.all([load(),refresh()])}catch(e){setMsg('保存失败：'+e.message)}finally{setBusy(false)}}async function del(x){if(!confirm('确定删除？'))return;try{await api(`/api/admin/items?type=${tab}&id=${x.id}`,{method:'DELETE'});await Promise.all([load(),refresh()]);setMsg('已删除。')}catch(e){setMsg(e.message)}}async function upload(files,onDone,folder,relativePaths=[]){if(!files?.length)return;const originalFiles=[...files];setBusy(true);setMsg('正在优化并上传图片…');try{const fileList=await Promise.all(originalFiles.map(optimizeImageFile)),localPreviews=fileList.map(f=>URL.createObjectURL(f));const fd=new FormData();fileList.forEach(f=>fd.append('files',f));relativePaths.forEach(p=>fd.append('relative_paths',p));fd.append('folder',folder);const d=await api('/api/admin/upload',{method:'POST',body:fd});const pairs={};d.urls.forEach((u,i)=>{if(localPreviews[i])pairs[u]=localPreviews[i]});setPreviewMap(m=>({...m,...pairs}));onDone(d.urls);setMsg('图片已上传。后台立即显示预览；Cloudflare 自动部署完成后正式图片地址生效。')}catch(e){setMsg('上传失败：'+e.message)}finally{setBusy(false)}}async function uploadField(files,field,folder){upload(files,urls=>{if(field==='images'||field==='detail_images')update(field,[...(editing[field]||[]),...urls]);else update(field,urls[0])},folder)}async function logout(){await api('/api/auth/logout',{method:'POST'}).catch(()=>{});onLogout()}const menu=[['dashboard','首页',null],['site','网站装修',Settings2],['categories','产品分类',null],['products','产品',null],['media','媒体库',ImageIcon],['news','新闻',null],['navigation','导航菜单',PanelTop]];const list=rows[tab]||[];const title={dashboard:'首页',products:'产品管理',categories:'产品分类',news:'新闻管理',site:'网站装修',media:'媒体库',navigation:'导航菜单'}[tab];return <div className="admin-layout"><aside className="admin-sidebar"><Logo settings={siteDraft}/><div className="admin-menu"><span>后台管理</span>{menu.map(([k,n,Icon])=><button key={k} className={tab===k?'active':''} onClick={()=>{setTab(k);setEditing(null)}}>{Icon&&<Icon size={15}/>}<span className="menu-name">{n}</span>{!['site','dashboard'].includes(k)&&<span>{Array.isArray(rows[k])?rows[k].length:''}</span>}</button>)}</div><Link to="/" target="_blank"><ExternalLink size={16}/> 查看网站</Link><button className="admin-signout" onClick={logout}><LogOut size={16}/> 退出登录</button></aside><section className="admin-content"><div className="admin-top"><div><span className="eyebrow">后台管理</span><h1>{title}</h1></div>{['products','categories','news','navigation'].includes(tab)&&<button className="btn btn-accent" onClick={()=>setEditing(structuredClone(blank[tab]))}><Plus size={17}/> 新增</button>}</div>{msg&&<div className="admin-message">{msg}</div>}{tab==='dashboard'?<AdminDashboard rows={rows} setTab={setTab}/>:tab==='site'?<SiteSettingsEditor value={siteDraft} onChange={setSiteDraft} onSave={saveSettings} busy={busy} previewMap={previewMap} upload={(files,cb,folder)=>upload(files,cb,folder)} navigation={rows.navigation||DEFAULT_NAV}/>:tab==='media'?<MediaLibrary upload={(files,cb,folder)=>upload(files,cb,folder)} busy={busy} setBusy={setBusy} setMsg={setMsg}/>:editing?<form className="editor" onSubmit={save}><div className="editor-title"><h2>{editing.id?'编辑':'新增'}内容</h2><button type="button" onClick={()=>setEditing(null)}>取消 <X size={14}/></button></div>{tab==='categories'&&<><Field label="分类名称" value={editing.name} onChange={v=>update('name',v)} required/><Field label="URL 标识（Slug）" value={editing.slug} onChange={v=>update('slug',v)}/><Field label="简介" value={editing.summary} onChange={v=>update('summary',v)} multiline/><Field label="显示排序" type="number" value={editing.sort_order} onChange={v=>update('sort_order',Number(v))}/></>}{tab==='navigation'&&<><Field label="菜单名称" value={editing.label} onChange={v=>update('label',v)} required/><Field label="链接路径" value={editing.path} onChange={v=>update('path',v)} placeholder="例如 /products" required/><Field label="排序" type="number" value={editing.sort_order} onChange={v=>update('sort_order',Number(v))}/><label className="check-line"><input type="checkbox" checked={editing.visible!==false} onChange={e=>update('visible',e.target.checked)}/>{editing.visible!==false?<Eye size={15}/>:<EyeOff size={15}/>} 前台显示</label></>}{tab==='products'&&<><div className="form-grid"><Field label="产品型号" value={editing.model} onChange={v=>update('model',v)} required/><Field label="产品名称" value={editing.name} onChange={v=>update('name',v)} required/></div><label className="field">所属分类<select value={editing.category_id||''} onChange={e=>update('category_id',Number(e.target.value))} required><option value="">请选择</option>{rows.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label><Field label="URL 标识（Slug）" value={editing.slug} onChange={v=>update('slug',v)}/><Field label="简短介绍" value={editing.summary} onChange={v=>update('summary',v)} multiline/><Field label="产品详细介绍" value={editing.description} onChange={v=>update('description',v)} multiline rows={7}/><SpecsEditor value={editing.specs||{}} onChange={v=>update('specs',v)}/><label className="check-line"><input type="checkbox" checked={!!editing.featured} onChange={e=>update('featured',e.target.checked)}/> 首页推荐</label><Field label="显示排序" type="number" value={editing.sort_order} onChange={v=>update('sort_order',Number(v))}/><div className="product-media-editor">
 <div className="product-media-editor-title"><span className="eyebrow">商品图片</span><h2>产品图片管理</h2><p>参考电商商品后台：主图负责列表与顶部展示，详情图用于产品详情页下方内容。</p></div>
 <ProductImageGroupEditor title="主图 / 商品图" help="第一张自动作为产品封面图；用于首页推荐、产品中心缩略图和产品详情顶部轮播。" images={editing.images||[]} onChange={v=>update('images',v)} onUpload={files=>uploadField(files,'images','products')} previewMap={previewMap} mainMode/>
 <ProductImageGroupEditor title="详情图" help="只显示在产品详情页下方，适合设备细节、结构、尺寸、应用场景等图片。" images={editing.detail_images||[]} onChange={v=>update('detail_images',v)} onUpload={files=>uploadField(files,'detail_images','products')} previewMap={previewMap}/>
</div></>}{tab==='news'&&<><Field label="新闻标题" value={editing.title} onChange={v=>update('title',v)} required/><Field label="URL 标识（Slug）" value={editing.slug} onChange={v=>update('slug',v)}/><Field label="摘要" value={editing.excerpt} onChange={v=>update('excerpt',v)} multiline/><Field label="新闻正文" value={editing.body} onChange={v=>update('body',v)} multiline rows={12}/><label className="field">发布状态<select value={editing.status} onChange={e=>update('status',e.target.value)}><option value="draft">草稿</option><option value="published">已发布</option></select></label><Field label="发布日期" type="date" value={(editing.published_at||'').slice(0,10)} onChange={v=>update('published_at',v+'T00:00:00Z')}/><div className="field">封面图片<div className="upload"><Upload size={17}/> 上传封面<input type="file" accept="image/*" onChange={e=>{uploadField(e.target.files,'cover_url','news');e.target.value=''}}/></div>{editing.cover_url&&<div className="image-list"><div><img src={previewMap[editing.cover_url]||editing.cover_url}/></div></div>}</div></>}<button disabled={busy} className="btn btn-accent"><Save size={17}/>{busy?'处理中…':'保存'}</button></form>:<div className="admin-table">{list.length?<table><thead><tr><th>名称</th><th>信息</th><th>操作</th></tr></thead><tbody>{list.map(x=><tr key={x.id}><td>{tab==='products'?<div className="admin-product-name"><div className="admin-product-thumb">{imageOf(x)?<img src={imageOf(x)} alt={x.name}/>:<span>无图</span>}</div><div><strong>{x.model||x.name}</strong><small>{x.name}</small></div></div>:<strong>{x.model||x.label||x.name||x.title}</strong>}</td><td>{tab==='navigation'?`${x.path} · ${x.visible?'显示':'隐藏'}`:(x.name||x.slug||x.status)}</td><td className="actions"><button onClick={()=>setEditing(structuredClone(x))}>编辑</button><button className="danger" type="button" aria-label={`删除 ${x.model||x.label||x.name||x.title||"此项"}`} title="删除" onClick={()=>del(x)}><Trash2 size={15}/></button></td></tr>)}</tbody></table>:<div className="empty">暂无内容。</div>}</div>}</section></div>}
function RoutedApp(){const{booted}=useData();if(!booted)return <div className="site-boot" role="status" aria-live="polite"><span>TYRKAID</span><small>正在加载网站内容…</small></div>;return <Routes><Route path="/" element={<><Header/><Home/><Footer/></>}/><Route path="/products" element={<Products/>}/><Route path="/products/:slug" element={<ProductDetail/>}/><Route path="/categories/:slug" element={<Category/>}/><Route path="/news" element={<News/>}/><Route path="/news/:slug" element={<Article/>}/><Route path="/about" element={<About/>}/><Route path="/contact" element={<Contact/>}/><Route path="/admin" element={<Admin/>}/><Route path="*" element={<NotFound/>}/></Routes>}
function App(){return <DataProvider><RoutedApp/></DataProvider>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
