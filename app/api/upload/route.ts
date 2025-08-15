import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2Server, isR2Configured } from '@/lib/r2-storage'
import { compressLineArtImage, validateColoringPageImage } from '@/lib/image-compression-safe'

export async function POST(request: NextRequest) {
  try {
    // Check if R2 is configured
    if (!isR2Configured()) {
      return NextResponse.json(
        { 
          error: 'R2 storage not configured. Please set up Cloudflare R2 environment variables.',
          fallback: true 
        },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'
    const type = formData.get('type') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Determine folder based on type
    let targetFolder = folder
    switch (type) {
      case 'library':
        targetFolder = 'library'
        break
      case 'banner':
        targetFolder = 'banners'
        break
      case 'hero':
        targetFolder = 'hero'
        break
      case 'avatar':
        targetFolder = 'avatars'
        break
      case 'reference':
        targetFolder = 'references'
        break
      default:
        targetFolder = 'uploads'
    }

    // Convert file to buffer for server-side upload
    const buffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(buffer)

    console.log(`🎨 Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)

    // 压缩图片 - 专为Hello Kitty线稿图优化 (内置错误处理)
    const compressionResult = await compressLineArtImage(fileBuffer, file.name)

    // 验证图片是否适合作为着色页
    if (compressionResult.metadata) {
      const validation = validateColoringPageImage({
        width: compressionResult.metadata.width,
        height: compressionResult.metadata.height,
        format: compressionResult.metadata.format,
        size: compressionResult.originalSize
      })
      
      if (validation.warnings.length > 0) {
        console.log('⚠️ Image validation warnings:', validation.warnings)
      }
    }

    // 上传压缩后的主图到R2
    const compressedResult = await uploadToR2Server(
      compressionResult.compressedBuffer!,
      file.name,
      'image/png', // 强制PNG格式以保持透明度
      targetFolder
    )

    if (!compressedResult.success) {
      return NextResponse.json(
        { error: compressedResult.error || 'Main image upload failed' },
        { status: 500 }
      )
    }

    // 上传缩略图到R2 (thumbnails文件夹)
    const thumbnailResult = await uploadToR2Server(
      compressionResult.thumbnailBuffer!,
      `thumb_${file.name}`,
      'image/png',
      `${targetFolder}/thumbnails`
    )

    console.log(`✅ Upload complete: ${compressionResult.compressionRatio.toFixed(1)}% compression`)

    const result = compressedResult

    if (result.success) {
      return NextResponse.json({
        success: true,
        url: result.url,
        thumbnailUrl: thumbnailResult.success ? thumbnailResult.url : result.url,
        key: result.key,
        thumbnailKey: thumbnailResult.key,
        filename: file.name,
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        compressionRatio: compressionResult.compressionRatio,
        type: 'image/png', // 压缩后统一为PNG格式
        metadata: compressionResult.metadata,
        warnings: compressionResult.metadata ? validateColoringPageImage({
          width: compressionResult.metadata.width,
          height: compressionResult.metadata.height,
          format: compressionResult.metadata.format,
          size: compressionResult.originalSize
        }).warnings : []
      })
    } else {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Upload API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}