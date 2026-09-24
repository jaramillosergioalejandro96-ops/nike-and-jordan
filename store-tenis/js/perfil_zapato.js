const CATALOG_KEY = "nikeJordanAdminCatalog";
const CART_KEY = "nikeJordanCart";
const profilePage = document.getElementById("profilePage");
const productId = Number(new URLSearchParams(window.location.search).get("id"));

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  }[character]));
}

function getProduct() {
  try {
    const products = JSON.parse(localStorage.getItem(CATALOG_KEY) || "[]");
    return products.find((product) => Number(product.id) === productId);
  } catch (e) {
    return null;
  }
}

function showError() {
  profilePage.innerHTML = `<div class="profile-error"><h1>Modelo no encontrado</h1><p>Regresa al catálogo para elegir otro perfil.</p></div>`;
}

function renderProfile(product) {
  const brandClass = product.brand === "Jordan" ? "brand-jordan" : "";
  const description = `${product.name} combina la identidad de ${product.brand} con una silueta pensada para acompañarte todos los días. Su acabado ${product.color.toLowerCase()} suma presencia a cualquier combinación.`;
  profilePage.innerHTML = `
    <div class="profile-layout">
      <div class="product-visual">
        ${product.tag ? `<span class="profile-tag">${escapeHtml(product.tag)}</span>` : ""}
        <img src="${escapeHtml(product.img)}" alt="${escapeHtml(product.name)}">
      </div>
      <section class="product-info">
        <p class="profile-eyebrow ${brandClass}">${escapeHtml(product.brand)}</p>
        <h1 class="profile-title">${escapeHtml(product.name)}</h1>
        <p class="profile-color">${escapeHtml(product.color)}</p>
        <p class="profile-description">${escapeHtml(description)}</p>
        <div><span class="profile-price">$${escapeHtml(product.price)}</span><span class="profile-currency">USD</span></div>
        <div class="purchase-panel">
          <label class="field-label">Selecciona tu talla</label>
          <div class="size-grid" id="sizeGrid">
            ${[38, 39, 40, 41, 42, 43, 44, 45, 46, 47].map((size, index) => `<button class="size-btn${index === 3 ? " selected" : ""}" data-size="${size}">${size}</button>`).join("")}
          </div>
          <div class="purchase-row">
            <div class="quantity"><button id="decrease" aria-label="Disminuir cantidad">−</button><span id="quantity">1</span><button id="increase" aria-label="Aumentar cantidad">+</button></div>
            <button class="add-button" id="addButton">Añadir al carrito</button>
          </div>
        </div>
      </section>
    </div>
    <div class="profile-toast" id="profileToast"></div>`;

  let quantity = 1;
  let selectedSize = 41;
  document.querySelectorAll(".size-btn").forEach((button) => button.addEventListener("click", () => {
    selectedSize = Number(button.dataset.size);
    document.querySelectorAll(".size-btn").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
  }));
  document.getElementById("decrease").addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    document.getElementById("quantity").textContent = quantity;
  });
  document.getElementById("increase").addEventListener("click", () => {
    quantity += 1;
    document.getElementById("quantity").textContent = quantity;
  });
  document.getElementById("addButton").addEventListener("click", () => {
    let cart = [];
    try { cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (e) { cart = []; }
    const item = cart.find((cartItem) => cartItem.id === product.id && cartItem.size === selectedSize);
    if (item) item.qty += quantity;
    else cart.push({ ...product, size: selectedSize, qty: quantity });
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    const toast = document.getElementById("profileToast");
    toast.textContent = `${product.name}, talla ${selectedSize}, añadido al carrito.`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2400);
  });
}

const product = getProduct();
if (product) renderProfile(product);
else showError();