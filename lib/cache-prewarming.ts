/**
 * 缓存预热系统
 * 提前加载热门和重要的路由数据，提升首次访问体验
 */

import { getSeoUrlMapping } from './seo-url-storage'
import routeMonitor from './route-monitoring'

type PrewarmConfig = {
  enabled: boolean
  popularRoutes: string[]
  batchSize: number
  delayBetweenBatches: number
  retryAttempts: number
}

class CachePrewarmer {
  private config: PrewarmConfig = {
    enabled: process.env.NODE_ENV === 'production',
    popularRoutes: [],
    batchSize: 5,
    delayBetweenBatches: 1000, // 1秒
    retryAttempts: 3
  }
  
  private isWarming = false
  private warmingPromise: Promise<void> | null = null

  constructor() {
    // 自动从SEO缓存中提取流行路由
    this.updatePopularRoutes()
    
    // 定期更新流行路由列表
    if (typeof window === 'undefined') { // 仅在服务端
      setInterval(() => {
        this.updatePopularRoutes()
      }, 30 * 60 * 1000) // 30分钟更新一次
    }
  }

  // 更新流行路由列表
  private async updatePopularRoutes() {
    try {
      // 从监控系统获取热门路由
      const metrics = routeMonitor.getMetrics()
      const popularFromMetrics = metrics.popularSlugs.map(s => s.slug)

      // 从SEO缓存获取默认路由
      const fs = require('fs')
      if (fs.existsSync('.seo-url-cache.json')) {
        const cacheData = JSON.parse(fs.readFileSync('.seo-url-cache.json', 'utf8'))
        const allRoutes = Object.keys(cacheData)
        
        // 合并热门路由和所有路由的前几个
        this.config.popularRoutes = [
          ...new Set([
            ...popularFromMetrics,
            ...allRoutes.slice(0, 10) // 取前10个作为默认预热
          ])
        ]
        
        console.log('📈 更新预热路由列表:', {
          fromMetrics: popularFromMetrics.length,
          fromCache: allRoutes.length,
          final: this.config.popularRoutes.length
        })
      }
    } catch (error) {
      console.warn('⚠️ 更新预热路由列表失败:', error)
    }
  }

  // 启动缓存预热
  async startPrewarming(): Promise<void> {
    if (!this.config.enabled || this.isWarming) {
      return this.warmingPromise || Promise.resolve()
    }

    console.log('🔥 开始缓存预热...')
    this.isWarming = true

    this.warmingPromise = this.performPrewarming()
    
    try {
      await this.warmingPromise
      console.log('✅ 缓存预热完成')
    } catch (error) {
      console.error('❌ 缓存预热失败:', error)
    } finally {
      this.isWarming = false
      this.warmingPromise = null
    }
  }

  // 执行预热过程
  private async performPrewarming(): Promise<void> {
    const routes = [...this.config.popularRoutes]
    
    // 分批处理
    for (let i = 0; i < routes.length; i += this.config.batchSize) {
      const batch = routes.slice(i, i + this.config.batchSize)
      
      console.log(`🔥 预热批次 ${Math.floor(i / this.config.batchSize) + 1}/${Math.ceil(routes.length / this.config.batchSize)}:`, batch)
      
      // 并行处理批次内的路由
      await Promise.all(
        batch.map(slug => this.prewarmRoute(slug))
      )
      
      // 批次间延迟
      if (i + this.config.batchSize < routes.length) {
        await this.delay(this.config.delayBetweenBatches)
      }
    }
  }

  // 预热单个路由
  private async prewarmRoute(slug: string, attempt = 1): Promise<void> {
    try {
      // 预热SEO缓存
      const seoData = await getSeoUrlMapping(slug)
      if (seoData) {
        console.log(`🌡️ 预热SEO缓存: ${slug} → ${seoData.title}`)
      } else {
        console.log(`⚠️ 预热失败，未找到SEO数据: ${slug}`)
      }

      // 可以扩展：预热其他相关数据
      // - 图片预加载
      // - 相关推荐计算
      // - 用户偏好数据等

    } catch (error) {
      if (attempt < this.config.retryAttempts) {
        console.log(`🔄 预热重试 ${attempt + 1}/${this.config.retryAttempts}: ${slug}`)
        await this.delay(1000 * attempt) // 递增延迟
        return this.prewarmRoute(slug, attempt + 1)
      } else {
        console.error(`❌ 预热最终失败: ${slug}`, error)
      }
    }
  }

  // 智能预热：基于访问模式
  async intelligentPrewarm(): Promise<void> {
    if (!this.config.enabled) return

    console.log('🧠 启动智能预热...')
    
    try {
      // 获取最近访问的路由
      const metrics = routeMonitor.getMetrics()
      const recentPopular = metrics.popularSlugs.slice(0, 5)
      
      // 预测可能访问的相关路由
      const predictedRoutes = this.predictRelatedRoutes(recentPopular.map(r => r.slug))
      
      // 预热预测路由
      for (const slug of predictedRoutes) {
        await this.prewarmRoute(slug)
        await this.delay(500) // 短延迟
      }
      
      console.log('✅ 智能预热完成')
    } catch (error) {
      console.error('❌ 智能预热失败:', error)
    }
  }

  // 预测相关路由（基于标题相似性和类别）
  private predictRelatedRoutes(baseSlugs: string[]): string[] {
    try {
      const fs = require('fs')
      if (!fs.existsSync('.seo-url-cache.json')) return []

      const cacheData = JSON.parse(fs.readFileSync('.seo-url-cache.json', 'utf8'))
      const allEntries = Object.entries(cacheData)
      
      const predicted: string[] = []
      
      for (const baseSlug of baseSlugs) {
        const baseEntry = cacheData[baseSlug]
        if (!baseEntry) continue
        
        // 找相似的路由
        const similar = allEntries
          .filter(([slug, data]: [string, any]) => {
            if (slug === baseSlug) return false
            
            // 基于标题关键词相似性
            const baseWords = new Set(baseEntry.title.toLowerCase().split(' '))
            const currentWords = new Set(data.title.toLowerCase().split(' '))
            const commonWords = [...baseWords].filter(word => currentWords.has(word))
            
            return commonWords.length >= 2 // 至少2个共同词
          })
          .slice(0, 2) // 每个基础路由最多预测2个相关路由
          .map(([slug]) => slug)
        
        predicted.push(...similar)
      }
      
      return [...new Set(predicted)] // 去重
    } catch (error) {
      console.warn('⚠️ 预测相关路由失败:', error)
      return []
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 获取预热状态
  getStatus() {
    return {
      enabled: this.config.enabled,
      isWarming: this.isWarming,
      routeCount: this.config.popularRoutes.length,
      routes: this.config.popularRoutes.slice(0, 5) // 只显示前5个
    }
  }

  // 手动添加路由到预热列表
  addRouteToPrewarm(slug: string) {
    if (!this.config.popularRoutes.includes(slug)) {
      this.config.popularRoutes.unshift(slug) // 添加到开头
      console.log(`➕ 添加路由到预热列表: ${slug}`)
    }
  }

  // 配置预热参数
  configure(newConfig: Partial<PrewarmConfig>) {
    this.config = { ...this.config, ...newConfig }
    console.log('⚙️ 缓存预热配置已更新:', this.config)
  }
}

// 全局预热器实例
const cachePrewarmer = new CachePrewarmer()

// 在服务启动时自动预热
if (typeof window === 'undefined') {
  // 延迟启动，让其他系统先初始化
  setTimeout(() => {
    cachePrewarmer.startPrewarming()
  }, 5000) // 5秒后开始预热
  
  // 每小时进行一次智能预热
  setInterval(() => {
    cachePrewarmer.intelligentPrewarm()
  }, 60 * 60 * 1000)
}

export default cachePrewarmer