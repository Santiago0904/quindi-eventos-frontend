import { getEventos } from "../services/eventos.service.ts";
import type { Evento } from "../services/eventos.service.ts";
import { displayCategory, eventCategories } from "../constants/eventCategories.ts";
import { isFavoriteEvent, toggleFavoriteEvent } from "../utils/favorites.ts";
import { bindImageFallbacks, getPreferredImage, imageCandidatesAttribute } from "../utils/imageFallback.ts";
import { setupNavbar } from "../utils/navbar.ts";
import { getAuthUser } from "../utils/storage.ts";

let eventos: Evento[] = [];
let carouselIndex = 0;
let carouselTimer: number | undefined;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatearFecha(fecha: string): string {
  const partes = fecha.split("-");
  if (partes.length !== 3) return fecha;
  const [, mes, dia] = partes;
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${Number.parseInt(dia, 10)} ${meses[Number.parseInt(mes, 10) - 1] ?? ""}`;
}

function formatearPrecio(precio: number): string {
  return precio === 0 ? "Gratis" : `$${precio.toLocaleString("es-CO")} COP`;
}

function recortarTexto(texto: string, max = 260): string {
  return texto.length > max ? `${texto.slice(0, max).trim()}...` : texto;
}

function cardEvento(e: Evento): string {
  const favorito = isFavoriteEvent(e.id);
  const image = getPreferredImage(e);
  const precio = formatearPrecio(Number(e.precio ?? 0));
  return `
    <article class="event-card-modern" data-id="${escapeHtml(e.id)}" tabindex="0" role="button">
      <div class="event-card-media">
        <img src="${image}" alt="${escapeHtml(e.nombre)}" loading="lazy" data-image-candidates="${imageCandidatesAttribute(e)}" />
        <span class="event-date-pill">${formatearFecha(e.fecha)}</span>
        <button class="favorite-chip ${favorito ? "active" : ""}" type="button" data-favorite-id="${escapeHtml(e.id)}">
          ${favorito ? "Guardado" : "Guardar"}
        </button>
      </div>
      <div class="event-card-content">
        <div class="event-card-topline">
          <span>${escapeHtml(e.municipio || e.lugar.split(",")[0])}</span>
          <span class="event-category-pill">${escapeHtml(displayCategory(e.categoria))}</span>
        </div>
        <h3>${escapeHtml(e.nombre)}</h3>
        <p>${escapeHtml(e.descripcion)}</p>
        <div class="event-card-footer">
          <span class="event-price-pill">${precio}</span>
          <a href="/src/pages/detalle.html?id=${encodeURIComponent(e.id)}">Detalle</a>
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

  bindImageFallbacks();
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
  bindCards();
}

function renderCarousel(lista: Evento[]): void {
  const track = document.getElementById("home-carousel-track");
  if (!track) return;

  const destacados = lista.slice(0, 5);
  if (destacados.length === 0) {
    track.innerHTML = "";
    return;
  }

  track.innerHTML = destacados.map((e, index) => `
    <article class="home-carousel-slide ${index === 0 ? "active" : ""}" data-slide="${index}">
      <img src="${getPreferredImage(e)}" alt="${escapeHtml(e.nombre)}" data-image-candidates="${imageCandidatesAttribute(e)}" />
      <div class="home-carousel-content">
        <div class="carousel-meta">
          <span>${escapeHtml(e.municipio || e.lugar.split(",")[0])}</span>
          <span>${escapeHtml(displayCategory(e.categoria))}</span>
          <span>${formatearFecha(e.fecha)} · ${escapeHtml(e.hora)}</span>
        </div>
        <h3>${escapeHtml(e.nombre)}</h3>
        <p>${escapeHtml(recortarTexto(e.descripcion))}</p>
        <span class="carousel-price">${formatearPrecio(Number(e.precio ?? 0))}</span>
        <a class="btn-primary" href="/src/pages/detalle.html?id=${encodeURIComponent(e.id)}">Ver detalle</a>
      </div>
    </article>
  `).join("");

  const showSlide = (nextIndex: number) => {
    const slides = Array.from(track.querySelectorAll<HTMLElement>(".home-carousel-slide"));
    if (slides.length === 0) return;
    carouselIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => slide.classList.toggle("active", index === carouselIndex));
  };

  document.getElementById("carousel-prev")?.addEventListener("click", () => showSlide(carouselIndex - 1));
  document.getElementById("carousel-next")?.addEventListener("click", () => showSlide(carouselIndex + 1));

  window.clearInterval(carouselTimer);
  carouselTimer = window.setInterval(() => showSlide(carouselIndex + 1), 6500);
  bindImageFallbacks(track);
}

function abrirModal(e: Evento): void {
  const precio = formatearPrecio(Number(e.precio ?? 0));
  const modalImage = document.getElementById("modal-imagen") as HTMLImageElement;
  modalImage.src = getPreferredImage(e);
  modalImage.alt = e.nombre;
  modalImage.dataset.imageCandidates = imageCandidatesAttribute(e);
  document.getElementById("modal-categoria")!.textContent = e.categoria;
  document.getElementById("modal-nombre")!.textContent = e.nombre;
  document.getElementById("modal-fecha")!.textContent = `${e.fecha} · ${e.hora}`;
  document.getElementById("modal-lugar")!.textContent = e.lugar;
  document.getElementById("modal-descripcion")!.textContent = e.descripcion;
  document.getElementById("modal-precio")!.textContent = precio;
  (document.getElementById("modal-link") as HTMLAnchorElement).href = `/src/pages/detalle.html?id=${encodeURIComponent(e.id)}`;
  bindImageFallbacks(document.getElementById("modal")!);
  document.getElementById("modal")!.classList.add("active");
  document.body.style.overflow = "hidden";
}

function cerrarModal(): void {
  document.getElementById("modal")!.classList.remove("active");
  document.body.style.overflow = "";
}

function normalizarTexto(valor: string): string {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function renderCategoryOptions(): void {
  const select = document.getElementById("filtro-categoria") as HTMLSelectElement | null;
  if (!select) return;
  select.innerHTML = `
    <option value="">Categoria</option>
    ${eventCategories.map((category) => `<option value="${category}">${displayCategory(category)}</option>`).join("")}
  `;
}

function aplicarFiltros(): void {
  const texto = normalizarTexto((document.getElementById("buscador") as HTMLInputElement).value);
  const municipio = normalizarTexto((document.getElementById("filtro-municipio") as HTMLSelectElement).value);
  const categoria = normalizarTexto((document.getElementById("filtro-categoria") as HTMLSelectElement).value);
  const filtrados = eventos.filter((e) => {
    const nombre = normalizarTexto(e.nombre);
    const descripcion = normalizarTexto(e.descripcion);
    const lugar = normalizarTexto(e.lugar);
    const municipioEvento = normalizarTexto(e.municipio);
    const categoriaEvento = normalizarTexto(e.categoria);
    const matchTexto = !texto || nombre.includes(texto) || descripcion.includes(texto) || lugar.includes(texto);
    const matchMunicipio = !municipio || lugar.includes(municipio) || municipioEvento === municipio;
    const matchCategoria = !categoria || categoriaEvento === categoria;
    return matchTexto && matchMunicipio && matchCategoria;
  });
  renderGrid(filtrados);
}

async function init(): Promise<void> {
  setupNavbar(window.location.pathname);
  renderCategoryOptions();

  const loading = document.getElementById("loading")!;
  const error = document.getElementById("error")!;
  try {
    eventos = await getEventos();
    loading.classList.add("hidden");
    renderCarousel(eventos);
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
