/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverComponentsExternalPackages: ["@libsql/client", "@prisma/adapter-libsql"],
  },
  async rewrites() {
    return [
      {
        source: "/api/polymarket/:path*",
        destination: "https://gamma-api.polymarket.com/:path*",
      },
    ];
  },
};

export default nextConfig;
