// SEO优化：图片数据管理器
// 目标：消除URL中的查询参数，实现完全SEO友好的URL结构

interface ImageData {
  id: string
  slug: string
  title: string
  imageUrl: string
  printUrl?: string
  createdAt: Date
}

// 内存中的图片数据存储（生产环境应使用数据库）
const imageDataStore = new Map<string, ImageData>()

// 根据slug注册图片数据
export function registerImageData(data: ImageData) {
  imageDataStore.set(data.slug, data)
  console.log(`📝 注册图片数据: ${data.slug} -> ${data.imageUrl}`)
  console.log(`🗂️ 当前存储的图片总数: ${imageDataStore.size}`)
}

// 根据slug获取图片数据
export function getImageDataBySlug(slug: string): ImageData | null {
  const result = imageDataStore.get(slug) || null
  console.log(`🔍 查找图片数据: ${slug}`, {
    found: !!result,
    totalStored: imageDataStore.size,
    allSlugs: Array.from(imageDataStore.keys())
  })
  return result
}

// 根据ID和URL动态注册图片（用于从图库页面）
export function registerDynamicImage(id: string, title: string, imageUrl: string): string {
  // 生成安全的slug
  let cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-') // 空格替换为连字符
    .replace(/-+/g, '-') // 多个连字符合并为一个
    .replace(/^-+|-+$/g, '') // 移除开头和结尾的连字符
    .substring(0, 30)
  
  // 确保不以连字符结尾
  cleanTitle = cleanTitle.replace(/-+$/, '')
  
  // 如果清理后为空，使用默认值
  if (!cleanTitle) {
    cleanTitle = 'coloring-page'
  }
  
  const slug = `${cleanTitle}-${id}`
  
  const imageData: ImageData = {
    id,
    slug,
    title,
    imageUrl,
    printUrl: imageUrl, // 可以后续优化为高清版本
    createdAt: new Date()
  }
  
  registerImageData(imageData)
  
  console.log('📝 动态注册图片:', {
    originalTitle: title,
    cleanTitle,
    finalSlug: slug,
    imageUrl: imageUrl.substring(0, 50) + '...'
  })
  
  return slug
}

// 清理过期的动态注册数据（防止内存泄漏）
export function cleanupOldImages() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  
  for (const [slug, data] of imageDataStore.entries()) {
    if (data.createdAt < oneHourAgo) {
      imageDataStore.delete(slug)
      console.log(`🗑️ 清理过期图片数据: ${slug}`)
    }
  }
}

// 定期清理（每小时执行一次）
if (typeof window === 'undefined') { // 只在服务器端执行
  setInterval(cleanupOldImages, 60 * 60 * 1000)
}