import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
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
  edadMinima: 0,
};

export default function EventForm({ initialValues, onSave, onCancel, submitLabel }: EventFormProps) {
  const [values, setValues] = useState<EventFormValues>(defaultValues);

  useEffect(() => {
    if (initialValues) {
      setValues(initialValues);
    } else {
      setValues(defaultValues);
    }
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === "edadMinima" ? (parseInt(value, 10) || 0) : value,
    } as EventFormValues));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className="event-form space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span>Nombre</span>
          <input
            name="nombre"
            value={values.nombre}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span>Municipio</span>
          <input
            name="municipio"
            value={values.municipio}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span>Categoría</span>
          <select
            name="categoria"
            value={values.categoria}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          >
            <option value="">Selecciona una categoría</option>
            <option value="CULTURE">Cultura</option>
            <option value="GASTRONOMY">Gastronomía</option>
            <option value="NATURE">Naturaleza</option>
          </select>
        </label>
        <label className="block">
          <span>Fecha</span>
          <input
            type="date"
            name="fecha"
            value={values.fecha}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span>Hora</span>
          <input
            type="time"
            name="hora"
            value={values.hora}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span>Lugar</span>
          <input
            name="lugar"
            value={values.lugar}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span>Imagen</span>
          <input
            name="imagen"
            value={values.imagen}
            onChange={handleChange}
            className="w-full rounded border px-3 py-2"
          />
        </label>
        <label className="block">
          <span>Edad mínima</span>
          <input
            type="number"
            min="0"
            name="edadMinima"
            value={values.edadMinima}
            onChange={handleChange}
            required
            className="w-full rounded border px-3 py-2"
          />
        </label>
      </div>
      <label className="block">
        <span>Descripción</span>
        <textarea
          name="descripcion"
          value={values.descripcion}
          onChange={handleChange}
          rows={4}
          required
          className="w-full rounded border px-3 py-2"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded border px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  );
}
