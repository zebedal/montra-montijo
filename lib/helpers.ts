export const MAX_LOGO_SIZE_MB = 2;
export const MAX_IMAGE_SIZE_MB = 3;

export function validateImage(file: File, maxMB: number) {
  if (!file.type.startsWith("image/")) {
    return "Ficheiro inválido. Só imagens são permitidas.";
  }

  if (file.size > maxMB * 1024 * 1024) {
    return `Imagem demasiado grande (máx. ${maxMB}MB)`;
  }

  return null;
}
