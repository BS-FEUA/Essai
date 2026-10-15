const nextConfig = {
  // Vercel's Next.js 16.3 adapter currently conflicts with standalone output.
  // Keep standalone output for self-hosted builds, but let Vercel use its adapter.
  output: process.env.VERCEL ? undefined : 'standalone',
  poweredByHeader: false,
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        ],
      },
    ];
  },
};

export default nextConfig;
