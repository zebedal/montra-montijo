import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Montra Montijo",
    short_name: "Montra",

    description:
      "Descubra empresas, serviços e comércio local do concelho do Montijo.",

    start_url: "/",

    display: "standalone",

    background_color: "#ffffff",

    theme_color: "#265941",

    lang: "pt-PT",

    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any"
      }
    ]
  };
}
