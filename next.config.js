/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Enhanced webpack config to fix bundler issues
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    
    // Fix for React Server Components bundler issues
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            default: false,
            vendors: false,
          },
        },
      }
    }
    
    return config
  },
  // Keep experimental features minimal and fix bundler issues
  experimental: {
    optimizePackageImports: ['lucide-react']
  },
  // Move serverComponentsExternalPackages to the correct location
  serverExternalPackages: []
}

module.exports = nextConfig