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
      accent: ["#FF4136", "#FF69B4"] // 红色和粉色（移除绿色）
    }
  },
  {
    original: "/astronaut-cat-coloring-page.png",
    colored: "/references/hello-kitty-colored.svg", // 临时使用现有的彩色参考图
    title: "Astronaut Kitty",
    colorScheme: {
      primary: ["#001f3f", "#7FDBFF"], // 深蓝和浅蓝
      secondary: ["#AAAAAA", "#FFFFFF"], // 灰色和白色
      accent: ["#FF851B", "#FFDC00"] // 橙色和黄色
    }
  },
  {
    original: "/cute-kitty-coloring-page.png", 
    colored: "/references/hello-kitty-colored.svg", // 临时使用现有的彩色参考图
    title: "Cute Kitty",
    colorScheme: {
      primary: ["#F012BE", "#FF69B4"], // 紫红和粉色
      secondary: ["#FFFFFF", "#7FDBFF"], // 白色和浅蓝
      accent: ["#FF851B", "#FFDC00"] // 橙色和黄色（移除绿色）
    }
  },
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
  
  // 🔥 首先检查数据库中的图片配对
  try {
    console.log('🔄 Checking database for paired colored image...')
    const pairingResponse = await fetch(`/api/image-pairing?imageUrl=${encodeURIComponent(cleanUrl)}`)
    
    if (pairingResponse.ok) {
      const pairingResult = await pairingResponse.json()
      if (pairingResult.success && pairingResult.data) {
        console.log('✅ Found database pairing:', pairingResult.data)
        
        // 创建动态颜色参考
        const dynamicReference: ColorReference = {
          original: pairingResult.data.lineImage.imageUrl,
          colored: pairingResult.data.coloredImage.imageUrl,
          title: `${pairingResult.data.lineImage.title} - Colored Reference`,
          colorScheme: {
            // 🎨 注意：这些颜色只作为备选方案
            // 实际颜色将通过 getRecommendedColors() 从彩色图像中提取
            primary: ["#FF69B4", "#FFFFFF"], // 粉色和白色（备选）
            secondary: ["#00BCD4", "#FFDC00"], // 蓝色和黄色（备选）
            accent: ["#FF4136", "#FF851B", "#B10DC9", "#7FDBFF"] // 红色、橙色、紫色、浅蓝（移除绿色）
          }
        }
        
        console.log('🎨 Using database-paired colored image:', dynamicReference.colored)
        return dynamicReference
      }
    } else {
      console.log('⚠️ Database pairing lookup failed or no pairing found')
    }
  } catch (error) {
    console.warn('⚠️ Error checking database pairing:', error)
  }
  
  // 获取所有彩色参考图数据（包括数据库和硬编码）作为fallback
  const allReferences = await fetchColorReferences()
  
  let found = allReferences.find(ref => {
    // 跳过默认参考图
    if (ref.original === "default") return false
    
    // 精确匹配
    if (ref.original === cleanUrl) return true
    
    // 基于文件名的匹配
    const originalBasename = ref.original.split('/').pop() || ''
    const cleanBasename = cleanUrl.split('/').pop() || ''
    const matches = cleanUrl.includes(originalBasename) || originalBasename.includes(cleanBasename) || ref.original.includes(cleanUrl)
    
    console.log(`  Checking ${ref.original} vs ${cleanUrl}: ${matches}`)
    return matches
  })
  
  // 如果没有找到具体匹配，不使用任何默认参考图
  if (!found) {
    console.log('🎨 No color reference found for:', cleanUrl)
    return null
  }
  
  console.log('✅ Color reference result:', found.title)
  return found
}

/**
 * 同步版本的getColorReference，用于需要立即结果的场景
 * 注意：同步版本无法进行数据库查询，只能使用缓存或硬编码数据
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
  
  // 🔥 注意：同步版本无法查询数据库配对，建议使用异步版本 getColorReference()
  console.log('⚠️ Sync version cannot check database pairings. Use getColorReference() for full functionality.')
  
  // 只使用缓存数据或硬编码数据
  const allReferences = colorReferenceCache || colorReferences
  
  let found = allReferences.find(ref => {
    // 跳过默认参考图
    if (ref.original === "default") return false
    
    // 精确匹配
    if (ref.original === cleanUrl) return true
    
    // 基于文件名的匹配
    const originalBasename = ref.original.split('/').pop() || ''
    const cleanBasename = cleanUrl.split('/').pop() || ''
    const matches = cleanUrl.includes(originalBasename) || originalBasename.includes(cleanBasename) || ref.original.includes(cleanUrl)
    
    return matches
  })
  
  // 如果没有找到具体匹配，不使用任何默认参考图
  if (!found) {
    console.log('🎨 No color reference found (sync) for:', cleanUrl)
    return null
  }
  
  console.log('✅ Color reference result (sync):', found.title)
  return found
}

/**
 * 生成彩色参考图URL（如果不存在真实彩色图，返回空字符串）
 */
export async function getColoredImageUrl(originalImageUrl: string): Promise<string> {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    return ''
  }
  
  const reference = await getColorReference(originalImageUrl)
  
  if (reference) {
    // 只有真实的彩色参考图才返回URL
    return reference.colored
  }
  
  // 如果没有找到真实的参考图映射，返回空字符串
  return ''
}

/**
 * 获取推荐色彩方案 - 从真实的彩色参考图中提取颜色
 */
export async function getRecommendedColors(originalImageUrl: string): Promise<string[]> {
  // 检查输入参数是否有效
  if (!originalImageUrl || typeof originalImageUrl !== 'string') {
    console.log('❌ No valid image URL provided for color recommendations')
    return [] // 返回空数组，表示没有颜色建议
  }
  
  const reference = await getColorReference(originalImageUrl)
  
  if (reference && reference.colored && reference.colored !== 'default') {
    console.log('✅ Found real color reference, extracting colors from:', reference.colored)
    
    // 🎯 使用真实的像素颜色提取而不是预设颜色方案
    try {
      console.log('🔄 Starting real pixel color extraction from:', reference.colored)
      
      // 动态导入颜色提取模块
      const { extractColorsFromImage } = await import('./color-extractor')
      const extractedColors = await extractColorsFromImage(reference.colored, 8)
      
      if (extractedColors && extractedColors.length > 0) {
        console.log('✅ Successfully extracted colors from image:', extractedColors)
        return extractedColors
      } else {
        console.log('⚠️ No colors could be extracted from image')
        return []
      }
    } catch (error) {
      console.error('❌ Failed to extract colors from image:', error)
      return []
    }
  }
  
  // 没有真实参考图时不返回任何颜色建议
  console.log('🚫 No real color reference found, not providing any colors')
  return []
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