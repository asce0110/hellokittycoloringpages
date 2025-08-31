import { NextRequest, NextResponse } from 'next/server'
import { getLibraryImageById } from '@/lib/database'

// POST /api/download - 处理图片下载
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { libraryImageId, type = 'standard' } = body // type: 'standard' | 'print'
    
    console.log('处理下载请求:', { libraryImageId, type })
    
    if (!libraryImageId) {
      return NextResponse.json({
        success: false,
        error: '缺少libraryImageId参数'
      }, { status: 400 })
    }
    
    try {
      // 从数据库获取图片信息
      const image = await getLibraryImageById(libraryImageId)
      
      if (!image) {
        return NextResponse.json({
          success: false,
          error: '图片未找到'
        }, { status: 404 })
      }
      
      // 根据类型选择合适的URL
      const downloadUrl = type === 'print' && image.printUrl 
        ? image.printUrl 
        : image.imageUrl
      
      // 增加下载计数 (可选)
      // 这里可以添加analytics tracking
      console.log(`图片下载: ${image.title} (${type})`)
      
      // 返回下载信息
      return NextResponse.json({
        success: true,
        downloadUrl,
        filename: `${image.title.replace(/[^a-zA-Z0-9]/g, '_')}_${type}.png`,
        image: {
          id: image.id,
          title: image.title,
          description: image.description
        }
      })
      
    } catch (dbError) {
      console.log('数据库连接失败，使用fallback处理:', dbError)
      
      // 开发环境fallback - 返回占位图片
      return NextResponse.json({
        success: true,
        downloadUrl: '/hello-kitty-coloring-page.png',
        filename: `hello_kitty_coloring_${type}.png`,
        fallback: true,
        image: {
          id: libraryImageId,
          title: 'Hello Kitty Coloring Page',
          description: 'A beautiful Hello Kitty coloring page'
        }
      })
    }
    
  } catch (error) {
    console.error('下载处理失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '下载处理失败'
    }, { status: 500 })
  }
}

// GET /api/download - 直接下载文件 (可选的直接下载端点)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const libraryImageId = searchParams.get('id')
    const type = searchParams.get('type') || 'standard'
    
    if (!libraryImageId) {
      return NextResponse.json({
        success: false,
        error: '缺少id参数'
      }, { status: 400 })
    }
    
    // 重用POST逻辑
    const mockRequest = new Request('http://localhost', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ libraryImageId, type })
    })
    
    const postResponse = await POST(mockRequest as NextRequest)
    const data = await postResponse.json()
    
    if (data.success && data.downloadUrl) {
      // 重定向到实际的下载URL
      return NextResponse.redirect(data.downloadUrl)
    } else {
      return NextResponse.json(data, { status: postResponse.status })
    }
    
  } catch (error) {
    console.error('直接下载失败:', error)
    
    return NextResponse.json({
      success: false,
      error: '直接下载失败'
    }, { status: 500 })
  }
}