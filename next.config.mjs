/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Remove output: 'export' for development mode
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  
  // 实验性功能配置，修复React Server Components问题
  experimental: {
    serverComponentsExternalPackages: ['print-js'],
    serverActions: {
      allowedOrigins: ['localhost', '127.0.0.1'],
    },
    // 禁用部分优化以避免bundler问题
    optimizePackageImports: [],
    optimizeCss: false,
  },
  
  // webpack配置 - 简化配置避免bundler问题
  webpack: (config, { isServer, dev }) => {
    // 确保print-js只在客户端加载
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('print-js')
    }
    
    // 仅在生产环境应用优化
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
      }
    }
    
    return config
  },
  // 优化静态导出
  distDir: '.next',
}

export default nextConfig