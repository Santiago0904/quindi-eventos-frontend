import { createEventReview, getEventReviews, type Review } from "../services/reviewService";
import { getEventoById, getEventos } from "../services/eventos.service";
import type { Evento } from "../services/eventos.service";
import { isFavoriteEvent, toggleFavoriteEvent } from "../utils/favorites";
import { bindImageFallbacks, getImageCandidates, getPreferredImage, imageCandidatesAttribute, setImageWithFallback } from "../utils/imageFallback";
import { setupNavbar } from "../utils/navbar";
import { getAuthUser } from "../utils/storage";

let currentEventId = "";
let selectedRating = 5;
let galleryImages: string[] = [];
let galleryIndex = 0;

function ratingStars(rating: number): string {
  return "\u2605".repeat(rating) + "\u2606".repeat(5 - rating);
}

function getInitial(name: string): string {
  return (name.trim().charAt(0) || "U").toUpperCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
}

async function init(): Promise<void> {
  setupNavbar(window.location.pathname);

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

  currentEventId = idParam;

  try {
    const [evento, todosEventos] = await Promise.all([
      getEventoById(idParam),
      getEventos(),
    ]);
    if (!evento) throw new Error("No encontrado");
    renderDetalle(evento);
    renderSimilares(evento, todosEventos);
    bindFavoriteButton(evento.id);
    bindReviewForm();
    await renderReviews(evento.id);
    loading.classList.add("hidden");
    contenido.classList.remove("hidden");
  } catch {
    loading.classList.add("hidden");
    error.classList.remove("hidden");
  }
}

function renderDetalle(e: Evento): void {
  document.title = `${e.nombre} - QuindioEventos`;
  const precio = e.precio === 0 ? "Gratis" : `$${e.precio.toLocaleString("es-CO")} COP`;

  renderGallery(e);
  document.getElementById("detalle-nombre")!.textContent = e.nombre;
  document.getElementById("detalle-categoria")!.textContent = e.categoria;
  document.getElementById("detalle-lugar-hero")!.textContent = e.lugar;
  document.getElementById("detalle-fecha-hero")!.textContent = `${e.fecha} · ${e.hora}`;
  document.getElementById("detalle-descripcion")!.textContent = e.descripcion;
  document.getElementById("info-hora")!.textContent = e.hora;
  document.getElementById("info-lugar")!.textContent = e.lugar;
  document.getElementById("info-categoria")!.textContent = e.categoria;
  document.getElementById("info-fecha")!.textContent = e.fecha;
  document.getElementById("info-edad")!.textContent = `${e.edadMinima ?? 0}+`;
  document.getElementById("info-municipio")!.textContent = e.municipio || e.lugar.split(",")[0];
  document.getElementById("sidebar-precio")!.textContent = precio;
  document.getElementById("sidebar-categoria")!.textContent = e.categoria;
  document.getElementById("sidebar-fecha")!.textContent = e.fecha;
  document.getElementById("sidebar-hora")!.textContent = e.hora;
}

function renderGallery(e: Evento): void {
  const gallery = document.getElementById("detalle-galeria")!;
  const mainImage = document.getElementById("detalle-imagen") as HTMLImageElement;
  const carouselImage = document.getElementById("carousel-image") as HTMLImageElement | null;
  const counter = document.getElementById("carousel-counter");
  const prev = document.getElementById("gallery-prev") as HTMLButtonElement | null;
  const next = document.getElementById("gallery-next") as HTMLButtonElement | null;
  const images = (e.imagenes?.length ? e.imagenes : [e.imagen]).filter(Boolean);
  const mainEventImage = getPreferredImage(e);

  galleryImages = getImageCandidates(e).filter((image) => image !== mainEventImage);
  galleryIndex = 0;
  mainImage.alt = e.nombre;
  setImageWithFallback(mainImage, getImageCandidates(e));

  if (!carouselImage || !counter || !prev || !next || galleryImages.length === 0) {
    gallery.classList.add("hidden");
    return;
  }

  gallery.classList.remove("hidden");

  const renderActiveImage = (index: number) => {
    galleryIndex = (index + galleryImages.length) % galleryImages.length;
    const image = galleryImages[galleryIndex];
    setImageWithFallback(carouselImage, [image]);
    carouselImage.alt = `${e.nombre} imagen adicional ${galleryIndex + 1}`;
    counter.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
  };

  prev.onclick = () => renderActiveImage(galleryIndex - 1);
  next.onclick = () => renderActiveImage(galleryIndex + 1);
  renderActiveImage(0);
}

function bindFavoriteButton(eventId: string): void {
  const button = document.getElementById("btn-favorito") as HTMLButtonElement;

  const sync = () => {
    const active = isFavoriteEvent(eventId);
    button.classList.toggle("active", active);
    button.textContent = active ? "Guardado en favoritos" : "Guardar en favoritos";
  };

  sync();

  button.addEventListener("click", () => {
    if (!getAuthUser()) {
      window.location.href = "/src/pages/login.html";
      return;
    }
    toggleFavoriteEvent(eventId);
    sync();
  });
}

async function renderReviews(eventId: string): Promise<void> {
  const list = document.getElementById("reviews-list")!;
  const summary = document.getElementById("review-summary")!;

  try {
    const reviews = await getEventReviews(eventId);
    if (reviews.length === 0) {
      summary.textContent = "Sin reseñas";
      list.innerHTML = `<div class="review-card empty-review"><p>Este evento aun no tiene reseñas. Se el primero en opinar.</p></div>`;
      return;
    }

    const average = reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;
    summary.textContent = `${average.toFixed(1)} / 5 · ${reviews.length} reseña${reviews.length === 1 ? "" : "s"}`;
    list.innerHTML = reviews.map(renderReview).join("");
  } catch {
    summary.textContent = "Reseñas no disponibles";
    list.innerHTML = `<div class="review-card empty-review"><p>No se pudieron cargar las reseñas. Revisa que el backend de reseñas este activo.</p></div>`;
  }
}

function renderReview(review: Review): string {
  const userName = escapeHtml(review.userName);
  const comment = escapeHtml(review.comment);
  return `
    <article class="review-card">
      <div class="review-avatar">${getInitial(review.userName)}</div>
      <div class="review-content">
        <header>
          <div>
            <strong>${userName}</strong>
            <small>${formatReviewDate(review.createdAt)}</small>
          </div>
          <span class="review-stars">${ratingStars(review.rating)}</span>
        </header>
        <p>${comment}</p>
      </div>
    </article>
  `;
}

function setReviewMessage(type: "idle" | "loading" | "success" | "error", text = ""): void {
  const message = document.getElementById("review-message")!;
  message.className = `review-message${type === "idle" ? "" : ` is-${type}`}`;
  message.textContent = text;
}

function showReviewAlert(type: "success" | "error", text: string): void {
  setReviewMessage(type, text);
  window.setTimeout(() => {
    const message = document.getElementById("review-message");
    if (message?.textContent === text) {
      setReviewMessage("idle");
    }
  }, 4500);
}

function bindReviewForm(): void {
  const form = document.getElementById("review-form") as HTMLFormElement;
  const comment = document.getElementById("review-comment") as HTMLTextAreaElement;
  const starButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("#review-stars button"));

  const syncStars = () => {
    starButtons.forEach((button) => {
      const ratingValue = Number(button.dataset.rating);
      const active = ratingValue <= selectedRating;
      button.classList.toggle("active", active);
      button.textContent = active ? "\u2605" : "\u2606";
      button.setAttribute("aria-checked", String(active && ratingValue === selectedRating));
    });
  };

  starButtons.forEach((button) => {
    button.addEventListener("click", () => {
      selectedRating = Math.max(1, Number(button.dataset.rating));
      syncStars();
      setReviewMessage("idle");
    });
  });

  syncStars();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!getAuthUser()) {
      window.location.href = "/src/pages/login.html";
      return;
    }

    if (comment.value.trim().length === 0) {
      showReviewAlert("error", "Escribe un comentario antes de publicar tu reseña.");
      return;
    }

    try {
      setReviewMessage("loading", "Publicando reseña...");
      await createEventReview(currentEventId, Math.max(1, selectedRating), comment.value.trim());
      comment.value = "";
      selectedRating = 5;
      syncStars();
      showReviewAlert("success", "Reseña publicada correctamente.");
      await renderReviews(currentEventId);
    } catch {
      showReviewAlert("error", "No se pudo publicar la reseña. Intenta nuevamente.");
    }
  });
}

function renderSimilares(actual: Evento, todos: Evento[]): void {
  const similares = todos.filter((e) => e.id !== actual.id && e.categoria === actual.categoria).slice(0, 3);
  const lista = similares.length > 0
    ? similares
    : todos.filter((e) => e.id !== actual.id).slice(0, 3);

  const grid = document.getElementById("similares-grid")!;
  if (lista.length === 0) {
    (grid.closest("section") as HTMLElement).style.display = "none";
    return;
  }

  grid.innerHTML = lista.map((e) => {
    const image = getPreferredImage(e);
    return `
      <a href="/src/pages/detalle.html?id=${e.id}" class="event-card-modern similar-card">
        <div class="event-card-media">
          <img src="${image}" alt="${escapeHtml(e.nombre)}" loading="lazy" data-image-candidates="${imageCandidatesAttribute(e)}" />
          <span class="event-date-pill">${e.fecha}</span>
        </div>
        <div class="event-card-content">
          <div class="event-card-topline">
            <span>${escapeHtml(e.municipio || e.lugar.split(",")[0])}</span>
            <span class="event-category-pill">${escapeHtml(e.categoria)}</span>
          </div>
          <h3>${escapeHtml(e.nombre)}</h3>
          <p>${escapeHtml(e.descripcion)}</p>
          <div class="event-card-footer">
            <span>${e.hora}</span>
            <span>Ver detalle</span>
          </div>
        </div>
      </a>
    `;
  }).join("");
  bindImageFallbacks(grid);
}

init();
