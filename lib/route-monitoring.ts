/**
 * 路由监控和错误日志系统
 * 用于跟踪和诊断路由问题
 */

type RouteEvent = {
  timestamp: number
  slug: string
  type: 'access' | 'not_found' | 'seo_cache_hit' | 'seo_cache_miss' | 'library_match' | 'error'
  details?: any
  userAgent?: string
  ip?: string
}

type RouteMetrics = {
  totalAccesses: number
  notFoundCount: number
  seoCacheHitRate: number
  averageResponseTime: number
  errorCount: number
  popularSlugs: Array<{ slug: string; count: number }>
}

class RouteMonitor {
  private events: RouteEvent[] = []
  private readonly maxEvents = 1000 // 保留最近1000个事件
  private readonly metricsWindow = 24 * 60 * 60 * 1000 // 24小时指标窗口

  // 记录路由访问事件
  logRouteAccess(slug: string, userAgent?: string, ip?: string) {
    this.addEvent({
      timestamp: Date.now(),
      slug,
      type: 'access',
      userAgent,
      ip
    })
  }

  // 记录404事件
  logNotFound(slug: string, details?: any, userAgent?: string) {
    this.addEvent({
      timestamp: Date.now(),
      slug,
      type: 'not_found',
      details,
      userAgent
    })
    
    console.warn('🚫 路由404:', {
      slug,
      timestamp: new Date().toISOString(),
      details,
      userAgent: userAgent?.substring(0, 100) // 截断用户代理
    })
  }

  // 记录SEO缓存命中
  logSeoCacheHit(slug: string, title: string) {
    this.addEvent({
      timestamp: Date.now(),
      slug,
      type: 'seo_cache_hit',
      details: { title }
    })
  }

  // 记录SEO缓存未命中
  logSeoCacheMiss(slug: string) {
    this.addEvent({
      timestamp: Date.now(),
      slug,
      type: 'seo_cache_miss'
    })
    
    console.info('📊 SEO缓存未命中:', {
      slug,
      timestamp: new Date().toISOString(),
      suggestion: '考虑预热此路由或检查缓存键格式'
    })
  }

  // 记录库数据匹配
  logLibraryMatch(slug: string, imageId: string, title: string) {
    this.addEvent({
      timestamp: Date.now(),
      slug,
      type: 'library_match',
      details: { imageId, title }
    })
  }

  // 记录错误事件
  logError(slug: string, error: Error, context?: any) {
    this.addEvent({
      timestamp: Date.now(),
      slug,
      type: 'error',
      details: {
        message: error.message,
        stack: error.stack?.substring(0, 500), // 截断堆栈跟踪
        context
      }
    })
    
    console.error('💥 路由错误:', {
      slug,
      error: error.message,
      timestamp: new Date().toISOString(),
      context
    })
  }

  // 添加事件到队列
  private addEvent(event: RouteEvent) {
    this.events.push(event)
    
    // 保持队列大小
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }
  }

  // 获取路由指标
  getMetrics(): RouteMetrics {
    const now = Date.now()
    const windowStart = now - this.metricsWindow
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart)

    const totalAccesses = recentEvents.filter(e => e.type === 'access').length
    const notFoundCount = recentEvents.filter(e => e.type === 'not_found').length
    const seoCacheHits = recentEvents.filter(e => e.type === 'seo_cache_hit').length
    const seoCacheMisses = recentEvents.filter(e => e.type === 'seo_cache_miss').length
    const errorCount = recentEvents.filter(e => e.type === 'error').length

    // 计算热门slug
    const slugCounts = recentEvents
      .filter(e => e.type === 'access')
      .reduce((acc, event) => {
        acc[event.slug] = (acc[event.slug] || 0) + 1
        return acc
      }, {} as Record<string, number>)

    const popularSlugs = Object.entries(slugCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([slug, count]) => ({ slug, count }))

    return {
      totalAccesses,
      notFoundCount,
      seoCacheHitRate: seoCacheHits + seoCacheMisses > 0 
        ? seoCacheHits / (seoCacheHits + seoCacheMisses) 
        : 0,
      averageResponseTime: 0, // TODO: 实现响应时间跟踪
      errorCount,
      popularSlugs
    }
  }

  // 获取最近的404事件
  getRecentNotFound(limit = 10): RouteEvent[] {
    return this.events
      .filter(e => e.type === 'not_found')
      .slice(-limit)
      .reverse()
  }

  // 获取错误事件
  getRecentErrors(limit = 10): RouteEvent[] {
    return this.events
      .filter(e => e.type === 'error')
      .slice(-limit)
      .reverse()
  }

  // 生成健康报告
  generateHealthReport(): string {
    const metrics = this.getMetrics()
    const recent404s = this.getRecentNotFound(5)
    const recentErrors = this.getRecentErrors(3)

    let report = '🏥 路由系统健康报告\n'
    report += '=' .repeat(50) + '\n\n'

    // 基本指标
    report += '📊 基本指标 (24小时):\n'
    report += `• 总访问量: ${metrics.totalAccesses}\n`
    report += `• 404错误: ${metrics.notFoundCount}\n`
    report += `• 系统错误: ${metrics.errorCount}\n`
    report += `• SEO缓存命中率: ${(metrics.seoCacheHitRate * 100).toFixed(1)}%\n\n`

    // 健康状态
    const healthScore = this.calculateHealthScore(metrics)
    report += `💗 健康得分: ${healthScore}/100\n`
    
    if (healthScore >= 90) {
      report += '✅ 系统运行良好\n\n'
    } else if (healthScore >= 70) {
      report += '⚠️  系统需要关注\n\n'
    } else {
      report += '🚨 系统存在问题，需要立即处理\n\n'
    }

    // 热门路由
    if (metrics.popularSlugs.length > 0) {
      report += '🔥 热门路由:\n'
      metrics.popularSlugs.slice(0, 5).forEach(({ slug, count }) => {
        report += `• ${slug}: ${count} 次访问\n`
      })
      report += '\n'
    }

    // 最近404
    if (recent404s.length > 0) {
      report += '🚫 最近404错误:\n'
      recent404s.forEach(event => {
        const time = new Date(event.timestamp).toLocaleTimeString()
        report += `• [${time}] ${event.slug}\n`
      })
      report += '\n'
    }

    // 最近错误
    if (recentErrors.length > 0) {
      report += '💥 最近系统错误:\n'
      recentErrors.forEach(event => {
        const time = new Date(event.timestamp).toLocaleTimeString()
        const message = event.details?.message || 'Unknown error'
        report += `• [${time}] ${event.slug}: ${message}\n`
      })
      report += '\n'
    }

    // 建议
    report += '💡 优化建议:\n'
    if (metrics.notFoundCount > metrics.totalAccesses * 0.1) {
      report += '• 404率较高，检查URL生成逻辑和SEO缓存\n'
    }
    if (metrics.seoCacheHitRate < 0.8) {
      report += '• SEO缓存命中率较低，考虑预热常用路由\n'
    }
    if (metrics.errorCount > 0) {
      report += '• 存在系统错误，检查错误日志并修复\n'
    }
    
    return report
  }

  // 计算健康得分
  private calculateHealthScore(metrics: RouteMetrics): number {
    let score = 100

    // 404率扣分
    const notFoundRate = metrics.totalAccesses > 0 ? metrics.notFoundCount / metrics.totalAccesses : 0
    if (notFoundRate > 0.05) score -= 20 // 5%以上404率
    if (notFoundRate > 0.1) score -= 20  // 10%以上404率

    // 错误率扣分
    const errorRate = metrics.totalAccesses > 0 ? metrics.errorCount / metrics.totalAccesses : 0
    if (errorRate > 0.01) score -= 30 // 1%以上错误率
    if (errorRate > 0.05) score -= 30 // 5%以上错误率

    // 缓存命中率扣分
    if (metrics.seoCacheHitRate < 0.9) score -= 10
    if (metrics.seoCacheHitRate < 0.7) score -= 15

    return Math.max(0, score)
  }

  // 清理旧数据
  cleanup() {
    const cutoff = Date.now() - this.metricsWindow
    this.events = this.events.filter(e => e.timestamp >= cutoff)
  }
}

// 全局监控实例
const routeMonitor = new RouteMonitor()

// 定期清理数据
if (typeof window === 'undefined') { // 仅在服务端运行
  setInterval(() => {
    routeMonitor.cleanup()
  }, 60 * 60 * 1000) // 每小时清理一次
}

export default routeMonitor