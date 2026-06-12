type ImageSource = {
  imagen?: string;
  imagenes?: string[];
};

export const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 600'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' x2='1' y1='0' y2='1'%3E%3Cstop stop-color='%23EAF3E8'/%3E%3Cstop offset='0.55' stop-color='%23FAF7F2'/%3E%3Cstop offset='1' stop-color='%23E8E0D5'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='900' height='600' fill='url(%23g)'/%3E%3Ccircle cx='690' cy='110' r='120' fill='%23C8973A' opacity='0.2'/%3E%3Cpath d='M0 450 C160 380 250 470 410 410 C560 355 660 410 900 325 L900 600 L0 600 Z' fill='%232D5A27' opacity='0.35'/%3E%3Cpath d='M0 510 C180 440 310 535 500 470 C670 415 760 470 900 420 L900 600 L0 600 Z' fill='%232C1810' opacity='0.18'/%3E%3Ctext x='70' y='105' fill='%232C1810' font-family='Georgia,serif' font-size='52' font-weight='700'%3EQuindioEventos%3C/text%3E%3Ctext x='74' y='150' fill='%235C3D2E' font-family='Arial,sans-serif' font-size='24'%3EImagen no disponible%3C/text%3E%3C/svg%3E";

export function getImageCandidates(source: ImageSource): string[] {
  const values = [source.imagen, ...(source.imagenes ?? [])]
    .map((item) => item?.trim())
    .filter((item): item is string => Boolean(item));
  return Array.from(new Set(values));
}

export function getPreferredImage(source: ImageSource): string {
  return getImageCandidates(source)[0] ?? FALLBACK_IMAGE;
}

export function imageCandidatesAttribute(source: ImageSource): string {
  return encodeURIComponent(JSON.stringify(getImageCandidates(source)));
}

function readCandidates(img: HTMLImageElement): string[] {
  try {
    const encoded = img.dataset.imageCandidates;
    return encoded ? JSON.parse(decodeURIComponent(encoded)) as string[] : [];
  } catch {
    return [];
  }
}

export function setImageWithFallback(img: HTMLImageElement, candidates: string[], fallback = FALLBACK_IMAGE): void {
  const cleanCandidates = Array.from(new Set(candidates.map((item) => item.trim()).filter(Boolean)));
  img.dataset.imageCandidates = encodeURIComponent(JSON.stringify(cleanCandidates));
  img.dataset.imageIndex = "0";
  img.onerror = () => {
    const nextIndex = Number(img.dataset.imageIndex ?? "0") + 1;
    if (nextIndex < cleanCandidates.length) {
      img.dataset.imageIndex = String(nextIndex);
      img.src = cleanCandidates[nextIndex];
      return;
    }
    img.onerror = null;
    img.src = fallback;
  };
  img.src = cleanCandidates[0] ?? fallback;
}

export function bindImageFallbacks(root: ParentNode = document): void {
  root.querySelectorAll<HTMLImageElement>("img[data-image-candidates]").forEach((img) => {
    const candidates = readCandidates(img);
    if (candidates.length === 0) {
      img.src = FALLBACK_IMAGE;
      return;
    }
    setImageWithFallback(img, candidates);
  });
}
