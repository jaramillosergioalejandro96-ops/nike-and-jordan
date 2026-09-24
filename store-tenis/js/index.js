function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser"));
  } catch (e) {
    return null;
  }
}

function renderAuthNav() {
  const currentUser = getCurrentUser();

  const navLinksGuest = document.getElementById("navLinksGuest");
  const navLinksUser = document.getElementById("navLinksUser");
  const navGreeting = document.getElementById("navGreeting");
  const adminPanelLink = document.getElementById("adminPanelLink");

  if (currentUser) {
    navLinksGuest.style.display = "none";
    navLinksUser.style.display = "flex";
    navGreeting.textContent = `hola, ${currentUser.nombre}`;
  } else {
    navLinksGuest.style.display = "flex";
    navLinksUser.style.display = "none";
  }

  if (adminPanelLink) {
    adminPanelLink.style.display = (currentUser && currentUser.rol === "administrador") ? "flex" : "none";
  }
}

document.getElementById("navLogoutLink").addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("currentUser");
  renderAuthNav();
});

const products = [];

let currentFilter = "TODOS";
const wishlist = new Set();

const productsGrid = document.getElementById("productsGrid");
const resultsCount = document.getElementById("resultsCount");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");

const CART_KEY = "nikeJordanCart";
let cart = [];

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    cart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    cart = [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
  }
}

function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      brand: product.brand,
      name: product.name,
      color: product.color,
      price: product.price,
      img: product.img,
      qty: 1,
    });
  }
  saveCart();
  renderCart();
  showToast(`${product.name} añadido al carrito`);
  openCart();
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((i) => i.id !== id);
  saveCart();
  renderCart();
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
}

function cartTotalItems() {
  return cart.reduce((sum, i) => sum + i.qty, 0);
}

function cartTotalPrice() {
  return cart.reduce((sum, i) => sum + i.qty * i.price, 0);
}

const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const cartEmpty = document.getElementById("cartEmpty");
const cartItemsEl = document.getElementById("cartItems");
const cartFooter = document.getElementById("cartFooter");
const cartTotalEl = document.getElementById("cartTotal");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");

function renderCart() {
  const totalItems = cartTotalItems();

  // Nav badge
  if (totalItems > 0) {
    cartCountEl.style.display = "flex";
    cartCountEl.textContent = totalItems;
  } else {
    cartCountEl.style.display = "none";
  }

  // Empty state vs items
  if (cart.length === 0) {
    cartEmpty.style.display = "flex";
    cartItemsEl.style.display = "none";
    cartFooter.style.display = "none";
    return;
  }

  cartEmpty.style.display = "none";
  cartItemsEl.style.display = "flex";
  cartFooter.style.display = "block";

  cartItemsEl.innerHTML = cart.map((item) => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        <img src="${item.img}" alt="${item.name}">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-brand ${item.brand === "Jordan" ? "brand-jordan" : ""}">${item.brand}</div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-color">${item.color}</div>
        <div class="cart-item-row">
          <div class="qty-control">
            <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
            <span class="qty-value">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
          </div>
          <span class="cart-item-price">$${item.price * item.qty}</span>
        </div>
      </div>
      <button class="cart-item-remove" data-action="remove" data-id="${item.id}" aria-label="Eliminar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `).join("");

  cartTotalEl.textContent = `$${cartTotalPrice()}`;
}

cartItemsEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;

  if (action === "inc") changeQty(id, 1);
  if (action === "dec") changeQty(id, -1);
  if (action === "remove") removeFromCart(id);
});

clearCartBtn.addEventListener("click", clearCart);

checkoutBtn.addEventListener("click", () => {
  showToast("¡Gracias por tu compra! (demo)");
  clearCart();
  closeCart();
});

function openCart() {
  cartOverlay.classList.add("active");
  cartDrawer.classList.add("active");
}
function closeCart() {
  cartOverlay.classList.remove("active");
  cartDrawer.classList.remove("active");
}

cartBtn.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCart();
});

let toastTimeout;
function showToast(message) {
  let toast = document.querySelector(".cart-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "cart-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => toast.classList.add("show"));
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

function getTagClass(tag) {
  return (tag === "SALE" || tag === "NUEVO") ? "product-tag tag-red" : "product-tag";
}

function renderProducts() {
  const filtered = products.filter((p) => {
    if (currentFilter === "TODOS") return true;
    return p.brand.toUpperCase() === currentFilter;
  });

  resultsCount.textContent = `${filtered.length} modelos encontrados`;

  const catalogEmpty = document.getElementById("catalogEmpty");
  if (filtered.length === 0) {
    catalogEmpty.style.display = "block";
    productsGrid.innerHTML = "";
    return;
  }
  catalogEmpty.style.display = "none";

  productsGrid.innerHTML = filtered.map((product) => `
    <div class="product-card" data-id="${product.id}">
      <div class="product-img-wrap">
        <img class="product-img" src="${product.img}" alt="${product.name}">
        ${product.tag ? `<div class="${getTagClass(product.tag)}">${product.tag}</div>` : ""}
        <button class="wishlist-btn ${wishlist.has(product.id) ? "active" : ""}" data-id="${product.id}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="${wishlist.has(product.id) ? "currentColor" : "none"}" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </svg>
        </button>
        <div class="quick-add">
          <button class="quick-add-btn" data-id="${product.id}">+ Añadir al Carrito</button>
        </div>
      </div>
      <div class="product-info">
        <div class="product-brand ${product.brand === "Jordan" ? "brand-jordan" : ""}">${product.brand}</div>
        <div class="product-name">${product.name}</div>
        <div class="product-color">${product.color}</div>
        <div class="product-price-row">
          <span class="product-price">$${product.price}</span>
          <span class="product-currency">USD</span>
        </div>
      </div>
    </div>
  `).join("");
}

document.querySelectorAll(".filter-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  });
});

document.querySelectorAll(".brand-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((b) => {
      b.classList.toggle("active", b.dataset.filter === currentFilter);
    });
    renderProducts();
    document.getElementById("productos").scrollIntoView({ behavior: "smooth" });
  });
});

productsGrid.addEventListener("click", (e) => {
  const wishBtn = e.target.closest(".wishlist-btn");
  const addBtn = e.target.closest(".quick-add-btn");

  if (wishBtn) {
    e.stopPropagation();
    const id = Number(wishBtn.dataset.id);
    if (wishlist.has(id)) {
      wishlist.delete(id);
    } else {
      wishlist.add(id);
    }
    renderProducts();
    return;
  }

  if (addBtn) {
    e.stopPropagation();
    const id = Number(addBtn.dataset.id);
    const product = products.find((p) => p.id === id);
    if (product) addToCart(product);
  }
});

const marqueeInner = document.getElementById("marqueeInner");
let marqueeHTML = "";
for (let i = 0; i < 6; i++) {
  const isEven = i % 2 === 0;
  marqueeHTML += `<span class="marquee-item ${isEven ? "" : "dim"}">${isEven ? "JUST DO IT" : "★ FREE SHIPPING ★"}</span>`;
}
marqueeInner.innerHTML = marqueeHTML;

loadCart();
renderProducts();
renderCart();
renderAuthNav();