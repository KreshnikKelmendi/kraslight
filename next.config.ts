const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Use this app folder as trace root (avoids parent lockfile confusion on Vercel/local).
  outputFileTracingRoot: path.join(__dirname),
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['kraslight.vercel.app', 'localhost', 'res.cloudinary.com', 'qhljdgbyolelfafndpoe.supabase.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        pathname: '/**',
      },
    ],
  },
  serverExternalPackages: ['cloudinary', 'sharp'],
  async redirects() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/images/placeholder.svg',
        permanent: false,
      },
      {
        source: '/about',
        destination: '/rreth-nesh',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/kontakti',
        permanent: true,
      },
    ];
  },
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
  },
};

module.exports = nextConfig;
