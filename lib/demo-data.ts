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

// 永久seoId功能已移除，现在使用基于标题的URL
function generatePermanentSeoId(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// 管理员账户数据
export const adminUser: User = {
  id: "550e8400-e29b-41d4-a716-446655440100", // UUID格式的admin ID
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
  id: "550e8400-e29b-41d4-a716-446655440101", // UUID格式的用户ID
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
    id: "550e8400-e29b-41d4-a716-446655441001", // UUID格式的generation ID
    userId: "550e8400-e29b-41d4-a716-446655440101", // 引用demoUser的UUID
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
    id: "550e8400-e29b-41d4-a716-446655441002", // UUID格式的generation ID 
    userId: "550e8400-e29b-41d4-a716-446655440101", // 引用demoUser的UUID 
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
    id: "550e8400-e29b-41d4-a716-446655441003", // UUID格式的generation ID
    userId: "550e8400-e29b-41d4-a716-446655440101", // 引用demoUser的UUID
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

// 图片库数据 - 包括真实用户上传的图片和默认图片
export const demoLibraryImages: LibraryImage[] = [
  // 真实上传的图片 - 对应SEO缓存中的数据
  {
    id: "550e8400-e29b-41d4-a716-446655440001", // UUID格式的ID
    title: "Hello Kitty Astronaut",
    description: "Hello Kitty exploring space as a brave astronaut surrounded by stars",
    imageUrl: "https://r2.coloringpagesprintable.net/uploads/1755442141915-5la4zk1sq4t.blob",
    thumbnailUrl: "https://r2.coloringpagesprintable.net/uploads/1755442141915-5la4zk1sq4t.blob",
    tags: ["Hello Kitty", "Space", "Adventure"],
    category: "Adventure",
    difficulty: "medium",
    isActive: true,
    isFeatured: true,
    downloadCount: 250, // 更高的下载量让它成为热门
    viewCount: 1250, // 浏览量
    uploadedBy: "550e8400-e29b-41d4-a716-446655440100", // 引用adminUser的UUID
    fileSize: 860350,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-08-20"), // 较新的日期
    updatedAt: new Date("2024-08-20")
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440002", // UUID格式的ID
    title: "Hello Kitty Portrait",
    description: "A beautiful portrait-style Hello Kitty coloring page perfect for beginners",
    imageUrl: "https://r2.coloringpagesprintable.net/uploads/1755444954865-bpaijly5jln.blob",
    thumbnailUrl: "https://r2.coloringpagesprintable.net/uploads/1755444954865-bpaijly5jln.blob",
    tags: ["Hello Kitty", "Portrait", "Cute"],
    category: "Characters", 
    difficulty: "easy",
    isActive: true,
    isFeatured: true,
    downloadCount: 180, // 高下载量
    viewCount: 950, // 浏览量
    uploadedBy: "550e8400-e29b-41d4-a716-446655440100", // 引用adminUser的UUID
    fileSize: 384000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-08-22"), // 最新的日期
    updatedAt: new Date("2024-08-22")
  },
  // 保留原有的默认图片作为备用
  {
    id: "550e8400-e29b-41d4-a716-446655440003", // UUID格式的ID
    title: "Hello Kitty Space Explorer",
    description: "Hello Kitty exploring space as an astronaut with colorful stars",
    imageUrl: "/astronaut-cat-coloring-page.png",
    thumbnailUrl: "/astronaut-cat-line-art.png",
    tags: ["Hello Kitty", "Space", "Adventure"],
    category: "Adventure",
    difficulty: "medium",
    isActive: true,
    isFeatured: false, // 不特色，优先级较低
    downloadCount: 150,
    viewCount: 780, // 浏览量
    uploadedBy: "550e8400-e29b-41d4-a716-446655440100", // 引用adminUser的UUID
    fileSize: 860350,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15")
  },
  {
    id: "550e8400-e29b-41d4-a716-446655440004", // UUID格式的ID
    title: "Hello Kitty Classic",
    description: "Traditional Hello Kitty pose perfect for beginners",
    imageUrl: "/hello-kitty-coloring-page.png",
    thumbnailUrl: "/hello-kitty-coloring-page.png",
    tags: ["Hello Kitty", "Classic", "Simple"],
    category: "Characters", 
    difficulty: "easy",
    isActive: true,
    isFeatured: false, // 不特色，优先级较低
    downloadCount: 89,
    viewCount: 425, // 浏览量
    uploadedBy: "550e8400-e29b-41d4-a716-446655440100", // 引用adminUser的UUID
    fileSize: 384000,
    imageWidth: 1024,
    imageHeight: 1024,
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-20")
  }
]

// Banner模拟数据已删除 - 现在返回空数组，使用默认图片显示
export const demoBannerImages: BannerImage[] = []

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

// 用户收藏数据 - 🎯 修复: 使用正确的UUID格式ID确保与图库数据匹配
export const demoUserFavorites: UserFavorite[] = [
  {
    id: "550e8400-e29b-41d4-a716-446655442001",
    userId: "550e8400-e29b-41d4-a716-446655440101", // 使用demoUser的UUID
    generationId: "550e8400-e29b-41d4-a716-446655441001", // 引用demoGenerations[0]
    createdAt: new Date("2024-08-02"),
    generation: demoGenerations[0]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655442002", 
    userId: "550e8400-e29b-41d4-a716-446655440101", // 使用demoUser的UUID
    generationId: "550e8400-e29b-41d4-a716-446655441003", // 引用demoGenerations[2]
    createdAt: new Date("2024-07-30"),
    generation: demoGenerations[2]
  },
  {
    id: "550e8400-e29b-41d4-a716-446655442003",
    userId: "550e8400-e29b-41d4-a716-446655440101", // 使用demoUser的UUID  
    libraryImageId: "64105254-f184-4009-a201-e3fc5f4e0cc7", // 🎯 修复: 使用真实的图库ID (第1张 go and fly a kite)
    createdAt: new Date("2024-08-01")
  },
  {
    id: "550e8400-e29b-41d4-a716-446655442004",
    userId: "550e8400-e29b-41d4-a716-446655440101", // 使用demoUser的UUID
    libraryImageId: "389e9cfc-89eb-4190-8728-1088a6e0e82f", // 🎯 修复: 使用真实的图库ID (第5张 Hello Kitty in a space suit)
    createdAt: new Date("2024-08-22")
  },
  {
    id: "550e8400-e29b-41d4-a716-446655442005",
    userId: "550e8400-e29b-41d4-a716-446655440100", // admin用户也收藏了第一张
    libraryImageId: "64105254-f184-4009-a201-e3fc5f4e0cc7", // 🎯 修复: 使用真实的图库ID (第1张 go and fly a kite)
    createdAt: new Date("2024-08-21")
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
      viewCount: 0, // 新上传的图片初始浏览量为0
      fileSize: imageData.fileSize || 0,
      imageWidth: imageData.imageWidth || 1024,
      imageHeight: imageData.imageHeight || 1024,
      uploadedBy: 'admin',
      // seoId功能已移除，现在使用基于标题的SEO URL
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