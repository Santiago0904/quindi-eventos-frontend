import { useEffect, useState, useMemo } from "react";
import { ensureAdmin } from "../ts/auth/authGuard";
import {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
  type Event,
  type EventFormValues,
} from "../services/eventService";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  type User,
  type UserFormValues,
} from "../services/userService";
import EventForm from "../components/EventForm";
import UserForm from "../components/UserForm";
import { displayCategory, eventCategories } from "../constants/eventCategories";

const municipioOptions = [
  "Armenia",
  "Calarcá",
  "Circasia",
  "Filandia",
  "Montenegro",
  "Quimbaya",
  "Salento",
  "La Tebaida",
  "Buenavista",
  "Córdoba",
  "Génova",
  "Pueblo Tapao",
];

type EventDateOrder = "none" | "nearest" | "farthest";
type PriceOrder = "none" | "low" | "high";

const inputClass = "w-full rounded-lg border border-[#E8E0D5] bg-white px-3 py-2 text-sm text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20";
const labelClass = "grid gap-2 text-xs font-bold uppercase tracking-[0.08em] text-[#7A6A5E]";

function getEventPrice(eventItem: Event): number {
  return Number(eventItem.precio ?? 0);
}

function formatPrice(value: number): string {
  return value === 0 ? "Gratis" : `$${value.toLocaleString("es-CO")}`;
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState<"dashboard" | "events" | "users">("dashboard");
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [eventFilters, setEventFilters] = useState({
    search: "",
    municipio: "",
    categoria: "",
    fecha: "",
    dateOrder: "none" as EventDateOrder,
    edadMinima: "",
    minPrice: "",
    maxPrice: "",
    priceOrder: "none" as PriceOrder,
  });
  const [userFilters, setUserFilters] = useState({
    search: "",
    rol: "",
  });

  useEffect(() => {
    ensureAdmin();
    loadBackendData();
  }, []);

  const loadBackendData = async () => {
    setLoading(true);
    setError(null);

    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (reason) {
      console.error(reason);
      setError("No se pudieron cargar los eventos desde el backend. Revisa que http://localhost:3000/events este activo.");
    }

    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (reason) {
      console.warn("No se pudieron cargar usuarios. El CRUD de eventos sigue disponible.", reason);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateEvent = () => {
    setEventToEdit(null);
    setEventModalOpen(true);
  };

  const handleOpenEditEvent = (eventItem: Event) => {
    setEventToEdit(eventItem);
    setEventModalOpen(true);
  };

  const handleSaveEvent = async (eventValues: EventFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (eventToEdit) {
        const updated = await updateEvent(eventToEdit.id, eventValues);
        setEvents((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createEvent(eventValues);
        setEvents((current) => [created, ...current]);
      }
      setEventModalOpen(false);
    } catch (reason) {
      console.error(reason);
      setError("No se pudo guardar el evento. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmDelete = confirm("¿Eliminar este evento?");
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      await deleteEvent(id);
      setEvents((current) => current.filter((item) => item.id !== id));
    } catch (reason) {
      console.error(reason);
      setError("No se pudo eliminar el evento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateUser = () => {
    setUserToEdit(null);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setUserToEdit(user);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (userValues: UserFormValues) => {
    setLoading(true);
    setError(null);

    try {
      if (userToEdit) {
        const updated = await updateUser(userToEdit.id, userValues);
        setUsers((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      } else {
        const created = await createUser(userValues);
        setUsers((current) => [created, ...current]);
      }
      setUserModalOpen(false);
    } catch (reason) {
      console.error(reason);
      setError("No se pudo guardar el usuario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    const confirmDelete = confirm("¿Eliminar este usuario?");
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);

    try {
      await deleteUser(id);
      setUsers((current) => current.filter((item) => item.id !== id));
    } catch (reason) {
      console.error(reason);
      setError("No se pudo eliminar el usuario. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  const eventCount = useMemo(() => events.length, [events]);
  const userCount = useMemo(() => users.length, [users]);
  const filteredEvents = useMemo(() => {
    const search = eventFilters.search.trim().toLowerCase();
    const minAge = eventFilters.edadMinima === "" ? null : Number(eventFilters.edadMinima);
    const minPrice = eventFilters.minPrice === "" ? null : Number(eventFilters.minPrice);
    const maxPrice = eventFilters.maxPrice === "" ? null : Number(eventFilters.maxPrice);

    const result = events.filter((eventItem) => {
      const price = getEventPrice(eventItem);
      const matchesSearch = !search
        || eventItem.nombre.toLowerCase().includes(search)
        || eventItem.descripcion.toLowerCase().includes(search)
        || eventItem.lugar.toLowerCase().includes(search);
      const matchesMunicipio = !eventFilters.municipio || eventItem.municipio === eventFilters.municipio;
      const matchesCategoria = !eventFilters.categoria || eventItem.categoria === eventFilters.categoria;
      const matchesDate = !eventFilters.fecha || eventItem.fecha === eventFilters.fecha;
      const matchesAge = minAge === null || Number(eventItem.edadMinima) >= minAge;
      const matchesMinPrice = minPrice === null || price >= minPrice;
      const matchesMaxPrice = maxPrice === null || price <= maxPrice;

      return matchesSearch && matchesMunicipio && matchesCategoria && matchesDate && matchesAge && matchesMinPrice && matchesMaxPrice;
    });

    return [...result].sort((left, right) => {
      if (eventFilters.dateOrder !== "none") {
        const leftTime = new Date(left.fecha).getTime();
        const rightTime = new Date(right.fecha).getTime();
        return eventFilters.dateOrder === "nearest" ? leftTime - rightTime : rightTime - leftTime;
      }

      if (eventFilters.priceOrder !== "none") {
        return eventFilters.priceOrder === "low"
          ? getEventPrice(left) - getEventPrice(right)
          : getEventPrice(right) - getEventPrice(left);
      }

      return 0;
    });
  }, [eventFilters, events]);
  const filteredUsers = useMemo(() => {
    const search = userFilters.search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !search || user.nombre.toLowerCase().includes(search) || user.correo.toLowerCase().includes(search);
      const matchesRole = !userFilters.rol || user.rol === userFilters.rol;
      return matchesSearch && matchesRole;
    });
  }, [userFilters, users]);

  const resetEventFilters = () => {
    setEventFilters({
      search: "",
      municipio: "",
      categoria: "",
      fecha: "",
      dateOrder: "none",
      edadMinima: "",
      minPrice: "",
      maxPrice: "",
      priceOrder: "none",
    });
  };

  const resetUserFilters = () => {
    setUserFilters({ search: "", rol: "" });
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] text-[#2C1810]">
      <section className="mx-auto flex w-full max-w-[1360px] min-w-0 flex-col gap-6 px-4 py-6 md:px-8">
        <div className="overflow-hidden rounded-2xl border border-[#E8E0D5] bg-[#2C1810] p-6 text-white shadow-xl shadow-[#2C1810]/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#E8E0D5]">Panel de administración</p>
              <h1 className="mt-4 font-serif text-3xl font-semibold">Administración de eventos y usuarios</h1>
              <p className="mt-3 max-w-2xl text-sm text-[#E8E0D5]">
                Gestiona en vivo el listado de eventos y la base de usuarios conectados a tu backend.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <span className="block text-sm text-[#E8E0D5]">Eventos</span>
                <p className="mt-2 text-2xl font-semibold">{eventCount}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <span className="block text-sm text-[#E8E0D5]">Usuarios</span>
                <p className="mt-2 text-2xl font-semibold">{userCount}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-4 text-center backdrop-blur-sm">
                <span className="block text-sm text-[#E8E0D5]">Conexión</span>
                <p className="mt-2 text-2xl font-semibold">{loading ? "Cargando..." : "Activa"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-lg shadow-[#2C1810]/5">
            <p className="mb-6 text-sm font-semibold uppercase tracking-[0.3em] text-[#7A6A5E]">Secciones</p>
            <nav className="flex flex-col gap-2">
              {[
                { key: "dashboard", label: "Resumen" },
                { key: "events", label: "Eventos" },
                { key: "users", label: "Usuarios" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setActiveSection(item.key as "dashboard" | "events" | "users")}
                  className={`rounded-lg px-4 py-3 text-left text-sm font-medium transition ${
                    activeSection === item.key
                      ? "bg-[#2C1810] text-white shadow-lg shadow-[#2C1810]/10"
                      : "text-[#5C3D2E] hover:bg-[#FAF7F2]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-10 rounded-xl border border-[#E8E0D5] bg-[#FAF7F2] p-5">
              <h2 className="text-sm font-semibold text-[#2C1810]">Consejos rápidos</h2>
              <p className="mt-3 text-sm leading-6 text-[#7A6A5E]">
                Usa el CRUD para administrar eventos reales, cambiar municipios desde la lista desplegable y actualizar usuarios desde el backend.
              </p>
            </div>
          </aside>

          <article className="min-w-0 space-y-6">
            {error ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {activeSection === "dashboard" && (
              <section className="space-y-6 rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-lg shadow-[#2C1810]/5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#2C1810]">Resumen general</h2>
                    <p className="mt-2 text-sm text-[#7A6A5E]">
                      Controla la base de datos de eventos y usuarios obtenida directamente del backend.
                    </p>
                  </div>
                  <button
                    onClick={loadBackendData}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-lg bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5C3D2E] disabled:cursor-not-allowed disabled:bg-[#7A6A5E]"
                  >
                    Actualizar datos
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-[#E8E0D5] p-5">
                    <h3 className="text-sm font-semibold text-[#2C1810]">Eventos recientes</h3>
                    <div className="mt-4 space-y-3">
                      {events.slice(0, 4).map((eventItem) => (
                        <div key={eventItem.id} className="rounded-lg bg-[#FAF7F2] p-4">
                          <p className="font-medium text-[#2C1810]">{eventItem.nombre}</p>
                          <p className="text-sm text-[#7A6A5E]">
                            {eventItem.municipio} · {eventItem.lugar} · {eventItem.fecha} {eventItem.hora}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-xl border border-[#E8E0D5] p-5">
                    <h3 className="text-sm font-semibold text-[#2C1810]">Usuarios recientes</h3>
                    <div className="mt-4 space-y-3">
                      {users.slice(0, 4).map((user) => (
                        <div key={user.id} className="rounded-lg bg-[#FAF7F2] p-4">
                          <p className="font-medium text-[#2C1810]">{user.nombre}</p>
                          <p className="text-sm text-[#7A6A5E]">{user.correo} · {user.rol}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "events" && (
              <section className="admin-crud-section rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-lg shadow-[#2C1810]/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#2C1810]">Gestión de eventos</h2>
                    <p className="mt-2 text-sm text-[#7A6A5E]">
                      Eventos cargados desde el backend. Edita, elimina, crea y filtra registros reales.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-lg bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5C3D2E] disabled:cursor-not-allowed disabled:bg-[#7A6A5E]"
                    onClick={handleOpenCreateEvent}
                    disabled={loading}
                  >
                    Nuevo evento
                  </button>
                </div>

                <div className="mb-6 rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] p-4">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2D5A27]">Filtros</p>
                      <h3 className="font-serif text-xl font-semibold text-[#2C1810]">Buscar eventos</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#7A6A5E]">
                      <span>{filteredEvents.length} de {events.length} eventos</span>
                      <button
                        type="button"
                        onClick={resetEventFilters}
                        className="rounded-full border border-[#E8E0D5] bg-white px-3 py-2 text-xs font-bold text-[#5C3D2E] hover:bg-[#EAF3E8]"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <label className={labelClass}>
                      Nombre
                      <input
                        value={eventFilters.search}
                        onChange={(event) => setEventFilters((current) => ({ ...current, search: event.target.value }))}
                        placeholder="Buscar por nombre, lugar..."
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Municipio
                      <select
                        value={eventFilters.municipio}
                        onChange={(event) => setEventFilters((current) => ({ ...current, municipio: event.target.value }))}
                        className={inputClass}
                      >
                        <option value="">Todos</option>
                        {municipioOptions.map((municipio) => (
                          <option key={municipio} value={municipio}>{municipio}</option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Categoría
                      <select
                        value={eventFilters.categoria}
                        onChange={(event) => setEventFilters((current) => ({ ...current, categoria: event.target.value }))}
                        className={inputClass}
                      >
                        <option value="">Todas</option>
                        {eventCategories.map((category) => (
                          <option key={category} value={category}>{displayCategory(category)}</option>
                        ))}
                      </select>
                    </label>
                    <label className={labelClass}>
                      Fecha exacta
                      <input
                        type="date"
                        value={eventFilters.fecha}
                        onChange={(event) => setEventFilters((current) => ({ ...current, fecha: event.target.value }))}
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Orden por fecha
                      <select
                        value={eventFilters.dateOrder}
                        onChange={(event) => setEventFilters((current) => ({ ...current, dateOrder: event.target.value as EventDateOrder }))}
                        className={inputClass}
                      >
                        <option value="none">Sin ordenar</option>
                        <option value="nearest">Más próximos primero</option>
                        <option value="farthest">Más lejanos primero</option>
                      </select>
                    </label>
                    <label className={labelClass}>
                      Edad mínima desde
                      <input
                        type="number"
                        min="0"
                        value={eventFilters.edadMinima}
                        onChange={(event) => setEventFilters((current) => ({ ...current, edadMinima: event.target.value }))}
                        placeholder="Ej. 12"
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Precio mínimo
                      <input
                        type="number"
                        min="0"
                        value={eventFilters.minPrice}
                        onChange={(event) => setEventFilters((current) => ({ ...current, minPrice: event.target.value }))}
                        placeholder="0"
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Precio máximo
                      <input
                        type="number"
                        min="0"
                        value={eventFilters.maxPrice}
                        onChange={(event) => setEventFilters((current) => ({ ...current, maxPrice: event.target.value }))}
                        placeholder="100000"
                        className={inputClass}
                      />
                    </label>
                    <label className={`${labelClass} md:col-span-2 xl:col-span-1`}>
                      Orden por precio
                      <select
                        value={eventFilters.priceOrder}
                        onChange={(event) => setEventFilters((current) => ({ ...current, priceOrder: event.target.value as PriceOrder }))}
                        className={inputClass}
                      >
                        <option value="none">Sin ordenar</option>
                        <option value="low">Menor a mayor</option>
                        <option value="high">Mayor a menor</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="admin-mobile-list">
                  {filteredEvents.map((eventItem) => (
                    <article key={eventItem.id} className="admin-mobile-card">
                      <div className="admin-mobile-card-header">
                        <div>
                          <h3>{eventItem.nombre}</h3>
                          <p>{eventItem.municipio} · {eventItem.fecha}</p>
                        </div>
                        <span>{formatPrice(getEventPrice(eventItem))}</span>
                      </div>
                      <dl>
                        <div><dt>Lugar</dt><dd>{eventItem.lugar}</dd></div>
                        <div><dt>Hora</dt><dd>{eventItem.hora}</dd></div>
                        <div><dt>Categoría</dt><dd>{displayCategory(eventItem.categoria)}</dd></div>
                        <div><dt>Edad mínima</dt><dd>{eventItem.edadMinima}</dd></div>
                        <div><dt>Imágenes</dt><dd>{eventItem.imagenes?.length ? `${eventItem.imagenes.length} imágenes` : eventItem.imagen ? "1 imagen" : "N/A"}</dd></div>
                      </dl>
                      <div className="admin-mobile-actions">
                        <button type="button" onClick={() => handleOpenEditEvent(eventItem)}>Editar</button>
                        <button type="button" className="danger" onClick={() => handleDeleteEvent(eventItem.id)}>Eliminar</button>
                      </div>
                    </article>
                  ))}
                  {filteredEvents.length === 0 ? (
                    <div className="admin-mobile-empty">No hay eventos que coincidan con los filtros.</div>
                  ) : null}
                </div>

                <div className="admin-table-wrap overflow-x-auto rounded-xl border border-[#E8E0D5]">
                  <table className="min-w-[1120px] divide-y divide-[#E8E0D5] text-sm">
                    <thead className="bg-[#FAF7F2] text-[#5C3D2E]">
                      <tr>
                        <th className="px-5 py-4 text-left font-semibold">Nombre</th>
                        <th className="px-5 py-4 text-left font-semibold">Municipio</th>
                        <th className="px-5 py-4 text-left font-semibold">Lugar</th>
                        <th className="px-5 py-4 text-left font-semibold">Fecha</th>
                        <th className="px-5 py-4 text-left font-semibold">Hora</th>
                        <th className="px-5 py-4 text-left font-semibold">Categoría</th>
                        <th className="px-5 py-4 text-left font-semibold">Edad mínima</th>
                        <th className="px-5 py-4 text-left font-semibold">Precio</th>
                        <th className="px-5 py-4 text-left font-semibold">Imágenes</th>
                        <th className="px-5 py-4 text-left font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E0D5] bg-white">
                      {filteredEvents.map((eventItem) => (
                        <tr key={eventItem.id}>
                          <td className="px-5 py-4 font-medium text-[#2C1810]">{eventItem.nombre}</td>
                          <td className="px-5 py-4">{eventItem.municipio}</td>
                          <td className="px-5 py-4">{eventItem.lugar}</td>
                          <td className="px-5 py-4">{eventItem.fecha}</td>
                          <td className="px-5 py-4">{eventItem.hora}</td>
                            <td className="px-5 py-4">{displayCategory(eventItem.categoria)}</td>
                          <td className="px-5 py-4">{eventItem.edadMinima}</td>
                          <td className="px-5 py-4 font-semibold text-[#2D5A27]">{formatPrice(getEventPrice(eventItem))}</td>
                          <td className="px-5 py-4">
                            {eventItem.imagen ? (
                              <a href={eventItem.imagen} target="_blank" rel="noreferrer" className="text-[#2D5A27] hover:underline">
                                {eventItem.imagenes?.length ? `${eventItem.imagenes.length} imágenes` : "Ver"}
                              </a>
                            ) : (
                              <span className="text-[#7A6A5E]">N/A</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleOpenEditEvent(eventItem)}
                                className="rounded-full border border-[#E8E0D5] px-3 py-1 text-xs font-semibold text-[#5C3D2E] hover:bg-[#FAF7F2]"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(eventItem.id)}
                                className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-5 py-10 text-center text-[#7A6A5E]">
                            No hay eventos que coincidan con los filtros.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeSection === "users" && (
              <section className="admin-crud-section rounded-2xl border border-[#E8E0D5] bg-white p-6 shadow-lg shadow-[#2C1810]/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="font-serif text-2xl font-semibold text-[#2C1810]">Gestión de usuarios</h2>
                    <p className="mt-2 text-sm text-[#7A6A5E]">
                      Usuarios obtenidos desde el backend. Crea, edita, elimina y filtra registros reales.
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-lg bg-[#2C1810] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5C3D2E] disabled:cursor-not-allowed disabled:bg-[#7A6A5E]"
                    onClick={handleOpenCreateUser}
                    disabled={loading}
                  >
                    Nuevo usuario
                  </button>
                </div>

                <div className="mb-6 rounded-2xl border border-[#E8E0D5] bg-[#FAF7F2] p-4">
                  <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2D5A27]">Filtros</p>
                      <h3 className="font-serif text-xl font-semibold text-[#2C1810]">Buscar usuarios</h3>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-[#7A6A5E]">
                      <span>{filteredUsers.length} de {users.length} usuarios</span>
                      <button
                        type="button"
                        onClick={resetUserFilters}
                        className="rounded-full border border-[#E8E0D5] bg-white px-3 py-2 text-xs font-bold text-[#5C3D2E] hover:bg-[#EAF3E8]"
                      >
                        Limpiar
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className={labelClass}>
                      Nombre o correo
                      <input
                        value={userFilters.search}
                        onChange={(event) => setUserFilters((current) => ({ ...current, search: event.target.value }))}
                        placeholder="Buscar usuario..."
                        className={inputClass}
                      />
                    </label>
                    <label className={labelClass}>
                      Rol
                      <select
                        value={userFilters.rol}
                        onChange={(event) => setUserFilters((current) => ({ ...current, rol: event.target.value }))}
                        className={inputClass}
                      >
                        <option value="">Todos</option>
                        <option value="administrador">Administrador</option>
                        <option value="visitante">Visitante</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="admin-mobile-list">
                  {filteredUsers.map((user) => (
                    <article key={user.id} className="admin-mobile-card">
                      <div className="admin-mobile-card-header">
                        <div>
                          <h3>{user.nombre}</h3>
                          <p>{user.correo}</p>
                        </div>
                        <span>{user.rol}</span>
                      </div>
                      <dl>
                        <div><dt>Correo</dt><dd>{user.correo}</dd></div>
                        <div><dt>Rol</dt><dd>{user.rol}</dd></div>
                      </dl>
                      <div className="admin-mobile-actions">
                        <button type="button" onClick={() => handleOpenEditUser(user)}>Editar</button>
                        <button type="button" className="danger" onClick={() => handleDeleteUser(user.id)}>Eliminar</button>
                      </div>
                    </article>
                  ))}
                  {filteredUsers.length === 0 ? (
                    <div className="admin-mobile-empty">No hay usuarios que coincidan con los filtros.</div>
                  ) : null}
                </div>

                <div className="admin-table-wrap overflow-x-auto rounded-xl border border-[#E8E0D5]">
                  <table className="min-w-[720px] divide-y divide-[#E8E0D5] text-sm">
                    <thead className="bg-[#FAF7F2] text-[#5C3D2E]">
                      <tr>
                        <th className="px-5 py-4 text-left font-semibold">Nombre</th>
                        <th className="px-5 py-4 text-left font-semibold">Correo</th>
                        <th className="px-5 py-4 text-left font-semibold">Rol</th>
                        <th className="px-5 py-4 text-left font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E0D5] bg-white">
                      {filteredUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="px-5 py-4 font-medium text-[#2C1810]">{user.nombre}</td>
                          <td className="px-5 py-4">{user.correo}</td>
                          <td className="px-5 py-4 capitalize">{user.rol}</td>
                          <td className="px-5 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleOpenEditUser(user)}
                                className="rounded-full border border-[#E8E0D5] px-3 py-1 text-xs font-semibold text-[#5C3D2E] hover:bg-[#FAF7F2]"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-5 py-10 text-center text-[#7A6A5E]">
                            No hay usuarios que coincidan con los filtros.
                          </td>
                        </tr>
                      ) : null}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </article>
        </div>
      </section>

      {(eventModalOpen || userModalOpen) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2C1810]/60 p-3 sm:p-4">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#E8E0D5] bg-white p-4 shadow-2xl shadow-[#2C1810]/20 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-serif text-xl font-semibold text-[#2C1810]">
                {eventModalOpen ? (eventToEdit ? "Editar evento" : "Crear evento") : userModalOpen ? userToEdit ? "Editar usuario" : "Crear usuario" : ""}
              </h2>
              <button
                onClick={() => {
                  setEventModalOpen(false);
                  setUserModalOpen(false);
                }}
                className="rounded-full border border-[#E8E0D5] px-3 py-2 text-sm text-[#5C3D2E] hover:bg-[#FAF7F2]"
              >
                Cerrar
              </button>
            </div>
            {eventModalOpen ? (
              <EventForm
                initialValues={eventToEdit ?? {
                  nombre: "",
                  descripcion: "",
                  municipio: municipioOptions[0],
                  lugar: "",
                  fecha: "",
                  hora: "",
                  categoria: "Cultural",
                  imagen: "",
                  imagenes: [],
                  edadMinima: 0,
                  precio: 0,
                }}
                onSave={handleSaveEvent}
                onCancel={() => setEventModalOpen(false)}
                submitLabel={eventToEdit ? "Guardar cambios" : "Crear evento"}
              />
            ) : (
              <UserForm
                initialValues={userToEdit ?? { nombre: "", correo: "", contrasena: "", rol: "visitante" }}
                onSave={handleSaveUser}
                onCancel={() => setUserModalOpen(false)}
                requirePassword={!userToEdit}
                submitLabel={userToEdit ? "Guardar cambios" : "Crear usuario"}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
