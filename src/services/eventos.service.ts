const API_URL = "http://localhost:3000/eventos";

export interface Evento {
  id: number;
  nombre: string;
  fecha: string;
  hora: string;
  lugar: string;
  descripcion: string;
  imagen: string;
  precio: number;
  categoria: string;
}

export async function getEventos(): Promise<Evento[]> {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Error al obtener eventos");
    return await res.json();
  } catch (error) {
    console.warn("Backend no disponible, usando datos locales:", error);
    const res = await fetch("/src/data/eventos.json");
    return await res.json();
  }
}

export async function getEventoById(id: number): Promise<Evento | null> {
  try {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Evento no encontrado");
    return await res.json();
  } catch (error) {
    console.warn("Backend no disponible, buscando en datos locales:", error);
    const res = await fetch("/src/data/eventos.json");
    const eventos: Evento[] = await res.json();
    return eventos.find(e => e.id === id) ?? null;
  }
}