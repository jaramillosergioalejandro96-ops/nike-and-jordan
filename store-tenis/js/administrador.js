

const SESSION_KEY = "currentUser";

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch (e) {
    return null;
  }
}

function seedDemoAdminSession() {
  if (!getCurrentUser()) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
      nombre: "Admin Demo",
      rol: "administrador",
    }));
  }
}

function guardAdminAccess() {
  const user = getCurrentUser();
  if (!user || user.rol !== "administrador") {
    window.location.href = "inicio_sesion.html";
    return null;
  }
  return user;
}

seedDemoAdminSession(); 
const currentUser = guardAdminAccess();

document.getElementById("adminUsername").textContent = currentUser ? currentUser.nombre : "";

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = "inicio_sesion.html";
});

const CATALOG_KEY = "nikeJordanAdminCatalog";
const SEED_PRODUCTS = [];

let products = [];
let currentFilter = "TODOS";
let searchTerm = "";

function loadProducts() {
  try {
    const saved = localStorage.getItem(CATALOG_KEY);
    products = saved ? JSON.parse(saved) : SEED_PRODUCTS.slice();
  } catch (e) {
    products = SEED_PRODUCTS.slice();
  }
}

function saveProducts() {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(products));
  } catch (e) {
  }
}

let toastTimeout;
function showToast(message) {
  let toast = document.querySelector(".admin-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "admin-toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  clearTimeout(toastTimeout);
  requestAnimationFrame(() => toast.classList.add("show"));
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2200);
}

const tableBody = document.getElementById("productsTableBody");
const adminEmpty = document.getElementById("adminEmpty");

function getFilteredProducts() {
  return products.filter((p) => {
    const matchesBrand = currentFilter === "TODOS" || p.brand.toUpperCase() === currentFilter;
    const matchesSearch = searchTerm === "" ||
      p.name.toLowerCase().includes(searchTerm) ||
      p.brand.toLowerCase().includes(searchTerm);
    return matchesBrand && matchesSearch;
  });
}

function renderTable() {
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    tableBody.innerHTML = "";
    if (products.length === 0) {
      adminEmpty.innerHTML = `
        <p>Todavía no hay productos en el catálogo.</p>
        <span>Agrega el primero con el botón "+ Agregar producto".</span>
      `;
    } else {
      adminEmpty.innerHTML = `<p>No se encontraron productos con esa búsqueda.</p>`;
    }
    adminEmpty.style.display = "block";
    return;
  }
  adminEmpty.style.display = "none";

  tableBody.innerHTML = filtered.map((p) => `
    <tr data-id="${p.id}">
      <td><img class="table-img" src="${p.img}" alt="${p.name}"></td>
      <td class="table-product-name">${p.name}</td>
      <td><span class="table-brand ${p.brand === "Jordan" ? "brand-jordan" : ""}">${p.brand}</span></td>
      <td class="table-color">${p.color}</td>
      <td>
        <input type="number" class="price-input" data-id="${p.id}" data-field="price" value="${p.price}" min="0" step="1">
      </td>
      <td>
        <input type="text" class="tag-input" data-id="${p.id}" data-field="tag" value="${p.tag || ""}" placeholder="—">
      </td>
      <td>
        <div class="row-actions">
          <button class="row-save-btn" data-action="save" data-id="${p.id}" disabled>Guardar</button>
          <button class="row-delete-btn" data-action="delete" data-id="${p.id}" aria-label="Eliminar producto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

tableBody.addEventListener("input", (e) => {
  const input = e.target.closest("input[data-field]");
  if (!input) return;
  const row = input.closest("tr");
  const saveBtn = row.querySelector('[data-action="save"]');
  input.classList.add("dirty");
  saveBtn.disabled = false;
});

tableBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const product = products.find((p) => p.id === id);
  if (!product) return;

  if (btn.dataset.action === "save") {
    const row = btn.closest("tr");
    const priceInput = row.querySelector('[data-field="price"]');
    const tagInput = row.querySelector('[data-field="tag"]');

    const newPrice = Number(priceInput.value);
    if (!newPrice || newPrice <= 0) {
      showToast("El precio debe ser mayor a 0.");
      return;
    }

    product.price = newPrice;
    product.tag = tagInput.value.trim();

    saveProducts();
    priceInput.classList.remove("dirty");
    tagInput.classList.remove("dirty");
    btn.disabled = true;
    showToast(`Precio de "${product.name}" actualizado.`);
  }

  if (btn.dataset.action === "delete") {
    const confirmed = window.confirm(`¿Eliminar "${product.name}" del catálogo?`);
    if (!confirmed) return;

    products = products.filter((p) => p.id !== id);
    saveProducts();
    renderTable();
    showToast(`"${product.name}" eliminado del catálogo.`);
  }
});

document.querySelectorAll(".filter-pill").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderTable();
  });
});

document.getElementById("searchInput").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderTable();
});

const addModalOverlay = document.getElementById("addModalOverlay");
const addProductForm = document.getElementById("addProductForm");
const newNameInput = document.getElementById("newName");
const newBrandInput = document.getElementById("newBrand");
const newPriceInput = document.getElementById("newPrice");
const newColorInput = document.getElementById("newColor");
const newImgInput = document.getElementById("newImg");
const newTagInput = document.getElementById("newTag");
const newNameError = document.getElementById("newNameError");
const newPriceError = document.getElementById("newPriceError");

function openAddModal() {
  addModalOverlay.classList.add("active");
  newNameInput.focus();
}
function closeAddModal() {
  addModalOverlay.classList.remove("active");
  addProductForm.reset();
  newNameError.textContent = "";
  newPriceError.textContent = "";
}

document.getElementById("openAddModal").addEventListener("click", openAddModal);
document.getElementById("closeAddModal").addEventListener("click", closeAddModal);
document.getElementById("cancelAddModal").addEventListener("click", closeAddModal);
addModalOverlay.addEventListener("click", (e) => {
  if (e.target === addModalOverlay) closeAddModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && addModalOverlay.classList.contains("active")) closeAddModal();
});

addProductForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = newNameInput.value.trim();
  const price = Number(newPriceInput.value);
  let valid = true;

  if (name === "") {
    newNameError.textContent = "El nombre del modelo es obligatorio.";
    valid = false;
  } else {
    newNameError.textContent = "";
  }

  if (!price || price <= 0) {
    newPriceError.textContent = "Ingresa un precio válido.";
    valid = false;
  } else {
    newPriceError.textContent = "";
  }

  if (!valid) return;

  const newProduct = {
    id: Date.now(),
    brand: newBrandInput.value,
    name,
    price,
    color: newColorInput.value.trim() || "Sin especificar",
    img: newImgInput.value.trim() || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&auto=format",
    tag: newTagInput.value.trim(),
  };

  products.push(newProduct);
  saveProducts();
  renderTable();
  closeAddModal();
  showToast(`"${newProduct.name}" agregado al catálogo.`);
});

loadProducts();
renderTable();
