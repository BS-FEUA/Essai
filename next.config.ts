import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // The development indicator is not part of the BS-Lokossa interface.
  devIndicators: false,
  poweredByHeader: false,
  reactStrictMode: false,
};

export default nextConfig;

