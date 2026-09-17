const products = [
  { id: 1, brand: "Nike", name: "Air Max 270", price: 150, color: "Triple Black", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&auto=format", tag: "BESTSELLER" },
  { id: 2, brand: "Nike", name: "Air Force 1 '07", price: 110, color: "White / White", img: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=600&fit=crop&auto=format", tag: "CLÁSICO" },
  { id: 3, brand: "Nike", name: "Dunk High", price: 115, color: "White / Sail", img: "https://images.unsplash.com/photo-1512374382149-233c42b6a83b?w=600&h=600&fit=crop&auto=format", tag: null },
  { id: 4, brand: "Nike", name: "Air Max 97", price: 175, color: "Black / White", img: "https://images.unsplash.com/photo-1605408499391-6368c628ef42?w=600&h=600&fit=crop&auto=format", tag: "NUEVO" },
  { id: 5, brand: "Nike", name: "React Infinity Run", price: 160, color: "Black / Orange", img: "https://images.unsplash.com/photo-1585232004423-244e0e6904e3?w=600&h=600&fit=crop&auto=format", tag: null },
  { id: 6, brand: "Nike", name: "Blazer Mid '77", price: 100, color: "White / Gum", img: "https://images.unsplash.com/photo-1656164753657-8ff832063a71?w=600&h=600&fit=crop&auto=format", tag: "SALE" },
  { id: 7, brand: "Jordan", name: "Air Jordan 1 Retro High OG", price: 180, color: "Black / White / Red", img: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&h=600&fit=crop&auto=format", tag: "ICÓNICO" },
  { id: 8, brand: "Jordan", name: "Air Jordan 13 Retro", price: 210, color: "Black / White", img: "https://images.unsplash.com/photo-1533681018184-68bd1d883b97?w=600&h=600&fit=crop&auto=format", tag: null },
  { id: 9, brand: "Jordan", name: "Air Jordan 4 Retro", price: 220, color: "Fire Red", img: "https://images.unsplash.com/photo-1731132198530-e4b2dc51d511?w=600&h=600&fit=crop&auto=format", tag: "NUEVO" },
  { id: 10, brand: "Jordan", name: "Air Jordan 6 Rings", price: 195, color: "Red / Chrome", img: "https://images.unsplash.com/photo-1686931463322-916e93213d86?w=600&h=600&fit=crop&auto=format", tag: null },
  { id: 11, brand: "Jordan", name: "Air Jordan 11 Retro", price: 245, color: "White / Red", img: "https://images.unsplash.com/photo-1605523741177-cd660595c2cf?w=600&h=600&fit=crop&auto=format", tag: "PREMIUM" },
  { id: 12, brand: "Jordan", name: "Air Jordan 3 Retro", price: 200, color: "White / Cement", img: "https://images.unsplash.com/photo-1656335362192-2bc9051b1824?w=600&h=600&fit=crop&auto=format", tag: null },
];

let currentFilter = "TODOS";
let cartCount = 0;
const wishlist = new Set();

const productsGrid = document.getElementById("productsGrid");
const resultsCount = document.getElementById("resultsCount");
const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");

function getTagClass(tag) {
  return (tag === "SALE" || tag === "NUEVO") ? "product-tag tag-red" : "product-tag";
}

function renderProducts() {
  const filtered = products.filter((p) => {
    if (currentFilter === "TODOS") return true;
    return p.brand.toUpperCase() === currentFilter;
  });

  resultsCount.textContent = `${filtered.length} modelos encontrados`;

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

function updateCartDisplay() {
  if (cartCount > 0) {
    cartCountEl.style.display = "flex";
    cartCountEl.textContent = cartCount;
  } else {
    cartCountEl.style.display = "none";
  }
}

// Filter tabs (top of products section)
document.querySelectorAll(".filter-tab").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-tab").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  });
});

// Brand card buttons (Nike / Jordan hero cards) also set the filter
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

// Cart button: clicking decrements (matches original behavior)
cartBtn.addEventListener("click", () => {
  cartCount = Math.max(0, cartCount - 1);
  updateCartDisplay();
});

// Delegate clicks inside the product grid (wishlist + quick add)
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
    cartCount += 1;
    updateCartDisplay();
  }
});

// Marquee strip content
const marqueeInner = document.getElementById("marqueeInner");
let marqueeHTML = "";
for (let i = 0; i < 6; i++) {
  const isEven = i % 2 === 0;
  marqueeHTML += `<span class="marquee-item ${isEven ? "" : "dim"}">${isEven ? "JUST DO IT" : "★ FREE SHIPPING ★"}</span>`;
}
marqueeInner.innerHTML = marqueeHTML;

// Initial render
renderProducts();