import type { AuthUser } from "../services/auth.service";

const LOCAL_KEY = "quindio_eventos_user";
const SESSION_KEY = "quindio_eventos_user_session";

export function saveAuthUser(user: AuthUser, remember = true): void {
  const payload = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(LOCAL_KEY, payload);
    sessionStorage.removeItem(SESSION_KEY);
    return;
  }

  sessionStorage.setItem(SESSION_KEY, payload);
  localStorage.removeItem(LOCAL_KEY);
}

export function getAuthUser(): AuthUser | null {
  const raw = localStorage.getItem(LOCAL_KEY) ?? sessionStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthUser(): void {
  localStorage.removeItem(LOCAL_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function isAuthenticated(): boolean {
  return getAuthUser() !== null;
}

export function getAuthUserRole(): string | null {
  return getAuthUser()?.role ?? null;
}
