import { clearAuthUser, getAuthUser } from "./storage.ts";

interface NavLink {
  label: string;
  href: string;
  active?: boolean;
}

function createLink(link: NavLink): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.href = link.href;
  anchor.textContent = link.label;
  anchor.className = "nav-link";
  if (link.active) {
    anchor.classList.add("active");
  }
  return anchor;
}

function createButton(label: string): HTMLButtonElement {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "nav-btn";
  button.textContent = label;
  return button;
}

function createActionLink(label: string, href: string, primary = true): HTMLAnchorElement {
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.textContent = label;
  anchor.className = primary ? "nav-btn" : "nav-btn secondary";
  return anchor;
}

export function setupNavbar(currentPath: string): void {
  const user = getAuthUser();
  const navList = document.querySelector(".nav-links");
  const navActions = document.querySelector(".nav-actions");
  const nav = navList?.closest("nav");

  if (!navList || !navActions || !nav) {
    return;
  }

  navList.innerHTML = "";
  navActions.innerHTML = "";
  nav.classList.remove("nav-open");

  let toggle = nav.querySelector<HTMLButtonElement>(".nav-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-label", "Abrir menu de navegacion");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span><span></span>";
    nav.insertBefore(toggle, navList);
  }

  const closeMenu = () => {
    nav.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu de navegacion");
  };

  toggle.onclick = () => {
    const isOpen = nav.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Cerrar menu de navegacion" : "Abrir menu de navegacion");
  };

  const current = currentPath || window.location.pathname;
  const isIndex = current === "/" || current.endsWith("/index.html");
  const isAdmin = current.endsWith("/admin.html");

  const links: NavLink[] = [
    { label: "Inicio", href: "/index.html", active: isIndex },
    { label: "Eventos", href: "/index.html#eventos" },
  ];

  if (user) {
    links.push({ label: "Favoritos", href: "/src/pages/favoritos.html", active: current.endsWith("/favoritos.html") });
  }

  if (user?.role === "admin" || user?.role === "administrador") {
    links.push({ label: "Panel", href: "/src/pages/admin.html", active: isAdmin });
  }

  links.forEach((link) => {
    const item = document.createElement("li");
    const anchor = createLink(link);
    anchor.addEventListener("click", closeMenu);
    item.appendChild(anchor);
    navList.appendChild(item);
  });

  if (user) {
    const logoutBtn = createButton(`Cerrar sesion (${user.name})`);
    logoutBtn.addEventListener("click", () => {
      clearAuthUser();
      window.location.href = "/src/pages/login.html";
    });
    navActions.appendChild(logoutBtn);
  } else {
    navActions.appendChild(createActionLink("Iniciar sesion", "/src/pages/login.html", true));
    navActions.appendChild(createActionLink("Registrarse", "/src/pages/registro.html", false));
  }

  navActions.querySelectorAll("a, button").forEach((item) => {
    item.addEventListener("click", closeMenu);
  });
}
