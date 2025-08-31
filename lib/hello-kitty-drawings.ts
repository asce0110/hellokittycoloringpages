// Hello Kitty Drawings - SEO优化版本，使用数字ID结构
export interface HelloKittyDrawing {
  id: number
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
  // SEO优化字段
  metaTitle?: string
  metaDescription?: string
  keywords?: string[]
  structuredData?: object
}

// Hello Kitty Drawings 核心数据库 - 数字ID版本
export const HELLO_KITTY_DRAWINGS: HelloKittyDrawing[] = [
  {
    id: 1,
    title: 'Hello Kitty Astronaut Space Adventure',
    description: 'Hello Kitty exploring the cosmos as a brave astronaut, perfect for space-loving kids',
    imageUrl: '/astronaut-cat-coloring-page.png',
    thumbnailUrl: '/astronaut-cat-line-art.png',
    printUrl: '/astronaut-cat-coloring-page.png',
    category: 'Adventure',
    tags: ['hello kitty drawings', 'astronaut', 'space', 'adventure', 'kids coloring'],
    difficulty: 'medium',
    featured: true,
    createdAt: new Date('2024-01-15'),
    metaTitle: 'Hello Kitty Drawings #1 - Astronaut Space Adventure | Free Printable',
    metaDescription: 'Download free Hello Kitty drawings featuring our beloved cat as an astronaut! Perfect printable coloring page for kids who love space adventures.',
    keywords: ['hello kitty drawings', 'free hello kitty coloring', 'astronaut coloring page', 'space coloring sheets']
  },
  {
    id: 2,
    title: 'Classic Hello Kitty Portrait Drawing',
    description: 'The timeless Hello Kitty classic pose that everyone loves - perfect for beginners',
    imageUrl: '/hello-kitty-coloring-page.png',
    thumbnailUrl: '/hello-kitty-coloring-page.png', 
    printUrl: '/hello-kitty-coloring-page.png',
    category: 'Classic',
    tags: ['hello kitty drawings', 'classic', 'simple', 'beginner', 'portrait'],
    difficulty: 'easy',
    featured: true,
    createdAt: new Date('2024-01-20'),
    metaTitle: 'Hello Kitty Drawings #2 - Classic Portrait | Easy Coloring Page',
    metaDescription: 'Color the classic Hello Kitty portrait! Easy hello kitty drawings perfect for beginners and fans of all ages. Free printable coloring page.',
    keywords: ['hello kitty drawings', 'classic hello kitty', 'easy coloring pages', 'hello kitty portrait']
  },
  {
    id: 3,
    title: 'Hello Kitty Garden Paradise Drawing',
    description: 'Adorable Hello Kitty surrounded by beautiful blooming flowers in a magical garden',
    imageUrl: '/cute-kitty-coloring-page.png',
    thumbnailUrl: '/cute-kitty-coloring-page.png',
    printUrl: '/cute-kitty-coloring-page.png',
    category: 'Nature',
    tags: ['hello kitty drawings', 'garden', 'flowers', 'Nature', 'cute'],
    difficulty: 'medium',
    featured: false,
    createdAt: new Date('2024-02-01'),
    metaTitle: 'Hello Kitty Drawings #3 - Garden Paradise | Nature Coloring Page',
    metaDescription: 'Beautiful hello kitty drawings in a flower garden setting! Perfect nature-themed coloring page for kids who love gardens and flowers.',
    keywords: ['hello kitty drawings', 'garden coloring page', 'flower coloring sheets', 'nature drawings']
  },
  {
    id: 4,
    title: 'Hello Kitty Community Friends Drawing',
    description: 'Hello Kitty with her adorable friends in a heartwarming community scene',
    imageUrl: '/ai-community-coloring.png',
    thumbnailUrl: '/ai-community-coloring.png',
    printUrl: '/ai-community-coloring.png',
    category: 'Community',
    tags: ['hello kitty drawings', 'friends', 'community', 'social', 'group'],
    difficulty: 'medium',
    featured: false,
    createdAt: new Date('2024-02-10'),
    metaTitle: 'Hello Kitty Drawings #4 - Community Friends | Group Coloring Page',
    metaDescription: 'Hello kitty drawings featuring beloved characters and friends! Perfect community-themed coloring page promoting friendship and togetherness.',
    keywords: ['hello kitty drawings', 'hello kitty friends', 'community coloring', 'group drawings']
  },
  {
    id: 5,
    title: 'Playful Hello Kitty Cat Drawing',
    description: 'Hello Kitty in a playful, energetic pose that captures her fun-loving spirit',
    imageUrl: '/coloring-kitty-cat.png',
    thumbnailUrl: '/coloring-kitty-cat.png',
    printUrl: '/coloring-kitty-cat.png',
    category: 'Playful',
    tags: ['hello kitty drawings', 'playful', 'energetic', 'fun', 'active'],
    difficulty: 'easy',
    featured: true,
    createdAt: new Date('2024-02-15'),
    metaTitle: 'Hello Kitty Drawings #5 - Playful Cat | Fun Coloring Page',
    metaDescription: 'Fun and playful hello kitty drawings perfect for active kids! Easy coloring page featuring Hello Kitty in her most energetic pose.',
    keywords: ['hello kitty drawings', 'playful coloring pages', 'fun drawings', 'active hello kitty']
  }
]

// 根据数字ID获取Hello Kitty Drawing
export function getHelloKittyDrawingById(id: number): HelloKittyDrawing | null {
  return HELLO_KITTY_DRAWINGS.find(drawing => drawing.id === id) || null
}

// 获取所有可用的ID用于静态生成
export function getAllHelloKittyDrawingIds(): number[] {
  return HELLO_KITTY_DRAWINGS.map(drawing => drawing.id)
}

// 获取所有Hello Kitty Drawings
export function getAllHelloKittyDrawings(): HelloKittyDrawing[] {
  return HELLO_KITTY_DRAWINGS
}

// 获取特色Hello Kitty Drawings
export function getFeaturedHelloKittyDrawings(): HelloKittyDrawing[] {
  return HELLO_KITTY_DRAWINGS.filter(drawing => drawing.featured)
}

// 按分类获取Hello Kitty Drawings
export function getHelloKittyDrawingsByCategory(category: string): HelloKittyDrawing[] {
  return HELLO_KITTY_DRAWINGS.filter(drawing => drawing.category === category)
}

// 按难度获取Hello Kitty Drawings
export function getHelloKittyDrawingsByDifficulty(difficulty: 'easy' | 'medium' | 'complex'): HelloKittyDrawing[] {
  return HELLO_KITTY_DRAWINGS.filter(drawing => drawing.difficulty === difficulty)
}

// 生成结构化数据 (JSON-LD) 用于SEO
export function generateStructuredData(drawing: HelloKittyDrawing): object {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": drawing.title,
    "description": drawing.description,
    "image": `https://yoursite.com${drawing.imageUrl}`,
    "creator": {
      "@type": "Organization",
      "name": "AI Kitty Creator"
    },
    "genre": "Coloring Page",
    "keywords": drawing.keywords?.join(', ') || drawing.tags.join(', '),
    "dateCreated": drawing.createdAt.toISOString(),
    "isAccessibleForFree": true,
    "audience": {
      "@type": "Audience",
      "audienceType": "Children"
    },
    "educationalUse": "Art Education",
    "learningResourceType": "Coloring Page",
    "difficulty": drawing.difficulty
  }
}

// 从legacy slug或者实际图片URL创建动态Hello Kitty Drawing
export function createDynamicHelloKittyDrawing(
  title: string, 
  imageUrl: string, 
  description?: string,
  id?: number
): HelloKittyDrawing {
  const nextId = id || Math.max(...HELLO_KITTY_DRAWINGS.map(d => d.id)) + 1
  
  return {
    id: nextId,
    title: title,
    description: description || `Beautiful ${title} hello kitty drawing perfect for coloring`,
    imageUrl: imageUrl,
    thumbnailUrl: imageUrl,
    printUrl: imageUrl,
    category: 'Custom',
    tags: ['hello kitty drawings', 'custom', ...title.toLowerCase().split(' ').filter(word => word.length > 2)],
    difficulty: 'medium',
    featured: false,
    createdAt: new Date(),
    metaTitle: `Hello Kitty Drawings #${nextId} - ${title} | Free Printable Coloring Page`,
    metaDescription: `Download free hello kitty drawings featuring ${title}! Perfect printable coloring page for kids and Hello Kitty fans.`,
    keywords: ['hello kitty drawings', 'free coloring pages', title.toLowerCase(), 'printable drawings']
  }
}

// 所有可用的分类
export const HELLO_KITTY_CATEGORIES = [
  'Adventure',
  'Classic', 
  'Nature',
  'Community',
  'Playful',
  'Custom'
] as const

// 向后兼容映射 - 旧URL到新数字ID
export const LEGACY_TO_NUMBER_MAPPING: Record<string, number> = {
  'hello-kitty-astronaut-coloring': 1,
  'hello-kitty-classic-coloring': 2,
  'cute-kitty-garden-coloring': 3,
  'community-kitty-coloring': 4,
  'playful-kitty-coloring': 5,
  // 更多旧格式映射...
  'hello-kitty-in-a-space-suit-10000': 1,
  'hello-kitty-classic-10000': 2,
  'hello-kitty-tea-party-10001': 4,
  'hello-kitty-garden-10003': 3,
  'hello-kitty-birthday-10004': 5
}

// 从旧格式slug获取数字ID
export function getIdFromLegacySlug(legacySlug: string): number | null {
  return LEGACY_TO_NUMBER_MAPPING[legacySlug] || null
}