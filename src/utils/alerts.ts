import Swal from "sweetalert2";

const BASE_OPTIONS = {
  confirmButtonColor: "#2C1810",
  background: "#FAF7F2",
  color: "#2C1810",
};

export function showSuccess(message: string, title = "¡Bien!"): void {
  Swal.fire({
    icon: "success",
    title,
    text: message,
    ...BASE_OPTIONS,
  });
}

export function showError(message: string, title = "Error"): void {
  Swal.fire({
    icon: "error",
    title,
    text: message,
    ...BASE_OPTIONS,
  });
}

export function showInfo(message: string, title = "Información"): void {
  Swal.fire({
    icon: "info",
    title,
    text: message,
    ...BASE_OPTIONS,
  });
}
