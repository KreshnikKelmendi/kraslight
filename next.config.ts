/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['kraslight.vercel.app', 'localhost', 'res.cloudinary.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
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
    ];
  },
  experimental: {
    // Remove deprecated serverComponentsExternalPackages
  },
};

module.exports = nextConfig;
