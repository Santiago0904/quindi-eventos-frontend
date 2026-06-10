import "../css/input.css";
import "../css/styles.css";
import { createRoot } from "react-dom/client";
import AdminPanel from "./AdminPanel";

const rootElement = document.getElementById("admin-root");
if (rootElement) {
  createRoot(rootElement).render(<AdminPanel />);
}
