import { getEventoById, getEventos } from "../services/eventos.service";
import type { Evento } from "../services/eventos.service";

async function init(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const idParam = params.get("id");
  const loading = document.getElementById("loading")!;
  const error = document.getElementById("error")!;
  const contenido = document.getElementById("contenido")!;

  if (!idParam) {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
    return;
  }

  try {
    const [evento, todosEventos] = await Promise.all([
      getEventoById(parseInt(idParam)),
      getEventos()
    ]);
    if (!evento) throw new Error("No encontrado");
    loading.classList.add("hidden");
    renderDetalle(evento);
    renderSimilares(evento, todosEventos);
    contenido.classList.remove("hidden");
  } catch {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
  }
}

function renderDetalle(e: Evento): void {
  document.title = `${e.nombre} — QuindíoEventos`;
  const precio = e.precio === 0
    ? "Gratis"
    : `$${e.precio.toLocaleString("es-CO")} <small>COP</small>`;

  (document.getElementById("detalle-imagen") as HTMLImageElement).src = e.imagen;
  (document.getElementById("detalle-imagen") as HTMLImageElement).alt = e.nombre;
  document.getElementById("detalle-nombre")!.textContent = e.nombre;
  document.getElementById("detalle-categoria")!.textContent = e.categoria;
  document.getElementById("detalle-lugar-hero")!.textContent = `📍 ${e.lugar}`;
  document.getElementById("detalle-fecha-hero")!.textContent = `📅 ${e.fecha}`;
  document.getElementById("detalle-descripcion")!.textContent = e.descripcion;
  document.getElementById("info-hora")!.textContent = e.hora;
  document.getElementById("info-lugar")!.textContent = e.lugar;
  document.getElementById("info-categoria")!.textContent = e.categoria;
  document.getElementById("info-fecha")!.textContent = e.fecha;
  document.getElementById("sidebar-precio")!.innerHTML = precio;
  document.getElementById("sidebar-categoria")!.textContent = e.categoria;
  document.getElementById("sidebar-fecha")!.textContent = e.fecha;
  document.getElementById("sidebar-hora")!.textContent = e.hora;
}

function renderSimilares(actual: Evento, todos: Evento[]): void {
  const similares = todos.filter(e => e.id !== actual.id && e.categoria === actual.categoria).slice(0, 3);
  const lista = similares.length > 0
    ? similares
    : todos.filter(e => e.id !== actual.id).slice(0, 3);

  const grid = document.getElementById("similares-grid")!;
  if (lista.length === 0) {
    (grid.closest("section") as HTMLElement).style.display = "none";
    return;
  }

  grid.innerHTML = lista.map(e => {
    const precio = e.precio === 0 ? "Gratis" : `$${e.precio.toLocaleString("es-CO")}`;
    return `
      <a href="/src/pages/detalle.html?id=${e.id}" class="card-similar">
        <div class="card-similar-img">
          <img src="${e.imagen}" alt="${e.nombre}" loading="lazy" />
          <span class="card-similar-badge">${precio}</span>
        </div>
        <div class="card-similar-body">
          <h3 class="card-similar-titulo">${e.nombre}</h3>
          <p class="card-similar-desc">${e.descripcion}</p>
          <div class="card-similar-footer">
            <span class="card-similar-lugar">📍 ${e.lugar.split(",")[0]}</span>
            <span class="card-similar-link">Ver Detalles</span>
          </div>
        </div>
      </a>
    `;
  }).join("");
}

init();