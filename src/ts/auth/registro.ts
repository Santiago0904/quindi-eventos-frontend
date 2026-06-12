import { register } from "../../services/auth.service.ts";
import { isEmail, isRequired, minLength, passwordsMatch } from "../../utils/validators.ts";
import { showError, showSuccess } from "../../utils/alerts.ts";
import { redirectAuthenticatedUser } from "./authGuard.ts";

document.addEventListener("DOMContentLoaded", () => {
  redirectAuthenticatedUser();

  const form = document.getElementById("register-form") as HTMLFormElement | null;
  const nameInput = document.getElementById("name") as HTMLInputElement | null;
  const emailInput = document.getElementById("email") as HTMLInputElement | null;
  const passwordInput = document.getElementById("password") as HTMLInputElement | null;
  const confirmInput = document.getElementById("confirm-password") as HTMLInputElement | null;

  if (!form || !nameInput || !emailInput || !passwordInput || !confirmInput) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!isRequired(name) || !isRequired(email) || !isRequired(password) || !isRequired(confirmPassword)) {
      showError("Todos los campos son obligatorios.");
      return;
    }

    if (!isEmail(email)) {
      showError("Ingresa un correo electrónico válido.");
      return;
    }

    if (!minLength(password, 8)) {
      showError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!passwordsMatch(password, confirmPassword)) {
      showError("Las contraseñas no coinciden.");
      return;
    }

    try {
      await register({ name, email, password });
      showSuccess("Registro exitoso. Ahora puedes iniciar sesión.", "Bienvenido");
      setTimeout(() => {
        window.location.href = "/src/pages/login.html";
      }, 900);
    } catch (error) {
      const message = (error as any)?.message || "No fue posible registrar la cuenta. Intenta nuevamente.";
      showError(message);
      console.error(error);
    }
  });
});
