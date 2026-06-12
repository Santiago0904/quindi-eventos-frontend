import { getAuthUser } from "./storage";

const FAVORITES_KEY = "quindio_eventos_favoritos";

function getScopedKey(): string {
  const user = getAuthUser();
  return user ? `${FAVORITES_KEY}_${user.id}` : FAVORITES_KEY;
}

export function getFavoriteEventIds(): string[] {
  const raw = localStorage.getItem(getScopedKey());
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function isFavoriteEvent(eventId: string): boolean {
  return getFavoriteEventIds().includes(eventId);
}

export function toggleFavoriteEvent(eventId: string): boolean {
  const current = getFavoriteEventIds();
  const exists = current.includes(eventId);
  const next = exists ? current.filter((id) => id !== eventId) : [...current, eventId];
  localStorage.setItem(getScopedKey(), JSON.stringify(next));
  return !exists;
}
