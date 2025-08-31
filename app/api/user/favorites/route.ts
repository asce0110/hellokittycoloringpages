import { NextRequest, NextResponse } from 'next/server'
import { getUserFavorites, addToFavorites, removeFromFavorites } from '@/lib/database'

// 类型安全的错误消息提取工具函数
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

// GET /api/user/favorites - 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 API 收藏列表请求开始')
    
    // 获取用户ID - 优先从认证头部获取，其次从测试头部
    let userId = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!userId) {
      userId = request.headers.get('x-user-id') ?? undefined
    }
    if (!userId) {
      // 开发环境fallback - 使用有效的UUID格式
      userId = '550e8400-e29b-41d4-a716-446655440100' // 对应realAdminUser的UUID
    }
    
    // 🎯 用户ID格式验证 - 确保是有效的UUID
    const isValidUuid = (id: string): boolean => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    }
    
    if (!isValidUuid(userId)) {
      console.error('🔍 GET用户ID格式验证失败:', {
        userId: userId,
        isValidUuid: isValidUuid(userId),
        userIdLength: userId?.length,
        userIdType: typeof userId
      })
      
      return NextResponse.json({
        success: false,
        favorites: [],
        count: 0,
        error: `Invalid user ID format - must be UUID format, received: ${userId}`,
        errorType: 'validation',
        fallback: true, // 用户ID无效时仍然启用fallback
        mode: 'error'
      }, { status: 503 })
    }
    
    console.log('📋 获取收藏列表，用户ID:', userId)
    
    // 🎯 首先检查数据库连接是否可用
    try {
      // 检查 supabase 配置
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      
      if (!supabaseUrl || !supabaseServiceKey) {
        console.warn('⚠️ Supabase 环境变量未配置，启用fallback模式')
        return NextResponse.json({
          success: false,
          favorites: [],
          count: 0,
          error: 'Supabase environment variables not configured',
          fallback: true,
          mode: 'development',
          troubleshooting: 'Please check SUPABASE configuration in .env.local'
        }, { status: 503 })
      }
      
      console.log('✅ Supabase 配置检查通过，尝试数据库查询...')
      const favorites = await getUserFavorites(userId)
      
      console.log('✅ 成功获取收藏列表:', { count: favorites.length, userId })
      return NextResponse.json({
        success: true,
        favorites,
        count: favorites.length,
        mode: 'database'
      })
      
    } catch (dbError) {
      const errorMsg = getErrorMessage(dbError)
      console.error('❌ 数据库连接失败:', {
        error: errorMsg,
        userId,
        timestamp: new Date().toISOString()
      })
      
      // 🎯 分析错误类型并提供针对性的fallback响应
      const isConfigError = errorMsg.includes('Supabase配置缺失') || 
                           errorMsg.includes('fetch is not defined') ||
                           errorMsg.includes('NetworkError') ||
                           !errorMsg
      
      const isConnectionTimeout = errorMsg.includes('timeout') || 
                                 errorMsg.includes('ECONNREFUSED') ||
                                 errorMsg.includes('network')
      
      return NextResponse.json({
        success: false,
        favorites: [],
        count: 0,
        error: isConfigError 
          ? 'Supabase 配置缺失或无效 - 将使用本地缓存' 
          : isConnectionTimeout
          ? '数据库连接超时 - 将使用本地缓存'
          : '数据库查询失败 - 将使用本地缓存',
        fallback: true,
        mode: 'fallback',
        dbError: errorMsg,
        troubleshooting: isConfigError 
          ? '请检查 .env.local 中的 SUPABASE_SERVICE_ROLE_KEY 和 NEXT_PUBLIC_SUPABASE_URL'
          : '请检查 Supabase 服务状态或网络连接',
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }
  } catch (error) {
    console.error('💥 API 路由意外错误:', error)
    
    return NextResponse.json({
      success: false,
      error: 'API route processing failed',
      favorites: [],
      count: 0,
      fallback: true,
      mode: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST /api/user/favorites - 添加收藏
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { libraryImageId, generationId, userId: bodyUserId } = body
    
    // 获取用户ID - 优先从请求体获取，其次从认证头部获取，最后从测试头部
    let userId = bodyUserId
    if (!userId) {
      userId = request.headers.get('authorization')?.replace('Bearer ', '')
    }
    if (!userId) {
      userId = request.headers.get('x-user-id') ?? undefined
    }
    if (!userId) {
      // 开发环境fallback - 使用有效的UUID格式
      userId = '550e8400-e29b-41d4-a716-446655440100' // 对应realAdminUser的UUID
    }
    
    // 🎯 用户ID格式验证 - 确保是有效的UUID
    const isValidUuid = (id: string): boolean => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    }
    
    if (!isValidUuid(userId)) {
      console.error('🔍 POST用户ID格式验证失败:', {
        userId: userId,
        isValidUuid: isValidUuid(userId),
        userIdLength: userId?.length,
        userIdType: typeof userId,
        receivedFrom: bodyUserId ? 'request body' : 
                      request.headers.get('authorization') ? 'authorization header' :
                      request.headers.get('x-user-id') ? 'x-user-id header' : 'fallback'
      })
      
      return NextResponse.json({
        success: false,
        error: `Invalid user ID format - must be UUID format, received: ${userId}`,
        errorType: 'validation',
        fallback: true, // 用户ID无效时启用fallback
        troubleshooting: 'Please check user authentication status or re-login'
      }, { status: 503 })
    }
    
    // 详细的参数日志记录
    console.log('📝 添加收藏请求详情:', { 
      userId, 
      libraryImageId, 
      generationId,
      userIdType: typeof userId,
      libraryImageIdType: typeof libraryImageId,
      generationIdType: typeof generationId,
      requestHeaders: {
        authorization: request.headers.get('authorization')?.substring(0, 20) + '...',
        contentType: request.headers.get('content-type')
      },
      bodyContent: body
    })
    
    if (!libraryImageId && !generationId) {
      return NextResponse.json({
        success: false,
        error: 'Must provide libraryImageId or generationId'
      }, { status: 400 })
    }
    
    try {
      const success = await addToFavorites(userId, generationId, libraryImageId)
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Added to favorites'
        })
      } else {
        throw new Error('Database operation failed')
      }
    } catch (dbError) {
      console.error('❌ 收藏操作失败:', dbError)
      
      const errorMessage = getErrorMessage(dbError)
      
      // 测试各个条件匹配
      const isDuplicate = errorMessage.includes('duplicate key value violates unique constraint') || 
                          errorMessage.includes('duplicate key value violates') ||
                          errorMessage.includes('already exists')
      const isForeignKey = errorMessage.includes('violates foreign key constraint') || 
                           errorMessage.includes('is not present in table') ||
                           errorMessage.includes('user_favorites_user_id_fkey')
      const isUuidError = errorMessage.includes('invalid input syntax for type uuid')
      const isConfigMissing = errorMessage.includes('Supabase配置缺失') || !errorMessage
      
      console.log('🔍 分析数据库错误条件匹配:', { 
        errorMessage: errorMessage.substring(0, 200) + '...', 
        isDuplicate,
        isForeignKey,
        isUuidError,
        isConfigMissing
      })
      
      // 区分不同类型的数据库错误
      if (errorMessage.includes('duplicate key value violates unique constraint') || 
          errorMessage.includes('duplicate key value violates') ||
          errorMessage.includes('already exists')) {
        return NextResponse.json({
          success: false,
          error: 'This content is already in your favorites',
          errorType: 'duplicate',
          fallback: false
        }, { status: 409 }) // Conflict
      } else if (errorMessage.includes('violates foreign key constraint') || 
                 errorMessage.includes('is not present in table') ||
                 errorMessage.includes('user_favorites_user_id_fkey') ||
                 errorMessage.includes('Demo ID fallback mode')) {
        console.log('🔄 数据库操作需要fallback模式:', { 
          reason: errorMessage.includes('Demo ID fallback mode') ? 'Demo格式ID' : '外键约束',
          libraryImageId: libraryImageId,
          isDemoId: libraryImageId ? libraryImageId.startsWith('demo-') : false
        })
        
        return NextResponse.json({
          success: false,
          error: errorMessage.includes('Demo ID fallback mode') 
            ? 'Demo模式ID - 收藏功能使用本地缓存'
            : '数据库连接失败 - 收藏功能使用本地缓存',
          errorType: 'reference',
          fallback: true, // 启用fallback模式让前端使用localStorage
          troubleshooting: errorMessage.includes('Demo ID fallback mode')
            ? '开发模式：Demo格式的ID将保存到本地缓存'
            : '开发模式：数据将保存到本地缓存'
        }, { status: 503 }) // Service Unavailable - 让前端使用fallback
      } else if (errorMessage.includes('invalid input syntax for type uuid')) {
        console.error('🔍 UUID格式错误详情:', {
          userId, 
          libraryImageId, 
          generationId,
          userIdIsUuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(userId || ''),
          libraryImageIdIsUuid: libraryImageId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(libraryImageId) : 'N/A',
          generationIdIsUuid: generationId ? /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(generationId) : 'N/A',
          rawError: errorMessage
        })
        
        return NextResponse.json({
          success: false,
          error: '参数格式不正确 - 系统需要UUID格式的ID',
          errorType: 'validation',
          fallback: false,
          details: {
            userId: userId,
            libraryImageId: libraryImageId,
            generationId: generationId,
            expectedFormat: 'UUID (例如: f47ac10b-58cc-4372-a567-0e02b2c3d479)',
            receivedFormat: `userId: ${typeof userId}, libraryImageId: ${typeof libraryImageId}, generationId: ${typeof generationId}`
          }
        }, { status: 400 }) // Bad Request
      } else if (errorMessage.includes('Supabase配置缺失') || !errorMessage) {
        // 真正的连接问题
        return NextResponse.json({
          success: false,
          error: '数据库连接失败 - 收藏功能暂时不可用',
          fallback: true,
          dbError: errorMessage,
          troubleshooting: '请检查SUPABASE配置环境变量'
        }, { status: 503 })
      } else {
        // 其他数据库错误 - 在开发环境中启用fallback模式
        console.log('🔄 数据库操作失败，启用fallback模式:', errorMessage.substring(0, 100))
        
        return NextResponse.json({
          success: false,
          error: '数据库连接失败 - 收藏功能使用本地缓存',
          fallback: true, // 开发模式启用fallback
          dbError: errorMessage.substring(0, 200),
          troubleshooting: '开发模式：数据将保存到本地缓存'
        }, { status: 503 }) // Service Unavailable - 让前端使用localStorage
      }
    }
  } catch (error) {
    console.error('添加收藏失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to add favorite'
    }, { status: 500 })
  }
}

// DELETE /api/user/favorites - 移除收藏
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { libraryImageId, generationId, userId: bodyUserId } = body
    
    // 获取用户ID - 优先从请求体获取，其次从认证头部获取，最后从测试头部
    let userId = bodyUserId
    if (!userId) {
      userId = request.headers.get('authorization')?.replace('Bearer ', '')
    }
    if (!userId) {
      userId = request.headers.get('x-user-id') ?? undefined
    }
    if (!userId) {
      // 开发环境fallback - 使用有效的UUID格式
      userId = '550e8400-e29b-41d4-a716-446655440100' // 对应realAdminUser的UUID
    }
    
    // 🎯 用户ID格式验证 - 确保是有效的UUID
    const isValidUuid = (id: string): boolean => {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
    }
    
    if (!isValidUuid(userId)) {
      console.error('🔍 DELETE用户ID格式验证失败:', {
        userId: userId,
        isValidUuid: isValidUuid(userId),
        userIdLength: userId?.length,
        userIdType: typeof userId
      })
      
      return NextResponse.json({
        success: false,
        error: `Invalid user ID format - must be UUID format, received: ${userId}`,
        errorType: 'validation',
        fallback: true, // 用户ID无效时启用fallback
        troubleshooting: 'Please check user authentication status or re-login'
      }, { status: 503 })
    }
    
    console.log('移除收藏:', { userId, libraryImageId, generationId })
    
    if (!libraryImageId && !generationId) {
      return NextResponse.json({
        success: false,
        error: 'Must provide libraryImageId or generationId'
      }, { status: 400 })
    }
    
    try {
      const success = await removeFromFavorites(userId, generationId, libraryImageId)
      
      if (success) {
        return NextResponse.json({
          success: true,
          message: 'Removed from favorites'
        })
      } else {
        throw new Error('Database operation failed')
      }
    } catch (dbError) {
      console.error('❌ 数据库连接失败:', dbError)
      
      // 🎯 明确告知前端数据库连接失败，避免虚假成功
      return NextResponse.json({
        success: false,
        error: '数据库连接失败 - 收藏功能暂时不可用',
        fallback: true,
        dbError: getErrorMessage(dbError),
        troubleshooting: '请检查SUPABASE配置环境变量'
      }, { status: 503 })
    }
  } catch (error) {
    console.error('移除收藏失败:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to remove favorite'
    }, { status: 500 })
  }
}