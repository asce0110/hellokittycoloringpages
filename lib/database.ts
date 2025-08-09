import { supabase, supabaseAdmin } from './supabase'
import {
  User,
  GenerationHistory,
  LibraryImage,
  BannerImage,
  PricingPlan,
  SystemSetting,
  UserSubscription,
  UserFavorite,
  AnalyticsStats,
  DashboardStats,
  ApiResponse,
  PaginatedResponse,
  CreateGenerationRequest,
  CreateLibraryImageRequest,
  UpdateLibraryImageRequest,
  UpdateSystemSettingRequest
} from './types'

// ==================== User Operations ====================

export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching user:', error)
    return null
  }
  
  return data
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error) {
    console.error('Error fetching user by email:', error)
    return null
  }
  
  return data
}

export async function getAllUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabaseAdmin
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching users:', error)
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      success: false
    }
  }
  
  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    },
    success: true
  }
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating user:', error)
    return null
  }
  
  return data
}

// ==================== Generation History Operations ====================

export async function getUserGenerations(userId: string, page = 1, limit = 10): Promise<PaginatedResponse<GenerationHistory>> {
  const offset = (page - 1) * limit
  
  const { data, error, count } = await supabase
    .from('generation_history')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching user generations:', error)
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      success: false
    }
  }
  
  return {
    data: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    },
    success: true
  }
}

export async function createGeneration(userId: string, generation: CreateGenerationRequest): Promise<GenerationHistory | null> {
  const { data, error } = await supabase
    .from('generation_history')
    .insert([{
      user_id: userId,
      ...generation
    }])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating generation:', error)
    return null
  }
  
  return data
}

export async function toggleGenerationFavorite(userId: string, generationId: string): Promise<boolean> {
  // First get the current state
  const { data: generation, error: fetchError } = await supabase
    .from('generation_history')
    .select('is_favorite')
    .eq('id', generationId)
    .eq('user_id', userId)
    .single()
  
  if (fetchError) {
    console.error('Error fetching generation:', fetchError)
    return false
  }
  
  // Toggle the favorite status
  const { error: updateError } = await supabase
    .from('generation_history')
    .update({ is_favorite: !generation.is_favorite })
    .eq('id', generationId)
    .eq('user_id', userId)
  
  if (updateError) {
    console.error('Error updating favorite status:', updateError)
    return false
  }
  
  return true
}

// ==================== Library Images Operations ====================

export async function getLibraryImages(filters: {
  category?: string
  difficulty?: string
  featured?: boolean
  active?: boolean
  page?: number
  limit?: number
} = {}): Promise<PaginatedResponse<LibraryImage>> {
  const { category, difficulty, featured, active = true, page = 1, limit = 12 } = filters
  const offset = (page - 1) * limit
  
  let query = supabase
    .from('library_images')
    .select('*', { count: 'exact' })
    .eq('is_active', active)
    .order('created_at', { ascending: false })
  
  if (category) query = query.eq('category', category)
  if (difficulty) query = query.eq('difficulty', difficulty)
  if (featured !== undefined) query = query.eq('is_featured', featured)
  
  const { data, error, count } = await query.range(offset, offset + limit - 1)
  
  if (error) {
    console.error('Error fetching library images:', error)
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      success: false
    }
  }
  
  // 转换数据库字段名为TypeScript接口字段名
  const transformedData = (data || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    imageUrl: item.image_url,
    thumbnailUrl: item.thumbnail_url,
    tags: item.tags || [],
    category: item.category,
    difficulty: item.difficulty,
    isActive: item.is_active,
    isFeatured: item.is_featured || false,
    downloadCount: item.download_count || 0,
    fileSize: item.file_size || 0,
    imageWidth: item.image_width || 1024,
    imageHeight: item.image_height || 1024,
    uploadedBy: item.uploaded_by || 'unknown',
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at)
  }))

  return {
    data: transformedData,
    pagination: {
      page,
      limit,
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    },
    success: true
  }
}

export async function createLibraryImage(image: CreateLibraryImageRequest, uploadedBy?: string): Promise<LibraryImage | null> {
  console.log('🔍 Creating library image with data:', {
    ...image,
    uploaded_by: uploadedBy
  })

  // 转换前端字段名到数据库字段名 (只包含表中存在的字段)
  const dbData = {
    title: image.title,
    description: image.description || '',
    image_url: image.imageUrl,
    thumbnail_url: image.thumbnailUrl,
    tags: image.tags || [],
    category: image.category,
    difficulty: image.difficulty,
    is_active: image.isActive !== false
  }

  console.log('📊 Sending to database:', dbData)

  const { data, error } = await supabaseAdmin
    .from('library_images')
    .insert([dbData])
    .select()
    .single()
  
  if (error) {
    console.error('❌ Database error creating library image:', error)
    console.error('Error details:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    return null
  }
  
  if (!data) {
    console.error('❌ No data returned from database insert')
    return null
  }

  console.log('✅ Library image created successfully:', data)
  
  // 转换数据库字段名 (只包含实际存在的字段)
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    thumbnailUrl: data.thumbnail_url,
    tags: data.tags || [],
    category: data.category,
    difficulty: data.difficulty,
    isActive: data.is_active,
    isFeatured: false, // 默认值，因为表中没有这个字段
    downloadCount: 0, // 默认值
    fileSize: 0, // 默认值
    imageWidth: 1024, // 默认值
    imageHeight: 1024, // 默认值
    uploadedBy: 'admin', // 默认值
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function updateLibraryImage(id: string, updates: UpdateLibraryImageRequest): Promise<LibraryImage | null> {
  const { data, error } = await supabaseAdmin
    .from('library_images')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating library image:', error)
    return null
  }
  
  if (!data) return null
  
  // 转换数据库字段名
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    imageUrl: data.image_url,
    thumbnailUrl: data.thumbnail_url,
    tags: data.tags || [],
    category: data.category,
    difficulty: data.difficulty,
    isActive: data.is_active,
    isFeatured: data.is_featured || false,
    downloadCount: data.download_count || 0,
    fileSize: data.file_size || 0,
    imageWidth: data.image_width || 1024,
    imageHeight: data.image_height || 1024,
    uploadedBy: data.uploaded_by || 'unknown',
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  }
}

export async function deleteLibraryImage(id: string): Promise<boolean> {
  const { error } = await supabaseAdmin
    .from('library_images')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting library image:', error)
    return false
  }
  
  return true
}

// ==================== Banner Images Operations ====================

export async function getBannerImages(showOn?: 'homepage' | 'library'): Promise<BannerImage[]> {
  let query = supabase
    .from('banner_images')
    .select('*')
    .eq('is_active', true)
    .order('position', { ascending: true })
  
  if (showOn === 'homepage') {
    query = query.eq('show_on_homepage', true)
  } else if (showOn === 'library') {
    query = query.eq('show_on_library', true)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching banner images:', error)
    return []
  }
  
  return data || []
}

// ==================== Pricing Plans Operations ====================

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { data, error } = await supabase
    .from('pricing_plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching pricing plans:', error)
    return []
  }
  
  return data || []
}

export async function updatePricingPlan(id: string, updates: Partial<PricingPlan>): Promise<PricingPlan | null> {
  const { data, error } = await supabaseAdmin
    .from('pricing_plans')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating pricing plan:', error)
    return null
  }
  
  return data
}

// ==================== System Settings Operations ====================

export async function getSystemSettings(isPublic?: boolean): Promise<SystemSetting[]> {
  let query = supabase.from('system_settings').select('*')
  
  if (isPublic !== undefined) {
    query = query.eq('is_public', isPublic)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching system settings:', error)
    return []
  }
  
  return data || []
}

export async function getSystemSetting(key: string): Promise<SystemSetting | null> {
  const { data, error } = await supabase
    .from('system_settings')
    .select('*')
    .eq('setting_key', key)
    .single()
  
  if (error) {
    console.error('Error fetching system setting:', error)
    return null
  }
  
  return data
}

export async function updateSystemSetting(key: string, updates: UpdateSystemSettingRequest, updatedBy?: string): Promise<SystemSetting | null> {
  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .update({
      ...updates,
      updated_by: updatedBy
    })
    .eq('setting_key', key)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating system setting:', error)
    return null
  }
  
  return data
}

// ==================== User Favorites Operations ====================

export async function getUserFavorites(userId: string): Promise<UserFavorite[]> {
  const { data, error } = await supabase
    .from('user_favorites')
    .select(`
      *,
      generation:generation_history(*),
      library_image:library_images(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user favorites:', error)
    return []
  }
  
  return data || []
}

export async function addToFavorites(userId: string, generationId?: string, libraryImageId?: string): Promise<boolean> {
  const { error } = await supabase
    .from('user_favorites')
    .insert([{
      user_id: userId,
      generation_id: generationId,
      library_image_id: libraryImageId
    }])
  
  if (error) {
    console.error('Error adding to favorites:', error)
    return false
  }
  
  return true
}

export async function removeFromFavorites(userId: string, generationId?: string, libraryImageId?: string): Promise<boolean> {
  let query = supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
  
  if (generationId) {
    query = query.eq('generation_id', generationId)
  } else if (libraryImageId) {
    query = query.eq('library_image_id', libraryImageId)
  }
  
  const { error } = await query
  
  if (error) {
    console.error('Error removing from favorites:', error)
    return false
  }
  
  return true
}

// ==================== Analytics Operations ====================

export async function getDashboardStats(): Promise<DashboardStats> {
  // Get latest analytics stats
  const { data: latestStats } = await supabaseAdmin
    .from('analytics_stats')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(1)
    .single()
  
  // Get stats from 7 days ago for growth calculation
  const { data: weekAgoStats } = await supabaseAdmin
    .from('analytics_stats')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(1)
    .gte('stat_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  
  // Get library images count
  const { count: libraryImagesCount } = await supabase
    .from('library_images')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
  
  const currentRevenue = latestStats?.monthly_revenue || 0
  const previousRevenue = weekAgoStats ? weekAgoStats[0]?.monthly_revenue || 0 : 0
  const revenueGrowth = previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0
  
  return {
    totalUsers: latestStats?.total_users || 0,
    totalGenerations: latestStats?.total_generations || 0,
    totalLibraryImages: libraryImagesCount || 0,
    monthlyRevenue: currentRevenue,
    activeProUsers: latestStats?.pro_users || 0,
    newUsersToday: latestStats?.new_users || 0,
    generationsToday: latestStats?.daily_generations || 0,
    revenueGrowth
  }
}

export async function getAnalyticsStats(days = 30): Promise<AnalyticsStats[]> {
  const { data, error } = await supabaseAdmin
    .from('analytics_stats')
    .select('*')
    .order('stat_date', { ascending: false })
    .limit(days)
  
  if (error) {
    console.error('Error fetching analytics stats:', error)
    return []
  }
  
  return data || []
}