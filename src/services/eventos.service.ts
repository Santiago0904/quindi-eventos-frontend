const API_URL = "https://quindi-eventos-backend.onrender.com/events";

export interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  hora: string;
  municipio: string;
  lugar: string;
  descripcion: string;
  imagen: string;
  imagenes: string[];
  precio: number;
  categoria: string;
  edadMinima: number;
}

type BackendEvento = Omit<Evento, "id" | "precio" | "imagenes"> & {
  id: string | number;
  imagenes?: string[];
  precio?: number;
};

type ApiResponse<T> = {
  data: T;
};

function normalizeEvento(evento: BackendEvento): Evento {
  const imagenes = Array.isArray(evento.imagenes) ? evento.imagenes.filter(Boolean).map(String) : [];
  const imagen = String(evento.imagen ?? imagenes[0] ?? "");
  return {
    ...evento,
    id: String(evento.id),
    imagen,
    imagenes: imagenes.length > 0 ? imagenes : imagen ? [imagen] : [],
    precio: evento.precio ?? 0,
    edadMinima: Number(evento.edadMinima ?? 0),
  };
}

export async function getEventos(): Promise<Evento[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener eventos");
    const body = await res.json() as ApiResponse<BackendEvento[]> | BackendEvento[];
    const eventos = Array.isArray(body) ? body : body.data;
    return eventos.map(normalizeEvento);
  } catch (error) {
    console.warn("Backend no disponible, usando datos locales:", error);
    const res = await fetch("/src/data/eventos.json");
    const eventos = await res.json() as BackendEvento[];
    return eventos.map(normalizeEvento);
  }
}

export async function getEventoById(id: string | number): Promise<Evento | null> {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Evento no encontrado");
    const body = await res.json() as ApiResponse<BackendEvento> | BackendEvento;
    const evento = "data" in body ? body.data : body;
    return normalizeEvento(evento);
  } catch (error) {
    console.warn("Backend no disponible, buscando en datos locales:", error);
    const res = await fetch("/src/data/eventos.json");
    const eventos = await res.json() as BackendEvento[];
    return eventos.map(normalizeEvento).find(e => e.id === String(id)) ?? null;
  }
}
