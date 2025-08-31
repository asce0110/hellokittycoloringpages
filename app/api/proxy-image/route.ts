import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('url')
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image URL provided' },
        { status: 400 }
      )
    }

    console.log('🔄 Proxying image request (GET) for:', imageUrl)
    
    // 获取图片数据
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'AI-Kitty-Creator/1.0',
        'Accept': 'image/*,*/*',
      },
    })

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const imageBuffer = await response.arrayBuffer()

    console.log('✅ Successfully proxied image (GET):', {
      contentType,
      size: imageBuffer.byteLength,
      url: imageUrl
    })

    // 返回图片数据，设置正确的CORS头部
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    })
  } catch (error) {
    console.error('❌ Image proxy error (GET):', error)
    return NextResponse.json(
      { error: 'Internal server error while proxying image' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json()
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image URL provided' },
        { status: 400 }
      )
    }

    console.log('🔄 Proxying image request for:', imageUrl)
    
    // 获取图片数据
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'AI-Kitty-Creator/1.0',
        'Accept': 'image/*,*/*',
      },
    })

    if (!response.ok) {
      console.error('❌ Failed to fetch image:', response.status, response.statusText)
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const contentType = response.headers.get('content-type') || 'image/png'
    const imageBuffer = await response.arrayBuffer()

    console.log('✅ Successfully proxied image:', {
      contentType,
      size: imageBuffer.byteLength,
      url: imageUrl
    })

    // 返回图片数据，设置正确的CORS头部
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=3600', // 缓存1小时
      },
    })
  } catch (error) {
    console.error('❌ Image proxy error:', error)
    return NextResponse.json(
      { error: 'Internal server error while proxying image' },
      { status: 500 }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}