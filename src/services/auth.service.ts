import axios from "axios";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  token?: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

const API_BASE = "/api/auth";

function parseUser(data: unknown): AuthUser {
  if (typeof data !== "object" || data === null) {
    throw new Error("Respuesta de usuario inválida");
  }

  const payload = (data as any).user ?? data;

  if (typeof payload !== "object" || payload === null) {
    throw new Error("Respuesta de usuario inválida");
  }

  const { id, nombre, correo, rol } = payload as Record<string, unknown>;
  const token = (data as Record<string, unknown>).token ?? (payload as Record<string, unknown>).token;

  if ((typeof id !== "string" && typeof id !== "number") || typeof nombre !== "string" || typeof correo !== "string" || typeof rol !== "string") {
    throw new Error("Estructura de usuario incorrecta");
  }

  return {
    id: String(id),
    name: nombre,
    email: correo,
    role: normalizeRole(rol),
    token: typeof token === "string" ? token : undefined,
  };
}

function normalizeRole(role: string): string {
  const normalized = role.toLowerCase();
  if (normalized === "administrador" || normalized === "admin") {
    return "admin";
  }
  if (normalized === "usuario" || normalized === "user") {
    return "user";
  }
  return normalized;
}

export async function login(payload: LoginPayload): Promise<AuthUser> {
  try {
    const response = await axios.post(`${API_BASE}/login`, {
      correo: payload.email,
      contrasena: payload.password,
    });

    return parseUser(response.data);
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.mensaje) {
      throw new Error(axiosError.response.data.mensaje);
    }
    throw error;
  }
}

export async function register(payload: RegisterPayload): Promise<AuthUser> {
  try {
    const response = await axios.post(`${API_BASE}/register`, {
      nombre: payload.name,
      correo: payload.email,
      contrasena: payload.password,
    });

    return parseUser(response.data);
  } catch (error) {
    const axiosError = error as any;
    if (axiosError.response?.data?.mensaje) {
      throw new Error(axiosError.response.data.mensaje);
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await axios.post(`${API_BASE}/logout`);
}
