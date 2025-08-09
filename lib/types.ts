export interface User {
  id: string
  email: string
  name?: string
  role: "user" | "admin"
  isProUser: boolean
  generationsToday: number
  totalGenerations: number
  lastGenerationDate?: Date
  avatarUrl?: string
  createdAt: Date
  updatedAt: Date
}

export interface GenerationHistory {
  id: string
  userId: string
  prompt: string
  imageUrl: string
  thumbnailUrl?: string
  style: string
  complexity: string
  isFavorite: boolean
  isPublic: boolean
  generationParams?: Record<string, any>
  createdAt: Date
}

export interface LibraryImage {
  id: string
  title: string
  description?: string
  imageUrl: string
  thumbnailUrl: string
  tags: string[]
  category: string
  difficulty: "easy" | "medium" | "complex"
  isActive: boolean
  isFeatured: boolean
  downloadCount: number
  uploadedBy?: string
  fileSize?: number
  imageWidth?: number
  imageHeight?: number
  createdAt: Date
  updatedAt: Date
}

export interface BannerImage {
  id: string
  title: string
  imageUrl: string
  linkUrl?: string
  description?: string
  position: number
  isActive: boolean
  showOnHomepage: boolean
  showOnLibrary: boolean
  showOnHero: boolean  // 新增：是否在hero区域显示
  heroRow: "top" | "bottom" | null  // 新增：显示在hero的上排还是下排
  createdAt: Date
  updatedAt: Date
}

export interface PricingPlan {
  id: string
  name: string
  description?: string
  priceMonthly: number
  priceYearly?: number
  features: string[]
  generationsPerDay: number
  highResolution: boolean
  noWatermark: boolean
  priorityGeneration: boolean
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface SystemSetting {
  id: string
  settingKey: string
  settingValue: any
  description?: string
  category: string
  isPublic: boolean
  updatedBy?: string
  createdAt: Date
  updatedAt: Date
}

export interface UserSubscription {
  id: string
  userId: string
  planId: string
  status: "active" | "canceled" | "expired" | "pending"
  startedAt: Date
  expiresAt?: Date
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  createdAt: Date
  updatedAt: Date
  plan?: PricingPlan
}

export interface UserFavorite {
  id: string
  userId: string
  generationId?: string
  libraryImageId?: string
  createdAt: Date
  generation?: GenerationHistory
  libraryImage?: LibraryImage
}

export interface AnalyticsStats {
  id: string
  statDate: Date
  totalUsers: number
  newUsers: number
  totalGenerations: number
  dailyGenerations: number
  totalDownloads: number
  dailyDownloads: number
  proUsers: number
  monthlyRevenue: number
  createdAt: Date
}

export interface DashboardStats {
  totalUsers: number
  totalGenerations: number
  totalLibraryImages: number
  monthlyRevenue: number
  activeProUsers: number
  newUsersToday: number
  generationsToday: number
  revenueGrowth: number
}

// API Response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  success: boolean
}

// Form types for API requests
export interface CreateGenerationRequest {
  prompt: string
  style: string
  complexity: string
  isPublic?: boolean
}

export interface UpdateLibraryImageRequest {
  title: string
  description?: string
  tags: string[]
  category: string
  difficulty: "easy" | "medium" | "complex"
  isActive: boolean
  isFeatured: boolean
}

export interface CreateLibraryImageRequest extends UpdateLibraryImageRequest {
  imageUrl: string
  thumbnailUrl: string
}

export interface UpdateSystemSettingRequest {
  settingValue: any
  description?: string
}

// Legacy type aliases for backward compatibility
export type PricingConfig = PricingPlan