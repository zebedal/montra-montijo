const sectorImages: Record<string, string> = {
  "alimentacao-restauracao": "/images/setores/restauracao.webp",
  comercio: "/images/setores/comercio.webp",
  saude: "/images/setores/saude.webp",
  "beleza-bem-estar": "/images/setores/beleza.webp",
  servicos: "/images/setores/servicos.webp",
  "casa-construcao": "/images/setores/casa.webp",
  automovel: "/images/setores/automovel.webp",
  "educacao-formacao": "/images/setores/educacao.webp",
  desporto: "/images/setores/desporto.webp",
  "cultura-lazer-eventos": "/images/setores/cultura.webp",
  tecnologia: "/images/setores/tecnologia.webp",
  "imobiliario-financas": "/images/setores/imobiliario.webp",
  "turismo-alojamento": "/images/setores/turismo.webp",
  animais: "/images/setores/animais.webp"
};

export function getSectorImage(slug: string) {
  return sectorImages[slug] ?? null;
}
