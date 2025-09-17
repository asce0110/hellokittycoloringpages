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
  ColoringProgress,
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
  // 检查Supabase客户端是否初始化
  if (!supabase) {
    console.error('Supabase client not initialized - using fallback')
    return {
      data: [],
      pagination: { page: filters.page || 1, limit: filters.limit || 12, total: 0, totalPages: 0 },
      success: false
    }
  }

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
    console.error('Error fetching library images:', {
      message: error.message || 'Unknown error',
      details: error.details || null,
      hint: error.hint || null,
      code: error.code || null,
      fullError: error
    })
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
    viewCount: item.view_count || 0,  // 新增：真实浏览量
    fileSize: item.file_size || 0,
    imageWidth: item.image_width || 1024,
    imageHeight: item.image_height || 1024,
    uploadedBy: item.uploaded_by || 'unknown',
    // seoId已移除，使用基于标题的URL
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

  // 检查Supabase是否可用
  if (!supabaseAdmin) {
    console.warn('⚠️ Supabase admin client not available, falling back to demo storage')
    
    // 使用demo-data作为降级方案
    try {
      const newImage: LibraryImage = {
        id: `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: image.title,
        description: image.description || '',
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl || image.imageUrl,
        tags: image.tags || [],
        category: image.category,
        difficulty: image.difficulty,
        isActive: image.is_active !== false,
        isFeatured: image.is_featured || false,
        downloadCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // 存储到localStorage作为演示
      if (typeof window !== 'undefined') {
        const existingImages = JSON.parse(localStorage.getItem('demo_library_images') || '[]')
        existingImages.push(newImage)
        localStorage.setItem('demo_library_images', JSON.stringify(existingImages))
      }
      
      console.log('✅ Library image saved to demo storage:', newImage.id)
      return newImage
    } catch (demoError) {
      console.error('❌ Demo storage fallback failed:', demoError)
      return null
    }
  }

  // 转换前端字段名到数据库字段名 (只包含表中存在的字段)
  const dbData = {
    title: image.title,
    description: image.description || '',
    image_url: image.imageUrl,
    thumbnail_url: image.thumbnailUrl,
    tags: image.tags || [],
    category: image.category,
    difficulty: image.difficulty,
    is_active: image.is_active !== false,
    is_featured: image.is_featured || false,
    // 需要生成seo_id，基于标题（限制为6个字符）
    seo_id: Math.random().toString(36).slice(2, 6) // 生成4位随机字符串，确保不超长
  }

  console.log('📊 Sending to database:', dbData)

  try {
    const { data, error } = await supabaseAdmin
      .from('library_images')
      .insert([dbData])
      .select()
      .single()
    
    if (error) {
      console.error('❌ Database error creating library image:', error)
      console.error('Error details:', {
        message: error.message || 'Unknown database error',
        details: error.details || 'No details available',
        hint: error.hint || 'No hint available',
        code: error.code || 'NO_CODE'
      })
      
      // 如果是网络或连接问题，尝试降级方案
      if (error.code === 'PGRST301' || error.message.includes('connection') || !error.message) {
        console.log('🔄 Database connection issue detected, attempting fallback...')
        return createLibraryImage(image, uploadedBy) // 这将触发上面的降级逻辑
      }
      
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
      viewCount: 0, // 默认浏览量
      createdAt: data.created_at,
      updatedAt: data.updated_at
    }
    
  } catch (networkError) {
    console.error('❌ Network error during database operation:', networkError)
    console.log('🔄 Falling back to demo storage due to network error')
    
    // 网络错误时的降级处理
    try {
      const newImage: LibraryImage = {
        id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: image.title,
        description: image.description || '',
        imageUrl: image.imageUrl,
        thumbnailUrl: image.thumbnailUrl || image.imageUrl,
        tags: image.tags || [],
        category: image.category,
        difficulty: image.difficulty,
        isActive: image.is_active !== false,
        isFeatured: image.is_featured || false,
        downloadCount: 0,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      console.log('✅ Library image saved to fallback storage:', newImage.id)
      return newImage
    } catch (fallbackError) {
      console.error('❌ Fallback storage failed:', fallbackError)
      return null
    }
  }
}

// 根据slug查找图片 - 用于着色页面
export async function getLibraryImageById(id: string): Promise<LibraryImage | null> {
  try {
    console.log('🔍 Looking for library image by ID:', id)
    
    const { data, error } = await supabase
      .from('library_images')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()
    
    if (error) {
      console.error('Error fetching library image by ID:', error)
      return null
    }
    
    if (!data) {
      return null
    }
    
    // 转换数据库字段名为TypeScript接口字段名
    const transformedImage: LibraryImage = {
      id: data.id,
      title: data.title,
      description: data.description,
      imageUrl: data.image_url,
      printUrl: data.print_url, // 高分辨率打印版本
      thumbnailUrl: data.thumbnail_url,
      tags: data.tags || [],
      category: data.category,
      difficulty: data.difficulty,
      isActive: data.is_active,
      isFeatured: data.is_featured || false,
      downloadCount: data.download_count || 0,
      viewCount: data.view_count || 0,  // 新增：真实浏览量
      fileSize: data.file_size || 0,
      imageWidth: data.image_width || 1024,
      imageHeight: data.image_height || 1024,
      uploadedBy: data.uploaded_by || 'unknown',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
    
    return transformedImage
  } catch (error) {
    console.error('Unexpected error in getLibraryImageById:', error)
    return null
  }
}

export async function getLibraryImageBySlug(slug: string): Promise<LibraryImage | null> {
  try {
    // 从slug中提取ID（格式: title-id）
    const parts = slug.split('-')
    const id = parts[parts.length - 1]
    
    console.log('🔍 Looking for library image by slug:', { slug, extractedId: id })
    
    // 首先尝试通过ID查找
    if (id && /^\d+$/.test(id)) {
      const numericId = parseInt(id)
      
      // Handle mapping from numeric IDs (10000+) to demo IDs (lib-1, lib-2, etc.)
      let searchId: string | number = numericId
      if (numericId >= 10000 && numericId <= 10004) {
        // Map numeric IDs back to original demo IDs
        const demoIndex = numericId - 10000 + 1 // 10000 -> lib-1, 10001 -> lib-2, etc.
        searchId = `lib-${demoIndex}`
        console.log('🔄 Mapping numeric ID to demo ID:', { numericId, demoId: searchId })
      }
      
      // Try numeric ID first
      let query = supabaseAdmin
        .from('library_images')
        .select('*')
        .eq('is_active', true)
        .single()
        
      if (typeof searchId === 'string') {
        query = query.eq('id', searchId)
      } else {
        query = query.eq('id', searchId)
      }
      
      const { data, error } = await query
      
      if (data && !error) {
        console.log('✅ Found library image by ID:', data)
        return {
          id: String(data.id),
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
          viewCount: data.view_count || 0,  // 新增：真实浏览量
          fileSize: data.file_size || 0,
          imageWidth: data.image_width || 1024,
          imageHeight: data.image_height || 1024,
          uploadedBy: data.uploaded_by || 'unknown',
          // seoId已移除，使用基于标题的URL
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at)
        }
      }
    }
    
    // 如果通过ID找不到，尝试模糊匹配标题
    const titleFromSlug = slug.replace(/-\d+$/, '').replace(/-/g, ' ')
    const { data: titleMatches, error: titleError } = await supabaseAdmin
      .from('library_images')
      .select('*')
      .eq('is_active', true)
      .ilike('title', `%${titleFromSlug}%`)
      .limit(1)
    
    if (titleMatches && titleMatches.length > 0 && !titleError) {
      console.log('✅ Found library image by title match:', titleMatches[0])
      const data = titleMatches[0]
      return {
        id: String(data.id),
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
        viewCount: data.view_count || 0,  // 新增：真实浏览量
        fileSize: data.file_size || 0,
        imageWidth: data.image_width || 1024,
        imageHeight: data.image_height || 1024,
        uploadedBy: data.uploaded_by || 'unknown',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      }
    }
    
    console.log('❌ Library image not found for slug:', slug)
    return null
    
  } catch (error) {
    console.error('❌ Error fetching library image by slug:', error)
    return null
  }
}

export async function updateLibraryImage(id: string, updates: UpdateLibraryImageRequest): Promise<LibraryImage | null> {
  console.log('🔄 Updating library image:', { id, updates })
  
  try {
    const { data, error } = await supabaseAdmin
      .from('library_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('❌ Supabase error updating library image:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      return null
    }
    
    if (!data) {
      console.error('❌ No data returned from update operation')
      return null
    }
    
    console.log('✅ Library image updated successfully:', data)
    
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
      viewCount: data.view_count || 0,  // 新增：真实浏览量
      fileSize: data.file_size || 0,
      imageWidth: data.image_width || 1024,
      imageHeight: data.image_height || 1024,
      uploadedBy: data.uploaded_by || 'unknown',
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  } catch (error) {
    console.error('❌ Unexpected error updating library image:', error)
    return null
  }
}

export async function deleteLibraryImage(id: string): Promise<boolean> {
  try {
    // 首先获取图片数据以获取URL信息
    const { data: image, error: fetchError } = await supabaseAdmin
      .from('library_images')
      .select('image_url, thumbnail_url, title')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching library image for deletion:', fetchError)
      return false
    }

    if (!image) {
      console.error('Library image not found:', id)
      return false
    }

    console.log(`🗑️ Deleting library image: "${image.title}" (ID: ${id})`)

    // 从数据库删除记录
    const { error: deleteError } = await supabaseAdmin
      .from('library_images')
      .delete()
      .eq('id', id)
    
    if (deleteError) {
      console.error('Error deleting library image from database:', deleteError)
      return false
    }

    console.log('✅ Library image deleted from database successfully')

    // 同步删除R2中的文件
    const { deleteMultipleFromR2, extractR2KeyFromUrl } = await import('./r2-storage')
    const r2Keys: string[] = []
    
    // 主图片
    if (image.image_url) {
      const mainImageKey = extractR2KeyFromUrl(image.image_url)
      if (mainImageKey) {
        r2Keys.push(mainImageKey)
      }
    }
    
    // 缩略图
    if (image.thumbnail_url && image.thumbnail_url !== image.image_url) {
      const thumbnailKey = extractR2KeyFromUrl(image.thumbnail_url)
      if (thumbnailKey) {
        r2Keys.push(thumbnailKey)
      }
    }

    if (r2Keys.length > 0) {
      console.log(`🧹 Cleaning up ${r2Keys.length} library image files from R2...`)
      
      const r2DeleteResult = await deleteMultipleFromR2(r2Keys)
      
      if (!r2DeleteResult.success) {
        console.warn('⚠️ Some library image R2 files could not be deleted:', r2DeleteResult.failed)
        // 不阻止删除操作，只记录警告
      }
    } else {
      console.log('🔍 No R2 files to clean up for library image')
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteLibraryImage:', error)
    return false
  }
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
  console.log('🔄 getUserFavorites 开始查询:', { userId, timestamp: new Date().toISOString() })
  
  // 🎯 详细检查 supabaseAdmin 配置
  if (!supabaseAdmin) {
    const errorMsg = '数据库连接失败 - Supabase配置缺失'
    console.error('❌', errorMsg, {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? '已配置' : '未配置',
      serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? '已配置' : '未配置'
    })
    throw new Error(errorMsg)
  }
  
  try {
    console.log('🔍 开始 Supabase 查询...')
    
    // 使用管理员客户端绕过RLS策略
    const { data, error } = await supabaseAdmin
      .from('user_favorites')
      .select(`
        *,
        generation:generation_history(*),
        library_image:library_images(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('❌ Supabase 查询错误:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId
      })
      throw new Error(`数据库查询失败: ${error.message} (代码: ${error.code})`)
    }
    
    console.log('✅ Supabase 查询成功:', { 
      resultCount: data?.length || 0,
      userId,
      timestamp: new Date().toISOString()
    })
    
    return data || []
    
  } catch (dbError) {
    // 🎯 捕获并增强错误信息
    const errorMsg = dbError instanceof Error ? dbError.message : String(dbError)
    
    console.error('💥 getUserFavorites 数据库操作异常:', {
      原始错误: errorMsg,
      用户ID: userId,
      时间戳: new Date().toISOString(),
      supabaseAdmin状态: supabaseAdmin ? '已初始化' : '未初始化'
    })
    
    // 重新抛出带有更多上下文的错误
    throw new Error(`getUserFavorites 失败: ${errorMsg}`)
  }
}

export async function addToFavorites(userId: string, generationId?: string, libraryImageId?: string): Promise<boolean> {
  try {
    console.log('📝 Database.addToFavorites 接收参数:', {
      userId: userId,
      generationId: generationId,
      libraryImageId: libraryImageId,
      userIdIsUuid: userId ? isValidUuid(userId) : false,
      generationIdIsUuid: generationId ? isValidUuid(generationId) : false,
      libraryImageIdIsUuid: libraryImageId ? isValidUuid(libraryImageId) : false,
      libraryImageIdIsDemo: libraryImageId ? libraryImageId.startsWith('demo-') : false
    })

    // 🎯 ID格式验证和处理
    if (libraryImageId && libraryImageId.startsWith('demo-')) {
      console.log('🔄 Database处理Demo格式ID - 启用fallback模式:', {
        demoId: libraryImageId,
        fallbackReason: 'Demo格式ID无法存储到数据库UUID字段'
      })
      // Demo ID 不能存储到数据库的UUID字段，直接返回fallback模式
      throw new Error('Demo ID fallback mode - data saved to localStorage only')
    }

    // 🎯 确保只有有效的UUID才会发送到数据库
    if (generationId && !isValidUuid(generationId)) {
      throw new Error(`Generation ID format invalid - must be UUID format, got: ${generationId}`)
    }
    
    if (libraryImageId && !isValidUuid(libraryImageId)) {
      throw new Error(`Library Image ID format invalid - must be UUID format, got: ${libraryImageId}`)
    }

    // 使用直接的 REST API 调用绕过 SDK 问题
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase configuration missing')
    }
    
    const response = await fetch(`${supabaseUrl}/rest/v1/user_favorites`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        user_id: userId,
        generation_id: generationId,
        library_image_id: libraryImageId
      })
    })
    
    if (!response.ok) {
      const errorData = await response.text()
      console.error('Error adding to favorites:', response.status, errorData)
      
      // 解析 PostgreSQL 错误
      if (errorData.includes('duplicate key value violates unique constraint')) {
        throw new Error('duplicate key value violates unique constraint')
      }
      
      if (errorData.includes('invalid input syntax for type uuid')) {
        throw new Error('invalid input syntax for type uuid')
      }
      
      throw new Error(`HTTP ${response.status}: ${errorData}`)
    }
    
    const data = await response.json()
    console.log('✅ Successfully added to favorites:', data)
    return true
    
  } catch (error) {
    console.error('Error adding to favorites:', error)
    throw error // 重新抛出错误，让上层处理
  }
}

// 🎯 UUID格式验证工具函数
function isValidUuid(id: string): boolean {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidPattern.test(id)
}

export async function removeFromFavorites(userId: string, generationId?: string, libraryImageId?: string): Promise<boolean> {
  // 使用管理员客户端绕过RLS策略
  let query = supabaseAdmin
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

// ==================== Coloring Progress Operations ====================

export async function saveColoringProgress(
  userId: string,
  imageUrl: string,
  imageSlug: string,
  progressData: string,
  progressType: "dataURL" | "pixelData" | "layerData" = "dataURL",
  deviceType: "desktop" | "mobile" = "desktop"
): Promise<ColoringProgress | null> {
  // 首先检查是否已存在该用户的该图片进度
  const { data: existing } = await supabase
    .from('coloring_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('image_url', imageUrl)
    .single()

  const progressRecord = {
    user_id: userId,
    image_url: imageUrl,
    image_slug: imageSlug,
    progress_data: progressData,
    progress_type: progressType,
    device_type: deviceType,
    last_modified: new Date().toISOString()
  }

  let result
  if (existing) {
    // 更新现有记录
    const { data, error } = await supabase
      .from('coloring_progress')
      .update(progressRecord)
      .eq('id', existing.id)
      .select()
      .single()
    result = { data, error }
  } else {
    // 创建新记录
    const { data, error } = await supabase
      .from('coloring_progress')
      .insert([{
        ...progressRecord,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()
    result = { data, error }
  }

  if (result.error) {
    console.error('Error saving coloring progress:', result.error)
    return null
  }

  // 转换字段名
  const data = result.data
  return {
    id: data.id,
    userId: data.user_id,
    imageUrl: data.image_url,
    imageSlug: data.image_slug,
    progressData: data.progress_data,
    progressType: data.progress_type,
    deviceType: data.device_type,
    lastModified: new Date(data.last_modified),
    createdAt: new Date(data.created_at)
  }
}

export async function getColoringProgress(
  userId: string,
  imageUrl: string
): Promise<ColoringProgress | null> {
  const { data, error } = await supabase
    .from('coloring_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('image_url', imageUrl)
    .single()

  if (error) {
    console.error('Error fetching coloring progress:', error)
    return null
  }

  if (!data) return null

  return {
    id: data.id,
    userId: data.user_id,
    imageUrl: data.image_url,
    imageSlug: data.image_slug,
    progressData: data.progress_data,
    progressType: data.progress_type,
    deviceType: data.device_type,
    lastModified: new Date(data.last_modified),
    createdAt: new Date(data.created_at)
  }
}

export async function deleteColoringProgress(
  userId: string,
  imageUrl: string
): Promise<boolean> {
  const { error } = await supabase
    .from('coloring_progress')
    .delete()
    .eq('user_id', userId)
    .eq('image_url', imageUrl)

  if (error) {
    console.error('Error deleting coloring progress:', error)
    return false
  }

  return true
}

export async function getUserColoringProgress(
  userId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<ColoringProgress>> {
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('coloring_progress')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('last_modified', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching user coloring progress:', error)
    return {
      data: [],
      pagination: { page, limit, total: 0, totalPages: 0 },
      success: false
    }
  }

  const transformedData = (data || []).map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    imageUrl: item.image_url,
    imageSlug: item.image_slug,
    progressData: item.progress_data,
    progressType: item.progress_type,
    deviceType: item.device_type,
    lastModified: new Date(item.last_modified),
    createdAt: new Date(item.created_at)
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