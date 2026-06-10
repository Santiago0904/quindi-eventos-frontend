import { useEffect, useMemo, useState } from "react";
import { createEvent, deleteEvent, getEvents, updateEvent } from "../services/eventService";
import type { Event, EventFormValues } from "../services/eventService";
import EventForm from "../components/EventForm";

const COFFEE = "#3b2314";
const SIDEBAR_ACTIVE = "#bbf7d0";
type AdminSection = "events" | "users" | "settings" | "categories";

const previewRows: Event[] = [
  {
    id: "preview-1",
    nombre: "Festival del Café",
    descripcion: "Celebración del café y la cultura local",
    municipio: "Salento",
    lugar: "Plaza Principal",
    fecha: "2024-10-15",
    hora: "18:00",
    categoria: "GASTRONOMY",
    imagen: "/assets/placeholder-coffee.jpg",
    edadMinima: 0,
  },
  {
    id: "preview-2",
    nombre: "Caminata Cocora",
    descripcion: "Senderismo por el valle de Cocora",
    municipio: "Salento",
    lugar: "Valle de Cocora",
    fecha: "2024-10-18",
    hora: "08:00",
    categoria: "NATURE",
    imagen: "/assets/placeholder-hike.jpg",
    edadMinima: 6,
  },
  {
    id: "preview-3",
    nombre: "Desfile del Yipao",
    descripcion: "Tradicional desfile en las calles",
    municipio: "Armenia",
    lugar: "Av. Bolívar",
    fecha: "2024-10-22",
    hora: "16:00",
    categoria: "CULTURE",
    imagen: "/assets/placeholder-parade.jpg",
    edadMinima: 0,
  },
];

function badgeClass(cat: string) {
  const c = cat?.toUpperCase?.() ?? "";
  if (c === "GASTRONOMY") return "bg-[#bbf7d0] text-[#065f46]";
  if (c === "NATURE") return "bg-[#ffd8b5] text-[#7c2d12]";
  if (c === "CULTURE") return "bg-[#f3d6ff] text-[#4c1d95]";
  return "bg-gray-100 text-gray-800";
}

export default function AdminPanel(): JSX.Element {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>("events");
  const [offlineMode, setOfflineMode] = useState(false);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
      setOfflineMode(false);
    } catch (err) {
      setError("No se pudo conectar al backend. Mostrando datos de ejemplo.");
      setEvents(previewRows);
      setOfflineMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchEvents();
  }, []);

  const handleCreateClick = () => {
    setEditingEvent(null);
    setActiveSection("events");
    setFormOpen(true);
  };

  const handleEdit = (ev: Event) => {
    setEditingEvent(ev);
    setActiveSection("events");
    setFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("¿Está seguro de eliminar este evento?");
    if (!ok) return;
    setSaving(true);
    try {
      await deleteEvent(id);
      await fetchEvents();
    } catch {
      setEvents((current) => {
        const baseRows = current.length > 0 ? current : previewRows;
        return baseRows.filter((event) => event.id !== id);
      });
      setOfflineMode(true);
      setError("No se pudo conectar al backend. El evento se eliminó solo en esta vista.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (values: EventFormValues) => {
    setSaving(true);
    try {
      if (editingEvent) await updateEvent(editingEvent.id, values);
      else await createEvent(values);
      setFormOpen(false);
      setEditingEvent(null);
      await fetchEvents();
    } catch {
      setEvents((current) => {
        const baseRows = current.length > 0 ? current : previewRows;
        if (editingEvent) {
          return baseRows.map((event) => (event.id === editingEvent.id ? { ...event, ...values } : event));
        }

        return [
          ...baseRows,
          {
            id: `local-${Date.now()}`,
            ...values,
            imagen: values.imagen || "/assets/placeholder-coffee.jpg",
          },
        ];
      });
      setFormOpen(false);
      setEditingEvent(null);
      setOfflineMode(true);
      setError("No se pudo conectar al backend. Los cambios se guardaron solo en esta vista.");
    } finally {
      setSaving(false);
    }
  };

  const initialValues = useMemo<EventFormValues | undefined>(() => {
    if (!editingEvent) return undefined;
    return {
      nombre: editingEvent.nombre,
      descripcion: editingEvent.descripcion,
      municipio: editingEvent.municipio,
      lugar: editingEvent.lugar,
      fecha: editingEvent.fecha,
      hora: editingEvent.hora,
      categoria: editingEvent.categoria,
      imagen: editingEvent.imagen,
      edadMinima: editingEvent.edadMinima,
    };
  }, [editingEvent]);

  const rows = events.length > 0 ? events : previewRows;

  return (
    <div className="min-h-screen flex bg-[#faf8f5] text-gray-900">
      <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col sticky top-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-[#3b2314] text-white flex items-center justify-center font-bold">QE</div>
          <div>
            <div className="text-lg font-semibold">QuindíoEventos</div>
            <div className="text-xs text-gray-400">Administrador</div>
          </div>
        </div>

        <div className="px-4">
          <button
            type="button"
            onClick={() => setActiveSection("events")}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium"
            style={activeSection === "events" ? { background: SIDEBAR_ACTIVE, color: "#064e3b" } : undefined}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 7h18M3 12h18M3 17h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Eventos
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("users")}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            style={activeSection === "users" ? { background: SIDEBAR_ACTIVE, color: "#064e3b" } : undefined}
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="7" r="3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Usuarios
          </button>
          <button
            type="button"
            onClick={() => setActiveSection("settings")}
            className="w-full mt-2 flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            style={activeSection === "settings" ? { background: SIDEBAR_ACTIVE, color: "#064e3b" } : undefined}
          >
            <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 3v3M12 18v3M4.2 6.6l2.1 2.1M17.7 15.4l2.1 2.1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Configuración
          </button>
        </div>

        <div className="mt-auto p-4">
          <div className="rounded-lg bg-[#2b1810] p-3 text-white">
            <div className="text-xs">Estado: sistema activo</div>
            <div className="mt-2 w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-[#bbf7d0]" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-hidden">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-4 text-sm text-gray-600">
              <button type="button" onClick={() => setActiveSection("events")} className="font-semibold text-gray-900">Panel de administración</button>
              <button type="button" onClick={() => setActiveSection("events")} className="hover:underline">Explorar eventos</button>
              <button type="button" onClick={() => setActiveSection("categories")} className="hover:underline">Categorías</button>
            </nav>

            <div className="relative">
              <input placeholder="Buscar eventos..." className="pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-white text-sm w-80" />
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="11" cy="11" r="6" strokeWidth="2"/></svg>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">AD</div>
            <div className="w-10 h-10 rounded-full bg-[#3b2314] text-white flex items-center justify-center">AD</div>
          </div>
        </header>

        {activeSection === "events" && <section className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Eventos</h1>
            <p className="text-sm text-gray-500 mt-1">Administra y monitorea todas las actividades culturales de la región del Quindío.</p>
          </div>

          <div>
            <button onClick={handleCreateClick} className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-white" style={{ background: COFFEE }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14M5 12h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Crear Nuevo Evento
            </button>
          </div>
        </section>}

        {loading && <div className="text-sm text-gray-500 mb-4">Cargando eventos...</div>}
        {error && <div className="text-sm text-red-600 mb-4">{error}</div>}
        {offlineMode && <div className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-md px-4 py-3 mb-4">Modo sin conexión: crear, editar y eliminar funcionan temporalmente en esta vista.</div>}

        {activeSection === "events" && <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Total de eventos</div>
              <div className="text-2xl font-semibold">{events.length > 0 ? events.length : 128}</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#fff1f0] flex items-center justify-center text-[#7c2d12]">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Próximos esta semana</div>
              <div className="text-2xl font-semibold">12</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#fff8f1] flex items-center justify-center text-orange-600">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 10v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500">Administradores activos</div>
              <div className="text-2xl font-semibold">5</div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#fdf2f8] flex items-center justify-center text-pink-600">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </section>}

        {activeSection === "events" && <section className="bg-white rounded-2xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Registro de eventos</h3>
            <div>
              <button className="px-3 py-2 rounded-md bg-gray-50 border border-gray-100 text-sm">Todos los municipios
                <svg className="inline-block ml-2 w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M6 9l6 6 6-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-sm text-gray-500 border-b">
                  <th className="py-3">NOMBRE DEL EVENTO</th>
                  <th className="py-3">MUNICIPIO</th>
                  <th className="py-3">CATEGORÍA</th>
                  <th className="py-3">FECHA</th>
                  <th className="py-3">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((ev) => (
                  <tr key={ev.id} className="hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={ev.imagen || '/assets/placeholder-coffee.jpg'} alt="miniatura" className="h-10 w-10 rounded-full object-cover" />
                        <div>
                          <div className="font-medium">{ev.nombre}</div>
                          <div className="text-xs text-gray-400">{ev.lugar}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{ev.municipio}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(ev.categoria)}`}>
                        {ev.categoria === 'GASTRONOMY' ? 'Gastronomía' : ev.categoria === 'NATURE' ? 'Naturaleza' : 'Cultura'}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-gray-600">{new Date(ev.fecha).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                    <td className="py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(ev)} className="p-2 rounded-md hover:bg-gray-100">
                          <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 21l3-1 11-11 1-3-3 1L4 20z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                        <button onClick={() => void handleDelete(ev.id)} className="p-2 rounded-md hover:bg-red-50 text-red-600">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 6h18" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-500">Mostrando 1 a {Math.min(rows.length, 3)} de {events.length > 0 ? events.length : 128} eventos</div>
            <div className="flex items-center gap-3">
              <button className="px-3 py-2 rounded-lg bg-white border border-gray-200 text-sm">Anterior</button>
              <button className="px-3 py-2 rounded-lg bg-[#3b2314] text-white text-sm">Siguiente</button>
            </div>
          </div>
        </section>}

        {activeSection === "users" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Usuarios</h1>
            <p className="mt-2 text-sm text-gray-500">Este apartado está listo para conectar la administración de usuarios.</p>
          </section>
        )}

        {activeSection === "settings" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
            <p className="mt-2 text-sm text-gray-500">Este apartado está listo para configurar el panel de administración.</p>
          </section>
        )}

        {activeSection === "categories" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
            <p className="mt-2 text-sm text-gray-500">Categorías disponibles: cultura, gastronomía y naturaleza.</p>
          </section>
        )}

        <footer className="text-sm text-gray-500 py-6 border-t">
          <div className="flex items-center justify-between">
            <div>© 2024 QuindíoEventos. Paisaje Cultural Cafetero.</div>
            <div className="flex items-center gap-4">
              <a className="hover:underline">Acerca del Quindío</a>
              <a className="hover:underline">Términos de servicio</a>
              <a className="hover:underline">Contacto</a>
            </div>
          </div>
        </footer>

        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <section className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold">{editingEvent ? 'Editar evento' : 'Crear evento'}</h2>
                <button type="button" onClick={() => setFormOpen(false)} className="text-sm text-gray-500">Cerrar</button>
              </div>
              <EventForm initialValues={initialValues} onSave={handleSave} onCancel={() => setFormOpen(false)} submitLabel={editingEvent ? 'Actualizar evento' : 'Guardar evento'} />
              {saving && <p className="mt-4 text-sm text-gray-600">Guardando cambios...</p>}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
