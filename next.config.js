/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react'],
  },
  images: {
    domains: ['lhvuoorzmjjnaasahmyw.supabase.co', 'lovable.dev'],
    formats: ['image/webp', 'image/avif'],
  },
  async redirects() {
    return [
      // Legacy route redirects
      {
        source: '/step/:stepId',
        destination: '/roadmap/step/:stepId',
        permanent: true,
      },
      {
        source: '/step/:stepId/:substep*',
        destination: '/roadmap/step/:stepId/:substep*',
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;