import "../css/input.css";
import "../css/styles.css";
import { createRoot } from "react-dom/client";
import AdminPanel from "./AdminPanel";
import { ensureAdmin } from "../ts/auth/authGuard.ts";
import { setupNavbar } from "../utils/navbar.ts";

ensureAdmin();
setupNavbar(window.location.pathname);

const rootElement = document.getElementById("admin-root");
if (rootElement) {
  createRoot(rootElement).render(<AdminPanel />);
}
