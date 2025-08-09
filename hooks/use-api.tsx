"use client"

import { useState, useEffect } from 'react'
import { 
  DashboardStats, 
  User, 
  GenerationHistory, 
  LibraryImage, 
  BannerImage, 
  PricingPlan, 
  SystemSetting,
  UserFavorite,
  PaginatedResponse,
  ApiResponse 
} from '@/lib/types'
import {
  getDemoAdminStats,
  getDemoUsers,
  getDemoLibraryImages,
  getDemoBanners,
  getDemoPricingPlans,
  getDemoSystemSettings,
  getDemoUserGenerations,
  getDemoUserFavorites,
  demoSystemSettings
} from '@/lib/demo-data'

// Admin hooks
export function useAdminStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchStats = async () => {
    try {
      setLoading(true)
      const data = await getDemoAdminStats()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  return { stats, loading, error, refetch: fetchStats }
}

export function useAdminUsers(page = 1, limit = 10) {
  const [users, setUsers] = useState<PaginatedResponse<User> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await getDemoUsers(page, limit)
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchUsers()
  }, [page, limit])
  
  return { users, loading, error, refetch: fetchUsers }
}

export function useAdminLibraryImages(page = 1, limit = 12) {
  const [images, setImages] = useState<PaginatedResponse<LibraryImage> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchImages = async () => {
    try {
      setLoading(true)
      
      // 使用真实的API路由
      const response = await fetch(`/api/admin/library-images?page=${page}&limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setImages(data)
      setError(null)
    } catch (err) {
      console.error('Failed to fetch library images:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch library images')
      
      // 如果 API 失败，回退到demo数据
      try {
        const fallbackData = await getDemoLibraryImages(page, limit)
        setImages(fallbackData)
      } catch (fallbackErr) {
        console.error('Fallback to demo data also failed:', fallbackErr)
      }
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchImages()
  }, [page, limit])
  
  return { images, loading, error, refetch: fetchImages }
}

export function useAdminBanners() {
  const [banners, setBanners] = useState<BannerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchBanners = async () => {
    try {
      setLoading(true)
      const data = await getDemoBanners()
      setBanners(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch banners')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchBanners()
  }, [])
  
  return { banners, loading, error, refetch: fetchBanners }
}

export function useAdminPricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const data = await getDemoPricingPlans()
      setPlans(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pricing plans')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchPlans()
  }, [])
  
  return { plans, loading, error, refetch: fetchPlans }
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<SystemSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchSettings = async () => {
    try {
      setLoading(true)
      const data = await getDemoSystemSettings()
      setSettings(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchSettings()
  }, [])
  
  const updateSetting = async (settingKey: string, settingValue: any, description?: string) => {
    try {
      // 模拟更新操作
      const updatedSettings = settings.map(setting => 
        setting.settingKey === settingKey 
          ? { ...setting, settingValue, description: description || setting.description }
          : setting
      )
      setSettings(updatedSettings)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update setting')
      return false
    }
  }
  
  return { settings, loading, error, updateSetting, refetch: fetchSettings }
}

// User hooks
export function useUserGenerations(userId: string, page = 1, limit = 10) {
  const [generations, setGenerations] = useState<PaginatedResponse<GenerationHistory> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchGenerations = async () => {
    try {
      setLoading(true)
      const data = await getDemoUserGenerations(userId, page, limit)
      setGenerations(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch generations')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (userId) {
      fetchGenerations()
    }
  }, [userId, page, limit])
  
  return { generations, loading, error, refetch: fetchGenerations }
}

export function useUserFavorites(userId: string) {
  const [favorites, setFavorites] = useState<UserFavorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const fetchFavorites = async () => {
    try {
      setLoading(true)
      const data = await getDemoUserFavorites(userId)
      setFavorites(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (userId) {
      fetchFavorites()
    }
  }, [userId])
  
  const addToFavorites = async (generationId?: string, libraryImageId?: string) => {
    try {
      // 模拟添加到收藏
      const newFavorite: UserFavorite = {
        id: `fav-${Date.now()}`,
        userId,
        generationId,
        libraryImageId,
        createdAt: new Date()
      }
      setFavorites(prev => [newFavorite, ...prev])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add to favorites')
      return false
    }
  }
  
  const removeFromFavorites = async (generationId?: string, libraryImageId?: string) => {
    try {
      // 模拟从收藏中移除
      setFavorites(prev => prev.filter(fav => 
        (generationId && fav.generationId !== generationId) ||
        (libraryImageId && fav.libraryImageId !== libraryImageId)
      ))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from favorites')
      return false
    }
  }
  
  return { favorites, loading, error, addToFavorites, removeFromFavorites, refetch: fetchFavorites }
}

// Public hooks
export function useLibraryImages(filters: {
  page?: number
  limit?: number
  category?: string
  difficulty?: string
  featured?: boolean
} = {}) {
  const { page = 1, limit = 12, category, difficulty, featured } = filters
  const [images, setImages] = useState<PaginatedResponse<LibraryImage> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        const data = await getDemoLibraryImages(page, limit)
        
        // 应用筛选器
        let filteredData = data.data
        if (category) {
          filteredData = filteredData.filter(img => img.category === category)
        }
        if (difficulty) {
          filteredData = filteredData.filter(img => img.difficulty === difficulty)
        }
        if (featured !== undefined) {
          filteredData = filteredData.filter(img => img.isFeatured === featured)
        }
        
        setImages({
          ...data,
          data: filteredData,
          pagination: {
            ...data.pagination,
            total: filteredData.length,
            totalPages: Math.ceil(filteredData.length / limit)
          }
        })
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch library images')
      } finally {
        setLoading(false)
      }
    }
    
    fetchImages()
  }, [page, limit, category, difficulty, featured])
  
  return { images, loading, error }
}

export function useBanners(showOn?: 'homepage' | 'library') {
  const [banners, setBanners] = useState<BannerImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchBanners() {
      try {
        setLoading(true)
        let data = await getDemoBanners()
        
        // 应用筛选器
        if (showOn === 'homepage') {
          data = data.filter(banner => banner.showOnHomepage)
        } else if (showOn === 'library') {
          data = data.filter(banner => banner.showOnLibrary)
        }
        
        setBanners(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch banners')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBanners()
  }, [showOn])
  
  return { banners, loading, error }
}