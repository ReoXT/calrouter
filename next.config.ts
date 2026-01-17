import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  // Performance optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@clerk/nextjs', 'recharts'],
    webpackBuildWorker: true,
  },

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
  },

  // Reduce bundle size
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // Enable React strict mode for better performance
  reactStrictMode: true,

  // Optimize headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
