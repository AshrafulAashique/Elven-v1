/* ============================================================
   ELVEN — admin script  (full rewrite with all new features)
   ============================================================ */

/* ---- Admin Auth Guard ---- */
(function checkAuth(){
  if(sessionStorage.getItem('elven_admin_auth') !== 'granted'){
    window.location.replace('shop-admin.html');
  }
})();

/* ---- Icon library ---- */
const ICONS = {
  necklace: `<svg viewBox="0 0 64 64" fill="none" stroke-width="2"><path d="M14 10c0 14 8 24 18 24s18-10 18-24" stroke-linecap="round"/><circle cx="32" cy="40" r="5"/></svg>`,
  earrings: `<svg viewBox="0 0 64 64" fill="none" stroke-width="2"><circle cx="24" cy="32" r="6"/><circle cx="40" cy="32" r="6"/></svg>`,
  bracelet: `<svg viewBox="0 0 64 64" fill="none" stroke-width="2"><ellipse cx="32" cy="32" rx="22" ry="12"/></svg>`,
  ring:     `<svg viewBox="0 0 64 64" fill="none" stroke-width="2"><circle cx="32" cy="38" r="14"/></svg>`,
  handbag:  `<svg viewBox="0 0 64 64" fill="none" stroke-width="2"><rect x="12" y="24" width="40" height="30" rx="2"/></svg>`,
  clutch:   `<svg viewBox="0 0 64 64" fill="none" stroke-width="2"><rect x="10" y="22" width="44" height="28" rx="2"/></svg>`,
};

function inr(n){ return '\u20B9' + Number(n).toLocaleString('en-IN'); }
function gradientFor(id){
  const g = ['linear-gradient(150deg,#F3D9D4,#F0B98D)','linear-gradient(150deg,#EFC9C7,#E8A06B)','linear-gradient(150deg,#F6E7DF,#C97D8B)','linear-gradient(150deg,#F0B98D,#C97D8B)','linear-gradient(150deg,#F3D9D4,#D9B77C)'];
  let h = 0; for(const ch of id) h = (h*31 + ch.charCodeAt(0)) % 997;
  return g[h % g.length];
}

let editingId = null;

/* ======================================================
   CATEGORIES
   ====================================================== */
function renderCatList(){
  const cats  = elvenLoadCats();
  const list  = document.getElementById('catList');
  if(!list) return;
  list.innerHTML = cats.map(c => `
    <div class="cat-item">
      <span>${c}</span>
      ${!['Necklaces','Earrings','Bracelets','Rings','Handbags','Accessories'].includes(c)
        ? `<button class="icon-btn danger small" data-delcat="${c}" title="Delete category"><svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg></button>`
        : '<span class="cat-default-badge">default</span>'}
    </div>
  `).join('');
  list.querySelectorAll('[data-delcat]').forEach(b => b.onclick = () => {
    const name = b.getAttribute('data-delcat');
    if(confirm(`Delete category "${name}"? Products in this category will remain but lose their category.`)){
      elvenDeleteCat(name);
      renderCatList();
      populateCategorySelect();
      flash(`Category "${name}" deleted`);
    }
  });
}

function populateCategorySelect(){
  const sel = document.getElementById('f-category');
  if(!sel) return;
  const cats = elvenLoadCats();
  sel.innerHTML = cats.map(c => `<option value="${c}">${c}</option>`).join('');
}

/* ======================================================
   SECTION HEADERS
   ====================================================== */
function renderHeadersForm(){
  const h = elvenLoadHeaders();
  const fields = [
    { id:'hdr-hero-tagline',    label:'Hero tagline (small text)',    key:'heroTagline'     },
    { id:'hdr-hero-title',      label:'Hero title (HTML allowed)',    key:'heroTitle'       },
    { id:'hdr-hero-sub',        label:'Hero subtitle',                key:'heroSub'         },
    { id:'hdr-featured',        label:'"Featured" section heading',   key:'featuredTitle'   },
    { id:'hdr-bestseller',      label:'"Best Sellers" section heading',key:'bestsellerTitle' },
    { id:'hdr-trending',        label:'"Trending Now" section heading',key:'trendingTitle'   },
    { id:'hdr-jewellery',       label:'"Jewellery" section heading',  key:'jewelleryTitle'  },
    { id:'hdr-handbags',        label:'"Handbags" section heading',   key:'handbagsTitle'   },
    { id:'hdr-footer-tagline',  label:'Footer tagline',               key:'footerTagline'   },
  ];
  const wrap = document.getElementById('headersForm');
  if(!wrap) return;
  wrap.innerHTML = fields.map(f => `
    <div class="field">
      <label for="${f.id}">${f.label}</label>
      <input id="${f.id}" type="text" value="${(h[f.key]||'').replace(/"/g,'&quot;')}" data-key="${f.key}">
    </div>
  `).join('') + `<div class="form-actions"><button class="btn" id="saveHdrsBtn">Save headers</button></div>`;

  document.getElementById('saveHdrsBtn').onclick = () => {
    const obj = {};
    wrap.querySelectorAll('[data-key]').forEach(el => { obj[el.getAttribute('data-key')] = el.value; });
    elvenSaveHeaders(obj);
    flash('Section headers saved — refresh the storefront to see changes');
  };
}

/* ======================================================
   STATS
   ====================================================== */
function renderStats(){
  const list = elvenLoad();
  const el = id => document.getElementById(id);
  if(el('statTotal'))     el('statTotal').textContent      = list.length;
  if(el('statJewellery')) el('statJewellery').textContent  = list.filter(p => p.category !== 'Handbags').length;
  if(el('statHandbags'))  el('statHandbags').textContent   = list.filter(p => p.category === 'Handbags').length;
  const avg = list.length ? Math.round(list.reduce((s,p) => s + Number(p.price),0)/list.length) : 0;
  if(el('statAvg'))       el('statAvg').textContent        = inr(avg);
}

/* ======================================================
   PRODUCT TABLE
   ====================================================== */
const SECTION_LABELS = { featured:'Featured', bestseller:'Best Seller', trending:'Trending', '':'' };

function renderTable(){
  const list  = elvenLoad();
  const tbody = document.getElementById('tbody');
  if(!tbody) return;
  if(!list.length){
    tbody.innerHTML = `<tr class="empty-row"><td colspan="7">No listings yet. Add your first one above.</td></tr>`;
    return;
  }
  tbody.innerHTML = list.map(p => {
    const thumb = p.image
      ? `<div class="p-thumb" style="background:#f3d9d4"><img src="${p.image}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px;"></div>`
      : `<div class="p-thumb" style="background:${gradientFor(p.id)}">${ICONS[p.icon]||ICONS.necklace}</div>`;
    return `
    <tr>
      <td>
        <div class="p-name-cell">
          ${thumb}
          <div>
            <span class="p-name">${p.name}</span>
            ${p.tag ? `<span class="p-tag">${p.tag}</span>` : ''}
          </div>
        </div>
      </td>
      <td><span class="badge">${p.category}</span></td>
      <td>${inr(p.price)}</td>
      <td>${p.section ? `<span class="section-badge ${p.section}">${SECTION_LABELS[p.section]}</span>` : '<span style="color:var(--ink-40)">—</span>'}</td>
      <td style="max-width:220px;color:var(--ink-70);font-size:12.5px;">${p.desc || ''}</td>
      <td>${p.id}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="Edit" data-edit="${p.id}">
            <svg viewBox="0 0 24 24"><path d="M4 20l4-1 11-11-3-3L5 16l-1 4z"/></svg>
          </button>
          <button class="icon-btn danger" title="Delete" data-del="${p.id}">
            <svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>
          </button>
        </div>
      </td>
    </tr>`; }).join('');

  tbody.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => loadIntoForm(b.getAttribute('data-edit')));
  tbody.querySelectorAll('[data-del]').forEach(b => b.onclick = () => {
    const p = elvenLoad().find(x => x.id === b.getAttribute('data-del'));
    if(confirm(`Delete "${p.name}"? This can't be undone.`)){
      elvenDelete(p.id); refreshAll(); flash(`Deleted "${p.name}"`);
    }
  });
}

/* ======================================================
   PRODUCT FORM
   ====================================================== */
let pendingImage = ''; // base64 or URL

function loadIntoForm(id){
  const p = elvenLoad().find(x => x.id === id);
  if(!p) return;
  editingId = id;
  document.getElementById('f-name').value     = p.name;
  populateCategorySelect();
  document.getElementById('f-category').value = p.category;
  document.getElementById('f-price').value    = p.price;
  document.getElementById('f-tag').value      = p.tag || '';
  document.getElementById('f-desc').value     = p.desc || '';
  document.getElementById('f-section').value  = p.section || '';
  const iconRadio = document.querySelector(`input[name="icon"][value="${p.icon}"]`);
  if(iconRadio) iconRadio.checked = true;

  // image preview
  pendingImage = p.image || '';
  updateImagePreview(pendingImage);
  document.getElementById('f-img-url').value = (p.image && !p.image.startsWith('data:')) ? p.image : '';

  document.getElementById('formTitle').textContent   = 'Edit listing';
  document.getElementById('submitBtn').textContent   = 'Save changes';
  document.getElementById('cancelBtn').style.display = 'inline-block';
  document.getElementById('panelForm').scrollIntoView({ behavior:'smooth', block:'start' });
}

function resetForm(){
  editingId = null;
  pendingImage = '';
  document.getElementById('productForm').reset();
  populateCategorySelect();
  updateImagePreview('');
  document.getElementById('f-img-url').value       = '';
  document.getElementById('formTitle').textContent  = 'Add a new listing';
  document.getElementById('submitBtn').textContent  = 'Add listing';
  document.getElementById('cancelBtn').style.display = 'none';
  document.getElementById('priceMsg').textContent   = '';
}

function updateImagePreview(src){
  const prev = document.getElementById('imgPreview');
  if(!prev) return;
  if(src){
    prev.innerHTML = `<img src="${src}" alt="preview">`;
    prev.style.display = 'block';
  } else {
    prev.innerHTML = '';
    prev.style.display = 'none';
  }
}

/* ======================================================
   FLASH TOAST
   ====================================================== */
function flash(msg){
  const t = document.getElementById('adminToast');
  if(!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(flash._t);
  flash._t = setTimeout(() => t.classList.remove('show'), 2800);
}

function refreshAll(){ renderStats(); renderTable(); }

/* ======================================================
   SIDEBAR NAV TABS
   ====================================================== */
function initSidebarNav(){
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const pane = document.getElementById('tab-' + btn.getAttribute('data-tab'));
      if(pane) pane.classList.add('active');
    });
  });
}

/* ======================================================
   DOMContentLoaded
   ====================================================== */
document.addEventListener('DOMContentLoaded', () => {
  populateCategorySelect();
  renderCatList();
  renderHeadersForm();
  refreshAll();
  initSidebarNav();

  /* price hint */
  document.getElementById('f-price')?.addEventListener('input', e => {
    const v = Number(e.target.value);
    const msg = document.getElementById('priceMsg');
    msg.className = 'msg';
    if(v && (v < 399 || v > 2000)){
      msg.textContent = 'Elven listings are usually priced ₹399–₹2000 — you can still save this.';
      msg.classList.add('warn');
    } else { msg.textContent = ''; }
  });

  /* image file picker */
  document.getElementById('f-img-file')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingImage = ev.target.result;
      updateImagePreview(pendingImage);
      document.getElementById('f-img-url').value = '';
    };
    reader.readAsDataURL(file);
  });

  /* image URL paste */
  document.getElementById('f-img-url')?.addEventListener('input', e => {
    const url = e.target.value.trim();
    if(url){ pendingImage = url; updateImagePreview(url); }
  });

  /* clear image */
  document.getElementById('clearImgBtn')?.addEventListener('click', () => {
    pendingImage = '';
    updateImagePreview('');
    document.getElementById('f-img-file').value = '';
    document.getElementById('f-img-url').value  = '';
  });

  /* submit product form */
  document.getElementById('productForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const data = {
      name:     document.getElementById('f-name').value.trim(),
      category: document.getElementById('f-category').value,
      price:    Number(document.getElementById('f-price').value),
      tag:      document.getElementById('f-tag').value.trim(),
      desc:     document.getElementById('f-desc').value.trim(),
      icon:     (document.querySelector('input[name="icon"]:checked')||{}).value || 'necklace',
      section:  document.getElementById('f-section').value,
      image:    pendingImage,
    };
    if(!data.name || !data.price){ flash('Name and price are required'); return; }
    if(editingId){ elvenUpdate(editingId, data); flash(`Saved "${data.name}"`); }
    else          { elvenAdd(data);              flash(`Added "${data.name}"`); }
    resetForm(); refreshAll();
  });

  document.getElementById('cancelBtn')?.addEventListener('click', resetForm);

  document.getElementById('resetSeedBtn')?.addEventListener('click', () => {
    if(confirm('Restore the original 20-item catalog? This replaces all current listings.')){
      elvenResetSeed(); resetForm(); refreshAll(); flash('Catalog restored to defaults');
    }
  });

  /* add category */
  document.getElementById('addCatBtn')?.addEventListener('click', () => {
    const input = document.getElementById('newCatInput');
    const name  = input.value.trim();
    if(!name){ flash('Enter a category name'); return; }
    if(name.length > 32){ flash('Category name too long (max 32 chars)'); return; }
    elvenAddCat(name);
    input.value = '';
    renderCatList();
    populateCategorySelect();
    flash(`Category "${name}" added`);
  });

  document.getElementById('newCatInput')?.addEventListener('keydown', e => {
    if(e.key === 'Enter'){ e.preventDefault(); document.getElementById('addCatBtn').click(); }
  });

  /* logout */
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    sessionStorage.removeItem('elven_admin_auth');
    window.location.replace('shop-admin.html');
  });
});
