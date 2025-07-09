/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false, // Pages routerを使用
  },
  // tRPCのためのAPI設定
  async rewrites() {
    return [
      {
        source: '/api/trpc/:path*',
        destination: '/api/trpc/:path*',
      },
    ];
  },
};

module.exports = nextConfig;