// next.config.js - Enhanced configuration for performance

import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Enable compression
  compress: true,

  // Optimize images
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable SWC minification (fastest)
  swcMinify: true,

  // Bundle analyzer (uncomment to analyze bundle size)
  // bundleAnalyzer: {
  //   enabled: process.env.ANALYZE === 'true',
  // },

  // Optimize fonts
  optimizeFonts: true,

  // Enable static optimization
  trailingSlash: false,
  generateEtags: false,

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Webpack optimizations
  webpack: (config: {
      optimization: {
        usedExports: boolean; sideEffects: boolean; splitChunks: {
          chunks: string; cacheGroups: {
            default: boolean; vendors: boolean;
            // Vendor chunk
            vendor: { chunks: string; test: RegExp; name: string; priority: number; enforce: boolean; };
            // Common chunk
            common: { name: string; minChunks: number; chunks: string; priority: number; reuseExistingChunk: boolean; enforce: boolean; };
          };
        };
      }; resolve: { alias: any; };
    }, { dev, isServer }: any) => {
    // Production optimizations
    if (!dev) {
      // Enable tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Split chunks more efficiently
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk
          vendor: {
            chunks: 'all',
            test: /node_modules/,
            name: 'vendor',
            priority: 20,
            enforce: true,
          },
          // Common chunk
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      };
    }

    // Optimize bundle size
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };

    return config;
  },

  // Enable static exports for better performance (if applicable)
  output: 'standalone', // Use 'export' for static sites

  // PowerBy header removal
  poweredByHeader: false,

  // Strict mode for React
  reactStrictMode: true,
};

module.exports = nextConfig;