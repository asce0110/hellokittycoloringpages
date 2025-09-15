/**
 * 统一ID处理工具
 * 解决收藏功能中不同页面ID格式不匹配的问题
 */

// ID格式类型定义
export type IdFormat = 'uuid' | 'demo' | 'slug' | 'reconstructed' | 'unknown'

export interface NormalizedIdResult {
  normalizedId: string
  originalId: string
  format: IdFormat
  confidence: number
  fallbackIds: string[]
}

/**
 * 检测ID格式
 */
export function detectIdFormat(id: string): IdFormat {
  if (!id || typeof id !== 'string') return 'unknown'
  
  // UUID格式：8-4-4-4-12 位十六进制
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return 'uuid'
  }
  
  // Demo格式：demo-开头
  if (id.startsWith('demo-')) {
    return 'demo'
  }
  
  // 重构ID格式：reconstructed-开头
  if (id.startsWith('reconstructed-')) {
    return 'reconstructed'
  }
  
  // Slug格式：包含连字符且是合理长度
  if (id.includes('-') && id.length > 3 && !/^\d+$/.test(id)) {
    return 'slug'
  }
  
  return 'unknown'
}

/**
 * 标准化ID - 将任意格式的ID转换为标准格式
 */
export function normalizeImageId(id: string | null | undefined): NormalizedIdResult {
  if (!id) {
    return {
      normalizedId: '',
      originalId: '',
      format: 'unknown',
      confidence: 0,
      fallbackIds: []
    }
  }
  
  const format = detectIdFormat(id)
  const fallbackIds: string[] = []
  
  // 生成可能的备用ID格式
  switch (format) {
    case 'uuid':
      // UUID是最标准的格式，直接使用
      fallbackIds.push(`demo-${id.slice(0, 8)}`) // 可能的demo格式
      break
      
    case 'demo':
      // Demo格式，添加无前缀版本
      const withoutDemo = id.replace(/^demo-/, '')
      fallbackIds.push(withoutDemo)
      break
      
    case 'reconstructed':
      // 重构格式，添加可能的原始格式
      const withoutReconstructed = id.replace(/^reconstructed-/, '')
      fallbackIds.push(withoutReconstructed)
      fallbackIds.push(`demo-${withoutReconstructed}`)
      break
      
    case 'slug':
      // Slug格式，可能对应demo版本
      fallbackIds.push(`demo-${id}`)
      break
  }
  
  return {
    normalizedId: id,
    originalId: id,
    format,
    confidence: format !== 'unknown' ? 0.9 : 0.3,
    fallbackIds
  }
}

/**
 * 从Library图片数据中提取收藏ID
 */
export function extractFavoriteId(image: any): NormalizedIdResult {
  // ID提取优先级：
  // 1. originalId (通常是UUID)
  // 2. id (主ID字段)
  // 3. libraryImageId (SEO缓存中的真实ID)
  // 4. slug (URL格式)
  
  const candidates = [
    image.originalId,
    image.id, 
    image.libraryImageId,
    image.slug
  ].filter(Boolean)
  
  if (candidates.length === 0) {
    return {
      normalizedId: '',
      originalId: '',
      format: 'unknown',
      confidence: 0,
      fallbackIds: []
    }
  }
  
  // 优先选择UUID格式的ID
  for (const candidate of candidates) {
    const result = normalizeImageId(candidate)
    if (result.format === 'uuid') {
      result.fallbackIds = candidates.filter(c => c !== candidate)
      return result
    }
  }
  
  // 如果没有UUID，选择第一个有效的ID
  const firstValid = candidates[0]
  const result = normalizeImageId(firstValid)
  result.fallbackIds = candidates.slice(1)
  
  return result
}

/**
 * 从着色页面数据中提取收藏ID
 */
export function extractColoringPageFavoriteId(coloringPage: any, trackingId?: string): NormalizedIdResult {
  // ID提取优先级：
  // 1. libraryImageId (SEO系统中的真实ID)
  // 2. trackingId (浏览量追踪使用的ID)
  // 3. id (着色页面ID)
  // 4. slug (URL格式)
  
  const candidates = [
    coloringPage.libraryImageId,
    trackingId,
    coloringPage.id,
    coloringPage.slug
  ].filter(Boolean)
  
  if (candidates.length === 0) {
    return {
      normalizedId: '',
      originalId: '',
      format: 'unknown',
      confidence: 0,
      fallbackIds: []
    }
  }
  
  // 优先选择UUID格式的ID
  for (const candidate of candidates) {
    const result = normalizeImageId(candidate)
    if (result.format === 'uuid') {
      result.fallbackIds = candidates.filter(c => c !== candidate)
      return result
    }
  }
  
  // 如果没有UUID，选择第一个有效的ID
  const firstValid = candidates[0]
  const result = normalizeImageId(firstValid)
  result.fallbackIds = candidates.slice(1)
  
  return result
}

/**
 * 智能ID匹配 - 判断两个ID是否指向同一个资源
 */
export function areIdsMatching(id1: string, id2: string): boolean {
  if (!id1 || !id2) return false
  if (id1 === id2) return true
  
  const norm1 = normalizeImageId(id1)
  const norm2 = normalizeImageId(id2)
  
  // 直接匹配
  if (norm1.normalizedId === norm2.normalizedId) return true
  
  // 交叉匹配：检查是否在对方的备用ID列表中
  if (norm1.fallbackIds.includes(norm2.normalizedId)) return true
  if (norm2.fallbackIds.includes(norm1.normalizedId)) return true
  
  // 特殊匹配规则
  // Demo格式匹配：demo-abc 和 abc
  if (norm1.format === 'demo' && norm2.format !== 'demo') {
    const withoutDemo = norm1.normalizedId.replace(/^demo-/, '')
    if (withoutDemo === norm2.normalizedId) return true
  }
  if (norm2.format === 'demo' && norm1.format !== 'demo') {
    const withoutDemo = norm2.normalizedId.replace(/^demo-/, '')
    if (withoutDemo === norm1.normalizedId) return true
  }
  
  // 重构ID匹配：reconstructed-123 和 123
  if (norm1.format === 'reconstructed' && norm2.format !== 'reconstructed') {
    const withoutReconstructed = norm1.normalizedId.replace(/^reconstructed-/, '')
    if (withoutReconstructed === norm2.normalizedId) return true
  }
  if (norm2.format === 'reconstructed' && norm1.format !== 'reconstructed') {
    const withoutReconstructed = norm2.normalizedId.replace(/^reconstructed-/, '')
    if (withoutReconstructed === norm1.normalizedId) return true
  }
  
  return false
}

/**
 * 调试工具：获取ID的详细信息
 */
export function debugIdInfo(id: string, context: string = ''): void {
  const result = normalizeImageId(id)
  console.log(`🔍 ID调试信息 ${context ? `(${context})` : ''}:`, {
    originalId: id,
    normalizedId: result.normalizedId,
    format: result.format,
    confidence: result.confidence,
    fallbackIds: result.fallbackIds
  })
}

/**
 * 批量ID调试工具
 */
export function debugIdMatching(id1: string, id2: string, context: string = ''): void {
  console.log(`🔍 ID匹配调试 ${context ? `(${context})` : ''}:`);
  debugIdInfo(id1, 'ID1')
  debugIdInfo(id2, 'ID2')
  console.log('匹配结果:', areIdsMatching(id1, id2))
}