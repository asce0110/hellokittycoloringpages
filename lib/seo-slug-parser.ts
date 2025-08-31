// 🎯 SEO slug解析器 - 从语义化URL中反向提取信息
// 解决映射数据丢失问题的备选方案

/**
 * 从SEO友好的slug中解析出基本信息
 * 即使没有存储映射，也能提供基本的页面功能
 */
export function parseSlugToBasicInfo(slug: string): {
  title: string
  isSemanticSlug: boolean
  hash?: string
} {
  // 检查是否为语义化slug格式 (xxx-xxx-hash)
  const parts = slug.split('-')
  
  if (parts.length < 2) {
    return { title: 'Hello Kitty Drawing', isSemanticSlug: false }
  }
  
  // 最后一部分可能是hash (通常6-8个字符的字母数字组合)
  const lastPart = parts[parts.length - 1]
  const isHashLike = /^[a-zA-Z0-9]{6,8}$/.test(lastPart)
  
  if (isHashLike) {
    // 移除hash部分，剩下的就是语义化标题
    const titleParts = parts.slice(0, -1)
    const semanticTitle = titleParts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    
    return {
      title: `Hello Kitty ${semanticTitle}`,
      isSemanticSlug: true,
      hash: lastPart
    }
  } else {
    // 整个slug都是语义化标题
    const semanticTitle = parts
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
    
    return {
      title: `Hello Kitty ${semanticTitle}`,
      isSemanticSlug: true
    }
  }
}

/**
 * 生成回退用的图片数据
 * 当没有真实图片URL时，使用默认图片
 */
export function generateFallbackDrawingData(slug: string): {
  id: number
  title: string
  description: string
  imageUrl: string
  thumbnailUrl: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'complex'
  category: string
} {
  const { title, hash } = parseSlugToBasicInfo(slug)
  
  // 基于slug生成一个稳定的ID
  const stableId = hash 
    ? parseInt(hash.slice(0, 6), 36) % 999999 + 100000
    : Math.abs(slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 999999 + 100000
  
  return {
    id: stableId,
    title,
    description: `A beautiful ${title.toLowerCase()} coloring page perfect for kids and Hello Kitty fans.`,
    imageUrl: '/hello-kitty-coloring-page.png', // 默认图片
    thumbnailUrl: '/hello-kitty-coloring-page.png',
    tags: ['Hello Kitty', 'coloring', 'kids', 'printable'],
    difficulty: 'medium' as const,
    category: 'Characters'
  }
}

/**
 * 智能标题清理 - 从可能重复的标题中提取核心内容
 */
export function smartTitleCleanup(title: string): string {
  return title
    // 移除重复的 "Hello Kitty"
    .replace(/^(Hello\s+Kitty\s+)*Hello\s+Kitty\s+/i, 'Hello Kitty ')
    // 移除常见后缀
    .replace(/\s+(coloring\s+page|drawing|image|picture)$/i, '')
    .trim()
}

/**
 * 检测slug类型
 */
export function detectSlugType(slug: string): 'numeric' | 'semantic' | 'mixed' {
  if (/^\d+$/.test(slug)) {
    return 'numeric'
  } else if (slug.includes('-') && !/^\d+$/.test(slug)) {
    return 'semantic'
  } else {
    return 'mixed'
  }
}

/**
 * 生成SEO优化的meta信息
 */
export function generateSeoMetaFromSlug(slug: string): {
  title: string
  description: string
  keywords: string[]
} {
  const { title } = parseSlugToBasicInfo(slug)
  const cleanTitle = smartTitleCleanup(title)
  
  return {
    title: `${cleanTitle} Coloring Page - Creative Digital Art | AI Kitty Creator`,
    description: `Explore our unique ${cleanTitle.toLowerCase()} digital coloring page. Perfect for creative kids and art enthusiasts. Free to download, print, or color online with interactive tools.`,
    keywords: [
      'coloring page',
      'digital art',
      'printable drawing',
      'kids creativity',
      'interactive coloring',
      'free art download',
      'AI art generator',
      'digital illustration',
      ...cleanTitle.toLowerCase().split(' ').filter(word => word.length > 2)
    ]
  }
}