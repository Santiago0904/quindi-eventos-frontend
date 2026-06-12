import { getAuthUser, getAuthUserRole, isAuthenticated, clearAuthUser } from "../../utils/storage.ts";

const LOGIN_PATH = "/src/pages/login.html";

export function redirectToLogin(): void {
  window.location.href = LOGIN_PATH;
}

export function ensureAuthenticated(): void {
  if (!isAuthenticated()) {
    redirectToLogin();
  }
}

export function ensureAdmin(): void {
  if (!isAuthenticated()) {
    redirectToLogin();
    return;
  }

  const role = getAuthUserRole();
  if (role !== "admin" && role !== "administrador") {
    clearAuthUser();
    redirectToLogin();
  }
}

export function redirectAuthenticatedUser(): void {
  const user = getAuthUser();
  if (!user) {
    return;
  }

  const target = user.role === "admin" || user.role === "administrador"
    ? "/src/pages/admin.html"
    : "/index.html";
  const current = window.location.pathname;
  if (current.endsWith("/login.html") || current.endsWith("/registro.html")) {
    window.location.href = target;
  }
}
