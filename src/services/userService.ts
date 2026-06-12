import axios from "axios";
import { getAuthUser } from "../utils/storage";

export interface User {
  id: string;
  nombre: string;
  correo: string;
  rol: "visitante" | "administrador";
}

type ApiUser = Omit<User, "id"> & { id: string | number };

type UserResponse<T> = {
  data: T;
};

export type UserFormValues = Omit<User, "id"> & {
  contrasena?: string;
};

const api = axios.create({
  baseURL: "https://quindi-eventos-backend.onrender.com",
});

api.interceptors.request.use((config) => {
  const token = getAuthUser()?.token;
  if (token) {
    config.headers["x-user-id"] = token;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function normalizeUser(user: ApiUser): User {
  return {
    id: String(user.id),
    nombre: user.nombre,
    correo: user.correo,
    rol: user.rol,
  };
}

function cleanUserPayload(user: UserFormValues): UserFormValues {
  if (user.contrasena?.trim()) {
    return { ...user, contrasena: user.contrasena.trim() };
  }

  const { contrasena: _contrasena, ...payload } = user;
  return payload;
}

export async function getUsers(): Promise<User[]> {
  const result = await api.get<UserResponse<ApiUser[]> | ApiUser[]>("/api/users");
  const users = Array.isArray(result.data) ? result.data : result.data.data;
  return users.map(normalizeUser);
}

export async function getUserById(id: string): Promise<User> {
  const result = await api.get<UserResponse<ApiUser> | ApiUser>(`/api/users/${id}`);
  const user = "data" in result.data ? result.data.data : result.data;
  return normalizeUser(user);
}

export async function createUser(user: UserFormValues): Promise<User> {
  const result = await api.post<UserResponse<ApiUser> | ApiUser>("/api/users", cleanUserPayload(user));
  const created = "data" in result.data ? result.data.data : result.data;
  return normalizeUser(created);
}

export async function updateUser(id: string, user: UserFormValues): Promise<User> {
  const result = await api.put<UserResponse<ApiUser> | ApiUser>(`/api/users/${id}`, cleanUserPayload(user));
  const updated = "data" in result.data ? result.data.data : result.data;
  return normalizeUser(updated);
}

export async function deleteUser(id: string): Promise<void> {
  await api.delete(`/api/users/${id}`);
}
