import { getEventos } from "../services/eventos.service";
import type { Evento } from "../services/eventos.service";

let eventos: Evento[] = [];

function formatearFecha(fecha: string): string {
  const [, mes, dia] = fecha.split("-");
  const meses = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  return `${parseInt(dia)} ${meses[parseInt(mes) - 1]}`;
}

function cardEvento(e: Evento): string {
  const precio = e.precio === 0
    ? "Gratis"
    : `$${e.precio.toLocaleString("es-CO")}`;
  return `
    <article class="card-evento" data-id="${e.id}" tabindex="0" role="button">
      <div class="card-img-wrap">
        <img src="${e.imagen}" alt="${e.nombre}" loading="lazy" />
        <span class="badge-fecha">${formatearFecha(e.fecha)}</span>
      </div>
      <div class="card-body">
        <div class="card-meta">
          <span class="card-lugar">📍 ${e.lugar.split(",")[0]}</span>
          <span class="card-cat">${e.categoria}</span>
        </div>
        <h3 class="card-titulo">${e.nombre}</h3>
        <p class="card-desc">${e.descripcion}</p>
        <p class="card-precio">${precio}</p>
      </div>
    </article>
  `;
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
  grid.querySelectorAll<HTMLElement>(".card-evento").forEach(card => {
    const abrir = () => {
      const ev = eventos.find(e => e.id === parseInt(card.dataset.id!));
      if (ev) abrirModal(ev);
    };
    card.addEventListener("click", abrir);
    card.addEventListener("keydown", (e) => { if (e.key === "Enter") abrir(); });
  });
}

function abrirModal(e: Evento): void {
  const precio = e.precio === 0 ? "Gratis" : `$${e.precio.toLocaleString("es-CO")}`;
  (document.getElementById("modal-imagen") as HTMLImageElement).src = e.imagen;
  (document.getElementById("modal-imagen") as HTMLImageElement).alt = e.nombre;
  document.getElementById("modal-categoria")!.textContent = e.categoria;
  document.getElementById("modal-nombre")!.textContent = e.nombre;
  document.getElementById("modal-fecha")!.textContent = `📅 ${e.fecha}  ·  ⏰ ${e.hora}`;
  document.getElementById("modal-lugar")!.textContent = `📍 ${e.lugar}`;
  document.getElementById("modal-descripcion")!.textContent = e.descripcion;
  document.getElementById("modal-precio")!.textContent = precio;
  (document.getElementById("modal-link") as HTMLAnchorElement).href = `/src/pages/detalle.html?id=${e.id}`;
  document.getElementById("modal")!.classList.add("active");
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
  const filtrados = eventos.filter(e => {
    const matchTexto = !texto || e.nombre.toLowerCase().includes(texto) || e.descripcion.toLowerCase().includes(texto);
    const matchMunicipio = !municipio || e.lugar.includes(municipio);
    const matchCategoria = !categoria || e.categoria === categoria;
    return matchTexto && matchMunicipio && matchCategoria;
  });
  renderGrid(filtrados);
}

async function init(): Promise<void> {
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
  document.getElementById("modal")!.addEventListener("click", (ev) => {
    if (ev.target === document.getElementById("modal")) cerrarModal();
  });
}

init();