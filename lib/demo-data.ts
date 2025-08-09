// 演示数据 - 模拟真实数据库响应
import {
  User,
  GenerationHistory,
  LibraryImage,
  BannerImage,
  PricingPlan,
  SystemSetting,
  UserFavorite,
  AnalyticsStats,
  DashboardStats,
  PaginatedResponse,
  ApiResponse
} from './types'

// 管理员账户数据
export const adminUser: User = {
  id: "admin-1",
  email: "asce3801@gmail.com",
  name: "Administrator",
  role: "admin",
  isProUser: true,
  generationsToday: 0,
  totalGenerations: 999,
  lastGenerationDate: new Date(),
  avatarUrl: "/placeholder-admin.jpg",
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date()
}

// 演示用户数据
export const demoUser: User = {
  id: "user-1",
  email: "user@example.com",
  name: "Demo User", 
  role: "user",
  isProUser: false,
  generationsToday: 2,
  totalGenerations: 15,
  lastGenerationDate: new Date(),
  avatarUrl: "/placeholder-user.jpg",
  createdAt: new Date("2024-01-15"),
  updatedAt: new Date()
}

// 演示用户列表 - 只显示真实存在的2个用户
export const demoUsers: User[] = [
  adminUser,
  demoUser
]

// 生成历史数据
export const demoGenerations: GenerationHistory[] = [
  {
    id: "gen-1",
    userId: "user-1",
    prompt: "Hello Kitty as an astronaut floating in space",
    imageUrl: "/generated/astronaut-kitty.png",
    thumbnailUrl: "/generated/thumbs/astronaut-kitty.png",
    style: "classic",
    complexity: "medium",
    isFavorite: true,
    isPublic: false,
    generationParams: { model: "dall-e-3", quality: "standard" },
    createdAt: new Date("2024-08-02")
  },
  {
    id: "gen-2",
    userId: "user-1", 
    prompt: "Hello Kitty having a tea party with friends",
    imageUrl: "/generated/tea-party.png",
    thumbnailUrl: "/generated/thumbs/tea-party.png",
    style: "cute",
    complexity: "simple",
    isFavorite: false,
    isPublic: true,
    generationParams: { model: "dall-e-3", quality: "standard" },
    createdAt: new Date("2024-08-01")
  },
  {
    id: "gen-3",
    userId: "user-1",
    prompt: "Hello Kitty in a magical forest with unicorns", 
    imageUrl: "/generated/magical-forest.png",
    thumbnailUrl: "/generated/thumbs/magical-forest.png",
    style: "fantasy",
    complexity: "complex",
    isFavorite: true,
    isPublic: false,
    generationParams: { model: "dall-e-3", quality: "hd" },
    createdAt: new Date("2024-07-30")
  }
]

// 图片库数据
export const demoLibraryImages: LibraryImage[] = [
  {
    id: "lib-1",
    title: "Hello Kitty Classic",
    description: "Traditional Hello Kitty pose perfect for beginners",
    imageUrl: "/library/hello-kitty-classic.png",
    thumbnailUrl: "/library/thumbs/hello-kitty-classic.png",
    tags: ["hello kitty", "classic", "simple"],
    category: "Characters",
    difficulty: "easy",
    isActive: true,
    isFeatured: true,
    downloadCount: 150,
    uploadedBy: "admin-1",
    fileSize: 256000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "lib-2", 
    title: "Hello Kitty Tea Party",
    description: "Hello Kitty having a delightful tea party",
    imageUrl: "/library/hello-kitty-tea-party.png",
    thumbnailUrl: "/library/thumbs/hello-kitty-tea-party.png",
    tags: ["hello kitty", "tea party", "detailed"],
    category: "Scenes", 
    difficulty: "medium",
    isActive: true,
    isFeatured: true,
    downloadCount: 89,
    uploadedBy: "admin-1",
    fileSize: 384000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  },
  {
    id: "lib-3",
    title: "Hello Kitty Astronaut", 
    description: "Hello Kitty exploring space as an astronaut",
    imageUrl: "/library/hello-kitty-astronaut.png",
    thumbnailUrl: "/library/thumbs/hello-kitty-astronaut.png",
    tags: ["hello kitty", "space", "astronaut", "adventure"],
    category: "Adventure",
    difficulty: "complex",
    isActive: true,
    isFeatured: false,
    downloadCount: 67,
    uploadedBy: "admin-1",
    fileSize: 512000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01")
  },
  {
    id: "lib-4",
    title: "Hello Kitty Garden",
    description: "Hello Kitty tending to beautiful flowers",
    imageUrl: "/library/hello-kitty-garden.png",
    thumbnailUrl: "/library/thumbs/hello-kitty-garden.png",
    tags: ["hello kitty", "garden", "flowers", "nature"],
    category: "Nature",
    difficulty: "medium",
    isActive: true,
    isFeatured: true,
    downloadCount: 112,
    uploadedBy: "admin-1",
    fileSize: 445000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-02-10"),
    updatedAt: new Date("2024-02-10")
  },
  {
    id: "lib-5",
    title: "Hello Kitty Birthday",
    description: "Hello Kitty celebrating with birthday cake",
    imageUrl: "/library/hello-kitty-birthday.png",
    thumbnailUrl: "/library/thumbs/hello-kitty-birthday.png",
    tags: ["hello kitty", "birthday", "cake", "celebration"],
    category: "Celebration",
    difficulty: "easy",
    isActive: true,
    isFeatured: false,
    downloadCount: 203,
    uploadedBy: "admin-1",
    fileSize: 298000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15")
  }
]

// 轮播图数据 - 使用真实存在的图片
export const demoBannerImages: BannerImage[] = [
  {
    id: "banner-1",
    title: "Welcome to AI Kitty Creator",
    imageUrl: "/hello-kitty-coloring-page.png",
    linkUrl: "/create",
    description: "Create unlimited Hello Kitty coloring pages with AI",
    position: 1,
    isActive: true,
    showOnHomepage: true,
    showOnLibrary: false,
    showOnHero: false,
    heroRow: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "banner-2",
    title: "Featured: Tea Party Collection", 
    imageUrl: "/cute-kitty-coloring-page.png",
    linkUrl: "/library?category=Scenes",
    description: "Discover our most popular tea party themed coloring pages",
    position: 2,
    isActive: true,
    showOnHomepage: true,
    showOnLibrary: true,
    showOnHero: false,
    heroRow: null,
    createdAt: new Date("2024-01-05"),
    updatedAt: new Date("2024-01-05")
  },
  // Hero区域专用banner图片
  {
    id: "hero-1",
    title: "Hero Top Row - Princess Kitty",
    imageUrl: "/hello-kitty-coloring-page.png",
    description: "Princess themed Hello Kitty for hero display",
    position: 1,
    isActive: true,
    showOnHomepage: false,
    showOnLibrary: false,
    showOnHero: true,
    heroRow: "top",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10")
  },
  {
    id: "hero-2",
    title: "Hero Bottom Row - Astronaut Kitty",
    imageUrl: "/astronaut-cat-coloring-page.png",
    description: "Astronaut themed Hello Kitty for hero display",
    position: 1,
    isActive: true,
    showOnHomepage: false,
    showOnLibrary: false,
    showOnHero: true,
    heroRow: "bottom",
    createdAt: new Date("2024-01-10"),
    updatedAt: new Date("2024-01-10")
  },
  {
    id: "hero-3",
    title: "Hero Top Row - Community Kitty",
    imageUrl: "/ai-community-coloring.png",
    description: "Community themed Hello Kitty for hero display",
    position: 2,
    isActive: true,
    showOnHomepage: false,
    showOnLibrary: false,
    showOnHero: true,
    heroRow: "top",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12")
  },
  {
    id: "hero-4",
    title: "Hero Bottom Row - Coloring Kitty",
    imageUrl: "/coloring-kitty-cat.png",
    description: "Coloring themed Hello Kitty for hero display",
    position: 2,
    isActive: true,
    showOnHomepage: false,
    showOnLibrary: false,
    showOnHero: true,
    heroRow: "bottom",
    createdAt: new Date("2024-01-12"),
    updatedAt: new Date("2024-01-12")
  }
]

// 价格计划数据
export const demoPricingPlans: PricingPlan[] = [
  {
    id: "plan-1",
    name: "Free Plan",
    description: "Perfect for getting started with AI kitty creation",
    priceMonthly: 0,
    priceYearly: 0,
    features: [
      "3 generations per day",
      "Standard resolution", 
      "Community support",
      "Basic templates"
    ],
    generationsPerDay: 3,
    highResolution: false,
    noWatermark: false,
    priorityGeneration: false,
    isActive: true,
    sortOrder: 1,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "plan-2",
    name: "Pro Plan",
    description: "Unlimited creativity for kitty enthusiasts",
    priceMonthly: 9.99,
    priceYearly: 99.99,
    features: [
      "Unlimited generations",
      "High resolution images",
      "No watermarks",
      "Priority processing", 
      "Premium templates",
      "Email support"
    ],
    generationsPerDay: 100,
    highResolution: true,
    noWatermark: true,
    priorityGeneration: true,
    isActive: true,
    sortOrder: 2,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "plan-3",
    name: "Business Plan",
    description: "For professional creators and educators",
    priceMonthly: 29.99,
    priceYearly: 299.99,
    features: [
      "Everything in Pro",
      "Commercial license",
      "Bulk downloads",
      "Custom templates",
      "Priority support",
      "Analytics dashboard"
    ],
    generationsPerDay: 500,
    highResolution: true,
    noWatermark: true,
    priorityGeneration: true,
    isActive: true,
    sortOrder: 3,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

// 系统设置数据
export const demoSystemSettings: SystemSetting[] = [
  {
    id: "setting-1",
    settingKey: "site_name",
    settingValue: "AI Kitty Creator",
    description: "Website name displayed in header",
    category: "general",
    isPublic: true,
    updatedBy: "admin-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "setting-2",
    settingKey: "free_generations_per_day",
    settingValue: 3,
    description: "Number of free generations per day for regular users",
    category: "limits",
    isPublic: false,
    updatedBy: "admin-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  },
  {
    id: "setting-3",
    settingKey: "maintenance_mode",
    settingValue: false,
    description: "Enable maintenance mode",
    category: "system",
    isPublic: false,
    updatedBy: "admin-1",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01")
  }
]

// 用户收藏数据
export const demoUserFavorites: UserFavorite[] = [
  {
    id: "fav-1",
    userId: "user-1",
    generationId: "gen-1",
    createdAt: new Date("2024-08-02"),
    generation: demoGenerations[0]
  },
  {
    id: "fav-2",
    userId: "user-1",
    generationId: "gen-3",
    createdAt: new Date("2024-07-30"),
    generation: demoGenerations[2]
  },
  {
    id: "fav-3",
    userId: "user-1",
    libraryImageId: "lib-1",
    createdAt: new Date("2024-08-01"),
    libraryImage: demoLibraryImages[0]
  }
]

// 管理面板统计数据
export const demoDashboardStats: DashboardStats = {
  totalUsers: 1329,
  totalGenerations: 9543,
  totalLibraryImages: 156,
  monthlyRevenue: 2840,
  activeProUsers: 89,
  newUsersToday: 12,
  generationsToday: 89,
  revenueGrowth: 12.5
}

// 分析统计数据
export const demoAnalyticsStats: AnalyticsStats[] = [
  {
    id: "stat-1",
    statDate: new Date(),
    totalUsers: 1329,
    newUsers: 12,
    totalGenerations: 9543,
    dailyGenerations: 89,
    totalDownloads: 1875,
    dailyDownloads: 45,
    proUsers: 89,
    monthlyRevenue: 875.21,
    createdAt: new Date()
  }
]

// 模拟API响应函数
export function createMockPaginatedResponse<T>(
  data: T[],
  page: number = 1,
  limit: number = 10
): PaginatedResponse<T> {
  const offset = (page - 1) * limit
  const paginatedData = data.slice(offset, offset + limit)
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit)
    },
    success: true
  }
}

export function createMockApiResponse<T>(data: T): ApiResponse<T> {
  return {
    data,
    success: true
  }
}

// 演示数据获取函数（模拟异步API调用）
export async function getDemoAdminStats(): Promise<DashboardStats> {
  // 模拟API延迟
  await new Promise(resolve => setTimeout(resolve, 500))
  return demoDashboardStats
}

export async function getDemoUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return createMockPaginatedResponse(demoUsers, page, limit)
}

export async function getDemoLibraryImages(page = 1, limit = 12): Promise<PaginatedResponse<LibraryImage>> {
  await new Promise(resolve => setTimeout(resolve, 300))
  
  // 在浏览器环境中，合并localStorage中的数据和删除的数据
  let availableImages = [...demoLibraryImages]
  
  if (typeof window !== 'undefined') {
    // 获取被删除的图片ID列表
    const deletedImages = getDeletedLibraryImages()
    availableImages = availableImages.filter(img => !deletedImages.includes(img.id))
    
    // 获取新上传的图片
    const uploadedImages = getUploadedLibraryImages()
    availableImages = [...availableImages, ...uploadedImages]
    
    // 获取更新的图片
    const updatedImages = getUpdatedLibraryImages()
    availableImages = availableImages.map(img => {
      const updated = updatedImages.find(u => u.id === img.id)
      return updated || img
    })
  }
  
  return createMockPaginatedResponse(availableImages, page, limit)
}

export async function getDemoBanners(): Promise<BannerImage[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  
  // 如果在浏览器环境中，合并localStorage中的新数据
  if (typeof window !== 'undefined') {
    const storedBanners = localStorage.getItem('uploaded_banners')
    if (storedBanners) {
      try {
        const uploadedBanners = JSON.parse(storedBanners)
        return [...demoBannerImages, ...uploadedBanners]
      } catch (error) {
        console.warn('Failed to parse stored banners:', error)
      }
    }
  }
  
  return demoBannerImages
}

// 添加新上传的banner到localStorage
export function addUploadedBanner(bannerData: Partial<BannerImage>): void {
  if (typeof window === 'undefined') return
  
  try {
    const storedBanners = localStorage.getItem('uploaded_banners')
    const existingBanners = storedBanners ? JSON.parse(storedBanners) : []
    
    const newBanner: BannerImage = {
      id: bannerData.id || `uploaded-${Date.now()}`,
      title: bannerData.title || 'Uploaded Image',
      imageUrl: bannerData.imageUrl || '',
      linkUrl: bannerData.linkUrl,
      description: bannerData.description || '',
      position: Date.now(),
      isActive: bannerData.isActive !== undefined ? bannerData.isActive : true,
      showOnHomepage: bannerData.showOnHomepage || false,
      showOnLibrary: bannerData.showOnLibrary || false,
      showOnHero: bannerData.showOnHero || false,
      heroRow: bannerData.heroRow || null,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    existingBanners.push(newBanner)
    localStorage.setItem('uploaded_banners', JSON.stringify(existingBanners))
    
    console.log('Banner saved to localStorage:', newBanner)
  } catch (error) {
    console.error('Failed to save banner to localStorage:', error)
  }
}

// 清理localStorage中的上传数据 (用于调试)
export function clearUploadedBanners(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('uploaded_banners')
  console.log('Cleared uploaded banners from localStorage')
}

// 获取localStorage中的上传数据 (用于调试)
export function getUploadedBanners(): BannerImage[] {
  if (typeof window === 'undefined') return []
  
  try {
    const storedBanners = localStorage.getItem('uploaded_banners')
    return storedBanners ? JSON.parse(storedBanners) : []
  } catch (error) {
    console.error('Failed to parse uploaded banners:', error)
    return []
  }
}

export async function getDemoPricingPlans(): Promise<PricingPlan[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return demoPricingPlans
}

export async function getDemoSystemSettings(): Promise<SystemSetting[]> {
  await new Promise(resolve => setTimeout(resolve, 200))
  return demoSystemSettings
}

export async function getDemoUserGenerations(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<GenerationHistory>> {
  await new Promise(resolve => setTimeout(resolve, 300))
  const userGenerations = demoGenerations.filter(gen => gen.userId === userId)
  return createMockPaginatedResponse(userGenerations, page, limit)
}

export async function getDemoUserFavorites(userId: string): Promise<UserFavorite[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return demoUserFavorites.filter(fav => fav.userId === userId)
}

// ========================
// Library Images localStorage管理
// ========================

// 获取已删除的图库图片ID列表
export function getDeletedLibraryImages(): string[] {
  if (typeof window === 'undefined') return []
  
  try {
    const deletedImages = localStorage.getItem('deleted_library_images')
    return deletedImages ? JSON.parse(deletedImages) : []
  } catch (error) {
    console.error('Failed to parse deleted library images:', error)
    return []
  }
}

// 添加已删除的图库图片ID
export function addDeletedLibraryImage(imageId: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const deletedImages = getDeletedLibraryImages()
    if (!deletedImages.includes(imageId)) {
      deletedImages.push(imageId)
      localStorage.setItem('deleted_library_images', JSON.stringify(deletedImages))
      console.log('Library image marked as deleted:', imageId)
    }
  } catch (error) {
    console.error('Failed to save deleted library image:', error)
  }
}

// 获取新上传的图库图片
export function getUploadedLibraryImages(): LibraryImage[] {
  if (typeof window === 'undefined') return []
  
  try {
    const uploadedImages = localStorage.getItem('uploaded_library_images')
    return uploadedImages ? JSON.parse(uploadedImages) : []
  } catch (error) {
    console.error('Failed to parse uploaded library images:', error)
    return []
  }
}

// 添加新上传的图库图片
export function addUploadedLibraryImage(imageData: Partial<LibraryImage>): void {
  if (typeof window === 'undefined') return
  
  try {
    const uploadedImages = getUploadedLibraryImages()
    const newImage: LibraryImage = {
      id: imageData.id || `lib-uploaded-${Date.now()}`,
      title: imageData.title || 'New Image',
      description: imageData.description || '',
      imageUrl: imageData.imageUrl || '',
      thumbnailUrl: imageData.thumbnailUrl || imageData.imageUrl || '',
      category: imageData.category || 'other',
      difficulty: imageData.difficulty || 'easy',
      tags: imageData.tags || [],
      isActive: imageData.isActive !== undefined ? imageData.isActive : true,
      isFeatured: imageData.isFeatured || false,
      downloadCount: 0,
      fileSize: imageData.fileSize || 0,
      imageWidth: imageData.imageWidth || 1024,
      imageHeight: imageData.imageHeight || 1024,
      uploadedBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    uploadedImages.push(newImage)
    localStorage.setItem('uploaded_library_images', JSON.stringify(uploadedImages))
    console.log('Library image saved to localStorage:', newImage)
  } catch (error) {
    console.error('Failed to save library image to localStorage:', error)
  }
}

// 获取已更新的图库图片
export function getUpdatedLibraryImages(): LibraryImage[] {
  if (typeof window === 'undefined') return []
  
  try {
    const updatedImages = localStorage.getItem('updated_library_images')
    return updatedImages ? JSON.parse(updatedImages) : []
  } catch (error) {
    console.error('Failed to parse updated library images:', error)
    return []
  }
}

// 更新图库图片
export function updateLibraryImage(updatedImage: LibraryImage): void {
  if (typeof window === 'undefined') return
  
  try {
    const updatedImages = getUpdatedLibraryImages()
    const existingIndex = updatedImages.findIndex(img => img.id === updatedImage.id)
    
    if (existingIndex >= 0) {
      updatedImages[existingIndex] = updatedImage
    } else {
      updatedImages.push(updatedImage)
    }
    
    localStorage.setItem('updated_library_images', JSON.stringify(updatedImages))
    console.log('Library image updated in localStorage:', updatedImage.id)
  } catch (error) {
    console.error('Failed to update library image in localStorage:', error)
  }
}

// 清理所有Library Images localStorage数据 (用于调试)
export function clearLibraryImagesData(): void {
  if (typeof window === 'undefined') return
  
  localStorage.removeItem('deleted_library_images')
  localStorage.removeItem('uploaded_library_images')
  localStorage.removeItem('updated_library_images')
  console.log('Cleared all library images localStorage data')
}