// 🎯 SEO优化：生成语义化、搜索引擎友好的URL
// 解决问题：将带查询参数的技术URL转换为干净的SEO URL

interface CleanUrlData {
  slug: string
  title: string
  imageUrl: string
  description?: string
  originalId?: string
}

// 内存存储（生产环境建议使用Redis或数据库）
const urlMappings = new Map<string, CleanUrlData>()

/**
 * 从标题生成SEO友好的slug
 * 🎯 修复重复问题：智能提取核心关键词，避免重复
 */
export function generateSeoSlug(title: string): string {
  // 🎯 智能策略：取"-"前面的部分，但移除已有的coloring pages后缀避免重复
  const beforeDash = title.split('-')[0].trim()
  
  const cleaned = beforeDash
    .toLowerCase()
    // 移除已存在的coloring pages等后缀
    .replace(/\s+(coloring\s+pages?|pages?)\s*$/i, '')
    .replace(/\s+coloring\s*$/i, '')
    // 清理特殊字符，只保留字母数字和空格
    .replace(/[^a-z0-9\s]/g, '')
    // 空格转连字符
    .replace(/\s+/g, '-')
    // 合并多个连字符
    .replace(/-+/g, '-')
    // 移除首尾连字符
    .replace(/^-+|-+$/g, '')
  
  // 如果清理后为空，使用drawing作为默认值
  const result = cleaned || 'drawing'
  
  // 如果没有以coloring相关结尾，添加统一的后缀
  if (!result.endsWith('-coloring') && !result.includes('coloring')) {
    return `${result}-coloring-pages`
  }
  
  return result
}

/**
 * 智能URL生成主函数
 * 优先使用最简洁的URL格式
 */
export async function generateSmartSeoUrl(title: string, imageUrl: string, description?: string): Promise<string> {
  return generateSeoUrl(title, imageUrl, description)
}

/**
 * 生成智能化的SEO URL路径
 * 优先使用干净的标题，只在必要时添加标识符
 */
export function generateSeoUrl(title: string, imageUrl: string, description?: string): string {
  const baseSlug = generateSeoSlug(title)
  
  // 🎯 简单策略：直接使用基础slug，不添加多余后缀
  const cleanSlug = baseSlug
  
  // 检查是否已存在相同的干净URL
  if (!urlMappings.has(cleanSlug)) {
    // 如果不存在冲突，使用最简洁的URL
    const urlData: CleanUrlData = {
      slug: cleanSlug,
      title,
      imageUrl,
      description,
      originalId: extractIdFromUrl(imageUrl)
    }
    
    urlMappings.set(cleanSlug, urlData)
    
    console.log('🚀 生成简洁SEO URL:', {
      原始标题: title,
      生成slug: cleanSlug,
      URL类型: 'clean'
    })
    
    // 🎯 关键修复：返回slug本身，不包含/color/前缀
    return cleanSlug
  }
  
  // 🔄 如果存在冲突，使用智能后缀
  const smartSuffix = generateSmartSuffix(title, description)
  const smartSlug = `${baseSlug}-${smartSuffix}`
  
  if (!urlMappings.has(smartSlug)) {
    const urlData: CleanUrlData = {
      slug: smartSlug,
      title,
      imageUrl,
      description,
      originalId: extractIdFromUrl(imageUrl)
    }
    
    urlMappings.set(smartSlug, urlData)
    
    console.log('🚀 生成智能SEO URL:', {
      原始标题: title,
      生成slug: smartSlug,
      URL类型: 'smart-suffix',
      后缀: smartSuffix
    })
    
    // 🎯 关键修复：返回slug本身，不包含/color/前缀
    return smartSlug
  }
  
  // 🆔 最后备用方案：使用URL哈希确保唯一性
  const fallbackId = btoa(imageUrl).slice(-6).replace(/[^a-zA-Z0-9]/g, '')
  const fallbackSlug = `${baseSlug}-${fallbackId}`
  
  const urlData: CleanUrlData = {
    slug: fallbackSlug,
    title,
    imageUrl,
    description,
    originalId: fallbackId
  }
  
  urlMappings.set(fallbackSlug, urlData)
  
  console.log('⚠️ 使用备用SEO URL:', {
    原始标题: title,
    生成slug: fallbackSlug,
    URL类型: 'fallback-with-id',
    备用ID: fallbackId
  })
  
  // 🎯 关键修复：返回slug本身，不包含/color/前缀
  return fallbackSlug
}

/**
 * 根据slug获取原始数据
 */
export function getDataBySlug(slug: string): CleanUrlData | null {
  return urlMappings.get(slug) || null
}

/**
 * 从当前URL提取信息并生成SEO URL
 */
export function convertCurrentUrlToSeo(currentUrl: string): string {
  try {
    const url = new URL(currentUrl)
    const imageUrl = url.searchParams.get('imageUrl')
    const title = url.searchParams.get('title')
    const description = url.searchParams.get('description')
    
    if (!imageUrl || !title) {
      throw new Error('缺少必要的URL参数')
    }
    
    return generateSeoUrl(
      decodeURIComponent(title),
      decodeURIComponent(imageUrl),
      description ? decodeURIComponent(description) : undefined
    )
  } catch (error) {
    console.error('❌ URL转换失败:', error)
    return '/hello-kitty-drawings'
  }
}

/**
 * 生成智能的语义化后缀
 * 基于描述信息或图片特征生成有意义的后缀
 */
function generateSmartSuffix(title: string, description?: string): string {
  // 从描述中提取关键词
  if (description && description.length > 10) {
    const keywords = description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !['hello', 'kitty', 'coloring', 'page', 'drawing'].includes(word))
      .slice(0, 2)
      .join('-')
    
    if (keywords.length > 2) {
      return keywords
    }
  }
  
  // 从标题中提取额外特征
  const titleWords = title
    .toLowerCase()
    .replace(/hello\s+kitty/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  // 使用最后一个有意义的词作为后缀
  const lastWord = titleWords[titleWords.length - 1]
  if (lastWord && lastWord.length > 2) {
    return lastWord
  }
  
  // 默认使用时间戳后4位
  return Date.now().toString().slice(-4)
}

/**
 * 从图片URL中提取ID
 */
function extractIdFromUrl(imageUrl: string): string | undefined {
  // 尝试从R2 URL中提取时间戳ID
  const match = imageUrl.match(/(\d{13,})/);
  return match ? match[1] : undefined;
}

/**
 * 生成规范化的meta标题
 */
export function generateMetaTitle(title: string): string {
  const cleanTitle = title.replace(/^hello\s+kitty\s+/i, '').trim()
  return `${cleanTitle} Coloring Page - Free Printable Download | Coloring Pages Printable`
}

/**
 * 生成SEO描述
 */
export function generateMetaDescription(title: string, description?: string): string {
  if (description && description.length > 20) {
    return `${description} Creative, fun, and free printable coloring page. Download instantly from Coloring Pages Printable!`
  }
  
  const cleanTitle = title.replace(/^hello\s+kitty\s+/i, '').trim()
  return `Discover ${cleanTitle} coloring page. High-quality, printable drawing perfect for kids and art enthusiasts. Download or color online with our interactive tools.`
}

/**
 * 生成结构化数据
 */
export function generateStructuredData(data: CleanUrlData) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": data.title,
    "description": data.description || generateMetaDescription(data.title),
    "image": data.imageUrl,
    "author": {
      "@type": "Organization",
      "name": "Coloring Pages Printable"
    },
    "publisher": {
      "@type": "Organization", 
      "name": "Coloring Pages Printable"
    },
    "keywords": [
      "coloring pages printable",
      "printable coloring pages",
      "free coloring pages",
      "coloring sheets printable",
      "kids creativity",
      "printable art",
      "digital coloring"
    ],
    "genre": "Children's Activity",
    "isAccessibleForFree": true
  }
}

/**
 * 清理过期的URL映射（防止内存泄漏）
 */
export function cleanupExpiredMappings() {
  const maxAge = 2 * 60 * 60 * 1000 // 2小时
  const now = Date.now()
  
  // 转换为数组来避免迭代器兼容性问题
  const entries = Array.from(urlMappings.entries())
  
  for (const [slug, data] of entries) {
    // 简单的过期检查（可以改进为基于创建时间）
    if (urlMappings.size > 1000) { // 如果条目太多就清理一些
      urlMappings.delete(slug)
      console.log('🗑️ 清理URL映射:', slug)
    }
  }
}

// 定期清理
if (typeof window === 'undefined') {
  setInterval(cleanupExpiredMappings, 30 * 60 * 1000) // 每30分钟清理一次
}

/**
 * 获取当前存储的所有映射（调试用）
 */
export function getAllMappings(): Map<string, CleanUrlData> {
  return new Map(urlMappings)
}