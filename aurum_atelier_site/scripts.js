
// Simple static site JS: loads products.json, renders grid, search, filters, cart via localStorage, modal

let PRODUCTS = [];
let filtered = [];
const productsGrid = document.getElementById('productsGrid');
const catalogTitle = document.getElementById('catalogTitle');
const cartCountEl = document.getElementById('cartCount');

// load products.json
fetch('products.json').then(r=>r.json()).then(data=>{
  PRODUCTS = data;
  filtered = PRODUCTS.slice();
  renderProducts(filtered);
  renderCategories();
  updateCartCount();
}).catch(err=>{
  console.error('Failed to load products.json', err);
  productsGrid.innerHTML = '<div class="muted">Failed to load products. Check that products.json exists in the same folder.</div>';
});

function renderProducts(list){
  productsGrid.innerHTML = '';
  if(!list.length){ productsGrid.innerHTML = '<div class="muted">No products found.</div>'; return; }
  list.forEach(p=>{
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
      <img loading="lazy" src="${p.images[0]}" alt="${p.title}" />
      <div><div class="p-title">${p.title}</div><div class="p-sub">${p.notes}</div></div>
      <div class="price-row">
        <div><div class="price">AED ${p.price}</div><div class="old">AED ${p.old_price}</div></div>
        <div><button class="add" onclick='openModalFromProduct(${p.id})'>Details</button></div>
      </div>
    `;
    productsGrid.appendChild(div);
  });
}

function renderCategories(){
  const cats = Array.from(new Set(PRODUCTS.map(p=>p.category)));
  const container = document.getElementById('categoriesList');
  if(!container) return;
  container.innerHTML = '';
  cats.forEach(c=>{
    const b = document.createElement('button');
    b.className = 'category-pill';
    b.textContent = c;
    b.onclick = ()=>filterCategory(c);
    container.appendChild(b);
  });
}

// search + filter UI
document.getElementById('search').addEventListener('input', (e)=>{
  const q = e.target.value.toLowerCase().trim();
  filtered = PRODUCTS.filter(p=> p.title.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q) );
  catalogTitle.textContent = q ? `Search: "${q}"` : 'All Products';
  renderProducts(filtered);
});

document.querySelectorAll('.main-nav a').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const f = a.getAttribute('data-filter');
    filterCategory(f);
  });
});

document.getElementById('sortSelect').addEventListener('change', (e)=>{
  sortProducts(e.target.value);
});

function sortProducts(mode){
  if(mode === 'default'){ renderProducts(filtered); return; }
  let sorted = filtered.slice();
  if(mode === 'price-asc') sorted.sort((a,b)=>a.price-b.price);
  if(mode === 'price-desc') sorted.sort((a,b)=>b.price-a.price);
  if(mode === 'title-asc') sorted.sort((a,b)=>a.title.localeCompare(b.title));
  renderProducts(sorted);
}

function filterCategory(cat){
  if(cat === 'all' || !cat){ filtered = PRODUCTS.slice(); catalogTitle.textContent = 'All Products'; }
  else { filtered = PRODUCTS.filter(p=>p.category === cat); catalogTitle.textContent = cat; }
  renderProducts(filtered);
  window.scrollTo({top:200, behavior:'smooth'});
}

// Modal functions
function openModalFromProduct(id){
  const p = PRODUCTS.find(x=>x.id===id);
  if(!p) return;
  openModal(p.title, p.notes, p.price, p.images);
}

function openModal(title, notes, price, images){
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalNotes').textContent = notes;
  document.getElementById('modalPrice').textContent = 'AED ' + price;
  const imgs = document.getElementById('modalImages');
  imgs.innerHTML = '';
  (Array.isArray(images)?images:[images]).forEach(src=>{
    const im = document.createElement('img');
    im.src = src;
    imgs.appendChild(im);
  });
  document.getElementById('productModal').style.display = 'flex';
  document.getElementById('addToCartModal').onclick = ()=>{ addToCart(title, price); };
}

function closeModal(){ document.getElementById('productModal').style.display = 'none'; }

// Cart using localStorage
function addToCart(title, price){
  let cart = JSON.parse(localStorage.getItem('aurum_cart') || '[]');
  const existing = cart.find(i=>i.title===title);
  if(existing) existing.qty += 1; else cart.push({title, price, qty:1});
  localStorage.setItem('aurum_cart', JSON.stringify(cart));
  updateCartCount();
  alert(title + ' added to cart (demo).');
  closeModal();
}

function updateCartCount(){
  const cart = JSON.parse(localStorage.getItem('aurum_cart') || '[]');
  const total = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = total;
}

// open cart button (simple view)
document.getElementById('cartBtn').addEventListener('click', ()=>{
  const cart = JSON.parse(localStorage.getItem('aurum_cart') || '[]');
  if(!cart.length){ alert('Cart is empty (demo).'); return; }
  let msg = 'Cart contents:\n';
  cart.forEach(i=> msg += `${i.qty}× ${i.title} — AED ${i.price}\n`);
  msg += '\nLocal-only demo cart. Clear with console or localStorage.clear().';
  alert(msg);
});

// close modal on backdrop
document.getElementById('productModal').addEventListener('click', function(e){ if(e.target===this) closeModal(); });

