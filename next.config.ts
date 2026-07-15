import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
