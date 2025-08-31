// SEO友好的着色页图片数据映射
export interface ColoringImage {
  id: string
  slug: string  // SEO友好的URL段
  title: string
  description: string
  imageUrl: string
  printUrl?: string
  category: string
  tags: string[]
  difficulty: 'easy' | 'medium' | 'complex'
  featured: boolean
  metaTitle?: string
  metaDescription?: string
  createdAt: Date
}

// 图片数据库 - 实际项目中应该从数据库获取
export const coloringImages: ColoringImage[] = [
  {
    id: '1',
    slug: 'hello-kitty-cute-bow',
    title: 'Hello Kitty with Cute Bow',
    description: 'Adorable Hello Kitty wearing a pretty bow, perfect for coloring fun!',
    imageUrl: '/hello-kitty-coloring-page.png',
    category: 'Characters',
    tags: ['hello-kitty', 'bow', 'cute', 'easy'],
    difficulty: 'easy',
    featured: true,
    metaTitle: 'Hello Kitty Coloring Page - Cute Bow Design | AI Kitty Creator',
    metaDescription: 'Color this adorable Hello Kitty wearing a pretty bow. Free printable coloring page perfect for kids and Hello Kitty fans!',
    createdAt: new Date('2024-01-01')
  },
  {
    id: '2', 
    slug: 'hello-kitty-flower-garden',
    title: 'Hello Kitty in Flower Garden',
    description: 'Hello Kitty surrounded by beautiful flowers in a magical garden scene.',
    imageUrl: '/cute-kitty-coloring-page.png',
    category: 'Nature',
    tags: ['hello-kitty', 'flowers', 'garden', 'Nature'],
    difficulty: 'medium',
    featured: true,
    metaTitle: 'Hello Kitty Flower Garden Coloring Page | AI Kitty Creator',
    metaDescription: 'Enjoy coloring Hello Kitty in a beautiful flower garden. Free printable coloring page with intricate floral details.',
    createdAt: new Date('2024-01-02')
  },
  {
    id: '3',
    slug: 'hello-kitty-birthday-cake', 
    title: 'Hello Kitty Birthday Celebration',
    description: 'Hello Kitty celebrating with a birthday cake and party decorations.',
    imageUrl: '/coloring-kitty-cat.png',
    category: 'Celebration',
    tags: ['hello-kitty', 'birthday', 'cake', 'party'],
    difficulty: 'medium',
    featured: false,
    metaTitle: 'Hello Kitty Birthday Coloring Page | AI Kitty Creator',
    metaDescription: 'Celebrate with Hello Kitty! Color this fun birthday scene with cake and decorations. Perfect for birthday parties.',
    createdAt: new Date('2024-01-03')
  },
  // Static fallback data for demo library images (numeric IDs 10000-10004)
  {
    id: '10000',
    slug: 'hello-kitty-in-a-space-suit-10000',
    title: 'Hello Kitty Astronaut',
    description: 'Hello Kitty exploring space as an astronaut',
    imageUrl: '/astronaut-cat-coloring-page.png',
    category: 'Adventure',
    tags: ['hello-kitty', 'space', 'astronaut', 'adventure'],
    difficulty: 'complex',
    featured: false,
    metaTitle: 'Hello Kitty Astronaut Coloring Page | AI Kitty Creator',
    metaDescription: 'Color Hello Kitty exploring space as an astronaut. Perfect for space adventure lovers!',
    createdAt: new Date('2024-02-01')
  },
  {
    id: '10001',
    slug: 'hello-kitty-tea-party-10001',
    title: 'Hello Kitty Tea Party',
    description: 'Hello Kitty having a delightful tea party',
    imageUrl: '/ai-community-coloring.png',
    category: 'Scenes',
    tags: ['hello-kitty', 'tea-party', 'detailed'],
    difficulty: 'medium',
    featured: true,
    metaTitle: 'Hello Kitty Tea Party Coloring Page | AI Kitty Creator',
    metaDescription: 'Color Hello Kitty having a delightful tea party. Detailed coloring page perfect for tea party enthusiasts!',
    createdAt: new Date('2024-01-20')
  },
  {
    id: '10002',
    slug: 'hello-kitty-classic-10002',
    title: 'Hello Kitty Classic',
    description: 'Traditional Hello Kitty pose perfect for beginners',
    imageUrl: '/hello-kitty-coloring-page.png',
    category: 'Characters',
    tags: ['hello-kitty', 'classic', 'simple'],
    difficulty: 'easy',
    featured: true,
    metaTitle: 'Hello Kitty Classic Coloring Page | AI Kitty Creator',
    metaDescription: 'Color this traditional Hello Kitty pose. Perfect for beginners and Hello Kitty fans!',
    createdAt: new Date('2024-01-15')
  },
  {
    id: '10003',
    slug: 'hello-kitty-garden-10003',
    title: 'Hello Kitty Garden',
    description: 'Hello Kitty tending to beautiful flowers',
    imageUrl: '/cute-kitty-coloring-page.png',
    category: 'Nature',
    tags: ['hello-kitty', 'garden', 'flowers', 'Nature'],
    difficulty: 'medium',
    featured: true,
    metaTitle: 'Hello Kitty Garden Coloring Page | AI Kitty Creator',
    metaDescription: 'Color Hello Kitty tending to beautiful flowers in the garden. Perfect for nature lovers!',
    createdAt: new Date('2024-02-10')
  },
  {
    id: '10004',
    slug: 'hello-kitty-birthday-10004',
    title: 'Hello Kitty Birthday',
    description: 'Hello Kitty celebrating with birthday cake',
    imageUrl: '/coloring-kitty-cat.png',
    category: 'Celebration',
    tags: ['hello-kitty', 'birthday', 'cake', 'celebration'],
    difficulty: 'easy',
    featured: false,
    metaTitle: 'Hello Kitty Birthday Coloring Page | AI Kitty Creator',
    metaDescription: 'Color Hello Kitty celebrating with birthday cake. Perfect for birthday celebrations!',
    createdAt: new Date('2024-02-15')
  },
  // 为现有的动态图片添加临时条目
  {
    id: '6729',
    slug: 'hello-kitty-custom-6729',
    title: 'Hello Kitty Custom Drawing',
    description: 'A beautiful Hello Kitty coloring page design.',
    imageUrl: '', // 将在运行时设置
    category: 'Characters',
    tags: ['hello-kitty', 'custom'],
    difficulty: 'medium',
    featured: false,
    metaTitle: 'Hello Kitty Custom Coloring Page | AI Kitty Creator',
    metaDescription: 'Color this unique Hello Kitty design. Free printable coloring page perfect for creative expression.',
    createdAt: new Date()
  }
]

// 辅助函数
export function getImageBySlug(slug: string): ColoringImage | null {
  return coloringImages.find(img => img.slug === slug) || null
}

export function getImageById(id: string): ColoringImage | null {
  return coloringImages.find(img => img.id === id) || null
}

export function getAllSlugs(): string[] {
  return coloringImages.map(img => img.slug)
}

// SEO友好的slug生成函数
// 终极修复：完全重写的slug生成函数 - 绝对防止无限循环
export function generateSlug(title: string): string {
  // 🚨 终极修复：如果输入为空或无效，立即返回安全值
  if (!title || typeof title !== 'string') {
    return 'safe-page'
  }
  
  // 🚨 循环检测：如果输入已经是slug格式（包含多个连字符），直接返回清理版本
  const dashCount = (title.match(/-/g) || []).length
  if (dashCount > 3) {
    console.warn('🚨 generateSlug: 检测到可能的slug输入，返回安全值')
    return 'safe-page'
  }
  
  // 🚨 重复检测：如果包含重复的单词模式，返回安全值
  const words = title.toLowerCase().split(/[-\s]+/)
  const uniqueWords = new Set(words)
  if (words.length > uniqueWords.size * 2) {
    console.warn('🚨 generateSlug: 检测到重复单词，返回安全值')
    return 'safe-page'
  }
  
  // 🚨 长度检测：如果太长，直接返回安全值
  if (title.length > 50) {
    console.warn('🚨 generateSlug: 输入过长，返回安全值')
    return 'safe-page'
  }
  
  // 🚨 特定模式检测
  const dangerousPatterns = [
    'hello-kitty-page',
    'sitting-in-cherry-blossom-garden',
    'drawing-drawing',
    'page-page'
  ]
  
  for (const pattern of dangerousPatterns) {
    if (title.toLowerCase().includes(pattern)) {
      console.warn('🚨 generateSlug: 检测到危险模式:', pattern)
      return 'safe-page'
    }
  }
  
  // 安全处理：只保留简单的字母数字和空格
  let cleanTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .trim()
  
  // 如果清理后为空或过短，使用默认值
  if (!cleanTitle || cleanTitle.length < 2) {
    cleanTitle = 'page'
  }
  
  // 最终长度限制
  if (cleanTitle.length > 20) {
    cleanTitle = cleanTitle.substring(0, 20).replace(/-+$/, '')
  }
  
  return cleanTitle || 'page'
}

// 根据上传的图片动态创建条目
export function createColoringImageEntry(
  id: string, 
  title: string, 
  imageUrl: string, 
  printUrl?: string
): ColoringImage {
  // 🎯 根源修复：检查title是否已经是一个slug格式，避免重复处理
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
  
  return {
    id,
    slug,
    title,
    description: `A beautiful ${title.toLowerCase()} coloring page design.`,
    imageUrl,
    printUrl,
    category: 'Characters',
    tags: ['hello-kitty', 'custom'],
    difficulty: 'medium',
    featured: false,
    metaTitle: `${title} - Free Coloring Page | AI Kitty Creator`,
    metaDescription: `Color this beautiful ${title.toLowerCase()} design. Free printable coloring page perfect for creative fun.`,
    createdAt: new Date()
  }
}

// 更新或添加图片条目到"数据库"（实际项目中应该存储到真正的数据库）
export function upsertColoringImage(image: ColoringImage): void {
  const existingIndex = coloringImages.findIndex(img => img.id === image.id)
  if (existingIndex >= 0) {
    coloringImages[existingIndex] = image
  } else {
    coloringImages.push(image)
  }
}