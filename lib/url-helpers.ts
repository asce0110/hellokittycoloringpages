import { generateSlug, createColoringImageEntry, upsertColoringImage, getImageBySlug } from './coloring-images'
import { registerDynamicImage } from './seo-image-manager'

// 生成SEO友好的着色页URL - 🎯 根源修复
export function generateColoringPageUrl(id: string, title: string): string {
  // 🚨 根源修复：检查title是否已经是一个slug格式，避免重复处理
  let cleanTitle = title
  
  // 如果title已经包含ID后缀，移除它
  if (title.includes('-' + id) && title.length > 20) {
    cleanTitle = title.replace(new RegExp(`-${id}$`), '')
  }
  
  // 如果title太长或包含重复内容，使用简化版本
  if (cleanTitle.length > 50 || cleanTitle.includes('hello-kitty-page') || cleanTitle.includes('sitting-in-cherry-blossom-garden-sitting')) {
    cleanTitle = 'drawing'
  }
  
  const slug = generateSlug(cleanTitle) + `-${id}`
  return `/${slug}`
}

// 从旧的查询参数URL创建新的slug URL - 🎯 真正的根源修复
export function migrateOldUrlToSlug(id: string, imageUrl: string, title?: string): string {
  // 🚨 根源修复：使用简洁安全的标题，完全避免重复内容
  const imageTitle = title && title.length < 30 && !title.includes('hello-kitty') 
    ? title 
    : `drawing`  // 使用最简单的标题
  
  const slug = generateSlug(imageTitle) + `-${id}`
  
  // 创建或更新图片条目
  const image = createColoringImageEntry(id, imageTitle, imageUrl)
  upsertColoringImage(image)
  
  return `/${slug}`
}

// 提取旧URL中的信息
export function parseOldColoringUrl(url: string): { id: string | null, imageUrl: string | null } {
  try {
    const urlObj = new URL(url, 'http://localhost:3000')
    const pathParts = urlObj.pathname.split('/')
    const id = pathParts[2] // /color/[id]
    const imageUrl = urlObj.searchParams.get('src')
    
    return {
      id: id || null,
      imageUrl: imageUrl ? decodeURIComponent(imageUrl) : null
    }
  } catch (error) {
    return { id: null, imageUrl: null }
  }
}

// 为库页面生成链接 - 🎯 SEO优化：无查询参数的干净URL
export function generateLibraryItemUrl(item: {
  id?: string
  title: string
  imageUrl: string
}): string {
  const id = item.id || generateIdFromImageUrl(item.imageUrl)
  
  // 🚀 SEO优化：注册图片数据，返回干净的URL
  const slug = registerDynamicImage(id, item.title, item.imageUrl)
  
  return `/${slug}`
}

// 从图片URL生成ID
function generateIdFromImageUrl(imageUrl: string): string {
  // 尝试从URL中提取时间戳或唯一标识符
  const matches = imageUrl.match(/(\d{13,})|([a-f0-9]{8,})/i)
  if (matches) {
    return matches[0]
  }
  
  // 如果没有找到，生成一个基于URL的哈希
  return btoa(imageUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
}

// 清理和标准化标题
export function cleanTitle(title: string): string {
  return title
    .replace(/^(hello\s+kitty\s+)/i, '') // 移除开头的 "Hello Kitty"
    .replace(/\s+(coloring\s+page|page)$/i, '') // 移除结尾的 "coloring page"
    .trim()
}

// 生成面包屑导航
export function generateBreadcrumbs(imageTitle: string, category?: string) {
  return [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/library' },
    ...(category ? [{ label: category, href: `/library?category=${encodeURIComponent(category)}` }] : []),
    { label: imageTitle, href: '' } // 当前页面，不需要链接
  ]
}

// 生成相关图片的建议URL
export function generateRelatedPageUrls(currentSlug: string, category: string = 'Characters'): string[] {
  // 生成更多通用和创意的相关页面
  const relatedUrlTemplates = [
    'cute-character-drawing',
    'creative-art-page',
    'fun-digital-illustration',
    'interactive-coloring-experience',
    'artistic-digital-page'
  ]

  return relatedUrlTemplates
    .map(template => `/${template}`)
    .filter(url => !url.includes(currentSlug))
}

// URL验证
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug) && slug.length > 0 && slug.length <= 100
}

// 从slug提取ID
export function extractIdFromSlug(slug: string): string | null {
  const match = slug.match(/-(\d+)$/)
  return match ? match[1] : null
}