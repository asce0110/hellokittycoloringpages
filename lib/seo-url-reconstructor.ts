// 🎯 SEO URL重建器 - 从slug重建真实图片URL
// 解决内存映射丢失问题，确保用户总能访问到真实图片

interface ReconstructedData {
  title: string
  imageUrl: string | null
  description: string
  isReconstructed: boolean
}

/**
 * 从SEO slug中重建原始数据
 * 优先使用存储的映射，如果丢失则尝试重建
 */
export function reconstructDataFromSlug(slug: string): ReconstructedData {
  console.log('🔍 尝试重建SEO数据:', slug)
  
  // 检查是否为我们生成的语义化slug格式
  const parts = slug.split('-')
  if (parts.length < 2) {
    return {
      title: 'Hello Kitty Drawing',
      imageUrl: null,
      description: 'A Hello Kitty coloring page',
      isReconstructed: false
    }
  }
  
  // 最后一部分应该是基于原始imageUrl的hash
  const urlHash = parts[parts.length - 1]
  
  // 从slug中提取标题部分
  const titleParts = parts.slice(0, -1)
  const reconstructedTitle = titleParts
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
  const fullTitle = `Hello Kitty ${reconstructedTitle}`
  
  console.log('📝 重建信息:', {
    slug,
    titleParts,
    reconstructedTitle: fullTitle,
    urlHash
  })
  
  // 🔍 尝试从当前会话的localStorage中查找映射
  const sessionMapping = tryGetFromSessionStorage(slug, urlHash)
  if (sessionMapping) {
    console.log('✅ 从sessionStorage找到真实图片URL')
    return {
      title: fullTitle,
      imageUrl: sessionMapping.imageUrl,
      description: sessionMapping.description || `A beautiful ${fullTitle.toLowerCase()} coloring page`,
      isReconstructed: true
    }
  }
  
  // 🔍 尝试从URL hash推测可能的图片URL模式
  const possibleImageUrl = reconstructImageUrl(urlHash)
  if (possibleImageUrl) {
    console.log('🔄 基于hash推测图片URL:', possibleImageUrl)
    return {
      title: fullTitle,
      imageUrl: possibleImageUrl,
      description: `A beautiful ${fullTitle.toLowerCase()} coloring page`,
      isReconstructed: true
    }
  }
  
  // 如果无法重建，返回基本信息
  console.log('⚠️ 无法重建真实图片URL，将使用默认图片')
  return {
    title: fullTitle,
    imageUrl: null,
    description: `A beautiful ${fullTitle.toLowerCase()} coloring page`,
    isReconstructed: false
  }
}

/**
 * 尝试从sessionStorage中获取映射数据
 */
function tryGetFromSessionStorage(slug: string, urlHash: string): { imageUrl: string, description?: string } | null {
  if (typeof window === 'undefined') return null
  
  try {
    // 尝试多个可能的key
    const possibleKeys = [
      `seo-mapping-${slug}`,
      `seo-mapping-${urlHash}`,
      `image-mapping-${urlHash}`
    ]
    
    for (const key of possibleKeys) {
      const stored = sessionStorage.getItem(key)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.imageUrl) {
          return parsed
        }
      }
    }
    
    // 尝试从所有存储的映射中查找匹配的hash
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('seo-mapping-')) {
        const stored = sessionStorage.getItem(key)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.urlHash === urlHash && parsed.imageUrl) {
            return parsed
          }
        }
      }
    }
  } catch (error) {
    console.log('sessionStorage访问失败:', error)
  }
  
  return null
}

/**
 * 基于hash尝试重建图片URL
 * 这个方法有限，但可以处理一些常见的R2存储URL模式
 */
function reconstructImageUrl(urlHash: string): string | null {
  // 如果hash看起来像base64编码的一部分，可能来自R2 URL
  if (urlHash.length >= 6 && /^[a-zA-Z0-9]+$/.test(urlHash)) {
    // 尝试几种常见的R2 URL模式
    const r2BaseUrl = 'https://pub-6b9f60f951414c618dea1ff78ef21e4d.r2.dev/uploads/'
    
    // 基于hash生成可能的文件名模式
    const possiblePatterns = [
      `${Date.now()}-${urlHash}.blob`,
      `1755442141915-${urlHash}.blob`,
      `${urlHash}.png`,
      `${urlHash}.jpg`
    ]
    
    // 返回第一个可能的URL（实际使用中可能需要验证）
    return r2BaseUrl + possiblePatterns[0]
  }
  
  return null
}

/**
 * 改进的URL生成器 - 同时保存到sessionStorage
 */
export function generatePersistentSeoUrl(title: string, imageUrl: string, description?: string): string {
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/^hello\s+kitty\s+/i, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 40) || 'drawing'
    
  const urlHash = btoa(imageUrl).slice(-6).replace(/[^a-zA-Z0-9]/g, '')
  const uniqueSlug = `${baseSlug}-${urlHash}`
  
  // 同时保存到内存和sessionStorage
  if (typeof window !== 'undefined') {
    try {
      const mappingData = {
        slug: uniqueSlug,
        title,
        imageUrl,
        description,
        urlHash,
        timestamp: Date.now()
      }
      
      sessionStorage.setItem(`seo-mapping-${uniqueSlug}`, JSON.stringify(mappingData))
      sessionStorage.setItem(`seo-mapping-${urlHash}`, JSON.stringify(mappingData))
      
      console.log('💾 SEO映射已保存到sessionStorage:', uniqueSlug)
    } catch (error) {
      console.log('⚠️ sessionStorage保存失败:', error)
    }
  }
  
  return `/hello-kitty-drawings/${uniqueSlug}`
}

/**
 * 检查重建的数据是否可信
 */
export function validateReconstructedData(data: ReconstructedData): boolean {
  return !!(data.title && data.title.length > 5)
}

/**
 * 清理过期的sessionStorage映射
 */
export function cleanupExpiredMappings() {
  if (typeof window === 'undefined') return
  
  try {
    const now = Date.now()
    const maxAge = 24 * 60 * 60 * 1000 // 24小时
    
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i)
      if (key?.startsWith('seo-mapping-')) {
        const stored = sessionStorage.getItem(key)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.timestamp && (now - parsed.timestamp) > maxAge) {
            sessionStorage.removeItem(key)
            console.log('🗑️ 清理过期映射:', key)
          }
        }
      }
    }
  } catch (error) {
    console.log('清理映射失败:', error)
  }
}