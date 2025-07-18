/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['kraslight.vercel.app', 'localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'kraslight.vercel.app',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['cloudinary'],
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

module.exports = nextConfig;
