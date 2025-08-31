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
  // webpack配置
  webpack: (config, { isServer }) => {
    // 确保print-js只在客户端加载
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('print-js')
    }
    
    return config
  },
  // 优化静态导出
  distDir: '.next',
}

export default nextConfig