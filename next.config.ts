import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tegalhhmnwqidjupgpgo.supabase.co"
      }
    ]
  }
};

export default nextConfig;
