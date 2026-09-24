const form = document.getElementById("registerForm");

const fullNameInput = document.getElementById("fullName");
const emailInput = document.getElementById("email");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const termsInput = document.getElementById("terms");

const fullNameError = document.getElementById("fullNameError");
const emailError = document.getElementById("emailError");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");
const termsError = document.getElementById("termsError");

const strengthWrap = document.getElementById("strengthWrap");
const strengthFill = document.getElementById("strengthFill");
const strengthLabel = document.getElementById("strengthLabel");
const rulesList = document.getElementById("rulesList");

const formBanner = document.getElementById("formBanner");
const submitBtn = document.getElementById("submitBtn");
const submitText = document.getElementById("submitText");

const EXISTING_EMAILS = [];
const EXISTING_USERNAMES = [];

function showBanner(message, type) {
  formBanner.textContent = message;
  formBanner.className = `form-banner ${type}`;
  formBanner.style.display = "block";
}
function hideBanner() {
  formBanner.style.display = "none";
}

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

function validateFullName(showError = true) {
  const value = fullNameInput.value.trim();
  const nameRegex = /^[A-Za-zÁÉÍÓÚÑáéíóúñ]+(\s[A-Za-zÁÉÍÓÚÑáéíóúñ]+)+$/;

  if (value === "") {
    if (showError) setFieldError(fullNameInput, fullNameError, "El nombre completo es obligatorio.");
    return false;
  }
  if (value.length < 4) {
    if (showError) setFieldError(fullNameInput, fullNameError, "El nombre es demasiado corto.");
    return false;
  }
  if (!nameRegex.test(value)) {
    if (showError) setFieldError(fullNameInput, fullNameError, "Escribe nombre y apellido, solo letras.");
    return false;
  }
  setFieldValid(fullNameInput, fullNameError);
  return true;
}

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
  if (EXISTING_EMAILS.includes(value.toLowerCase())) {
    if (showError) setFieldError(emailInput, emailError, "Este correo ya está registrado.");
    return false;
  }

  setFieldValid(emailInput, emailError);
  return true;
}

function validateUsername(showError = true) {
  const value = usernameInput.value.trim();
  const usernameRegex = /^[a-z0-9_]{4,16}$/;

  if (value === "") {
    if (showError) setFieldError(usernameInput, usernameError, "El nombre de usuario es obligatorio.");
    return false;
  }
  if (!usernameRegex.test(value)) {
    if (showError) setFieldError(usernameInput, usernameError, "4-16 caracteres: minúsculas, números o \"_\".");
    return false;
  }
  if (EXISTING_USERNAMES.includes(value.toLowerCase())) {
    if (showError) setFieldError(usernameInput, usernameError, "Ese nombre de usuario ya existe.");
    return false;
  }

  setFieldValid(usernameInput, usernameError);
  return true;
}

usernameInput.addEventListener("input", () => {
  const cleaned = usernameInput.value.toLowerCase().replace(/\s/g, "");
  if (cleaned !== usernameInput.value) usernameInput.value = cleaned;
});

function getPasswordChecks(value) {
  return {
    length: value.length >= 8,
    upper: /[A-Z]/.test(value),
    lower: /[a-z]/.test(value),
    number: /[0-9]/.test(value),
    special: /[^A-Za-z0-9]/.test(value),
  };
}

function updateRulesChecklist(value) {
  const checks = getPasswordChecks(value);
  rulesList.querySelectorAll("li").forEach((li) => {
    const rule = li.dataset.rule;
    li.classList.toggle("met", !!checks[rule]);
  });
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
  const allMet = Object.values(checks).every(Boolean);

  if (!allMet) {
    if (showError) setFieldError(passwordInput, passwordError, "La contraseña no cumple todos los requisitos.");
    return false;
  }

  setFieldValid(passwordInput, passwordError);
  return true;
}

function validateConfirmPassword(showError = true) {
  const value = confirmPasswordInput.value;

  if (value === "") {
    if (showError) setFieldError(confirmPasswordInput, confirmPasswordError, "Confirma la contraseña.");
    return false;
  }
  if (value !== passwordInput.value) {
    if (showError) setFieldError(confirmPasswordInput, confirmPasswordError, "Las contraseñas no coinciden.");
    return false;
  }

  setFieldValid(confirmPasswordInput, confirmPasswordError);
  return true;
}

function validateTerms(showError = true) {
  if (!termsInput.checked) {
    if (showError) termsError.textContent = "Debes aceptar las políticas para continuar.";
    return false;
  }
  termsError.textContent = "";
  return true;
}

fullNameInput.addEventListener("input", () => {
  fullNameInput.value === "" ? clearFieldState(fullNameInput, fullNameError) : validateFullName();
  hideBanner();
});
fullNameInput.addEventListener("blur", () => { if (fullNameInput.value.trim() !== "") validateFullName(); });

emailInput.addEventListener("input", () => {
  emailInput.value === "" ? clearFieldState(emailInput, emailError) : validateEmail();
  hideBanner();
});
emailInput.addEventListener("blur", () => { if (emailInput.value.trim() !== "") validateEmail(); });

usernameInput.addEventListener("input", () => {
  usernameInput.value === "" ? clearFieldState(usernameInput, usernameError) : validateUsername();
  hideBanner();
});
usernameInput.addEventListener("blur", () => { if (usernameInput.value.trim() !== "") validateUsername(); });

passwordInput.addEventListener("input", () => {
  updateStrengthMeter(passwordInput.value);
  updateRulesChecklist(passwordInput.value);
  passwordInput.value === "" ? clearFieldState(passwordInput, passwordError) : validatePassword();
  if (confirmPasswordInput.value !== "") validateConfirmPassword();
  hideBanner();
});
passwordInput.addEventListener("blur", () => { if (passwordInput.value !== "") validatePassword(); });

confirmPasswordInput.addEventListener("input", () => {
  confirmPasswordInput.value === "" ? clearFieldState(confirmPasswordInput, confirmPasswordError) : validateConfirmPassword();
  hideBanner();
});
confirmPasswordInput.addEventListener("blur", () => { if (confirmPasswordInput.value !== "") validateConfirmPassword(); });

termsInput.addEventListener("change", () => {
  validateTerms();
  hideBanner();
});

document.querySelectorAll(".toggle-password").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.target;
    const targetInput = document.getElementById(targetId);
    const isPassword = targetInput.type === "password";
    targetInput.type = isPassword ? "text" : "password";
    btn.setAttribute("aria-label", isPassword ? "Ocultar contraseña" : "Mostrar contraseña");
  });
});

function setSubmitLoading(isLoading) {
  submitBtn.disabled = isLoading;
  submitText.innerHTML = isLoading
    ? `<span class="spinner"></span> Creando usuario...`
    : "Crear Usuario";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  hideBanner();

  const validations = [
    validateFullName(),
    validateEmail(),
    validateUsername(),
    validatePassword(),
    validateConfirmPassword(),
    validateTerms(),
  ];

  const allValid = validations.every(Boolean);

  if (!allValid) {
    form.classList.add("shake");
    setTimeout(() => form.classList.remove("shake"), 500);
    showBanner("Revisa los campos marcados en rojo antes de continuar.", "error");
    return;
  }

  setSubmitLoading(true);

  setTimeout(() => {
    EXISTING_EMAILS.push(emailInput.value.trim().toLowerCase());
    EXISTING_USERNAMES.push(usernameInput.value.trim().toLowerCase());

    showBanner(`Usuario "${usernameInput.value.trim()}" creado correctamente.`, "success");
    setSubmitLoading(false);
    form.reset();

    [fullNameInput, emailInput, usernameInput, passwordInput, confirmPasswordInput].forEach((el) => {
      el.closest(".form-group")?.classList.remove("has-error", "is-valid");
    });
    strengthWrap.style.display = "none";
    updateRulesChecklist("");
  }, 1000);
});