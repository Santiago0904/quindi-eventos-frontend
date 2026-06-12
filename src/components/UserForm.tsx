import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import type { UserFormValues } from "../services/userService";

type UserFormProps = {
  initialValues?: UserFormValues;
  onSave: (user: UserFormValues) => void | Promise<void>;
  onCancel: () => void;
  submitLabel: string;
  requirePassword?: boolean;
};

const defaultValues: UserFormValues = {
  nombre: "",
  correo: "",
  contrasena: "",
  rol: "visitante",
};

export default function UserForm({ initialValues, onSave, onCancel, submitLabel, requirePassword = false }: UserFormProps) {
  const [values, setValues] = useState<UserFormValues>(defaultValues);

  useEffect(() => {
    setValues({ ...defaultValues, ...initialValues, contrasena: "" });
  }, [initialValues]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: value,
    } as UserFormValues));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Correo</span>
          <input
            type="email"
            name="correo"
            value={values.correo}
            onChange={handleChange}
            required
            className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">
          Contraseña {requirePassword ? "" : "(opcional para cambiarla)"}
        </span>
        <input
          type="password"
          name="contrasena"
          value={values.contrasena ?? ""}
          onChange={handleChange}
          required={requirePassword}
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-[#5C3D2E]">Rol</span>
        <select
          name="rol"
          value={values.rol}
          onChange={handleChange}
          required
          className="w-full rounded border border-[#E8E0D5] bg-white px-3 py-2 text-[#2C1810] outline-none transition focus:border-[#C8973A] focus:ring-2 focus:ring-[#C8973A]/20"
        >
          <option value="administrador">Administrador</option>
          <option value="visitante">Visitante</option>
        </select>
      </label>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="rounded bg-[#2C1810] px-4 py-2 text-white transition hover:bg-[#5C3D2E] disabled:cursor-not-allowed disabled:bg-[#7A6A5E]">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="rounded border border-[#E8E0D5] px-4 py-2 text-[#5C3D2E] hover:bg-[#FAF7F2]">
          Cancelar
        </button>
      </div>
    </form>
  );
}
