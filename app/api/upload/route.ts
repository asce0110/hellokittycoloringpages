import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2Server, isR2Configured } from '@/lib/r2-storage'
import { validateColoringPageImage } from '@/lib/image-compression-safe'

// 智能压缩函数 - 适配不同文件大小和类型
async function smartImageCompression(inputBuffer: Buffer, filename: string) {
  const originalSize = inputBuffer.length
  const originalSizeMB = originalSize / 1024 / 1024
  
  console.log(`🔄 [智能压缩] 开始: ${filename} | ${originalSizeMB.toFixed(1)}MB`)
  
  try {
    const sharp = require('sharp')
    console.log('✅ Sharp加载成功')
    
    const image = sharp(inputBuffer)
    console.log('✅ Sharp实例创建成功')
    
    const metadata = await image.metadata()
    console.log(`📋 元数据: ${metadata.width}x${metadata.height} ${metadata.format} | 通道: ${metadata.channels}`)
    
    // 检查图片类型和大小，选择最佳压缩策略
    let bestBuffer = inputBuffer
    let bestSize = originalSize
    let bestFormat = 'original'
    
    // 策略1: 尝试PNG调色板压缩 (适合线稿图)
    if (metadata.format === 'png' || metadata.channels <= 4) {
      console.log('🎯 尝试PNG调色板压缩...')
      try {
        const pngBuffer = await image
          .png({
            compressionLevel: 9,
            palette: true,
            colors: originalSizeMB > 5 ? 64 : 128, // 大文件用更少颜色
            progressive: false,
            adaptiveFiltering: true
          })
          .toBuffer()
        
        if (pngBuffer.length < bestSize) {
          bestBuffer = pngBuffer
          bestSize = pngBuffer.length
          bestFormat = 'png'
          console.log(`✅ PNG调色板: ${(bestSize/1024).toFixed(1)}KB`)
        }
      } catch (pngError) {
        console.log('⚠️ PNG调色板压缩失败，尝试其他方法')
      }
    }
    
    // 策略2: 尝试标准PNG压缩
    if (bestFormat === 'original') {
      console.log('🎯 尝试标准PNG压缩...')
      try {
        const standardPngBuffer = await image
          .png({
            compressionLevel: 9,
            palette: false,
            progressive: false,
            adaptiveFiltering: true
          })
          .toBuffer()
        
        if (standardPngBuffer.length < bestSize) {
          bestBuffer = standardPngBuffer
          bestSize = standardPngBuffer.length
          bestFormat = 'png'
          console.log(`✅ 标准PNG: ${(bestSize/1024).toFixed(1)}KB`)
        }
      } catch (stdError) {
        console.log('⚠️ 标准PNG压缩失败')
      }
    }
    
    // 策略3: 尝试WebP压缩 (特别适合大文件)
    if (originalSizeMB > 1) {
      console.log('🎯 尝试WebP压缩...')
      try {
        const webpBuffer = await image
          .webp({
            quality: originalSizeMB > 5 ? 75 : 85, // 大文件用更低质量
            effort: 6,
            lossless: false
          })
          .toBuffer()
        
        if (webpBuffer.length < bestSize * 0.8) { // WebP需要显著减少才采用
          bestBuffer = webpBuffer
          bestSize = webpBuffer.length
          bestFormat = 'webp'
          console.log(`✅ WebP压缩: ${(bestSize/1024).toFixed(1)}KB`)
        }
      } catch (webpError) {
        console.log('⚠️ WebP压缩失败')
      }
    }
    
    // 策略4: 如果图片很大，尝试降低尺寸
    if (originalSizeMB > 3 && metadata.width && metadata.height) {
      const maxDimension = Math.max(metadata.width, metadata.height)
      if (maxDimension > 2000) {
        console.log('🎯 尝试降低分辨率压缩...')
        try {
          const resizedBuffer = await image
            .resize(2000, 2000, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .png({
              compressionLevel: 9,
              palette: true,
              colors: 128
            })
            .toBuffer()
          
          if (resizedBuffer.length < bestSize * 0.7) { // 降分辨率需要显著减少
            bestBuffer = resizedBuffer
            bestSize = resizedBuffer.length
            bestFormat = 'png-resized'
            console.log(`✅ 降分辨率: ${(bestSize/1024).toFixed(1)}KB`)
          }
        } catch (resizeError) {
          console.log('⚠️ 降分辨率失败')
        }
      }
    }
    
    const compressionRatio = ((originalSize - bestSize) / originalSize) * 100
    
    console.log(`📊 最终结果: ${(originalSize/1024).toFixed(1)}KB → ${(bestSize/1024).toFixed(1)}KB (${compressionRatio.toFixed(1)}%)`)
    
    // 如果压缩效果不明显，使用原图
    if (compressionRatio < 5) {
      console.log('⚠️ 压缩效果不明显，使用原图')
      return {
        success: true,
        originalBuffer: inputBuffer,
        compressedBuffer: inputBuffer,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 0,
        format: 'original'
      }
    }
    
    return {
      success: true,
      originalBuffer: inputBuffer,
      compressedBuffer: bestBuffer,
      originalSize,
      compressedSize: bestSize,
      compressionRatio,
      format: bestFormat
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('❌ 智能压缩失败:', errorMessage)
    
    return {
      success: false,
      originalBuffer: inputBuffer,
      compressedBuffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      format: 'original',
      error: errorMessage
    }
  }
}

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
    
    // 为每个上传的图片生成永久的6位SEO ID
    const seoId = Date.now().toString().slice(-6)
    console.log(`🆔 Generated permanent seoId: ${seoId} for file: ${file.name}`)

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

    // Validate file size (max 20MB for testing)
    const maxSize = 20 * 1024 * 1024 // 20MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 20MB.' },
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

    console.log('='.repeat(60))
    console.log(`🎨 Processing ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
    console.log(`🔄 Starting SIMPLE image compression...`)
    console.log(`📄 File info:`, { name: file.name, size: fileBuffer.length, type: file.type })
    console.log('='.repeat(60))
    
    // 使用智能压缩处理不同类型和大小的图片
    console.log('🧠 [API] 开始智能压缩处理...')
    console.log('🧠 [API] 调用 smartImageCompression 函数')
    const compressionResult = await smartImageCompression(fileBuffer, file.name)
    console.log('🧠 [API] smartImageCompression 函数返回:', compressionResult.success ? '成功' : '失败')
    
    console.log('📋 Final compression result:', {
      success: compressionResult.success,
      originalSize: compressionResult.originalSize,
      compressedSize: compressionResult.compressedSize,
      compressionRatio: compressionResult.compressionRatio,
      format: compressionResult.format
    })

    // 验证图片是否适合作为着色页
    const validation = validateColoringPageImage({
      width: 800, // 默认值，因为简化版本没有metadata
      height: 600,
      format: compressionResult.format,
      size: compressionResult.originalSize
    })
    
    if (validation.warnings.length > 0) {
      console.log('⚠️ Image validation warnings:', validation.warnings)
    }

    // 上传压缩后的主图到R2
    const finalMimeType = compressionResult.format === 'webp' ? 'image/webp' : 'image/png';
    const compressedResult = await uploadToR2Server(
      compressionResult.compressedBuffer,
      file.name,
      finalMimeType,
      targetFolder
    )

    // 为打印功能保留高分辨率原图版本
    let printVersionResult = null
    try {
      console.log('🖨️ 创建高分辨率打印版本...')
      const sharp = require('sharp')
      const image = sharp(fileBuffer)
      const metadata = await image.metadata()
      
      // 创建适合打印的高分辨率版本 (300DPI适合A4打印)
      // 计算图片比例，确保充分利用A4空间
      const maxWidth = 2480   // A4横向最大宽度 at 300DPI (8.27")
      const maxHeight = 3508  // A4纵向最大高度 at 300DPI (11.69")
      
      // 根据图片比例选择最佳方向和尺寸
      let targetWidth, targetHeight
      if (metadata.width && metadata.height) {
        const aspectRatio = metadata.width / metadata.height
        
        if (aspectRatio > 1) {
          // 横向图片：以宽度为准
          targetWidth = maxWidth
          targetHeight = Math.floor(maxWidth / aspectRatio)
          // 如果高度超出，则以高度为准重新计算
          if (targetHeight > maxHeight) {
            targetHeight = maxHeight
            targetWidth = Math.floor(maxHeight * aspectRatio)
          }
        } else {
          // 纵向图片：以高度为准
          targetHeight = maxHeight
          targetWidth = Math.floor(maxHeight * aspectRatio)
          // 如果宽度超出，则以宽度为准重新计算
          if (targetWidth > maxWidth) {
            targetWidth = maxWidth
            targetHeight = Math.floor(maxWidth / aspectRatio)
          }
        }
      } else {
        // 默认尺寸
        targetWidth = maxWidth
        targetHeight = maxHeight
      }
      
      console.log(`🖨️ 生成打印版本: ${targetWidth}×${targetHeight}px (原图: ${metadata.width}×${metadata.height}px)`)
      
      const printBuffer = await image
        .resize(targetWidth, targetHeight, {
          fit: 'inside',
          withoutEnlargement: false, // 允许放大以获得更好的打印质量
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png({
          compressionLevel: 6,
          palette: false, // 保持全彩色用于打印
          quality: 95
        })
        .toBuffer()

      printVersionResult = await uploadToR2Server(
        printBuffer,
        `print_${file.name}`,
        'image/png',
        `${targetFolder}/print`
      )
      
      if (printVersionResult.success) {
        console.log(`✅ 打印版本上传成功: ${(printBuffer.length/1024).toFixed(1)}KB`)
      }
    } catch (printError) {
      console.log('⚠️ 打印版本创建失败，将使用压缩版本:', printError)
    }

    if (!compressedResult.success) {
      return NextResponse.json(
        { error: compressedResult.error || 'Main image upload failed' },
        { status: 500 }
      )
    }

    // 创建简单缩略图 (使用原图作为缩略图，可以后续优化)
    const thumbnailResult = await uploadToR2Server(
      compressionResult.compressedBuffer,
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
        printUrl: printVersionResult?.success ? printVersionResult.url : result.url, // 高分辨率打印版本
        thumbnailUrl: thumbnailResult.success ? thumbnailResult.url : result.url,
        key: result.key,
        printKey: printVersionResult?.key, // 打印版本的key
        thumbnailKey: thumbnailResult.key,
        filename: file.name,
        originalSize: compressionResult.originalSize,
        compressedSize: compressionResult.compressedSize,
        compressionRatio: compressionResult.compressionRatio,
        type: finalMimeType,
        metadata: {
          width: 800, // 简化版本的默认值
          height: 600,
          format: compressionResult.format,
          hasAlpha: true
        },
        warnings: validation.warnings
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

// 处理OPTIONS请求（用于CORS预检查）
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json(
    { message: 'Upload API is available' },
    { 
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  )
}