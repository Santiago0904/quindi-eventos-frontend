import { login } from "../../services/auth.service.ts";
import { saveAuthUser } from "../../utils/storage.ts";
import { isEmail, isRequired } from "../../utils/validators.ts";
import { showError, showSuccess } from "../../utils/alerts.ts";
import { redirectAuthenticatedUser } from "./authGuard.ts";

document.addEventListener("DOMContentLoaded", () => {
  redirectAuthenticatedUser();

  const form = document.getElementById("login-form") as HTMLFormElement | null;
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;
  const rememberInput = document.getElementById("remember") as HTMLInputElement | null;

  if (!form || !emailInput || !passwordInput || !rememberInput) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const remember = rememberInput.checked;

    if (!isRequired(email) || !isRequired(password)) {
      showError("Por favor completa todos los campos.");
      return;
    }

    if (!isEmail(email)) {
      showError("Ingresa un correo electrónico válido.");
      return;
    }

    try {
      const user = await login({ email, password });
      saveAuthUser(user, remember);
      showSuccess("Has iniciado sesión correctamente.", "Bienvenido");
      setTimeout(() => {
        window.location.href = user.role === "admin" || user.role === "administrador"
          ? "/src/pages/admin.html"
          : "/index.html";
      }, 800);
    } catch (error) {
      const message = (error as any)?.message || "No se pudo iniciar sesión. Verifica tus credenciales e intenta de nuevo.";
      showError(message);
      console.error(error);
    }
  });
});
