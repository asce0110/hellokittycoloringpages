// 彩色参考图映射
// 将黑白线稿图片映射到对应的彩色参考图

export interface ColorReference {
  original: string // 原始黑白线稿
  colored: string  // 彩色参考图
  title: string    // 图片标题
  colorScheme: {   // 推荐色彩方案
    primary: string[]
    secondary: string[]
    accent: string[]
  }
}

// 彩色参考图数据库
export const colorReferences: ColorReference[] = [
  {
    original: "/hello-kitty-coloring-page.png",
    colored: "/references/hello-kitty-colored.svg", // SVG彩色参考图
    title: "Hello Kitty Classic",
    colorScheme: {
      primary: ["#FF69B4", "#FFFFFF"], // 粉色和白色
      secondary: ["#00BCD4", "#FFDC00"], // 蓝色和黄色
      accent: ["#FF4136", "#2ECC40"] // 红色和绿色
    }
  },
  {
    original: "/astronaut-cat-coloring-page.png",
    colored: "/references/astronaut-cat-colored.png",
    title: "Astronaut Kitty",
    colorScheme: {
      primary: ["#001f3f", "#7FDBFF"], // 深蓝和浅蓝
      secondary: ["#AAAAAA", "#FFFFFF"], // 灰色和白色
      accent: ["#FF851B", "#FFDC00"] // 橙色和黄色
    }
  },
  {
    original: "/cute-kitty-coloring-page.png", 
    colored: "/references/cute-kitty-colored.png",
    title: "Cute Kitty",
    colorScheme: {
      primary: ["#F012BE", "#FF69B4"], // 紫红和粉色
      secondary: ["#FFFFFF", "#7FDBFF"], // 白色和浅蓝
      accent: ["#2ECC40", "#FFDC00"] // 绿色和黄色
    }
  }
]

// 缓存彩色参考图数据，避免重复请求
let colorReferenceCache: ColorReference[] | null = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存

/**
 * 从数据库获取所有彩色参考图
 */
async function fetchColorReferences(): Promise<ColorReference[]> {
  const now = Date.now()
  
  // 检查缓存是否有效
  if (colorReferenceCache && (now - cacheTimestamp) < CACHE_TTL) {
    return colorReferenceCache
  }

  try {
    console.log('🔄 Fetching color references from database...')
    const response = await fetch('/api/admin/color-references')
    
    if (!response.ok) {
      console.error('❌ Failed to fetch color references from database')
      return colorReferences // 降级到硬编码数据
    }
    
    const result = await response.json()
    const dbReferences = (result.data || []).map((item: any) => ({
      original: item.original_image_url,
      colored: item.colored_image_url,
      title: item.title,
      colorScheme: item.color_scheme
    }))
    
    // 合并数据库数据和硬编码数据
    colorReferenceCache = [...dbReferences, ...colorReferences]
    cacheTimestamp = now
    
    console.log(`✅ Loaded ${dbReferences.length} references from DB + ${colorReferences.length} hardcoded`)
    return colorReferenceCache
    
  } catch (error) {
    console.error('❌ Error fetching color references:', error)
    return colorReferences // 降级到硬编码数据
  }
}

/**
 * 根据原始图片URL获取彩色参考图信息
 */
export async function getColorReference(originalImageUrl: string): Promise<ColorReference | null> {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    console.log('❌ Invalid originalImageUrl:', originalImageUrl)
    return null
  }
  
  // 清理URL参数，只保留基础路径
  const cleanUrl = originalImageUrl.split('?')[0]
  console.log('🔍 Looking for color reference for:', cleanUrl)
  
  // 获取所有彩色参考图数据（包括数据库和硬编码）
  const allReferences = await fetchColorReferences()
  
  const found = allReferences.find(ref => {
    // 精确匹配
    if (ref.original === cleanUrl) return true
    
    // 基于文件名的匹配
    const originalBasename = ref.original.split('/').pop() || ''
    const cleanBasename = cleanUrl.split('/').pop() || ''
    const matches = cleanUrl.includes(originalBasename) || originalBasename.includes(cleanBasename) || ref.original.includes(cleanUrl)
    
    console.log(`  Checking ${ref.original} vs ${cleanUrl}: ${matches}`)
    return matches
  })
  
  console.log('✅ Color reference result:', found ? found.title : 'None found')
  return found || null
}

/**
 * 同步版本的getColorReference，用于需要立即结果的场景
 */
export function getColorReferenceSync(originalImageUrl: string): ColorReference | null {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    console.log('❌ Invalid originalImageUrl:', originalImageUrl)
    return null
  }
  
  // 清理URL参数，只保留基础路径
  const cleanUrl = originalImageUrl.split('?')[0]
  console.log('🔍 Looking for color reference for (sync):', cleanUrl)
  
  // 只使用缓存数据或硬编码数据
  const allReferences = colorReferenceCache || colorReferences
  
  const found = allReferences.find(ref => {
    // 精确匹配
    if (ref.original === cleanUrl) return true
    
    // 基于文件名的匹配
    const originalBasename = ref.original.split('/').pop() || ''
    const cleanBasename = cleanUrl.split('/').pop() || ''
    const matches = cleanUrl.includes(originalBasename) || originalBasename.includes(cleanBasename) || ref.original.includes(cleanUrl)
    
    return matches
  })
  
  console.log('✅ Color reference result (sync):', found ? found.title : 'None found')
  return found || null
}

/**
 * 生成彩色参考图URL（如果不存在真实彩色图，使用原图）
 */
export async function getColoredImageUrl(originalImageUrl: string): Promise<string> {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    return ''
  }
  
  const reference = await getColorReference(originalImageUrl)
  
  if (reference) {
    // 检查彩色参考图是否存在，如果不存在就使用原图
    return reference.colored
  }
  
  // 如果没有找到映射，返回原图
  return originalImageUrl
}

/**
 * 获取推荐色彩方案
 */
export async function getRecommendedColors(originalImageUrl: string): Promise<string[]> {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    // 返回默认色彩方案
    return [
      "#FF69B4", // Kitty Pink
      "#00BCD4", // Kitty Blue  
      "#FF4136", // Red
      "#FFDC00", // Yellow
      "#FFFFFF", // White
      "#000000"  // Black
    ]
  }
  
  const reference = await getColorReference(originalImageUrl)
  
  if (reference) {
    return [
      ...reference.colorScheme.primary,
      ...reference.colorScheme.secondary,
      ...reference.colorScheme.accent
    ]
  }
  
  // 默认Hello Kitty色彩方案
  return [
    "#FF69B4", // Kitty Pink
    "#00BCD4", // Kitty Blue  
    "#FF4136", // Red
    "#FFDC00", // Yellow
    "#FFFFFF", // White
    "#000000"  // Black
  ]
}

/**
 * 检查彩色参考图是否存在
 */
export async function hasColorReference(originalImageUrl: string): Promise<boolean> {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    return false
  }
  
  const reference = await getColorReference(originalImageUrl)
  const hasRef = reference !== null
  console.log(`🎨 hasColorReference(${originalImageUrl}): ${hasRef}`)
  return hasRef
}

/**
 * 同步版本的hasColorReference，用于需要立即结果的场景
 */
export function hasColorReferenceSync(originalImageUrl: string): boolean {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    return false
  }
  
  const hasRef = getColorReferenceSync(originalImageUrl) !== null
  console.log(`🎨 hasColorReferenceSync(${originalImageUrl}): ${hasRef}`)
  return hasRef
}