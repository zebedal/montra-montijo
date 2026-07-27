import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Conserva no Router Cache do browser as páginas dinâmicas já visitadas.
    // As mutações que chamam router.refresh() continuam a forçar dados novos.
    staleTimes: {
      dynamic: 300
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tegalhhmnwqidjupgpgo.supabase.co"
      },
      {
        protocol: "https",
        hostname: "www.mun-montijo.pt",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
