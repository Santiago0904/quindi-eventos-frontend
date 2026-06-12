export const eventCategories = [
  "Cultural",
  "Patrimonio cultural",
  "Gastronomia",
  "Musica",
  "Ecoturismo",
  "Turismo",
  "Arte y artesanias",
  "Deportivo",
  "Familiar",
  "Educativo",
  "Religioso",
  "Rural cafetero",
  "Aventura",
  "Ferias y fiestas",
  "Naturaleza",
] as const;

export const legacyCategoryLabels: Record<string, string> = {
  CULTURE: "Cultural",
  GASTRONOMY: "Gastronomia",
  NATURE: "Naturaleza",
};

export function displayCategory(category: string): string {
  return legacyCategoryLabels[category] ?? category;
}
