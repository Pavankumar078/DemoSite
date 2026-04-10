/* ===== VASUDHA — MAIN.JS ===== */

let currentProductId = null;
let selectedSize = 'M';
let selectedColor = null;
let selectedQty = 1;
let currentCategory = 'all';
let currentSort = 'default';

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  handleNavScroll();
  animateOnScroll();
});

// ===== NAVBAR =====
function handleNavScroll() {
  window.addEventListener('scroll', () => {
    const nb = document.getElementById('navbar');
    if (window.scrollY > 60) nb.classList.add('scrolled');
    else nb.classList.remove('scrolled');

    // Active nav link
    const sections = ['hero','collections','heritage','testimonials','contact'];
    const links = document.querySelectorAll('.nav-link');
    let active = 'hero';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) active = id;
    });
    links.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + active);
    });
  });
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ===== SEARCH =====
function toggleSearch() {
  const sb = document.getElementById('searchBar');
  sb.classList.toggle('open');
  if (sb.classList.contains('open')) {
    document.getElementById('searchInput').focus();
  }
}

async function doSearch(query) {
  const res = document.getElementById('searchResults');
  if (!query.trim()) { res.classList.remove('open'); return; }
  try {
    const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const products = await r.json();
    if (!products.length) {
      res.innerHTML = `<div class="search-result-item"><span style="color:var(--text-muted);font-style:italic;font-size:0.9rem">No results found for "${query}"</span></div>`;
    } else {
      res.innerHTML = products.slice(0, 5).map(p => `
        <div class="search-result-item" onclick="openProductModal(${p.id}); document.getElementById('searchBar').classList.remove('open');">
          <span class="sri-emoji">${p.emoji}</span>
          <div>
            <div class="sri-name">${p.name}</div>
            <div style="font-size:0.75rem;color:var(--text-muted)">${p.origin}</div>
          </div>
          <span class="sri-price">₹${p.price.toLocaleString('en-IN')}</span>
        </div>`).join('');
    }
    res.classList.add('open');
  } catch(e) { console.error(e); }
}

document.addEventListener('click', e => {
  if (!e.target.closest('.search-bar')) {
    document.getElementById('searchResults').classList.remove('open');
  }
});

// ===== PRODUCTS FILTER & SORT =====
async function filterProducts(cat, btn) {
  currentCategory = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  await loadProducts();
}

async function sortProducts(sort) {
  currentSort = sort;
  await loadProducts();
}

async function loadProducts() {
  const grid = document.getElementById('productsGrid');
  grid.style.opacity = '0.5';
  try {
    const r = await fetch(`/api/products?category=${currentCategory}&sort=${currentSort}`);
    const products = await r.json();
    grid.innerHTML = products.map((p, i) => buildProductCard(p, i)).join('');
    grid.style.opacity = '1';
  } catch(e) {
    console.error(e);
    grid.style.opacity = '1';
  }
}

function buildProductCard(p, index) {
  const discount = Math.round((1 - p.price / p.original_price) * 100);
  const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
  const tagClass = ['Premium','Heritage','Exclusive'].includes(p.tag) ? 'tag-gold' :
                   ['New Arrival','Trending'].includes(p.tag) ? 'tag-green' : 'tag-maroon';
  const colorDots = p.colors.map(c => `<span class="color-dot" style="background:${c}"></span>`).join('');
  const gradientBg = `linear-gradient(135deg, ${p.colors[0]}22, ${p.colors.length > 1 ? p.colors[1] : p.colors[0]}44)`;
  return `
    <div class="product-card" data-cat="${p.category}" style="animation-delay:${index*0.07}s">
      <div class="product-img-wrap">
        <div class="product-emoji-bg" style="background:${gradientBg}">
          <span class="product-emoji">${p.emoji}</span>
          <div class="product-color-dots">${colorDots}</div>
        </div>
        <div class="product-tag ${tagClass}">${p.tag}</div>
        <div class="product-overlay">
          <button class="btn-quick-view" onclick="openProductModal(${p.id})">Quick View</button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-origin">📍 ${p.origin}</span>
        <h3 class="product-name">${p.name}</h3>
        <span class="product-fabric">${p.fabric}</span>
        <div class="product-rating">
          <span class="stars">${stars}</span>
          <span class="rating-num">${p.rating} (${p.reviews})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">₹${p.price.toLocaleString('en-IN')}</span>
          <span class="product-original">₹${p.original_price.toLocaleString('en-IN')}</span>
          <span class="product-discount">${discount}% off</span>
        </div>
        <button class="btn-add-cart" onclick="addToCart(${p.id}, '${p.colors[0]}', 'M')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="cart-icon-btn"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          Add to Cart
        </button>
      </div>
    </div>`;
}

// ===== PRODUCT MODAL =====
async function openProductModal(id) {
  try {
    const r = await fetch(`/api/product/${id}`);
    const p = await r.json();
    currentProductId = id;
    selectedSize = 'M';
    selectedColor = p.colors[0];
    selectedQty = 1;

    const discount = Math.round((1 - p.price / p.original_price) * 100);
    const tagClass = ['Premium','Heritage','Exclusive'].includes(p.tag) ? 'tag-gold' :
                     ['New Arrival','Trending'].includes(p.tag) ? 'tag-green' : 'tag-maroon';
    const stars = '★'.repeat(Math.floor(p.rating)) + '☆'.repeat(5 - Math.floor(p.rating));
    const gradBg = `linear-gradient(135deg, ${p.colors[0]}33, ${p.colors.length > 1 ? p.colors[1] : p.colors[0]}55)`;
    const sizeBtns = ['XS','S','M','L','XL','XXL'].map(s =>
      `<button class="size-btn ${s === 'M' ? 'active' : ''}" onclick="selectSize('${s}', this)">${s}</button>`
    ).join('');
    const colorBtns = p.colors.map(c =>
      `<button class="color-pick ${c === p.colors[0] ? 'active' : ''}" style="background:${c}" onclick="selectColor('${c}', this)"></button>`
    ).join('');

    document.getElementById('modalContent').innerHTML = `
      <div class="modal-product">
        <div class="modal-img" style="background:${gradBg}">
          <span style="font-size:8rem;filter:drop-shadow(0 6px 20px rgba(0,0,0,0.2))">${p.emoji}</span>
        </div>
        <div class="modal-details">
          <span class="modal-tag ${tagClass}">${p.tag}</span>
          <h2 class="modal-name">${p.name}</h2>
          <div class="modal-origin">📍 ${p.origin}</div>
          <div class="modal-fabric">${p.fabric}</div>
          <div class="modal-rating">
            <span class="stars">${stars}</span>
            <span class="rating-num">${p.rating} · ${p.reviews} reviews</span>
          </div>
          <div class="modal-price-row">
            <span class="modal-price">₹${p.price.toLocaleString('en-IN')}</span>
            <span class="product-original">₹${p.original_price.toLocaleString('en-IN')}</span>
            <span class="product-discount">${discount}% off</span>
          </div>
          <p class="modal-desc">${p.description}</p>
          <div class="modal-options">
            <label>Size</label>
            <div class="size-btns">${sizeBtns}</div>
          </div>
          <div class="modal-options" style="margin-top:1rem">
            <label>Color</label>
            <div class="color-btns">${colorBtns}</div>
          </div>
          <div class="qty-row" style="margin-top:1rem">
            <label style="font-family:var(--font-display);font-size:0.75rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--text-muted);font-weight:600">Qty</label>
            <button class="qty-btn" onclick="changeQty(-1)">−</button>
            <span class="qty-val" id="qtyDisplay">1</span>
            <button class="qty-btn" onclick="changeQty(1)">+</button>
          </div>
          <div class="modal-actions">
            <button class="btn-buy-now" onclick="buyNow(${p.id})">Buy Now ✦</button>
            <button class="btn-add-cart-modal" onclick="addToCartFromModal(${p.id})">Add to Cart 🛍️</button>
          </div>
        </div>
      </div>`;
    document.getElementById('productModal').classList.add('open');
  } catch(e) { console.error(e); }
}

function selectSize(size, btn) {
  selectedSize = size;
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function selectColor(color, btn) {
  selectedColor = color;
  document.querySelectorAll('.color-pick').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function changeQty(delta) {
  selectedQty = Math.max(1, selectedQty + delta);
  document.getElementById('qtyDisplay').textContent = selectedQty;
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('open');
}

function closeModal(e) {
  if (e.target === e.currentTarget) closeProductModal();
}

// ===== CART =====
function toggleCart() {
  const overlay = document.getElementById('cartOverlay');
  overlay.classList.toggle('open');
  if (overlay.classList.contains('open')) renderCart();
}

function closeCartOverlay(e) {
  if (e.target === document.getElementById('cartOverlay')) toggleCart();
}

async function addToCart(id, color, size, qty = 1) {
  try {
    const r = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, color, size, quantity: qty })
    });
    const data = await r.json();
    updateCartBadge(data.count);
    showToast('✓ Added to cart!');
    animateCartBtn();
  } catch(e) { console.error(e); }
}

async function addToCartFromModal(id) {
  await addToCart(id, selectedColor, selectedSize, selectedQty);
  closeProductModal();
}

async function buyNow(id) {
  await addToCart(id, selectedColor, selectedSize, selectedQty);
  closeProductModal();
  openCheckout();
}

async function renderCart() {
  try {
    const r = await fetch('/api/cart');
    const data = await r.json();
    const items = document.getElementById('cartItems');
    const footer = document.getElementById('cartFooter');

    if (!data.items.length) {
      items.innerHTML = `<div class="empty-cart">🌸<br><br>Your cart is empty.<br>Explore our beautiful collections!</div>`;
      footer.innerHTML = '';
      return;
    }

    items.innerHTML = data.items.map(item => `
      <div class="cart-item">
        <div class="ci-emoji">${item.emoji}</div>
        <div class="ci-info">
          <div class="ci-name">${item.name}</div>
          <div class="ci-meta">Size: ${item.size} · Color: <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${item.color};vertical-align:middle;border:1px solid #ccc"></span></div>
          <div class="ci-price">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
          <div class="ci-qty">
            <button class="ci-qty-btn" onclick="updateQty(${item.id}, '${item.size}', ${item.quantity - 1})">−</button>
            <span style="font-family:var(--font-display);font-weight:600;min-width:20px;text-align:center">${item.quantity}</span>
            <button class="ci-qty-btn" onclick="updateQty(${item.id}, '${item.size}', ${item.quantity + 1})">+</button>
            <button class="ci-remove" onclick="removeFromCart(${item.id}, '${item.size}')">✕ Remove</button>
          </div>
        </div>
      </div>`).join('');

    footer.innerHTML = `
      <div class="cart-total-row">
        <span class="cart-total-label">Total (${data.count} items)</span>
        <span class="cart-total-val">₹${data.total.toLocaleString('en-IN')}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.75rem;font-style:italic">Free delivery on orders above ₹5,000 ✦</div>
      <button class="btn-checkout" onclick="openCheckout()">Proceed to Checkout →</button>`;
  } catch(e) { console.error(e); }
}

async function removeFromCart(id, size) {
  try {
    const r = await fetch('/api/cart/remove', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, size })
    });
    const data = await r.json();
    updateCartBadge(data.count);
    renderCart();
    showToast('Item removed from cart');
  } catch(e) { console.error(e); }
}

async function updateQty(id, size, qty) {
  if (qty < 1) { removeFromCart(id, size); return; }
  try {
    await fetch('/api/cart/update', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id, size, quantity: qty })
    });
    renderCart();
  } catch(e) { console.error(e); }
}

async function updateCartBadge(count) {
  if (count === undefined) {
    try {
      const r = await fetch('/api/cart');
      const data = await r.json();
      count = data.count;
    } catch(e) { count = 0; }
  }
  document.getElementById('cartBadge').textContent = count;
}

function animateCartBtn() {
  const btn = document.querySelector('.cart-btn');
  btn.style.transform = 'scale(1.3)';
  setTimeout(() => btn.style.transform = '', 300);
}

// ===== CHECKOUT =====
async function openCheckout() {
  if (document.getElementById('cartOverlay').classList.contains('open')) toggleCart();
  try {
    const r = await fetch('/api/cart');
    const data = await r.json();
    if (!data.items.length) { showToast('Your cart is empty!'); return; }

    const summaryRows = data.items.map(item =>
      `<div class="summary-item"><span>${item.name} × ${item.quantity}</span><span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span></div>`
    ).join('');
    const shipping = data.total >= 5000 ? 'Free' : '₹199';
    const grandTotal = data.total + (data.total >= 5000 ? 0 : 199);

    document.getElementById('checkoutContent').innerHTML = `
      <h2 class="checkout-title">Checkout</h2>
      <p class="checkout-subtitle">Complete your order — crafted just for you ✦</p>
      <div class="order-summary">
        <h4>Order Summary</h4>
        ${summaryRows}
        <div class="summary-item"><span>Subtotal</span><span>₹${data.total.toLocaleString('en-IN')}</span></div>
        <div class="summary-item"><span>Shipping</span><span>${shipping}</span></div>
        <div class="summary-item"><span>Total</span><span>₹${grandTotal.toLocaleString('en-IN')}</span></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>First Name</label><input type="text" id="co_fname" placeholder="Priya" required></div>
        <div class="form-group"><label>Last Name</label><input type="text" id="co_lname" placeholder="Sharma"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Email</label><input type="email" id="co_email" placeholder="you@email.com" required></div>
        <div class="form-group"><label>Phone</label><input type="tel" id="co_phone" placeholder="+91 98765 43210"></div>
      </div>
      <div class="form-group"><label>Delivery Address</label><textarea id="co_addr" rows="2" placeholder="House no., Street, City, PIN..."></textarea></div>
      <div class="form-group"><label>Payment Method</label>
        <select id="co_payment">
          <option value="upi">UPI / BHIM</option>
          <option value="card">Credit / Debit Card</option>
          <option value="netbanking">Net Banking</option>
          <option value="cod">Cash on Delivery</option>
          <option value="emi">Easy EMI</option>
        </select>
      </div>
      <button class="btn-primary" style="width:100%;margin-top:0.5rem;padding:1rem;border-radius:10px;font-size:0.9rem" onclick="placeOrder()">
        Place Order — ₹${grandTotal.toLocaleString('en-IN')} ✦
      </button>`;
    document.getElementById('checkoutModal').classList.add('open');
  } catch(e) { console.error(e); }
}

async function placeOrder() {
  const fname = document.getElementById('co_fname')?.value.trim();
  const email = document.getElementById('co_email')?.value.trim();
  if (!fname || !email) { showToast('⚠️ Please fill required fields'); return; }

  const customer = {
    name: fname + ' ' + (document.getElementById('co_lname')?.value || ''),
    email,
    phone: document.getElementById('co_phone')?.value,
    address: document.getElementById('co_addr')?.value,
    payment: document.getElementById('co_payment')?.value
  };

  try {
    const r = await fetch('/api/order', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ customer })
    });
    const data = await r.json();
    if (data.success) {
      updateCartBadge(0);
      document.getElementById('checkoutContent').innerHTML = `
        <div class="order-confirmed">
          <div class="big-check">🎉</div>
          <h3>Order Confirmed!</h3>
          <p style="color:var(--text-muted);margin-bottom:0.5rem">Thank you, ${customer.name.split(' ')[0]}! Your order has been placed.</p>
          <div class="order-id">ORDER #${data.order_id}</div>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.5rem">Confirmation details sent to <strong>${email}</strong>. Expected delivery: 5–7 business days.</p>
          <div style="background:var(--cream);border-radius:12px;padding:1rem;margin-bottom:1.5rem;font-size:0.85rem">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.5rem"><span>Total Paid</span><span style="font-family:var(--font-display);color:var(--maroon);font-weight:700">₹${data.order.total.toLocaleString('en-IN')}</span></div>
            <div style="display:flex;justify-content:space-between"><span>Payment</span><span style="text-transform:capitalize">${customer.payment}</span></div>
          </div>
          <button class="btn-primary" onclick="document.getElementById('checkoutModal').classList.remove('open')">Continue Shopping ✦</button>
        </div>`;
      showToast('🎉 Order placed successfully!');
    }
  } catch(e) { console.error(e); showToast('Something went wrong. Please try again.'); }
}

function closeCheckoutModal(e) {
  if (e.target === e.currentTarget) document.getElementById('checkoutModal').classList.remove('open');
}

// ===== CONTACT FORM =====
function submitContact(e) {
  e.preventDefault();
  showToast('✉️ Message sent! We\'ll reply within 24 hours.');
  e.target.reset();
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== SCROLL ANIMATIONS =====
function animateOnScroll() {
  const cards = document.querySelectorAll('.product-card, .testimonial-card, .heritage-card, .pillar');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    observer.observe(card);
  });
}
