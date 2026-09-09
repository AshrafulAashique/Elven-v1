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
  {
    "id": "p001",
    "name": "Alina Ring",
    "category": "Earrings",
    "price": 721,
    "tag": "New",
    "desc": "Designed for the modern Indian woman.",
    "icon": "bracelet",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p002",
    "name": "Alina Clutch",
    "category": "Rings",
    "price": 2044,
    "tag": "New",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "clutch",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p003",
    "name": "Kiaan Handbag",
    "category": "Handbags",
    "price": 1565,
    "tag": "New",
    "desc": "Designed for the modern Indian woman.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p004",
    "name": "Devika Accessory",
    "category": "Bracelets",
    "price": 1111,
    "tag": "New",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p005",
    "name": "Meher Necklace",
    "category": "Bracelets",
    "price": 692,
    "tag": "New",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&q=80"
  },
  {
    "id": "p006",
    "name": "Anaya Ring",
    "category": "Rings",
    "price": 1559,
    "tag": "Bestseller",
    "desc": "A statement piece for any occasion.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
  },
  {
    "id": "p007",
    "name": "Sera Earrings",
    "category": "Handbags",
    "price": 1612,
    "tag": "Bestseller",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "bracelet",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p008",
    "name": "Noor Accessory",
    "category": "Earrings",
    "price": 529,
    "tag": "Bestseller",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "bracelet",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p009",
    "name": "Meher Necklace",
    "category": "Necklaces",
    "price": 1165,
    "tag": "Bestseller",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80"
  },
  {
    "id": "p010",
    "name": "Noor Handbag",
    "category": "Accessories",
    "price": 675,
    "tag": "Bestseller",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "handbag",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p011",
    "name": "Farah Ring",
    "category": "Rings",
    "price": 1209,
    "tag": "",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "necklace",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80"
  },
  {
    "id": "p012",
    "name": "Amara Handbag",
    "category": "Bracelets",
    "price": 2359,
    "tag": "",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "bracelet",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p013",
    "name": "Devika Handbag",
    "category": "Earrings",
    "price": 1930,
    "tag": "",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "clutch",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1594938298603-c8148f4851c4?w=600&q=80"
  },
  {
    "id": "p014",
    "name": "Noor Studs",
    "category": "Earrings",
    "price": 1837,
    "tag": "",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "handbag",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p015",
    "name": "Noor Clutch",
    "category": "Accessories",
    "price": 2050,
    "tag": "",
    "desc": "A statement piece for any occasion.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80"
  },
  {
    "id": "p016",
    "name": "Kiaan Earrings",
    "category": "Rings",
    "price": 2152,
    "tag": "",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"
  },
  {
    "id": "p017",
    "name": "Rani Accessory",
    "category": "Bracelets",
    "price": 2139,
    "tag": "",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "handbag",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"
  },
  {
    "id": "p018",
    "name": "Amara Earrings",
    "category": "Accessories",
    "price": 2369,
    "tag": "",
    "desc": "Designed for the modern Indian woman.",
    "icon": "earrings",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
  },
  {
    "id": "p019",
    "name": "Kiara Necklace",
    "category": "Handbags",
    "price": 1318,
    "tag": "",
    "desc": "Designed for the modern Indian woman.",
    "icon": "clutch",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p020",
    "name": "Vale Ring",
    "category": "Handbags",
    "price": 1328,
    "tag": "",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "bracelet",
    "section": "featured",
    "image": "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"
  },
  {
    "id": "p021",
    "name": "Anaya Studs",
    "category": "Handbags",
    "price": 1918,
    "tag": "New",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "earrings",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80"
  },
  {
    "id": "p022",
    "name": "Sera Handbag",
    "category": "Bracelets",
    "price": 2180,
    "tag": "New",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "necklace",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
  },
  {
    "id": "p023",
    "name": "Devika Studs",
    "category": "Necklaces",
    "price": 841,
    "tag": "New",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "necklace",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
  },
  {
    "id": "p024",
    "name": "Sera Clutch",
    "category": "Bracelets",
    "price": 660,
    "tag": "New",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "ring",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p025",
    "name": "Liora Earrings",
    "category": "Handbags",
    "price": 766,
    "tag": "New",
    "desc": "A statement piece for any occasion.",
    "icon": "necklace",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p026",
    "name": "Noor Necklace",
    "category": "Handbags",
    "price": 2350,
    "tag": "Bestseller",
    "desc": "A statement piece for any occasion.",
    "icon": "ring",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80"
  },
  {
    "id": "p027",
    "name": "Zora Studs",
    "category": "Handbags",
    "price": 2318,
    "tag": "Bestseller",
    "desc": "Designed for the modern Indian woman.",
    "icon": "clutch",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"
  },
  {
    "id": "p028",
    "name": "Zora Clutch",
    "category": "Handbags",
    "price": 2174,
    "tag": "Bestseller",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "bracelet",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    "id": "p029",
    "name": "Zora Earrings",
    "category": "Necklaces",
    "price": 570,
    "tag": "Bestseller",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "handbag",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    "id": "p030",
    "name": "Noor Earrings",
    "category": "Rings",
    "price": 1588,
    "tag": "Bestseller",
    "desc": "A statement piece for any occasion.",
    "icon": "earrings",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80"
  },
  {
    "id": "p031",
    "name": "Liora Necklace",
    "category": "Earrings",
    "price": 2221,
    "tag": "",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "ring",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    "id": "p032",
    "name": "Vale Handbag",
    "category": "Earrings",
    "price": 1422,
    "tag": "",
    "desc": "A statement piece for any occasion.",
    "icon": "clutch",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p033",
    "name": "Sera Handbag",
    "category": "Rings",
    "price": 1237,
    "tag": "",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "earrings",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80"
  },
  {
    "id": "p034",
    "name": "Devika Accessory",
    "category": "Bracelets",
    "price": 944,
    "tag": "",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "necklace",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p035",
    "name": "Zeeya Studs",
    "category": "Rings",
    "price": 1722,
    "tag": "",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "clutch",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    "id": "p036",
    "name": "Liora Bracelet",
    "category": "Necklaces",
    "price": 1256,
    "tag": "",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "handbag",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=600&q=80"
  },
  {
    "id": "p037",
    "name": "Alina Bracelet",
    "category": "Necklaces",
    "price": 2295,
    "tag": "",
    "desc": "A statement piece for any occasion.",
    "icon": "clutch",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&q=80"
  },
  {
    "id": "p038",
    "name": "Meher Clutch",
    "category": "Handbags",
    "price": 1373,
    "tag": "",
    "desc": "Designed for the modern Indian woman.",
    "icon": "handbag",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    "id": "p039",
    "name": "Noor Clutch",
    "category": "Bracelets",
    "price": 1607,
    "tag": "",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "earrings",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p040",
    "name": "Kiaan Bracelet",
    "category": "Rings",
    "price": 1288,
    "tag": "",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "ring",
    "section": "bestseller",
    "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80"
  },
  {
    "id": "p041",
    "name": "Farah Ring",
    "category": "Rings",
    "price": 435,
    "tag": "New",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "earrings",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80"
  },
  {
    "id": "p042",
    "name": "Kiara Handbag",
    "category": "Earrings",
    "price": 1457,
    "tag": "New",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "bracelet",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80"
  },
  {
    "id": "p043",
    "name": "Rani Accessory",
    "category": "Accessories",
    "price": 641,
    "tag": "New",
    "desc": "A statement piece for any occasion.",
    "icon": "ring",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p044",
    "name": "Zeeya Tote",
    "category": "Rings",
    "price": 1899,
    "tag": "New",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "handbag",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p045",
    "name": "Sera Ring",
    "category": "Necklaces",
    "price": 1411,
    "tag": "New",
    "desc": "Designed for the modern Indian woman.",
    "icon": "ring",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p046",
    "name": "Kiara Ring",
    "category": "Rings",
    "price": 1579,
    "tag": "Bestseller",
    "desc": "A classic silhouette made for everyday elegance.",
    "icon": "handbag",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?w=600&q=80"
  },
  {
    "id": "p047",
    "name": "Noor Accessory",
    "category": "Bracelets",
    "price": 1794,
    "tag": "Bestseller",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "bracelet",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p048",
    "name": "Vale Choker",
    "category": "Bracelets",
    "price": 2292,
    "tag": "Bestseller",
    "desc": "A statement piece for any occasion.",
    "icon": "necklace",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p049",
    "name": "Noor Handbag",
    "category": "Accessories",
    "price": 1166,
    "tag": "Bestseller",
    "desc": "A statement piece for any occasion.",
    "icon": "earrings",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80"
  },
  {
    "id": "p050",
    "name": "Ayra Tote",
    "category": "Bracelets",
    "price": 1542,
    "tag": "Bestseller",
    "desc": "A statement piece for any occasion.",
    "icon": "handbag",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p051",
    "name": "Anaya Clutch",
    "category": "Bracelets",
    "price": 465,
    "tag": "",
    "desc": "A statement piece for any occasion.",
    "icon": "clutch",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1594938298603-c8148f4851c4?w=600&q=80"
  },
  {
    "id": "p052",
    "name": "Devika Necklace",
    "category": "Necklaces",
    "price": 916,
    "tag": "",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "clutch",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1574738549924-f7b53443a595?w=600&q=80"
  },
  {
    "id": "p053",
    "name": "Zeeya Handbag",
    "category": "Rings",
    "price": 1171,
    "tag": "",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "ring",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80"
  },
  {
    "id": "p054",
    "name": "Devika Choker",
    "category": "Necklaces",
    "price": 654,
    "tag": "",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "ring",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80"
  },
  {
    "id": "p055",
    "name": "Ishaani Earrings",
    "category": "Handbags",
    "price": 548,
    "tag": "",
    "desc": "Polished to a mirror finish for a subtle glow.",
    "icon": "necklace",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80"
  },
  {
    "id": "p056",
    "name": "Farah Ring",
    "category": "Handbags",
    "price": 2044,
    "tag": "",
    "desc": "A statement piece for any occasion.",
    "icon": "ring",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1544441893-675973e31985?w=600&q=80"
  },
  {
    "id": "p057",
    "name": "Zeeya Studs",
    "category": "Bracelets",
    "price": 638,
    "tag": "",
    "desc": "Hand-finished and perfectly weighted.",
    "icon": "necklace",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80"
  },
  {
    "id": "p058",
    "name": "Zeeya Clutch",
    "category": "Handbags",
    "price": 571,
    "tag": "",
    "desc": "Layered, simple, and effortlessly chic.",
    "icon": "bracelet",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=600&q=80"
  },
  {
    "id": "p059",
    "name": "Devika Clutch",
    "category": "Earrings",
    "price": 1277,
    "tag": "",
    "desc": "Designed for the modern Indian woman.",
    "icon": "necklace",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80"
  },
  {
    "id": "p060",
    "name": "Ayra Necklace",
    "category": "Earrings",
    "price": 2115,
    "tag": "",
    "desc": "A statement piece for any occasion.",
    "icon": "ring",
    "section": "trending",
    "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80"
  }
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
