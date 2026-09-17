// ===== CONFIG =====
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 3;
const STORAGE_KEY = "adminLoginAttempts";

// ===== DOM refs =====
const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const togglePassword = document.getElementById("togglePassword");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");
const formBanner = document.getElementById("formBanner");
const attemptsNote = document.getElementById("attemptsNote");
const strengthWrap = document.getElementById("strengthWrap");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");

// ===== Helpers: banner =====
function showBanner(message, type) {
  formBanner.textContent = message;
  formBanner.className = `form-banner ${type}`;
  formBanner.style.display = "block";
}

function hideBanner() {
  formBanner.style.display = "none";
}

// ===== Helpers: field error state =====
function setFieldError(inputEl, errorEl, message) {
  inputEl.closest(".form-group").classList.add("has-error");
  inputEl.closest(".form-group").classList.remove("is-valid");
  errorEl.textContent = message;
}

function setFieldValid(inputEl, errorEl) {
  inputEl.closest(".form-group").classList.remove("has-error");
  inputEl.closest(".form-group").classList.add("is-valid");
  errorEl.textContent = "";
}

function clearFieldState(inputEl, errorEl) {
  inputEl.closest(".form-group").classList.remove("has-error", "is-valid");
  errorEl.textContent = "";
}

// ===== Validation: email =====
function validateEmail(showError = true) {
  const value = emailInput.value.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (value === "") {
    if (showError) setFieldError(emailInput, emailError, "El correo electrónico es obligatorio.");
    return false;
  }

  if (!emailRegex.test(value)) {
    if (showError) setFieldError(emailInput, emailError, "Ingresa un correo electrónico válido.");
    return false;
  }

  // Domain-specific rule: only allow the store's admin domain
  const allowedDomain = "nikejordanstore.com";
  if (!value.toLowerCase().endsWith("@" + allowedDomain)) {
    if (showError) setFieldError(emailInput, emailError, `Usa tu correo corporativo (@${allowedDomain}).`);
    return false;
  }

  setFieldValid(emailInput, emailError);
  return true;
}

// ===== Validation: password strength / rules =====
function getPasswordChecks(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

function updateStrengthMeter(value) {
  if (value.length === 0) {
    strengthWrap.style.display = "none";
    return;
  }
  strengthWrap.style.display = "flex";

  const checks = getPasswordChecks(value);
  const score = Object.values(checks).filter(Boolean).length;

  const levels = [
    { min: 0, pct: 15, color: "#e8001c", label: "Muy débil" },
    { min: 2, pct: 40, color: "#e8001c", label: "Débil" },
    { min: 3, pct: 65, color: "#e8a300", label: "Media" },
    { min: 4, pct: 85, color: "#4ee08a", label: "Fuerte" },
    { min: 5, pct: 100, color: "#1fbf5c", label: "Muy fuerte" },
  ];

  let current = levels[0];
  for (const lvl of levels) {
    if (score >= lvl.min) current = lvl;
  }

  strengthFill.style.width = current.pct + "%";
  strengthFill.style.background = current.color;
  strengthLabel.textContent = current.label;
  strengthLabel.style.color = current.color;
}

function validatePassword(showError = true) {
  const value = passwordInput.value;

  if (value === "") {
    if (showError) setFieldError(passwordInput, passwordError, "La contraseña es obligatoria.");
    return false;
  }

  const checks = getPasswordChecks(value);

  if (!checks.length) {
    if (showError) setFieldError(passwordInput, passwordError, "Debe tener al menos 8 caracteres.");
    return false;
  }
  if (!checks.upper) {
    if (showError) setFieldError(passwordInput, passwordError, "Debe incluir al menos una mayúscula.");
    return false;
  }
  if (!checks.lower) {
    if (showError) setFieldError(passwordInput, passwordError, "Debe incluir al menos una minúscula.");
    return false;
  }
  if (!checks.number) {
    if (showError) setFieldError(passwordInput, passwordError, "Debe incluir al menos un número.");
    return false;
  }
  if (!checks.special) {
    if (showError) setFieldError(passwordInput, passwordError, "Debe incluir al menos un carácter especial.");
    return false;
  }

  setFieldValid(passwordInput, passwordError);
  return true;
}

// ===== Live validation (on input / blur) =====
emailInput.addEventListener("input", () => {
  if (emailInput.value.trim() === "") {
    clearFieldState(emailInput, emailError);
  } else {
    validateEmail();
  }
  hideBanner();
});

passwordInput.addEventListener("input", () => {
  updateStrengthMeter(passwordInput.value);
  if (passwordInput.value === "") {
    clearFieldState(passwordInput, passwordError);
  } else {
    validatePassword();
  }
  hideBanner();
});

emailInput.addEventListener("blur", () => {
  if (emailInput.value.trim() !== "") validateEmail();
});

passwordInput.addEventListener("blur", () => {
  if (passwordInput.value !== "") validatePassword();
});

// ===== Toggle password visibility =====
togglePassword.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  togglePassword.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
});

// ===== Lockout logic (stored in-memory for this session) =====
let attemptState = { count: 0, lockedUntil: null };

function isLockedOut() {
  if (!attemptState.lockedUntil) return false;
  if (Date.now() >= attemptState.lockedUntil) {
    attemptState = { count: 0, lockedUntil: null };
    attemptsNote.textContent = "";
    return false;
  }
  return true;
}

function formatRemaining(ms) {
  const totalSeconds = Math.ceil(ms / 1000);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function tickLockoutCountdown() {
  if (!attemptState.lockedUntil) return;
  const remaining = attemptState.lockedUntil - Date.now();
  if (remaining <= 0) {
    attemptState = { count: 0, lockedUntil: null };
    attemptsNote.textContent = "";
    hideBanner();
    setSubmitLoading(false);
    return;
  }
  showBanner(`Demasiados intentos fallidos. Intenta de nuevo en ${formatRemaining(remaining)}.`, "error");
  setTimeout(tickLockoutCountdown, 1000);
}

// ===== Submit loading state =====
function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading || isLockedOut();
  submitText.innerHTML = isLoading
    ? `<span class="spinner"></span> Verificando...`
    : "Ingresar al Panel";
}

// ===== Fake credential check (demo only — replace with real backend call) =====
const DEMO_ADMIN = {
  email: "admin@nikejordanstore.com",
  password: "Admin2026!",
};

function checkCredentials(email, password) {
  return email.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
}

// ===== Form submit =====
form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideBanner();

  if (isLockedOut()) {
    tickLockoutCountdown();
    return;
  }

  const emailOk = validateEmail();
  const passwordOk = validatePassword();

  if (!emailOk || !passwordOk) {
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
    showBanner("Corrige los errores marcados antes de continuar.", "error");
    return;
  }

  setSubmitLoading(true);

  // Simulate network request
  setTimeout(() => {
    const success = checkCredentials(emailInput.value.trim(), passwordInput.value);

    if (success) {
      attemptState = { count: 0, lockedUntil: null };
      attemptsNote.textContent = "";
      showBanner("¡Bienvenido! Redirigiendo al panel de administración...", "success");
      setSubmitLoading(false);
      submitBtn.disabled = true;
      // Aquí iría la redirección real, por ejemplo:
      // setTimeout(() => window.location.href = "/admin/dashboard", 1200);
    } else {
      attemptState.count += 1;
      const remaining = MAX_ATTEMPTS - attemptState.count;

      setFieldError(passwordInput, passwordError, "Credenciales incorrectas.");
      form.classList.add("shake");
      setTimeout(() => form.classList.remove("shake"), 500);

      if (remaining <= 0) {
        attemptState.lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        tickLockoutCountdown();
      } else {
        showBanner("Correo o contraseña incorrectos.", "error");
        attemptsNote.textContent = `Te ${remaining === 1 ? "queda" : "quedan"} ${remaining} ${remaining === 1 ? "intento" : "intentos"}.`;
      }

      setSubmitLoading(false);
    }
  }, 900);
});

// Initial state
setSubmitLoading(false);