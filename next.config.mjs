const nextConfig = {
  // Vercel's Next.js 16.3 adapter currently conflicts with standalone output.
  // Keep standalone output for self-hosted builds, but let Vercel use its adapter.
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  reactStrictMode: false,
};

export default nextConfig;
