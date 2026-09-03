/* ============================================================
   ELVEN — product store
   Client-side data layer backed by localStorage so the admin
   page's add/edit/delete actions are reflected on the storefront
   instantly (same browser). Ships with a seed catalog on first run.
   ============================================================ */

const ELVEN_KEY = 'elven_products_v2';
const ELVEN_CATS_KEY = 'elven_categories_v1';
const ELVEN_HDR_KEY  = 'elven_headers_v1';

/* ---------- default categories ---------- */
const DEFAULT_CATEGORIES = ['Necklaces','Earrings','Bracelets','Rings','Handbags','Accessories'];

function elvenLoadCats(){
  try{
    const raw = localStorage.getItem(ELVEN_CATS_KEY);
    return raw ? JSON.parse(raw) : [...DEFAULT_CATEGORIES];
  }catch(e){ return [...DEFAULT_CATEGORIES]; }
}
function elvenSaveCats(list){
  localStorage.setItem(ELVEN_CATS_KEY, JSON.stringify(list));
  fetch('/api/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(list) }).catch(e => {});
}
function elvenAddCat(name){
  const list = elvenLoadCats();
  if(!list.includes(name)){ list.push(name); elvenSaveCats(list); }
  return list;
}
function elvenDeleteCat(name){
  if(DEFAULT_CATEGORIES.includes(name)) return elvenLoadCats(); // protect defaults
  const list = elvenLoadCats().filter(c => c !== name);
  elvenSaveCats(list);
  return list;
}

/* ---------- section headers ---------- */
const DEFAULT_HEADERS = {
  heroTagline:    'the india edit — jewellery & bags',
  heroTitle:      'Unwrap <em>everyday</em><br>luxury',
  heroSub:        'Fine-finished jewellery and handbags, designed in-house and priced from ₹399. Keep scrolling.',
  featuredTitle:  'Featured',
  bestsellerTitle:'Best Sellers',
  trendingTitle:  'Trending Now',
  jewelleryTitle: 'Jewellery',
  handbagsTitle:  'Handbags',
  footerTagline:  'Fine-finished jewellery and handbags for the modern Indian woman. Designed in-house, priced from ₹399.',
};

function elvenLoadHeaders(){
  try{
    const raw = localStorage.getItem(ELVEN_HDR_KEY);
    return raw ? { ...DEFAULT_HEADERS, ...JSON.parse(raw) } : { ...DEFAULT_HEADERS };
  }catch(e){ return { ...DEFAULT_HEADERS }; }
}
function elvenSaveHeaders(h){
  localStorage.setItem(ELVEN_HDR_KEY, JSON.stringify(h));
  fetch('/api/headers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(h) }).catch(e => {});
}

/* ---------- seed catalog ---------- */
const ELVEN_SEED = [
  { id:'p01', name:'Amara Pearl Drop Necklace', category:'Necklaces', price:1299, tag:'Bestseller',
    desc:'Freshwater pearls strung on a fine gold-toned chain, finished with a delicate teardrop pendant.', icon:'necklace', section:'bestseller',
    image:'assets/products/p01.png' },
  { id:'p02', name:'Vale Layered Chain Necklace', category:'Necklaces', price:899, tag:'',
    desc:'Two fine chains layered at different lengths for an effortless everyday stack.', icon:'necklace', section:'',
    image:'assets/products/p02.png' },
  { id:'p03', name:'Rani Kundan Choker', category:'Necklaces', price:1799, tag:'New',
    desc:'Traditional kundan work set in a structured choker, made for festive evenings.', icon:'necklace', section:'featured',
    image:'assets/products/p03.png' },
  { id:'p04', name:'Noor Crystal Studs', category:'Earrings', price:499, tag:'',
    desc:'Petite round crystal studs that catch the light without ever feeling heavy.', icon:'earrings', section:'',
    image:'assets/products/p04.png' },
  { id:'p05', name:'Meher Pearl Drop Earrings', category:'Earrings', price:649, tag:'Bestseller',
    desc:'A single pearl suspended from a slim gold-toned hook — quietly elegant.', icon:'earrings', section:'bestseller',
    image:'assets/products/p05.png' },
  { id:'p06', name:'Zora Filigree Jhumkas', category:'Earrings', price:999, tag:'New',
    desc:'Hand-finished filigree domes with a soft antique gold plating.', icon:'earrings', section:'trending',
    image:'assets/products/p06.png' },
  { id:'p07', name:'Ishaani Hoop Earrings', category:'Earrings', price:549, tag:'',
    desc:'Medium hoops with a hammered texture, light enough for all-day wear.', icon:'earrings', section:'',
    image:'assets/products/p07.png' },
  { id:'p08', name:'Sera Cuff Bracelet', category:'Bracelets', price:799, tag:'',
    desc:'An open cuff in brushed gold-tone metal, sized to fit most wrists.', icon:'bracelet', section:'',
    image:'assets/products/p08.png' },
  { id:'p09', name:'Liora Beaded Bracelet Set', category:'Bracelets', price:599, tag:'New',
    desc:'A set of three thin beaded bracelets, worn stacked or separately.', icon:'bracelet', section:'trending',
    image:'assets/products/p09.png' },
  { id:'p10', name:'Anaya Tennis Bracelet', category:'Bracelets', price:1599, tag:'Bestseller',
    desc:'A single row of cubic zirconia set in a fine gold-toned band.', icon:'bracelet', section:'bestseller',
    image:'assets/products/p10.png' },
  { id:'p11', name:'Devika Solitaire Ring', category:'Rings', price:699, tag:'',
    desc:'A classic solitaire silhouette in a slim polished band.', icon:'ring', section:'',
    image:'assets/products/p11.png' },
  { id:'p12', name:'Kiaan Stacking Rings (Set of 3)', category:'Rings', price:749, tag:'New',
    desc:'Three slim bands — plain, twisted, and textured — made to be worn together.', icon:'ring', section:'trending',
    image:'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80' },
  { id:'p13', name:'Farah Statement Ring', category:'Rings', price:899, tag:'',
    desc:'An oversized oval stone set in a sculpted gold-toned mount.', icon:'ring', section:'',
    image:'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80' },
  { id:'p14', name:'Alina Structured Tote', category:'Handbags', price:1999, tag:'Bestseller',
    desc:'A boxy silhouette in vegan saffiano leather with a detachable strap.', icon:'handbag', section:'featured',
    image:'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80' },
  { id:'p15', name:'Noor Quilted Sling', category:'Handbags', price:1499, tag:'New',
    desc:'A soft quilted sling bag with a chunky chain strap, sized for the essentials.', icon:'handbag', section:'trending',
    image:'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80' },
  { id:'p16', name:'Meher Woven Potli', category:'Handbags', price:899, tag:'',
    desc:'A hand-woven potli with a drawstring close, made for festive fits.', icon:'clutch', section:'',
    image:'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80' },
  { id:'p17', name:'Ishita Satin Clutch', category:'Handbags', price:1199, tag:'',
    desc:'A structured satin clutch with a jewelled clasp and a slim wrist chain.', icon:'clutch', section:'',
    image:'https://images.unsplash.com/photo-1594938298603-c8148f4851c4?w=600&q=80' },
  { id:'p18', name:'Zeeya Mini Barrel Bag', category:'Handbags', price:1699, tag:'New',
    desc:'A rounded mini silhouette in soft vegan leather, worn crossbody or handheld.', icon:'handbag', section:'featured',
    image:'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
  { id:'p19', name:'Ayra Pearl Hair Pins (Set of 4)', category:'Accessories', price:399, tag:'',
    desc:'Four petite pearl-topped pins for a half-up style or a veil.', icon:'earrings', section:'',
    image:'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80' },
  { id:'p20', name:'Kiara Layered Anklet', category:'Accessories', price:549, tag:'',
    desc:'A double-chain anklet finished with tiny star charms.', icon:'bracelet', section:'',
    image:'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80' },
];


function elvenLoad(){
  try{
    const raw = localStorage.getItem(ELVEN_KEY);
    if(!raw){
      localStorage.setItem(ELVEN_KEY, JSON.stringify(ELVEN_SEED));
      return structuredClone(ELVEN_SEED);
    }
    // migrate old products that don't have section/image fields
    const list = JSON.parse(raw);
    return list.map(p => ({
      section: '',
      image: '',
      ...p
    }));
  }catch(e){
    return structuredClone(ELVEN_SEED);
  }
}

function elvenSave(list){
  localStorage.setItem(ELVEN_KEY, JSON.stringify(list));
  fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(list) }).catch(e => {});
  window.dispatchEvent(new CustomEvent('elven:changed'));
}

function elvenAdd(product){
  const list = elvenLoad();
  product.id = 'p' + Date.now().toString(36);
  if(!product.section) product.section = '';
  if(!product.image)   product.image   = '';
  list.unshift(product);
  elvenSave(list);
  return product;
}

function elvenUpdate(id, patch){
  const list = elvenLoad();
  const i = list.findIndex(p => p.id === id);
  if(i > -1){ list[i] = { ...list[i], ...patch }; elvenSave(list); }
  return list;
}

function elvenDelete(id){
  const list = elvenLoad().filter(p => p.id !== id);
  elvenSave(list);
  return list;
}

function elvenResetSeed(){
  localStorage.setItem(ELVEN_KEY, JSON.stringify(ELVEN_SEED));
  elvenSave(elvenLoad());
}

// Boot Sync: pull latest from backend server on load
async function elvenSyncBackend() {
  try {
    const [pRes, cRes, hRes] = await Promise.all([
      fetch('/api/products'),
      fetch('/api/categories'),
      fetch('/api/headers')
    ]);
    if (!pRes.ok) return;
    
    const products = await pRes.json();
    const categories = await cRes.json();
    const headers = await hRes.json();
    
    if (products && products.length > 0) localStorage.setItem(ELVEN_KEY, JSON.stringify(products));
    if (categories && categories.length > 0) localStorage.setItem(ELVEN_CATS_KEY, JSON.stringify(categories));
    if (headers && Object.keys(headers).length > 0) localStorage.setItem(ELVEN_HDR_KEY, JSON.stringify(headers));
    
    window.dispatchEvent(new CustomEvent('elven:changed')); // Trigger re-render with fresh backend data
  } catch (e) {
    console.warn("Backend not reachable. Running in offline/localStorage mode.");
  }
}
elvenSyncBackend();
