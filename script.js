const cartKey = 'autoparts_cart_v1';
let cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

const catalogEl = document.getElementById('catalog');
const cartCountEl = document.getElementById('cart-count');
const cartPanel = document.getElementById('cart-panel');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const viewCartBtn = document.getElementById('view-cart');
const closeCartBtn = document.getElementById('close-cart');
const brandFilter = document.getElementById('brand-filter');
const searchInput = document.getElementById('search');

function saveCart(){ localStorage.setItem(cartKey, JSON.stringify(cart)); renderCart(); }

function addToCart(p){
  const existing = cart.find(x=>x.id===p.id);
  if(existing) existing.qty++;
  else cart.push({id:p.id, qty:1, name:p.name, price:p.price});
  saveCart();
  alert('Додано в кошик: ' + p.name);
}

function renderProducts(products){
  catalogEl.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <div class="prod-img"><img src="${p.img}" alt="${p.name}" style="max-height:110px"></div>
      <div class="prod-meta">
        <h4>${p.name}</h4>
        <div class="row"><div>${p.brand}</div><div><strong>${p.price} грн</strong></div></div>
        <div style="margin-top:8px" class="row">
          <button class="btn buy">Купити</button>
          <small>SKU: ${p.sku}</small>
        </div>
      </div>
    `;
    card.querySelector('.buy').addEventListener('click', ()=>addToCart(p));
    catalogEl.appendChild(card);
  });
}

function renderCart(){
  cartCountEl.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsEl.innerHTML = '';
  if(cart.length===0){ cartItemsEl.innerHTML = '<p>Кошик порожній</p>'; cartTotalEl.textContent='0 грн'; return; }
  let total = 0;
  cart.forEach(item=>{
    total += item.price * item.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div style="width:56px;height:40px;background:#f3f3f3;border-radius:6px;display:flex;align-items:center;justify-content:center">${item.qty}×</div>
      <div class="meta">
        <div><strong>${item.name}</strong></div>
        <div>${item.price} грн</div>
      </div>
      <div>
        <button class="btn small dec">−</button>
        <button class="btn small inc">+</button>
        <button class="btn small rem">✕</button>
      </div>
    `;
    div.querySelector('.dec').addEventListener('click', ()=>{ item.qty=Math.max(1,item.qty-1); saveCart(); });
    div.querySelector('.inc').addEventListener('click', ()=>{ item.qty++; saveCart(); });
    div.querySelector('.rem').addEventListener('click', ()=>{ cart=cart.filter(x=>x.id!==item.id); saveCart(); });
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent = total + ' грн';
}

viewCartBtn.addEventListener('click', ()=>{ cartPanel.classList.toggle('hidden'); renderCart(); });
closeCartBtn.addEventListener('click', ()=>cartPanel.classList.add('hidden'));

function populateBrandFilter(allProducts){
  brandFilter.innerHTML = '<option value="">Всі марки</option>';
  const brands = Array.from(new Set(allProducts.map(p=>p.brand)));
  brands.forEach(b=>{
    const opt = document.createElement('option');
    opt.value = b; opt.textContent = b;
    brandFilter.appendChild(opt);
  });
}

function applyFilters(allProducts){
  const q = searchInput.value.trim().toLowerCase();
  const brand = brandFilter.value;
  const filtered = allProducts.filter(p=>{
    const okBrand = brand? p.brand === brand : true;
    const okQ = q ? (p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) : true;
    return okBrand && okQ;
  });
  renderProducts(filtered);
}

// ініціалізація
async function init(){
  const baseProducts = await fetch('products.json').then(r=>r.json());
  const adminProducts = JSON.parse(localStorage.getItem('autoparts_admin_products')||'[]');
  const allProducts = baseProducts.concat(adminProducts);

  populateBrandFilter(allProducts);
  applyFilters(allProducts);

  searchInput.addEventListener('input', ()=>applyFilters(allProducts));
  brandFilter.addEventListener('change', ()=>applyFilters(allProducts));
}
init();
renderCart();
