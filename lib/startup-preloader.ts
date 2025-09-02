// 服务启动预加载器
import { simplePreload } from './simple-preloader'

let preloadStarted = false
let preloadPromise: Promise<void> | null = null

/**
 * 启动时触发预加载
 * 确保只执行一次，避免重复预加载
 */
export function triggerStartupPreload(): Promise<void> {
  if (preloadStarted) {
    return preloadPromise || Promise.resolve()
  }

  preloadStarted = true
  console.log('🚀 触发服务启动预加载...')

  preloadPromise = (async () => {
    try {
      // 延迟启动，避免影响服务器启动性能
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // 执行SEO映射预加载
      await simplePreload()
      
      console.log('✅ 服务启动预加载完成')
    } catch (error) {
      console.error('❌ 服务启动预加载失败:', error)
    }
  })()

  return preloadPromise
}

/**
 * 检查预加载状态
 */
export function getPreloadStatus(): {
  started: boolean
  completed: boolean
  promise: Promise<void> | null
} {
  return {
    started: preloadStarted,
    completed: preloadPromise !== null,
    promise: preloadPromise
  }
}
