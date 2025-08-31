import { NextRequest, NextResponse } from 'next/server'

/**
 * 颜色提取API端点
 * 接收图像URL，返回从图像中提取的主色调
 */
export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing imageUrl parameter' },
        { status: 400 }
      )
    }

    console.log('🎨 Extracting colors from image:', imageUrl)

    // 对于服务器端颜色提取，我们需要先获取图像数据
    let imageBuffer: ArrayBuffer
    
    try {
      const imageResponse = await fetch(imageUrl)
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch image: ${imageResponse.status}`)
      }
      imageBuffer = await imageResponse.arrayBuffer()
    } catch (error) {
      console.error('❌ Failed to fetch image for color extraction:', error)
      return NextResponse.json(
        { error: 'Failed to fetch image for color extraction' },
        { status: 400 }
      )
    }

    // 返回图像数据给客户端处理
    // 由于颜色提取需要Canvas API，我们让客户端处理
    return NextResponse.json({
      success: true,
      message: 'Use client-side color extraction',
      imageDataAvailable: true
    })

  } catch (error) {
    console.error('❌ Color extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract colors from image' },
      { status: 500 }
    )
  }
}

/**
 * 简单的颜色分析（如果需要服务器端处理）
 * 这里提供基础框架，实际颜色提取在客户端进行
 */
function analyzeImageColors(imageBuffer: ArrayBuffer): string[] {
  // TODO: 如果需要服务器端颜色提取，可以使用Sharp库
  // 目前返回空数组，让客户端处理
  return []
}