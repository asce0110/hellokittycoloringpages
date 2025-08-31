// SEO URL存储服务 - 服务器端映射管理
type SeoUrlData = {
  imageUrl: string
  title: string
  description: string
  timestamp: number
  originalId?: string
  libraryImageId?: string // 用于浏览量追踪的真实图片ID
}

// 内存存储 + 文件持久化 (生产环境应该用Redis或数据库)
const seoUrlMap = new Map<string, SeoUrlData>()

// 文件持久化路径 (开发环境使用)
const STORAGE_FILE = './.seo-url-cache.json'

// 清理过期数据 (24小时过期) - 移动到顶部避免TDZ错误
const EXPIRY_TIME = 24 * 60 * 60 * 1000 // 24小时

// 加载现有数据
function loadStorageFromFile() {
  if (typeof window !== 'undefined') return // 只在服务端运行
  
  try {
    const fs = require('fs')
    const path = require('path')
    const fullPath = path.resolve(STORAGE_FILE)
    
    console.log(`🔍 尝试加载SEO缓存: ${fullPath}`)
    
    if (fs.existsSync(fullPath)) {
      const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'))
      const now = Date.now()
      let loadedCount = 0
      
      for (const [slug, entry] of Object.entries(data as Record<string, SeoUrlData>)) {
        // 只加载未过期的数据
        if (now - entry.timestamp < EXPIRY_TIME) {
          seoUrlMap.set(slug, entry)
          loadedCount++
        }
      }
      console.log(`✅ SEO缓存已加载: ${loadedCount}/${Object.keys(data).length} 个有效映射`)
      return loadedCount
    } else {
      console.log(`📄 SEO缓存文件不存在，将在首次存储时创建`)
      return 0
    }
  } catch (error) {
    console.error('❌ SEO缓存加载失败:', error)
    return 0
  }
}

// 保存数据到文件
function saveStorageToFile() {
  if (typeof window !== 'undefined') return // 只在服务端运行
  
  try {
    const fs = require('fs')
    const path = require('path')
    const fullPath = path.resolve(STORAGE_FILE)
    
    const data = Object.fromEntries(seoUrlMap.entries())
    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2))
    console.log(`💾 SEO缓存已保存: ${Object.keys(data).length} 个映射 → ${fullPath}`)
    return true
  } catch (error) {
    console.error('❌ SEO缓存保存失败:', error)
    return false
  }
}

// 启动时加载数据 - 延迟执行以确保所有变量已初始化
let isInitialized = false

function initializeStorage() {
  if (!isInitialized) {
    try {
      loadStorageFromFile()
      isInitialized = true
      console.log('✅ SEO缓存系统初始化完成')
    } catch (error) {
      console.error('❌ SEO缓存系统初始化失败:', error)
      isInitialized = true // 设置为true以避免重复尝试
    }
  }
}

// 使用 setTimeout 延迟初始化，确保模块完全加载
setTimeout(initializeStorage, 0)

// 定时清理过期数据 - 只有在初始化后才开始
setTimeout(() => {
  setInterval(() => {
    if (!isInitialized) return // 未初始化时跳过
    
    const now = Date.now()
    let deletedCount = 0
    for (const [slug, data] of seoUrlMap.entries()) {
      if (now - data.timestamp > EXPIRY_TIME) {
        seoUrlMap.delete(slug)
        console.log('🗑️ 清理过期SEO URL映射:', slug)
        deletedCount++
      }
    }
    
    if (deletedCount > 0) {
      console.log(`🧹 SEO缓存清理完成: 删除了 ${deletedCount} 个过期映射`)
      saveStorageToFile() // 更新文件
    }
  }, 60 * 60 * 1000) // 每小时清理一次
}, 5000) // 延迟5秒开始，确保系统完全启动

export function storeSeoUrlMapping(slug: string, data: SeoUrlData): void {
  // 确保系统已初始化
  if (!isInitialized) {
    initializeStorage()
  }
  
  // 确保先加载现有数据（避免覆盖）
  if (seoUrlMap.size === 0 && isInitialized) {
    loadStorageFromFile()
  }
  
  // 🎯 修复: 标准化存储键格式，移除随机数字并统一格式
  const normalizedSlug = normalizeSlugForStorage(slug)
  
  const mappingData = {
    ...data,
    timestamp: Date.now()
  }
  
  // 🔄 检查是否已存在相同内容（基于标题和图片URL）
  const existingEntry = findExistingMapping(data.title, data.imageUrl)
  if (existingEntry) {
    console.log('🔄 发现重复内容，更新现有映射:', {
      existingSlug: existingEntry.slug,
      newSlug: normalizedSlug,
      title: data.title
    })
    // 删除旧的重复条目
    seoUrlMap.delete(existingEntry.slug)
  }
  
  seoUrlMap.set(normalizedSlug, mappingData)
  console.log('💾 存储SEO URL映射:', { 
    originalSlug: slug,
    normalizedSlug: normalizedSlug,
    title: data.title, 
    totalMappings: seoUrlMap.size 
  })
  
  // 立即持久化到文件
  const saved = saveStorageToFile()
  if (!saved) {
    console.error('❌ SEO映射存储失败，可能导致后续查询失败')
  }
}

export function getSeoUrlMapping(slug: string): SeoUrlData | null {
  // 确保系统已初始化
  if (!isInitialized) {
    initializeStorage()
  }
  
  // 🔥 关键修复: 每次查询时确保数据已加载
  if (seoUrlMap.size === 0 && isInitialized) {
    console.log('🔄 内存为空，重新加载SEO缓存...')
    loadStorageFromFile()
  }
  
  // 🎯 修复: 处理不同的缓存键格式
  const normalizedSlug = normalizeSlugForLookup(slug)
  console.log(`🔍 查找SEO映射: 原始slug="${slug}" → 标准化slug="${normalizedSlug}"`)
  
  // 尝试多种可能的键格式
  let data = seoUrlMap.get(normalizedSlug)
  
  if (!data) {
    // 尝试其他可能的格式
    const alternativeFormats = [
      slug, // 原始格式
      `/${slug}`, // 带前缀格式（已移除/color前缀）
      slug.replace(/^\/color\//, ''), // 移除前缀格式
      // 处理旧格式URL（带6位数字）
      ...generateLegacySlugVariants(slug)
    ]
    
    for (const format of alternativeFormats) {
      data = seoUrlMap.get(format)
      if (data) {
        console.log(`✅ 通过备选格式找到SEO映射: "${format}" → ${data.title}`)
        break
      }
    }
  }
  
  if (!data) {
    console.log(`❌ SEO映射未找到: ${slug}`)
    console.log(`📊 当前缓存中的键:`, Array.from(seoUrlMap.keys()).slice(0, 5))
    return null
  }
  
  // 检查是否过期
  if (Date.now() - data.timestamp > EXPIRY_TIME) {
    console.log(`⏰ SEO映射已过期: ${slug}`)
    seoUrlMap.delete(normalizedSlug)
    saveStorageToFile() // 更新文件
    return null
  }
  
  console.log(`✅ SEO映射找到: ${slug} → ${data.title}`)
  return data
}

// 标准化slug用于查找
function normalizeSlugForLookup(slug: string): string {
  // 移除开头的 /color/ 前缀（如果存在）
  let normalized = slug.replace(/^\/color\//, '')
  
  // 🎯 关键修复: 查找时也要移除随机数字后缀以匹配标准化的缓存键
  normalized = normalized.replace(/-\d{6}$/, '')
  
  // 确保不是以连字符开头或结尾
  normalized = normalized.replace(/^-+|-+$/g, '')
  
  return normalized
}

// 生成可能的旧格式变体
function generateLegacySlugVariants(slug: string): string[] {
  const variants: string[] = []
  const baseSlug = normalizeSlugForLookup(slug)
  
  // 为了向后兼容，检查是否存在带随机数字的旧格式
  for (const [key] of seoUrlMap.entries()) {
    // 检查是否是旧格式且匹配基础部分
    if (key.includes(baseSlug) && /\d{6}$/.test(key)) {
      variants.push(key)
    }
  }
  
  // 如果输入本身包含6位数字，尝试移除数字后查找
  if (/\d{6}$/.test(slug)) {
    const withoutDigits = slug.replace(/-\d{6}$/, '')
    variants.push(withoutDigits)
  }
  
  return variants
}

// 标准化slug用于存储
function normalizeSlugForStorage(slug: string): string {
  // 处理旧的/color/前缀（现在已改为根路径）
  let normalized = slug.replace(/^\/color\//, '')
  
  // 移除6位随机数字后缀（如果存在）
  normalized = normalized.replace(/-\d{6}$/, '')
  
  // 确保格式一致
  normalized = normalized.replace(/^-+|-+$/g, '')
  
  return normalized
}

// 查找现有的相同内容映射
function findExistingMapping(title: string, imageUrl: string): { slug: string; data: SeoUrlData } | null {
  for (const [slug, data] of seoUrlMap.entries()) {
    if (data.title === title && data.imageUrl === imageUrl) {
      return { slug, data }
    }
  }
  return null
}

export function getAllSeoMappings(): Array<{ slug: string; data: SeoUrlData }> {
  return Array.from(seoUrlMap.entries()).map(([slug, data]) => ({ slug, data }))
}

export function clearSeoUrlMapping(slug: string): boolean {
  return seoUrlMap.delete(slug)
}

export function getStorageStats() {
  return {
    totalMappings: seoUrlMap.size,
    memoryUsage: JSON.stringify(Array.from(seoUrlMap.entries())).length
  }
}