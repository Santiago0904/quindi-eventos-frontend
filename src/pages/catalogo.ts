import { getEventos } from "../services/eventos.service.ts";
import type { Evento } from "../services/eventos.service.ts";
import { displayCategory, eventCategories } from "../constants/eventCategories.ts";
import { ensureAuthenticated } from "../ts/auth/authGuard.ts";
import { isFavoriteEvent, toggleFavoriteEvent } from "../utils/favorites.ts";
import { bindImageFallbacks, getPreferredImage, imageCandidatesAttribute } from "../utils/imageFallback.ts";
import { setupNavbar } from "../utils/navbar.ts";
import { getAuthUser } from "../utils/storage.ts";

let eventos: Evento[] = [];

function formatearFecha(fecha: string): string {
  const [, mes, dia] = fecha.split("-");
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${Number.parseInt(dia, 10)} ${meses[Number.parseInt(mes, 10) - 1]}`;
}

function cardEvento(e: Evento): string {
  const favorito = isFavoriteEvent(e.id);
  const image = getPreferredImage(e);
  return `
    <article class="event-card-modern" data-id="${e.id}" tabindex="0" role="button">
      <div class="event-card-media">
        <img src="${image}" alt="${e.nombre}" loading="lazy" data-image-candidates="${imageCandidatesAttribute(e)}" />
        <span class="event-date-pill">${formatearFecha(e.fecha)}</span>
        <button class="favorite-chip ${favorito ? "active" : ""}" type="button" data-favorite-id="${e.id}">
          ${favorito ? "Guardado" : "Guardar"}
        </button>
      </div>
      <div class="event-card-content">
        <div class="event-card-topline">
          <span>${e.municipio || e.lugar.split(",")[0]}</span>
          <span class="event-category-pill">${displayCategory(e.categoria)}</span>
        </div>
        <h3>${e.nombre}</h3>
        <p>${e.descripcion}</p>
        <div class="event-card-footer">
          <span>${e.fecha} · ${e.hora}</span>
          <a href="/src/pages/detalle.html?id=${e.id}">Detalle</a>
        </div>
      </div>
    </article>
  `;
}

function bindCards(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      if (!getAuthUser()) {
        window.location.href = "/src/pages/login.html";
        return;
      }
      const active = toggleFavoriteEvent(button.dataset.favoriteId!);
      button.classList.toggle("active", active);
      button.textContent = active ? "Guardado" : "Guardar";
    });
  });

  document.querySelectorAll<HTMLElement>(".event-card-modern").forEach((card) => {
    const abrir = () => {
      const ev = eventos.find((e) => e.id === card.dataset.id);
      if (ev) abrirModal(ev);
    };
    card.addEventListener("click", abrir);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") abrir();
    });
  });
}

function renderGrid(lista: Evento[]): void {
  const grid = document.getElementById("grid-eventos")!;
  const sinResultados = document.getElementById("sin-resultados")!;
  if (lista.length === 0) {
    grid.classList.add("hidden");
    sinResultados.classList.remove("hidden");
    return;
  }
  sinResultados.classList.add("hidden");
  grid.classList.remove("hidden");
  grid.innerHTML = lista.map(cardEvento).join("");
  bindImageFallbacks(grid);
  bindCards();
}

function abrirModal(e: Evento): void {
  const precio = e.precio === 0 ? "Gratis" : `$${e.precio.toLocaleString("es-CO")}`;
  const modalImage = document.getElementById("modal-imagen") as HTMLImageElement;
  modalImage.alt = e.nombre;
  modalImage.dataset.imageCandidates = imageCandidatesAttribute(e);
  modalImage.src = getPreferredImage(e);
  document.getElementById("modal-categoria")!.textContent = displayCategory(e.categoria);
  document.getElementById("modal-nombre")!.textContent = e.nombre;
  document.getElementById("modal-fecha")!.textContent = `${e.fecha} · ${e.hora}`;
  document.getElementById("modal-lugar")!.textContent = e.lugar;
  document.getElementById("modal-descripcion")!.textContent = e.descripcion;
  document.getElementById("modal-precio")!.textContent = precio;
  (document.getElementById("modal-link") as HTMLAnchorElement).href = `/src/pages/detalle.html?id=${e.id}`;
  document.getElementById("modal")!.classList.add("active");
  bindImageFallbacks(document.getElementById("modal")!);
  document.body.style.overflow = "hidden";
}

function cerrarModal(): void {
  document.getElementById("modal")!.classList.remove("active");
  document.body.style.overflow = "";
}

function aplicarFiltros(): void {
  const texto = (document.getElementById("buscador") as HTMLInputElement).value.toLowerCase();
  const municipio = (document.getElementById("filtro-municipio") as HTMLSelectElement).value;
  const categoria = (document.getElementById("filtro-categoria") as HTMLSelectElement).value;
  const filtrados = eventos.filter((e) => {
    const matchTexto = !texto || e.nombre.toLowerCase().includes(texto) || e.descripcion.toLowerCase().includes(texto);
    const matchMunicipio = !municipio || e.lugar.includes(municipio) || e.municipio === municipio;
    const matchCategoria = !categoria || e.categoria === categoria;
    return matchTexto && matchMunicipio && matchCategoria;
  });
  renderGrid(filtrados);
}

function renderCategoryOptions(): void {
  const select = document.getElementById("filtro-categoria") as HTMLSelectElement | null;
  if (!select) return;
  select.innerHTML = `
    <option value="">Categoria</option>
    ${eventCategories.map((category) => `<option value="${category}">${displayCategory(category)}</option>`).join("")}
  `;
}

async function init(): Promise<void> {
  setupNavbar(window.location.pathname);
  ensureAuthenticated();
  renderCategoryOptions();

  const loading = document.getElementById("loading")!;
  const error = document.getElementById("error")!;
  try {
    eventos = await getEventos();
    loading.classList.add("hidden");
    renderGrid(eventos);
  } catch {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
  }
  document.getElementById("buscador")!.addEventListener("input", aplicarFiltros);
  document.getElementById("filtro-municipio")!.addEventListener("change", aplicarFiltros);
  document.getElementById("filtro-categoria")!.addEventListener("change", aplicarFiltros);
  document.getElementById("modal-cerrar")!.addEventListener("click", cerrarModal);
  document.getElementById("modal")!.addEventListener("click", (event) => {
    if (event.target === document.getElementById("modal")) cerrarModal();
  });
}

init();
