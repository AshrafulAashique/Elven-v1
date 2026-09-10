/* ============================================================
   ELVEN — storefront script
   ============================================================ */
localStorage.removeItem('elven_products_v2'); // FORCE REFRESH FOR NEW PRODUCTS

/* ---------- global state ---------- */
const WA_NUMBER = '919449413372'; // Updated as per user request
let currentUser = null;
let currentWishlist = [];

// Performance utility
function rafThrottle(callback) {
  let ticking = false;
  return (...args) => {
    if(ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      callback(...args);
      ticking = false;
    });
  };
}

/* ---------- icon library ---------- */
const ELVEN_ICONS = {
  necklace: `<svg viewBox="0 0 64 64" class="icon-stroke"><path d="M14 10c0 14 8 24 18 24s18-10 18-24" stroke-linecap="round"/><circle cx="32" cy="40" r="5"/></svg>`,
  earrings: `<svg viewBox="0 0 64 64" class="icon-stroke"><path d="M24 8c0 4 3 6 3 10s-3 5-3 9" stroke-linecap="round"/><circle cx="24" cy="32" r="6"/><path d="M40 8c0 4 3 6 3 10s-3 5-3 9" stroke-linecap="round"/><circle cx="40" cy="32" r="6"/></svg>`,
  bracelet: `<svg viewBox="0 0 64 64" class="icon-stroke"><ellipse cx="32" cy="32" rx="22" ry="12"/><ellipse cx="32" cy="32" rx="14" ry="7"/></svg>`,
  ring:     `<svg viewBox="0 0 64 64" class="icon-stroke"><circle cx="32" cy="38" r="14"/><path d="M25 24l7-12 7 12-7 6z" stroke-linejoin="round"/></svg>`,
  handbag:  `<svg viewBox="0 0 64 64" class="icon-stroke"><path d="M20 24c0-8 5-14 12-14s12 6 12 14" stroke-linecap="round"/><rect x="12" y="24" width="40" height="30" rx="2"/></svg>`,
  clutch:   `<svg viewBox="0 0 64 64" class="icon-stroke"><rect x="10" y="22" width="44" height="28" rx="2"/><path d="M46 22c0-6-4-10-4-10" stroke-linecap="round"/></svg>`,
};

const ELVEN_GRADIENTS = [
  'linear-gradient(150deg,#F3D9D4,#F0B98D)',
  'linear-gradient(150deg,#EFC9C7,#E8A06B)',
  'linear-gradient(150deg,#F6E7DF,#C97D8B)',
  'linear-gradient(150deg,#F0B98D,#C97D8B)',
  'linear-gradient(150deg,#F3D9D4,#D9B77C)',
];

function gradientFor(id){
  let h = 0;
  for(const ch of id) h = (h*31 + ch.charCodeAt(0)) % 997;
  return ELVEN_GRADIENTS[h % ELVEN_GRADIENTS.length];
}

function inr(n){ return '\u20B9' + Number(n).toLocaleString('en-IN'); }

/* ---------- section headers ---------- */
function applyHeaders(){
  const h = elvenLoadHeaders();
  const set    = (id, val) => { const el = document.getElementById(id); if(el) el.innerHTML = val; };
  const setTxt = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
  set    ('heroTaglineEl',      h.heroTagline);
  set    ('heroTitleEl',        h.heroTitle);
  set    ('heroSubEl',          h.heroSub);
  setTxt ('featuredTitleEl',    h.featuredTitle);
  setTxt ('bestsellerTitleEl',  h.bestsellerTitle);
  setTxt ('trendingTitleEl',    h.trendingTitle);
  setTxt ('earringsTitleEl',    h.earringsTitle || 'Earrings');
  setTxt ('necklacesTitleEl',   h.necklacesTitle || 'Necklaces');
  setTxt ('ringsTitleEl',       h.ringsTitle || 'Rings');
  set    ('footerTaglineEl',    h.footerTagline);
}

/* ---------- nav ---------- */
const navEl = document.querySelector('.nav');
window.addEventListener('scroll', rafThrottle(() => {
  navEl.classList.toggle('scrolled', window.scrollY > 40);
}), { passive:true });

(function mobileNav(){
  const toggle = document.getElementById('navToggle');
  const links  = document.querySelector('.nav-links');
  if(!toggle || !links) return;
  toggle.addEventListener('click', () => {
    toggle.classList.toggle('open');
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    toggle.classList.remove('open');
    links.classList.remove('open');
  }));
})();

/* ---------- hero frame-sequence scroll animation (REMOVED for native scroll) ---------- */

/* ======================================================
   CAROUSEL ENGINE (REMOVED for native scroll)
   ====================================================== */

/* ---------- card HTML ---------- */
function cardHTML(p){
  const icon = ELVEN_ICONS[p.icon] || ELVEN_ICONS.necklace;
  const mainImg = (p.images && p.images.length) ? p.images[0] : p.image;
  const mediaContent = mainImg
    ? `<img src="${mainImg}" alt="${p.name}" loading="lazy" decoding="async">`
    : icon;
  const isWished = currentWishlist.includes(p.id);
  const heartFill = isWished ? 'var(--rose-2)' : 'none';
  const heartStroke = isWished ? 'var(--rose-2)' : 'currentColor';
  
  const isSoldOut = p.soldOut || p.quantity === 0;
  const tagBadge = isSoldOut ? `<span class="card-tag" style="background:#e07070;color:#fff;">Sold Out</span>` : (p.tag ? `<span class="card-tag">${p.tag}</span>` : '');
  const buttonState = isSoldOut ? `<button class="card-add" disabled style="opacity:0.5;cursor:not-allowed;color:var(--ink-40);">Out of stock</button>` : `<button class="card-add" data-add="${p.id}">Add to bag</button>`;
  
  return `
  <article class="card" data-id="${p.id}">
    <a href="product.html?id=${p.id}" class="card-link-wrapper" style="text-decoration:none; color:inherit; display:block;">
      <div class="card-media" style="background:${gradientFor(p.id)};">
        ${tagBadge}
        <button class="card-fav" aria-label="Save" onclick="event.preventDefault(); toggleWishlist('${p.id}')">
          <svg viewBox="0 0 24 24" fill="${heartFill}" stroke="${heartStroke}" stroke-width="1.8"><path d="M12 21s-7-4.6-10-9.2C.5 8.4 2 4.5 6 4c2.2-.3 4 1 6 3.2C14 5 15.8 3.7 18 4c4 .5 5.5 4.4 4 7.8C19 16.4 12 21 12 21z"/></svg>
        </button>
        ${mediaContent}
      </div>
      <div class="card-body">
        <div class="card-cat">${p.category}</div>
        <h3 class="card-name">${p.name}</h3>
      </div>
    </a>
    <div class="card-row" style="padding: 0 20px 26px;">
      <span class="card-price">${inr(p.price)}</span>
      ${buttonState}
    </div>
  </article>`;
}

function renderGrid(el, list){
  if(!el) return;
  if(!list.length){
    el.innerHTML = '';
    el.insertAdjacentHTML('afterend', `<p class="empty-note" data-empty>Nothing here yet.</p>`);
    return;
  }
  el.innerHTML = list.map(cardHTML).join('');
  
  if (window.elvenRevealObserver) {
    el.querySelectorAll('.card').forEach(c => {
      c.setAttribute('data-reveal', '');
      window.elvenRevealObserver.observe(c);
    });
  }
}

/* ---------- render all sections ---------- */
function renderAll(){
  const products = elvenLoad();
  document.querySelectorAll('[data-empty]').forEach(n => n.remove());

  const featured   = products.filter(p => p.section === 'featured');
  const bestseller = products.filter(p => p.section === 'bestseller');
  const trending   = products.filter(p => p.section === 'trending');

  // Toggle visibility
  const featSec  = document.getElementById('section-featured');
  const bsSec    = document.getElementById('section-bestseller');
  const trendSec = document.getElementById('section-trending');
  if(featSec)  featSec.style.display  = featured.length   ? '' : 'none';
  if(bsSec)    bsSec.style.display    = bestseller.length ? '' : 'none';
  if(trendSec) trendSec.style.display = trending.length   ? '' : 'none';

  // Render carousel tracks
  renderGrid(document.getElementById('featuredGrid'),   featured);
  renderGrid(document.getElementById('bestsellerGrid'), bestseller);
  renderGrid(document.getElementById('trendingGrid'),   trending);

  // Regular grids
  const earrings  = products.filter(p => p.category === 'Earrings');
  const necklaces = products.filter(p => p.category === 'Necklaces');
  const rings     = products.filter(p => p.category === 'Rings');

  renderGrid(document.getElementById('earringsGrid'),  earrings);
  renderGrid(document.getElementById('necklacesGrid'), necklaces);
  renderGrid(document.getElementById('ringsGrid'),     rings);

  const ec = document.getElementById('earringsCount');
  const nc = document.getElementById('necklacesCount');
  const rc = document.getElementById('ringsCount');
  
  if(ec) ec.textContent = earrings.length  + ' pieces';
  if(nc) nc.textContent = necklaces.length + ' pieces';
  if(rc) rc.textContent = rings.length     + ' pieces';

  bindAddButtons();
  applyHeaders();
}

/* ---------- cart ---------- */
const ELVEN_CART_KEY = 'elven_cart_v1';
function cartLoad(){ try{ return JSON.parse(localStorage.getItem(ELVEN_CART_KEY)) || []; }catch(e){ return []; } }
function cartSave(c){ localStorage.setItem(ELVEN_CART_KEY, JSON.stringify(c)); renderCart(); }

function bindAddButtons(){
  document.querySelectorAll('[data-add]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-add');
      const product = elvenLoad().find(p => p.id === id);
      if(!product) return;
      const cart = cartLoad();
      const line = cart.find(c => c.id === id);
      if(line) line.qty++; else cart.push({ id, qty:1 });
      cartSave(cart);
      showToast(`${product.name} added to bag`);
      openDrawer();
    };
  });
}

function renderCart(){
  const wrap    = document.getElementById('drawerItems');
  const totalEl = document.getElementById('drawerTotal');
  const countEl = document.getElementById('bagCount');
  const mCountEl = document.getElementById('mobileBagCount');
  if(!wrap) return;
  const cart     = cartLoad();
  const products = elvenLoad();
  let total = 0, count = 0;
  if(!cart.length){
    wrap.innerHTML = `<p class="drawer-empty">Your bag is empty.</p>`;
  } else {
    wrap.innerHTML = cart.map(line => {
      const p = products.find(x => x.id === line.id);
      if(!p) return '';
      total += p.price * line.qty;
      count += line.qty;
      const thumb = p.image
        ? `<div class="thumb" style="background:#f3d9d4;overflow:hidden"><img src="${p.image}" style="width:100%;height:100%;object-fit:cover" loading="lazy" decoding="async"></div>`
        : `<div class="thumb" style="background:${gradientFor(p.id)}">${ELVEN_ICONS[p.icon]||''}</div>`;
      return `
      <div class="drawer-item">
        ${thumb}
        <div class="info">
          <div class="n">${p.name}</div>
          <div class="p">${inr(p.price)} &times; ${line.qty}</div>
        </div>
        <button class="rm" data-rm="${p.id}">Remove</button>
      </div>`;
    }).join('');
  }
  if(totalEl) totalEl.textContent = inr(total);
  if(countEl) countEl.textContent = count;
  if(mCountEl) mCountEl.textContent = count;
  wrap.querySelectorAll('[data-rm]').forEach(b => {
    b.onclick = () => cartSave(cartLoad().filter(c => c.id !== b.getAttribute('data-rm')));
  });
}

function openDrawer(){
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawerBackdrop').classList.add('open');
}
function closeDrawer(){
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawerBackdrop').classList.remove('open');
}

let toastTimer;
function showToast(msg){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/* ---------- WhatsApp checkout ---------- */
function generateOrderNo(){
  return 'ORD-' + Math.random().toString(36).substring(2,10).toUpperCase();
}

function openCheckoutModal(){
  if (!currentUser) {
    showToast('Please sign in to checkout');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    return;
  }
  const cart = cartLoad();
  if(!cart.length){ showToast('Your bag is empty'); return; }
  document.getElementById('checkoutModal').classList.add('open');
  document.getElementById('checkoutBackdrop').classList.add('open');
}
function closeCheckoutModal(){
  document.getElementById('checkoutModal').classList.remove('open');
  document.getElementById('checkoutBackdrop').classList.remove('open');
}

function buildWAMessage(formData){
  const cart     = cartLoad();
  const products = elvenLoad();
  const orderNo  = generateOrderNo();
  let total = 0;
  const itemLines = cart.map(line => {
    const p = products.find(x => x.id === line.id);
    if(!p) return '';
    const subtotal = p.price * line.qty;
    total += subtotal;
    return `  • ${p.name} × ${line.qty} = ${inr(subtotal)}`;
  }).filter(Boolean).join('\n');

  return encodeURIComponent(
`✨ *New Order | Elven Store* ✨
──────────────────────
*Order ID:* ${orderNo}
*Name:* ${formData.name}
*Contact:* ${formData.phone}
──────────────────────
*Your Selection:*
${itemLines}
──────────────────────
*Total Amount:* ${inr(total)}
*Payment Mode:* ${formData.payment}
──────────────────────
*Delivery Address:*
${formData.address}

_Thank you for choosing Elven. Please confirm this order to proceed with dispatch!_ 🤍`
  );
}

/* ---------- CUSTOMER AUTH & WISHLIST ---------- */
async function initCustomerAuth() {
  const token = localStorage.getItem('elven_token');
  if (token) {
    try {
      const res = await fetch('/api/user', {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if (res.ok) {
        currentUser = await res.json();
        currentWishlist = currentUser.wishlist || [];
      } else {
        localStorage.removeItem('elven_token');
      }
    } catch(e) {}
  }
  updateNavAuthUI();
}

function updateNavAuthUI() {
  const adminLinks = document.querySelectorAll('.nav-admin');
  adminLinks.forEach(link => {
    link.textContent = currentUser ? 'Account' : 'Sign In';
    link.href = 'login.html';
  });
  
  const mLink = document.querySelector('.mobile-tab-bar .tab-btn:last-child span');
  const mBtn = document.querySelector('.mobile-tab-bar .tab-btn:last-child');
  if (mLink) mLink.textContent = currentUser ? 'Account' : 'Sign In';
  if (mBtn) mBtn.href = 'login.html';
}

async function toggleWishlist(productId) {
  if (!currentUser) {
    showToast('Please sign in to save items');
    setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    return;
  }
  const token = localStorage.getItem('elven_token');
  try {
    const res = await fetch('/api/user/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
      body: JSON.stringify({ productId })
    });
    if (res.ok) {
      const data = await res.json();
      currentWishlist = data.wishlist;
      renderAll();
      showToast(currentWishlist.includes(productId) ? 'Added to wishlist' : 'Removed from wishlist');
    }
  } catch(e) {
    showToast('Network error');
  }
}

/* ---------- DOMContentLoaded ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  
  window.elvenRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        window.elvenRevealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -10% 0px" });

  document.querySelectorAll('[data-reveal]').forEach(el => window.elvenRevealObserver.observe(el));
  await initCustomerAuth();
  renderAll();
  renderCart();

  document.getElementById('bagBtn')?.addEventListener('click', openDrawer);
  document.getElementById('mobileBagBtn')?.addEventListener('click', openDrawer);
  document.getElementById('drawerClose')?.addEventListener('click', closeDrawer);
  document.getElementById('drawerBackdrop')?.addEventListener('click', closeDrawer);

  document.getElementById('checkoutBtn')?.addEventListener('click', openCheckoutModal);
  document.getElementById('checkoutBackdrop')?.addEventListener('click', closeCheckoutModal);
  document.getElementById('closeCheckoutBtn')?.addEventListener('click', closeCheckoutModal);

  document.getElementById('checkoutForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const formData = {
      name:    document.getElementById('co-name').value.trim(),
      phone:   document.getElementById('co-phone').value.trim(),
      address: document.getElementById('co-address').value.trim(),
      payment: document.getElementById('co-payment').value,
    };
    const msg = buildWAMessage(formData);
    cartSave([]);
    closeCheckoutModal();
    closeDrawer();
    showToast('Redirecting to WhatsApp… Thank you for shopping Elven! 🎉');
    setTimeout(() => {
      window.open(`https://wa.me/${WA_NUMBER}?text=${msg}`, '_blank');
    }, 600);
  });
});

window.addEventListener('elven:changed', renderAll);
window.addEventListener('storage', e => { if(e.key === ELVEN_KEY) renderAll(); });

window.addEventListener('load', () => {
  const loaderEl = document.getElementById('loader');
  if(loaderEl) {
    loaderEl.classList.add('done');
    setTimeout(() => loaderEl.style.display = 'none', 600);
  }
});
