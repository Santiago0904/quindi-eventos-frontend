import axios from "axios";

export interface Event {
  id: string;
  nombre: string;
  descripcion: string;
  municipio: string;
  lugar: string;
  fecha: string;
  hora: string;
  categoria: string;
  imagen: string;
  imagenes: string[];
  edadMinima: number;
  precio: number;
}

export type EventFormValues = Omit<Event, "id">;

type ApiEvent = Omit<Event, "id"> & { id: string | number };

type EventResponse<T> = {
  data: T;
};

const api = axios.create({
  baseURL: "http://localhost:3000",
});

function normalizeEvent(event: ApiEvent): Event {
  const imagenes = Array.isArray(event.imagenes) ? event.imagenes.filter(Boolean).map(String) : [];
  const imagen = String(event.imagen ?? imagenes[0] ?? "");
  return {
    ...event,
    id: String(event.id),
    imagen,
    imagenes: imagenes.length > 0 ? imagenes : imagen ? [imagen] : [],
    edadMinima: Number(event.edadMinima),
    precio: Number(event.precio ?? 0),
  };
}

export async function getEvents(): Promise<Event[]> {
  const result = await api.get<EventResponse<ApiEvent[]> | ApiEvent[]>("/events");
  const events = Array.isArray(result.data) ? result.data : result.data.data;
  return events.map(normalizeEvent);
}

export async function getEventById(id: string): Promise<Event> {
  const result = await api.get<EventResponse<ApiEvent> | ApiEvent>(`/events/${id}`);
  const event = "data" in result.data ? result.data.data : result.data;
  return normalizeEvent(event);
}

export async function createEvent(event: EventFormValues): Promise<Event> {
  const result = await api.post<EventResponse<ApiEvent> | ApiEvent>("/events", event);
  const created = "data" in result.data ? result.data.data : result.data;
  return normalizeEvent(created);
}

export async function updateEvent(id: string, event: EventFormValues): Promise<Event> {
  const result = await api.put<EventResponse<ApiEvent> | ApiEvent>(`/events/${id}`, event);
  const updated = "data" in result.data ? result.data.data : result.data;
  return normalizeEvent(updated);
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}
