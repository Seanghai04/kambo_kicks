/** @type {import('next').NextConfig} */
const apiOrigin = (
  process.env.API_ORIGIN ||
  'https://kambokicks-production.up.railway.app'
).replace(/\/$/, '');

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api-backend/:path*',
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
