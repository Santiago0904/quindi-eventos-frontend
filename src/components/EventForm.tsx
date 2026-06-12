import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { displayCategory, eventCategories } from "../constants/eventCategories";
import type { EventFormValues } from "../services/eventService";

type EventFormProps = {
  initialValues?: EventFormValues;
  onSave: (event: EventFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
};

const defaultValues: EventFormValues = {
  nombre: "",
  descripcion: "",
  municipio: "",
  lugar: "",
  fecha: "",
  hora: "",
  categoria: "",
  imagen: "",
  imagenes: [],
  edadMinima: 0,
  precio: 0,
};

const municipioOptions = [
  "Armenia",
  "Calarca",
  "Circasia",
  "Filandia",
  "Montenegro",
  "Quimbaya",
  "Salento",
  "La Tebaida",
  "Buenavista",
  "Cordoba",
  "Genova",
  "Pueblo Tapao",
];

export default function EventForm({ initialValues, onSave, onCancel, submitLabel }: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(defaultValues);
  const [imagenesText, setImagenesText] = useState("");

  useEffect(() => {
    const nextValues = initialValues ?? defaultValues;
    setValues(nextValues);
    setImagenesText((nextValues.imagenes ?? []).join("\n"));
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "edadMinima" || name === "precio" ? Number.parseInt(value, 10) || 0 : value,
    } as EventFormValues));
  };

  const handleImagesChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = event.target;
    setImagenesText(value);
    setValues((prev) => ({
      ...prev,
      imagenes: value
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const imagenes = values.imagenes.length > 0 ? values.imagenes : [values.imagen].filter(Boolean);
    onSave({ ...values, imagenes });
  };

  return (
    <form onSubmit={handleSubmit} className="event-form space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Nombre</span>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Municipio</span>
          <select
            name="municipio"
            value={values.municipio}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          >
            <option value="">Selecciona un municipio</option>
            {municipioOptions.map((municipio) => (
              <option key={municipio} value={municipio}>
                {municipio}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Categoria</span>
          <select
            name="categoria"
            value={values.categoria}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          >
            <option value="">Selecciona una categoria</option>
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {displayCategory(category)}
              </option>
            ))}
            {values.categoria && !eventCategories.includes(values.categoria as typeof eventCategories[number]) ? (
              <option value={values.categoria}>{displayCategory(values.categoria)}</option>
            ) : null}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Fecha</span>
          <input
            type="date"
            name="fecha"
            value={values.fecha}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Hora</span>
          <input
            type="time"
            name="hora"
            value={values.hora}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Lugar</span>
          <input
            name="lugar"
            value={values.lugar}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Imagen principal</span>
          <input
            name="imagen"
            value={values.imagen}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Precio</span>
          <input
            type="number"
            min="0"
            name="precio"
            value={values.precio}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Edad minima</span>
          <input
            type="number"
            min="0"
            name="edadMinima"
            value={values.edadMinima}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Galería de imágenes</span>
        <textarea
          value={imagenesText}
          onChange={handleImagesChange}
          rows={4}
          placeholder="Pega una URL por línea. La imagen principal también se usará si dejas esto vacío."
          className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Descripcion</span>
        <textarea
          name="descripcion"
          value={values.descripcion}
          onChange={handleChange}
          rows={4}
          required
          className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded bg-[#2C1810] px-4 py-2 text-white hover:bg-[#5C3D2E]">
          {submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded border border-[#E8E0D5] px-4 py-2 text-[#5C3D2E] hover:bg-[#FAF7F2]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
