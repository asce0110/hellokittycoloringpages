"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useAuth } from "./use-auth"

interface FavoriteItem {
  id: string
  userId: string
  libraryImageId?: string
  generationId?: string
  createdAt: Date
}

interface FavoriteStatus {
  isOnline: boolean
  mode: 'database' | 'fallback' | 'offline' | 'error' | 'development'
  lastError?: string
  lastUpdated?: Date
  troubleshooting?: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isLoading: boolean
  isFavorite: (libraryImageId?: string, generationId?: string) => boolean
  addToFavorites: (libraryImageId?: string, generationId?: string) => Promise<boolean>
  removeFromFavorites: (libraryImageId?: string, generationId?: string) => Promise<boolean>
  toggleFavorite: (libraryImageId?: string, generationId?: string) => Promise<boolean>
  refreshFavorites: () => Promise<void>
  isOnline: boolean
  status: FavoriteStatus
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEY = 'ai-kitty-favorites-cache'

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [status, setStatus] = useState<FavoriteStatus>({
    isOnline: true,
    mode: 'database',
    lastUpdated: new Date()
  })

  // Load cached favorites from localStorage
  const loadCachedFavorites = () => {
    if (typeof window === 'undefined') return []
    
    try {
      const cached = localStorage.getItem(STORAGE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        return parsed.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }))
      }
    } catch (error) {
      console.error('❌ Failed to load favorites cache:', error)
    }
    
    return []
  }

  // Save favorites to localStorage
  const saveFavoritesToCache = (favoritesToSave: FavoriteItem[]) => {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesToSave))
    } catch (error) {
      console.error('❌ Failed to save favorites cache:', error)
    }
  }

  // 从服务器获取收藏列表
  const fetchFavorites = async (): Promise<FavoriteItem[]> => {
    if (!user) {
      console.log('🔍 用户未登录，返回空收藏列表')
      return []
    }

    try {
      console.log('🔄 获取用户收藏列表...', { userId: user.id })
      
      const response = await fetch('/api/user/favorites', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json'
        }
      })
      
      // 🎯 首先检查HTTP状态码
      console.log('📡 API响应状态:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok
      })
      
      const data = await response.json()
      
      // 🎯 增强对503错误的处理
      if (response.status === 503) {
        console.warn('⚠️ 服务不可用 (503)，启用fallback模式:', {
          error: data.error,
          mode: data.mode,
          fallback: data.fallback,
          troubleshooting: data.troubleshooting
        })
        
        setIsOnline(false)
        
        // 🎯 更新详细状态信息
        setStatus({
          isOnline: false,
          mode: data.mode || 'fallback',
          lastError: data.error,
          lastUpdated: new Date(),
          troubleshooting: data.troubleshooting
        })
        
        const cachedFavorites = loadCachedFavorites()
        
        // 显示用户友好的提示信息
        if (data.mode === 'development') {
          console.info('🔧 开发模式提示:', data.troubleshooting)
        } else if (data.mode === 'fallback') {
          console.info('🔄 使用本地缓存，原因:', data.error)
        }
        
        return cachedFavorites
      }
      
      if (data.success && data.favorites) {
        console.log('✅ 成功获取收藏列表:', { 
          count: data.favorites.length,
          mode: data.mode || 'database'
        })
        
        setIsOnline(true) // 数据库模式下设置为在线
        
        // 🎯 更新成功状态
        setStatus({
          isOnline: true,
          mode: data.mode || 'database',
          lastUpdated: new Date()
        })
        
        // 转换数据格式
        const transformedFavorites = data.favorites.map((fav: any) => ({
          id: fav.id,
          userId: fav.user_id,
          libraryImageId: fav.library_image_id,
          generationId: fav.generation_id,
          createdAt: new Date(fav.created_at)
        }))
        
        return transformedFavorites
      } else if (data.fallback) {
        console.warn('⚠️ API返回fallback标志，使用缓存:', data.error)
        setIsOnline(false)
        setStatus({
          isOnline: false,
          mode: 'fallback',
          lastError: data.error,
          lastUpdated: new Date(),
          troubleshooting: data.troubleshooting
        })
        return loadCachedFavorites()
      } else {
        console.error('❌ 获取收藏列表失败，使用缓存:', data.error)
        setIsOnline(false)
        setStatus({
          isOnline: false,
          mode: 'offline',
          lastError: data.error,
          lastUpdated: new Date()
        })
        return loadCachedFavorites()
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      console.error('❌ 网络请求异常，使用缓存:', {
        error: errorMsg,
        stack: error instanceof Error ? error.stack : undefined
      })
      setIsOnline(false)
      setStatus({
        isOnline: false,
        mode: 'error',
        lastError: `Network error: ${errorMsg}`,
        lastUpdated: new Date(),
        troubleshooting: 'Please check your network connection or try again later'
      })
      return loadCachedFavorites()
    }
  }

  // 刷新收藏列表
  const refreshFavorites = async () => {
    if (!isAuthenticated) {
      setFavorites([])
      return
    }

    setIsLoading(true)
    try {
      const freshFavorites = await fetchFavorites()
      setFavorites(freshFavorites)
      saveFavoritesToCache(freshFavorites)
      
      if (freshFavorites.length > 0) {
        setIsOnline(true)
      }
    } catch (error) {
      console.error('❌ 刷新收藏列表失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 检查是否收藏
  const isFavorite = (libraryImageId?: string, generationId?: string): boolean => {
    return favorites.some(fav => 
      (libraryImageId && fav.libraryImageId === libraryImageId) ||
      (generationId && fav.generationId === generationId)
    )
  }

  // 添加收藏
  const addToFavorites = async (libraryImageId?: string, generationId?: string): Promise<boolean> => {
    if (!user) {
      console.log('🔐 User not logged in, need to guide to login')
      // Throw special error, let UI component handle login guidance
      throw new Error('LOGIN_REQUIRED')
    }

    if (!libraryImageId && !generationId) {
      console.error('❌ Must provide libraryImageId or generationId')
      return false
    }

    // 🔍 添加详细的ID调试信息
    console.log('🎯 addToFavorites 接收到的参数:', {
      libraryImageId,
      libraryImageIdType: typeof libraryImageId,
      libraryImageIdLength: libraryImageId?.length,
      isUuidFormat: libraryImageId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(libraryImageId) : false,
      generationId,
      generationIdType: typeof generationId,
      generationIdLength: generationId?.length,
      isGenerationIdUuidFormat: generationId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(generationId) : false
    })

    // 🛡️ 在发送API之前再次验证ID格式
    let finalLibraryImageId = libraryImageId
    let finalGenerationId = generationId
    
    if (libraryImageId) {
      const { isValid, safeId, error } = validateAndPrepareId(libraryImageId)
      if (!isValid) {
        throw new Error(`❌ addToFavorites final validation failed - invalid libraryImageId: ${error}`)
      }
      finalLibraryImageId = safeId
      console.log('🔄 addToFavorites 最终ID转换 (libraryImageId):', { 输入: libraryImageId, 输出: safeId })
    }
    
    if (generationId) {
      const { isValid, safeId, error } = validateAndPrepareId(generationId)
      if (!isValid) {
        throw new Error(`❌ addToFavorites final validation failed - invalid generationId: ${error}`)
      }
      finalGenerationId = safeId
      console.log('🔄 addToFavorites 最终ID转换 (generationId):', { 输入: generationId, 输出: safeId })
    }

    try {
      console.log('➕ 添加收藏 (最终发送到API的参数):', { 
        原始libraryImageId: libraryImageId,
        最终libraryImageId: finalLibraryImageId, 
        原始generationId: generationId,
        最终generationId: finalGenerationId
      })
      
      const response = await fetch('/api/user/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          libraryImageId: finalLibraryImageId,
          generationId: finalGenerationId
        })
      })
      
      const data = await response.json()
      
      // 🎯 修复：正确判断API成功情况
      if (data.success) {
        console.log('✅ 收藏添加成功 (数据库模式)')
        
        // 立即更新本地状态（使用最终的安全ID）
        const newFavorite: FavoriteItem = {
          id: `temp-${Date.now()}`, // 临时ID
          userId: user.id,
          libraryImageId: finalLibraryImageId,
          generationId: finalGenerationId,
          createdAt: new Date()
        }
        
        const updatedFavorites = [...favorites, newFavorite]
        setFavorites(updatedFavorites)
        saveFavoritesToCache(updatedFavorites)
        setIsOnline(true)
        
        // 🎯 发布收藏状态更新事件
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('favoritesUpdated', {
            detail: {
              libraryImageId: finalLibraryImageId,
              generationId: finalGenerationId,
              isFavorited: true,
              operation: 'add'
            }
          })
          window.dispatchEvent(event)
          console.log('📡 发布收藏添加事件:', event.detail)
        }
        
        return true
      } else if (data.fallback) {
        console.log('✅ 收藏添加成功 (fallback模式):', data.error)
        
        // 保存到本地缓存（使用最终的安全ID）
        const cachedFavorite: FavoriteItem = {
          id: `cached-${Date.now()}`,
          userId: user.id,
          libraryImageId: finalLibraryImageId,
          generationId: finalGenerationId,
          createdAt: new Date()
        }
        
        const updatedFavorites = [...favorites, cachedFavorite]
        setFavorites(updatedFavorites)
        saveFavoritesToCache(updatedFavorites)
        setIsOnline(false)
        
        // 🎯 发布收藏状态更新事件 (fallback模式)
        if (typeof window !== 'undefined') {
          const event = new CustomEvent('favoritesUpdated', {
            detail: {
              libraryImageId: finalLibraryImageId,
              generationId: finalGenerationId,
              isFavorited: true,
              operation: 'add',
              mode: 'fallback'
            }
          })
          window.dispatchEvent(event)
          console.log('📡 发布收藏添加事件 (fallback):', event.detail)
        }
        
        return true // fallback模式也是成功
      } else if (data.errorType === 'duplicate') {
        console.log('✅ 内容已在收藏夹中 (视为成功):', data.error)
        // 重复收藏不是错误，返回true
        return true
      } else {
        console.error('❌ 添加收藏真正失败:', data.error)
        // 🎯 只有在真正失败时才抛出错误
        throw new Error(data.error || 'Failed to add to favorites')
      }
    } catch (error) {
      console.error('❌ 网络错误，保存到本地缓存:', error)
      
      // 🎯 区分网络错误和真正的逻辑错误
      if (error instanceof Error && error.message.includes('addToFavorites最终验证失败')) {
        // 这是ID验证错误，直接抛出不做缓存
        throw error
      }
      
      // 网络错误时保存到本地缓存（使用最终的安全ID）
      const cachedFavorite: FavoriteItem = {
        id: `offline-${Date.now()}`,
        userId: user.id,
        libraryImageId: finalLibraryImageId,
        generationId: finalGenerationId,
        createdAt: new Date()
      }
      
      const updatedFavorites = [...favorites, cachedFavorite]
      setFavorites(updatedFavorites)
      saveFavoritesToCache(updatedFavorites)
      setIsOnline(false)
      
      // 🎯 发布收藏状态更新事件 (网络错误但本地成功)
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('favoritesUpdated', {
          detail: {
            libraryImageId: finalLibraryImageId,
            generationId: finalGenerationId,
            isFavorited: true,
            operation: 'add',
            mode: 'offline'
          }
        })
        window.dispatchEvent(event)
        console.log('📡 发布收藏添加事件 (offline):', event.detail)
      }
      
      console.log('✅ 网络错误但本地缓存成功')
      return true // 本地操作成功
    }
  }

  // 移除收藏
  const removeFromFavorites = async (libraryImageId?: string, generationId?: string): Promise<boolean> => {
    if (!user) {
      console.log('🔐 用户未登录，需要引导登录')
      // 抛出特殊错误，让UI组件处理登录引导
      throw new Error('LOGIN_REQUIRED')
    }

    if (!libraryImageId && !generationId) {
      console.error('❌ Must provide libraryImageId or generationId')
      return false
    }

    try {
      console.log('➖ 移除收藏:', { libraryImageId, generationId })
      
      const response = await fetch('/api/user/favorites', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          libraryImageId,
          generationId
        })
      })
      
      const data = await response.json()
      
      if (data.success) {
        console.log('✅ 收藏移除成功')
        setIsOnline(true)
      } else if (data.fallback) {
        console.warn('⚠️ 数据库连接失败，仅从本地缓存移除:', data.error)
        setIsOnline(false)
      } else {
        console.error('❌ 移除收藏失败:', data.error)
      }
      
      // 无论服务器操作是否成功，都从本地状态移除
      const updatedFavorites = favorites.filter(fav => 
        !((libraryImageId && fav.libraryImageId === libraryImageId) ||
          (generationId && fav.generationId === generationId))
      )
      
      setFavorites(updatedFavorites)
      saveFavoritesToCache(updatedFavorites)
      
      // 🎯 发布收藏状态更新事件 (移除成功)
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('favoritesUpdated', {
          detail: {
            libraryImageId,
            generationId,
            isFavorited: false,
            operation: 'remove',
            mode: data.success ? 'database' : 'fallback'
          }
        })
        window.dispatchEvent(event)
        console.log('📡 发布收藏移除事件:', event.detail)
      }
      
      return data.success || data.fallback // 服务器成功或fallback模式都算成功
    } catch (error) {
      console.error('❌ 网络错误，仅从本地缓存移除:', error)
      
      // 网络错误时仅从本地移除
      const updatedFavorites = favorites.filter(fav => 
        !((libraryImageId && fav.libraryImageId === libraryImageId) ||
          (generationId && fav.generationId === generationId))
      )
      
      setFavorites(updatedFavorites)
      saveFavoritesToCache(updatedFavorites)
      setIsOnline(false)
      
      // 🎯 发布收藏状态更新事件 (网络错误但本地移除成功)
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('favoritesUpdated', {
          detail: {
            libraryImageId,
            generationId,
            isFavorited: false,
            operation: 'remove',
            mode: 'offline'
          }
        })
        window.dispatchEvent(event)
        console.log('📡 发布收藏移除事件 (offline):', event.detail)
      }
      
      return true // 本地操作成功
    }
  }

  // 🎯 统一的ID格式验证和防护 (与Library页面保持完全一致)
  const validateAndPrepareId = (id?: string): { isValid: boolean; safeId?: string; error?: string } => {
    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return { isValid: false, error: 'ID cannot be empty or invalid' }
    }
    
    const cleanId = id.trim()
    console.log('🔍 validateAndPrepareId 接收ID:', { 
      原始ID: id, 
      清理后ID: cleanId,
      type: typeof cleanId, 
      length: cleanId.length 
    })
    
    // 1. UUID格式检查（最高优先级）
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (uuidPattern.test(cleanId)) {
      console.log('✅ validateAndPrepareId 检测到有效UUID格式:', cleanId)
      return { isValid: true, safeId: cleanId }
    }
    
    // 2. Demo格式检查（已经是正确格式）
    if (cleanId.startsWith('demo-') && cleanId.length > 5) {
      console.log('✅ validateAndPrepareId 检测到有效demo格式:', cleanId)
      return { isValid: true, safeId: cleanId }
    }
    
    // 3. 纯数字转换为demo格式
    if (/^\d+$/.test(cleanId)) {
      const safeId = `demo-${cleanId}`
      console.log('🔄 validateAndPrepareId 数字转换为demo格式:', { 原始: cleanId, 转换后: safeId })
      return { isValid: true, safeId }
    }
    
    // 4. ❌ 完全无效的格式 - 拒绝处理
    console.error('❌ validateAndPrepareId 检测到无效ID格式:', {
      id: cleanId,
      length: cleanId.length,
      startsWithDemo: cleanId.startsWith('demo-'),
      isNumeric: /^\d+$/.test(cleanId),
      isUuid: uuidPattern.test(cleanId)
    })
    
    return { 
      isValid: false, 
      error: `Invalid ID format: "${cleanId}" - must be UUID format or demo-number format` 
    }
  }

  // 切换收藏状态
  const toggleFavorite = async (libraryImageId?: string, generationId?: string): Promise<boolean> => {
    // 🔍 详细调试: toggleFavorite 接收的参数
    console.log('🔄 toggleFavorite 接收到的原始参数:', {
      libraryImageId,
      libraryImageIdType: typeof libraryImageId,
      isOriginalUuid: libraryImageId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(libraryImageId) : false,
      generationId,
      generationIdType: typeof generationId,
      callerStack: new Error().stack?.split('\n').slice(1, 3).join(' -> ')
    })
    
    // 🎯 验证ID格式
    let safeLibraryImageId = libraryImageId
    let safeGenerationId = generationId
    
    if (libraryImageId) {
      const { isValid, safeId, error } = validateAndPrepareId(libraryImageId)
      console.log('🔍 toggleFavorite ID验证结果:', {
        原始ID: libraryImageId,
        安全ID: safeId,
        是否有效: isValid,
        错误信息: error
      })
      if (!isValid) {
        throw new Error(`Library image ID invalid: ${error}`)
      }
      if (error) {
        console.warn(`⚠️ 库图片ID格式警告: ${error}`)
      }
      safeLibraryImageId = safeId
      console.log('✅ toggleFavorite 转换后的safeLibraryImageId:', safeLibraryImageId)
    }
    
    if (generationId) {
      const { isValid, safeId, error } = validateAndPrepareId(generationId)
      if (!isValid) {
        throw new Error(`Generation image ID invalid: ${error}`)
      }
      if (error) {
        console.warn(`⚠️ 生成图片ID格式警告: ${error}`)
      }
      safeGenerationId = safeId
    }
    
    const currentlyFavorited = isFavorite(safeLibraryImageId, safeGenerationId)
    
    console.log(`🔄 切换收藏状态:`, {
      原始库图片ID: libraryImageId,
      安全库图片ID: safeLibraryImageId,
      原始生成ID: generationId,
      安全生成ID: safeGenerationId,
      currentlyFavorited,
      action: currentlyFavorited ? 'remove' : 'add'
    })
    
    try {
      if (currentlyFavorited) {
        console.log('🗑️ toggleFavorite 调用 removeFromFavorites:', { safeLibraryImageId, safeGenerationId })
        return await removeFromFavorites(safeLibraryImageId, safeGenerationId)
      } else {
        console.log('➕ toggleFavorite 调用 addToFavorites:', { safeLibraryImageId, safeGenerationId })
        return await addToFavorites(safeLibraryImageId, safeGenerationId)
      }
    } catch (error) {
      // 🎯 不要在这里处理错误，让它冒泡到调用组件
      console.error(`❌ 收藏切换失败:`, {
        原始库图片ID: libraryImageId,
        安全库图片ID: safeLibraryImageId,
        原始生成ID: generationId,
        安全生成ID: safeGenerationId,
        error
      })
      throw error
    }
  }

  // 用户登录状态变化时重新加载收藏
  useEffect(() => {
    if (isAuthenticated && user) {
      refreshFavorites()
    } else {
      setFavorites([])
    }
  }, [isAuthenticated, user?.id])

  const value: FavoritesContextType = {
    favorites,
    isLoading,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    refreshFavorites,
    isOnline,
    status
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error("useFavorites must be used within a FavoritesProvider")
  }
  return context
}