import { getEventos } from "../services/eventos.service";
import type { Evento } from "../services/eventos.service";
import { displayCategory } from "../constants/eventCategories";
import { ensureAuthenticated } from "../ts/auth/authGuard";
import { getFavoriteEventIds, toggleFavoriteEvent } from "../utils/favorites";
import { bindImageFallbacks, getPreferredImage, imageCandidatesAttribute } from "../utils/imageFallback";
import { setupNavbar } from "../utils/navbar";

function formatearFecha(fecha: string): string {
  const [, mes, dia] = fecha.split("-");
  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];
  return `${Number.parseInt(dia, 10)} ${meses[Number.parseInt(mes, 10) - 1]}`;
}

function formatearPrecio(precio: number): string {
  return precio === 0 ? "Gratis" : `$${precio.toLocaleString("es-CO")} COP`;
}

function renderCard(e: Evento): string {
  const image = getPreferredImage(e);
  return `
    <article class="event-card-modern" data-id="${e.id}" tabindex="0" role="button">
      <div class="event-card-media">
        <img src="${image}" alt="${e.nombre}" loading="lazy" data-image-candidates="${imageCandidatesAttribute(e)}" />
        <span class="event-date-pill">${formatearFecha(e.fecha)}</span>
        <button class="favorite-chip active" type="button" data-favorite-id="${e.id}" aria-label="Quitar de favoritos">Guardado</button>
      </div>
      <div class="event-card-content">
        <div class="event-card-topline">
          <span>${e.municipio || e.lugar.split(",")[0]}</span>
          <span class="event-category-pill">${displayCategory(e.categoria)}</span>
        </div>
        <h3>${e.nombre}</h3>
        <p>${e.descripcion}</p>
        <div class="event-card-footer">
          <span class="event-price-pill">${formatearPrecio(Number(e.precio ?? 0))}</span>
          <a href="/src/pages/detalle.html?id=${e.id}">Ver detalle</a>
        </div>
      </div>
    </article>
  `;
}

function bindCards(): void {
  document.querySelectorAll<HTMLElement>(".event-card-modern").forEach((card) => {
    const open = () => {
      window.location.href = `/src/pages/detalle.html?id=${card.dataset.id}`;
    };
    card.addEventListener("click", open);
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter") open();
    });
  });

  document.querySelectorAll<HTMLButtonElement>("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleFavoriteEvent(button.dataset.favoriteId!);
      button.closest(".event-card-modern")?.remove();
      if (!document.querySelector(".event-card-modern")) {
        document.getElementById("grid-eventos")!.classList.add("hidden");
        document.getElementById("sin-resultados")!.classList.remove("hidden");
      }
      updateFavoritesSummary();
    });
  });

  bindImageFallbacks();
}

function updateFavoritesSummary(count = document.querySelectorAll(".event-card-modern").length): void {
  document.getElementById("favorites-count")!.textContent = String(count);
  document.getElementById("favorites-helper")!.textContent = count > 0
    ? `Tienes ${count} evento${count === 1 ? "" : "s"} guardado${count === 1 ? "" : "s"} para revisar.`
    : "Aun no tienes eventos guardados.";
}

async function init(): Promise<void> {
  ensureAuthenticated();
  setupNavbar(window.location.pathname);

  const loading = document.getElementById("loading")!;
  const empty = document.getElementById("sin-resultados")!;
  const grid = document.getElementById("grid-eventos")!;

  const favoriteIds = getFavoriteEventIds();
  const eventos = await getEventos();
  const favoritos = eventos.filter((evento) => favoriteIds.includes(evento.id));

  loading.classList.add("hidden");
  updateFavoritesSummary(favoritos.length);

  if (favoritos.length === 0) {
    empty.classList.remove("hidden");
    return;
  }

  grid.innerHTML = favoritos.map(renderCard).join("");
  grid.classList.remove("hidden");
  bindCards();
}

init();
