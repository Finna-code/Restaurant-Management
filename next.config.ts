import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // keep your existing bits…
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // 1) Stub out @opentelemetry/exporter-jaeger
  // 2) Null-load handlebars to remove require.extensions warnings
  webpack(config) {
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      '@opentelemetry/exporter-jaeger': false,
    };

    config.module.rules.push({
      test: /node_modules[\\/]handlebars[\\/].*\.js$/,
      use: 'null-loader',
    });

    return config;
  },

  // 3) Replace allowedDevOrigins with a CORS header rule
  //    This will add Access-Control-Allow-Origin: * (and other headers)
  //    to all your /api routes so you don’t have to pin down ports.
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin',      value: '*' },
          { key: 'Access-Control-Allow-Methods',     value: 'GET,POST,PUT,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers',     value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
    ];
  },
};

export default nextConfig;
