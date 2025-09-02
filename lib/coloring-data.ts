// 统一的着色图片数据管理器
export interface ColoringPageData {
  id: string
  slug: string
  title: string
  description: string
  imageUrl: string
  thumbnailUrl?: string
  printUrl?: string
  referenceImageUrl?: string
  category: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'complex'
  featured: boolean
  createdAt: Date
  // SEO
  metaTitle?: string
  metaDescription?: string
  libraryImageId?: string // 用于浏览量追踪的真实图片ID
}

// 着色图片数据 - 直接对应demo数据中的真实图片
export const COLORING_PAGES: ColoringPageData[] = [
  {
    id: 'lib-1',
    slug: 'hello-kitty-astronaut-coloring',
    title: 'Hello Kitty Astronaut',
    description: 'Hello Kitty exploring space as an astronaut',
    imageUrl: '/astronaut-cat-coloring-page.png',
    thumbnailUrl: '/astronaut-cat-line-art.png',
    printUrl: '/astronaut-cat-coloring-page.png',
    category: 'Adventure',
    tags: ['hello kitty', 'space', 'astronaut', 'adventure'],
    difficulty: 'medium',
    featured: true,
    createdAt: new Date('2024-01-15'),
    metaTitle: 'Hello Kitty Astronaut Coloring Page - Free Space Adventure',
    metaDescription: 'Color Hello Kitty as an astronaut exploring space! Free printable coloring page perfect for kids who love space adventures.'
  },
  {
    id: 'lib-2',
    slug: 'hello-kitty-classic-coloring',
    title: 'Hello Kitty Classic',
    description: 'Traditional Hello Kitty pose perfect for beginners',
    imageUrl: '/hello-kitty-coloring-page.png',
    thumbnailUrl: '/hello-kitty-coloring-page.png',
    printUrl: '/hello-kitty-coloring-page.png',
    category: 'Characters',
    tags: ['hello kitty', 'classic', 'simple'],
    difficulty: 'easy',
    featured: true,
    createdAt: new Date('2024-01-20'),
    metaTitle: 'Classic Hello Kitty Coloring Page - Free Printable',
    metaDescription: 'Color the classic Hello Kitty design! Perfect for beginners and Hello Kitty fans of all ages.'
  },
  {
    id: 'lib-3',
    slug: 'cute-kitty-garden-coloring',
    title: 'Cute Kitty Garden',
    description: 'Adorable kitty surrounded by beautiful flowers',
    imageUrl: '/cute-kitty-coloring-page.png',
    thumbnailUrl: '/cute-kitty-coloring-page.png',
    printUrl: '/cute-kitty-coloring-page.png',
    category: 'Nature',
    tags: ['kitty', 'garden', 'flowers', 'Nature'],
    difficulty: 'medium',
    featured: false,
    createdAt: new Date('2024-02-01'),
    metaTitle: 'Cute Kitty Garden Coloring Page - Nature Theme',
    metaDescription: 'Color a cute kitty surrounded by beautiful garden flowers. Perfect for nature lovers!'
  }
]

// 标题转slug的标准化函数
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除特殊字符
    .replace(/\s+/g, '-')     // 空格转连字符
    .replace(/-+/g, '-')      // 多个连字符合并
    .replace(/^-|-$/g, '')    // 移除首尾连字符
    + '-coloring'             // 添加后缀
}

// 根据标题创建动态着色页面数据
export function createColoringPageFromTitle(title: string, imageUrl: string, description?: string): ColoringPageData {
  return {
    id: titleToSlug(title),
    slug: titleToSlug(title),
    title: title,
    description: description || `Color the beautiful ${title} design`,
    imageUrl: imageUrl,
    thumbnailUrl: imageUrl,
    printUrl: imageUrl,
    category: 'Custom',
    tags: title.toLowerCase().split(' ').filter(word => word.length > 2),
    difficulty: 'medium',
    featured: false,
    createdAt: new Date(),
    metaTitle: `${title} Coloring Page - Free Printable`,
    metaDescription: `Color the beautiful ${title} design! Free printable coloring page.`
  }
}

// 通过demo数据查找图片
function findImageFromDemoData(title: string): string {
  // 导入demo数据来查找真实图片
  const demoImages = [
    { title: "Hello Kitty Astronaut", imageUrl: "/astronaut-cat-coloring-page.png", keywords: ["astronaut", "space", "rocket"] },
    { title: "Hello Kitty Classic", imageUrl: "/hello-kitty-coloring-page.png", keywords: ["classic", "simple", "basic", "hello", "kitty"] },
    { title: "Cute Kitty Garden", imageUrl: "/cute-kitty-coloring-page.png", keywords: ["garden", "flower", "nature", "cute"] },
    { title: "Community Kitty", imageUrl: "/ai-community-coloring.png", keywords: ["community", "friends", "group"] },
    { title: "Playful Kitty Cat", imageUrl: "/coloring-kitty-cat.png", keywords: ["playful", "play", "fun", "cat"] },
    // 添加更多通用匹配
    { title: "Beach Bucket", imageUrl: "/hello-kitty-coloring-page.png", keywords: ["beach", "bucket", "sand", "summer", "ocean"] },
    { title: "Drawing", imageUrl: "/hello-kitty-coloring-page.png", keywords: ["drawing", "art", "creative"] }
  ]
  
  const titleLower = title.toLowerCase()
  console.log('🔍 查找图片匹配:', { title: titleLower })
  
  // 首先尝试精确标题匹配
  let foundImage = demoImages.find(img => 
    img.title.toLowerCase().includes(titleLower) ||
    titleLower.includes(img.title.toLowerCase())
  )
  
  // 如果没找到，尝试关键词匹配
  if (!foundImage) {
    foundImage = demoImages.find(img => 
      img.keywords.some(keyword => 
        titleLower.includes(keyword) || keyword.includes(titleLower)
      )
    )
  }
  
  const selectedImage = foundImage?.imageUrl || "/hello-kitty-coloring-page.png"
  console.log('✅ 选择的图片:', { title, selectedImage, foundTitle: foundImage?.title })
  
  return selectedImage
}

// 数据获取函数
export function getColoringPageBySlug(slug: string): ColoringPageData | null {
  // 首先查找静态数据
  const staticPage = COLORING_PAGES.find(page => page.slug === slug)
  if (staticPage) return staticPage
  
  // 如果没找到，尝试从slug反推标题并生成动态数据
  if (slug.endsWith('-coloring') || slug.endsWith('-coloring-pages')) {
    // 处理不同的后缀格式
    let titlePart = slug
    if (slug.endsWith('-coloring-pages')) {
      titlePart = slug.replace('-coloring-pages', '')
    } else if (slug.endsWith('-coloring')) {
      titlePart = slug.replace('-coloring', '')
    }
    
    const reconstructedTitle = titlePart
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
    
    // 查找对应的真实图片
    const imageUrl = findImageFromDemoData(reconstructedTitle)
    
    console.log('🔄 动态生成着色页面数据:', {
      原始slug: slug,
      重建标题: reconstructedTitle,
      图片URL: imageUrl
    })
    
    // 返回动态生成的页面数据
    return createColoringPageFromTitle(
      reconstructedTitle,
      imageUrl,
      `Color the beautiful ${reconstructedTitle} design`
    )
  }
  
  return null
}

export function getColoringPageById(id: string): ColoringPageData | null {
  return COLORING_PAGES.find(page => page.id === id) || null
}

export function getAllColoringPages(): ColoringPageData[] {
  return COLORING_PAGES
}

export function getFeaturedColoringPages(): ColoringPageData[] {
  return COLORING_PAGES.filter(page => page.featured)
}

export function getColoringPagesByCategory(category: string): ColoringPageData[] {
  return COLORING_PAGES.filter(page => page.category === category)
}

// 生成所有可用的slug用于静态生成
export function getAllColoringPageSlugs(): string[] {
  return COLORING_PAGES.map(page => page.slug)
}

// 向后兼容 - 处理旧的URL格式
export function mapLegacySlugToNew(legacySlug: string): string | null {
  const legacyMappings: Record<string, string> = {
    'hello-kitty-in-a-space-suit-10000': 'hello-kitty-astronaut-space-coloring',
    'hello-kitty-classic-10000': 'hello-kitty-classic-coloring',
    'hello-kitty-tea-party-10001': 'community-kitty-coloring',
    'hello-kitty-garden-10003': 'cute-kitty-garden-coloring',
    'hello-kitty-birthday-10004': 'playful-kitty-coloring'
  }
  
  return legacyMappings[legacySlug] || null
}