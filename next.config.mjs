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
  output: 'export',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  // 禁用 webpack 缓存以避免大文件
  webpack: (config, { isServer }) => {
    config.cache = false
    return config
  },
  // 优化静态导出
  distDir: '.next',
}

export default nextConfig