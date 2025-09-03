// API工具函数 - 处理移动端和桌面端的API调用差异

/**
 * 获取正确的API基础URL
 */
export function getApiBaseUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // 开发环境
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }
  
  // 生产环境备用 - 使用相对路径（让浏览器自动确定域名）
  return ''
}

/**
 * 安全的API调用 - 带重试和错误处理
 */
export async function safeApiCall(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response | null> {
  const baseUrl = getApiBaseUrl()
  const fullUrl = `${baseUrl}${endpoint}`
  
  console.log('🌐 API调用:', { endpoint, baseUrl, fullUrl })
  
  try {
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      },
    })
    
    if (!response.ok) {
      console.warn('⚠️ API调用返回错误状态:', response.status, response.statusText)
    }
    
    return response
  } catch (error) {
    console.error('❌ API调用失败:', { endpoint, error })
    
    // 如果使用的是相对路径且失败了，尝试相对路径
    if (baseUrl && !baseUrl.startsWith('http')) {
      try {
        console.log('🔄 尝试相对路径API调用...')
        const relativeResponse = await fetch(endpoint, options)
        return relativeResponse
      } catch (relativeError) {
        console.error('❌ 相对路径API调用也失败:', relativeError)
      }
    }
    
    return null
  }
}

/**
 * 获取SEO URL映射数据
 */
export async function getSeoUrlData(slug: string): Promise<any> {
  try {
    const response = await safeApiCall(`/api/seo-url?slug=${encodeURIComponent(slug)}`)
    
    if (response?.ok) {
      const result = await response.json()
      return result.data
    }
    
    return null
  } catch (error) {
    console.error('❌ 获取SEO URL数据失败:', error)
    return null
  }
}

/**
 * 获取库图片数据
 */
export async function getLibraryImages(limit: number = 100): Promise<any[]> {
  try {
    const response = await safeApiCall(`/api/library-images?limit=${limit}`)
    
    if (response?.ok) {
      const result = await response.json()
      return result.data || []
    }
    
    return []
  } catch (error) {
    console.error('❌ 获取库图片数据失败:', error)
    return []
  }
}