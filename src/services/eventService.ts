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
  edadMinima: number;
}

export type EventFormValues = Omit<Event, "id">;

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export async function getEvents(): Promise<Event[]> {
  const result = await api.get<{ data: Event[] }>("/events");
  return result.data.data;
}

export async function getEventById(id: string): Promise<Event> {
  const result = await api.get<{ data: Event }>(`/events/${id}`);
  return result.data.data;
}

export async function createEvent(event: EventFormValues): Promise<Event> {
  const result = await api.post<{ data: Event }>("/events", event);
  return result.data.data;
}

export async function updateEvent(id: string, event: EventFormValues): Promise<Event> {
  const result = await api.put<{ data: Event }>(`/events/${id}`, event);
  return result.data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await api.delete(`/events/${id}`);
}
