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
  printUrl?: string  // 高分辨率打印版本URL
  thumbnailUrl: string
  tags: string[]
  category: string
  difficulty: "easy" | "medium" | "complex"
  isActive: boolean
  isFeatured: boolean
  downloadCount: number
  viewCount: number  // 新增：真实浏览量统计
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
  printUrl?: string  // 高分辨率打印版本URL
  linkUrl?: string
  description?: string
  position: number
  isActive: boolean
  showOnHomepage: boolean
  showOnLibrary: boolean
  showOnHero: boolean  // 新增：是否在hero区域显示
  heroRow: "top" | "bottom" | null  // 新增：显示在hero的上排还是下排
  // 配对信息
  imageType?: "line" | "colored" | "unknown"  // 图片类型
  pairedImageId?: string  // 配对图片的ID
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

export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  style: string // classic, cute, simple, detailed
  complexity: "simple" | "medium" | "complex"
  category: string // character, scene, object, etc.
  isActive: boolean
  isDefault: boolean
  variables: string[] // {character}, {setting}, {action} etc.
  exampleOutput: string
  createdBy?: string
  sortOrder: number
  createdAt: Date
  updatedAt: Date
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
  // 使用数据库字段名
  is_active: boolean
  is_featured: boolean
}

export interface CreateLibraryImageRequest {
  title: string
  description?: string
  tags: string[]
  category: string
  difficulty: "easy" | "medium" | "complex"
  // 创建时使用数据库字段名
  is_active: boolean
  is_featured: boolean
  imageUrl: string
  thumbnailUrl: string
  seoId: string
}

export interface UpdateSystemSettingRequest {
  settingValue: any
  description?: string
}

export interface CreatePromptTemplateRequest {
  name: string
  description: string
  template: string
  style: string
  complexity: "simple" | "medium" | "complex"
  category: string
  variables: string[]
  exampleOutput: string
  isActive: boolean
  isDefault: boolean
  sortOrder: number
}

export interface UpdatePromptTemplateRequest extends CreatePromptTemplateRequest {
  id: string
}

export interface AIGenerationRequest {
  prompt: string
  style: string
  complexity: "simple" | "medium" | "complex"
  templateId?: string
  userId: string
}

// Legacy type aliases for backward compatibility
export type PricingConfig = PricingPlan