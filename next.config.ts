import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: "output: standalone" was used for the container/Caddy setup.
  // The Netlify Next.js runtime handles the build from the default
  // ".next" output, so standalone is intentionally omitted here.
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
