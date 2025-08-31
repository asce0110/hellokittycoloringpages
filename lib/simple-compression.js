// 简化的图片压缩实现 - JavaScript版本，确保运行时正常工作

/**
 * 简单直接的图片压缩函数
 */
async function simpleImageCompression(inputBuffer, filename) {
  const originalSize = inputBuffer.length
  
  console.log(`🔄 [SIMPLE] Starting compression for ${filename} (${(originalSize/1024).toFixed(1)}KB)`)
  
  try {
    // 直接导入Sharp
    const sharp = require('sharp')
    console.log('✅ [SIMPLE] Sharp loaded')
    
    // 创建Sharp实例
    const image = sharp(inputBuffer)
    
    // 获取图片信息
    const metadata = await image.metadata()
    console.log(`📋 [SIMPLE] Image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`)
    
    // 强制PNG压缩 - 适合线稿图
    const compressedBuffer = await image
      .png({
        compressionLevel: 9,      // 最高压缩
        palette: true,            // 使用调色板
        colors: 128,              // 限制颜色数量
        progressive: false,
        adaptiveFiltering: true
      })
      .toBuffer()
    
    const compressedSize = compressedBuffer.length
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100
    
    console.log(`✅ [SIMPLE] Compression complete: ${(originalSize/1024).toFixed(1)}KB → ${(compressedSize/1024).toFixed(1)}KB (${compressionRatio.toFixed(1)}% reduction)`)
    
    return {
      success: true,
      originalBuffer: inputBuffer,
      compressedBuffer,
      originalSize,
      compressedSize,
      compressionRatio,
      format: 'png'
    }
    
  } catch (error) {
    console.error('❌ [SIMPLE] Compression failed:', error)
    
    return {
      success: false,
      originalBuffer: inputBuffer,
      compressedBuffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      format: 'original',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * 备用压缩函数 - 使用更激进的压缩
 */
async function aggressiveCompression(inputBuffer, filename) {
  const originalSize = inputBuffer.length
  
  console.log(`🚀 [AGGRESSIVE] Starting aggressive compression for ${filename}`)
  
  try {
    const sharp = require('sharp')
    const image = sharp(inputBuffer)
    
    // 非常激进的压缩设置
    let bestBuffer = inputBuffer
    let bestSize = originalSize
    let bestFormat = 'original'
    
    // 尝试PNG压缩
    try {
      const pngBuffer = await image
        .png({
          compressionLevel: 9,
          palette: true,
          colors: 64,              // 更少颜色
          progressive: false,
          adaptiveFiltering: false
        })
        .toBuffer()
      
      if (pngBuffer.length < bestSize) {
        bestBuffer = pngBuffer
        bestSize = pngBuffer.length
        bestFormat = 'png'
        console.log(`📦 [AGGRESSIVE] PNG result: ${(bestSize/1024).toFixed(1)}KB`)
      }
    } catch (pngError) {
      console.log('⚠️ [AGGRESSIVE] PNG compression failed')
    }
    
    // 尝试WebP压缩
    try {
      const webpBuffer = await image
        .webp({
          quality: 80,
          effort: 6,
          lossless: false
        })
        .toBuffer()
      
      if (webpBuffer.length < bestSize) {
        bestBuffer = webpBuffer
        bestSize = webpBuffer.length
        bestFormat = 'webp'
        console.log(`📦 [AGGRESSIVE] WebP result: ${(bestSize/1024).toFixed(1)}KB`)
      }
    } catch (webpError) {
      console.log('⚠️ [AGGRESSIVE] WebP compression failed')
    }
    
    const compressionRatio = ((originalSize - bestSize) / originalSize) * 100
    
    console.log(`✅ [AGGRESSIVE] Best result: ${bestFormat} format, ${compressionRatio.toFixed(1)}% reduction`)
    
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
    console.error('❌ [AGGRESSIVE] Compression failed:', error)
    
    return {
      success: false,
      originalBuffer: inputBuffer,
      compressedBuffer: inputBuffer,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 0,
      format: 'original',
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

module.exports = {
  simpleImageCompression,
  aggressiveCompression
}