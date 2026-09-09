const fs = require('fs');
const path = require('path');

const categories = ['Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Handbags', 'Accessories'];
const sections = ['featured', 'bestseller', 'trending'];
const images = [
  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80',
  'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80',
  'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80',
  'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&q=80',
  'https://images.unsplash.com/photo-1594938298603-c8148f4851c4?w=600&q=80',
  'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80',
  'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80',
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80',
  'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80',
  'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80',
  'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80',
  'https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80',
  'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80',
  'https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80',
  'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80'
];

const adjectives = ['Amara', 'Vale', 'Rani', 'Noor', 'Meher', 'Zora', 'Ishaani', 'Sera', 'Liora', 'Anaya', 'Devika', 'Kiaan', 'Farah', 'Alina', 'Zeeya', 'Ayra', 'Kiara'];
const types = ['Necklace', 'Earrings', 'Bracelet', 'Ring', 'Handbag', 'Accessory', 'Choker', 'Studs', 'Tote', 'Clutch'];
const descs = [
  'A classic silhouette made for everyday elegance.',
  'Hand-finished and perfectly weighted.',
  'A statement piece for any occasion.',
  'Layered, simple, and effortlessly chic.',
  'Polished to a mirror finish for a subtle glow.',
  'Designed for the modern Indian woman.'
];
const icons = ['necklace', 'earrings', 'bracelet', 'ring', 'handbag', 'clutch'];

const newProducts = [];
let idCounter = 1;

for (let i = 0; i < sections.length; i++) {
  const section = sections[i];
  for (let j = 0; j < 20; j++) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const cat = categories[Math.floor(Math.random() * categories.length)];
    const img = images[Math.floor(Math.random() * images.length)];
    const desc = descs[Math.floor(Math.random() * descs.length)];
    const icon = icons[Math.floor(Math.random() * icons.length)];
    const price = Math.floor(Math.random() * 2000) + 399;
    
    newProducts.push({
      id: 'p' + String(idCounter).padStart(3, '0'),
      name: `${adj} ${type}`,
      category: cat,
      price: price,
      tag: j < 5 ? 'New' : (j < 10 ? 'Bestseller' : ''),
      desc: desc,
      icon: icon,
      section: section,
      image: img
    });
    idCounter++;
  }
}

const fileContent = `/* ============================================================
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
const ELVEN_SEED = ${JSON.stringify(newProducts, null, 2)};

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
`;

fs.writeFileSync(path.join(__dirname, 'js/products.js'), fileContent);
