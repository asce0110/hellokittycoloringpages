// Type-safe image compression module
import { getSmartCompressionConfig, type CompressionConfig } from './compression-config';

export interface ImageCompressionResult {
  success: boolean
  originalBuffer: Buffer
  compressedBuffer: Buffer
  thumbnailBuffer: Buffer
  originalSize: number
  compressedSize: number
  thumbnailSize: number
  compressionRatio: number
  metadata: {
    width: number
    height: number
    format: string
    hasAlpha: boolean
  }
  error?: string
}

/**
 * Type-safe line art image compression function
 */
export async function compressLineArtImage(
  inputBuffer: Buffer,
  filename: string,
  customConfig?: CompressionConfig
): Promise<ImageCompressionResult> {
  const originalSize = inputBuffer.length
  
  // 获取智能压缩配置
  const config = customConfig || getSmartCompressionConfig(originalSize, filename)

  // Default return result
  const defaultResult: ImageCompressionResult = {
    success: true,
    originalBuffer: inputBuffer,
    compressedBuffer: inputBuffer,
    thumbnailBuffer: inputBuffer,
    originalSize,
    compressedSize: originalSize,
    thumbnailSize: originalSize,
    compressionRatio: 0,
    metadata: {
      width: 800,
      height: 600,
      format: 'png',
      hasAlpha: true
    }
  }

  try {
    console.log(`🔄 Starting compression for ${filename} (${(originalSize/1024).toFixed(1)}KB)`)
    
    // Attempt compression without relying on type definitions
    const result = await attemptSharpCompression(inputBuffer, filename, config)
    
    if (result && result.success) {
      const compressionRatio = ((originalSize - result.compressedSize) / originalSize * 100).toFixed(1)
      console.log(`✅ Compression successful: ${(originalSize/1024).toFixed(1)}KB → ${(result.compressedSize/1024).toFixed(1)}KB (${compressionRatio}% reduction)`)
      return result
    } else {
      console.log('⚠️ Sharp compression failed, using original image')
      return {
        ...defaultResult,
        error: 'Sharp compression failed, using original image'
      }
    }
  } catch (error) {
    console.log('❌ Compression error:', error)
    return {
      ...defaultResult,
      error: error instanceof Error ? error.message : 'Compression failed'
    }
  }
}

/**
 * Detect if image is line art (suitable for palette compression)
 */
async function isLineArtImage(image: any, metadata: any): Promise<boolean> {
  try {
    // Simple heuristics for line art detection based on metadata
    const hasAlpha = Boolean(metadata.hasAlpha);
    const isGrayscale = metadata.channels <= 2;
    const isPng = metadata.format === 'png';
    
    // For coloring page app, most uploads are likely line art
    // PNG with alpha channel is very likely line art
    if (isPng && hasAlpha) return true;
    
    // Grayscale images are likely line art
    if (isGrayscale) return true;
    
    // PNG format is preferred for line art
    if (isPng) return true;
    
    // Default to true for coloring page application
    return true;
    
  } catch (error) {
    console.log('⚠️ Line art detection error, defaulting to true:', error);
    // Default to treating as line art for coloring page app
    return true;
  }
}

/**
 * Attempt Sharp compression with complete type safety
 */
async function attemptSharpCompression(
  inputBuffer: Buffer, 
  filename: string,
  config: CompressionConfig
): Promise<ImageCompressionResult | null> {
  try {
    console.log(`📦 Attempting Sharp compression for ${filename}`)
    
    // Dynamic import to avoid type checking
    const sharpModule = await import('sharp').catch((error) => {
      console.log('❌ Failed to import Sharp:', error)
      return null
    })
    
    if (!sharpModule) {
      console.log('❌ Sharp module not available')
      return null
    }

    const sharp = sharpModule.default || sharpModule
    if (typeof sharp !== 'function') {
      console.log('❌ Sharp is not a function')
      return null
    }
    
    console.log('✅ Sharp loaded successfully')

    // Create Sharp instance
    const image = sharp(inputBuffer)
    console.log('📊 Sharp instance created')
    
    // Get image metadata
    const metadata = await image.metadata()
    console.log('📋 Image metadata:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      channels: metadata.channels,
      hasAlpha: metadata.hasAlpha
    })
    
    if (!metadata.width || !metadata.height) {
      console.log('❌ Invalid image metadata')
      return null
    }

    // Smart compression based on image characteristics
    let compressedBuffer: Buffer;
    
    // Analyze image to determine optimal compression strategy
    const isLineArt = await isLineArtImage(image, metadata);
    console.log(`🎨 Line art detection: ${isLineArt ? 'YES' : 'NO'}`)
    
    if (isLineArt) {
      console.log(`🎯 Applying line art compression (palette: ${config.png.usePalette}, colors: ${config.png.paletteColors})`)
      // Optimize for line art using config parameters
      compressedBuffer = await image
        .png({
          compressionLevel: config.png.compressionLevel,
          palette: config.png.usePalette,
          colors: config.png.paletteColors,
          progressive: false,
          adaptiveFiltering: true,
          force: true
        })
        .toBuffer();
    } else {
      console.log('🖼️ Applying general image compression')
      // General image compression
      compressedBuffer = await image
        .png({
          compressionLevel: config.png.compressionLevel,
          palette: false,
          progressive: false,
          adaptiveFiltering: true
        })
        .toBuffer();
    }
    
    console.log(`📏 Initial compression result: ${(inputBuffer.length/1024).toFixed(1)}KB → ${(compressedBuffer.length/1024).toFixed(1)}KB`)
    
    // If palette compression didn't help much, try without palette
    if (isLineArt && config.png.usePalette && compressedBuffer.length > inputBuffer.length * 0.8) {
      console.log('🔄 Palette compression not effective, trying without palette')
      compressedBuffer = await image
        .png({
          compressionLevel: config.png.compressionLevel,
          palette: false,
          progressive: false,
          adaptiveFiltering: true
        })
        .toBuffer();
      console.log(`📏 Non-palette compression result: ${(compressedBuffer.length/1024).toFixed(1)}KB`)
    }

    // Generate optimized thumbnail
    const thumbnailBuffer = await sharp(inputBuffer)
      .resize(config.thumbnailSize, config.thumbnailSize, {
        fit: 'inside',
        withoutEnlargement: true,
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({
        compressionLevel: config.png.compressionLevel,
        palette: true,
        colors: Math.min(config.png.paletteColors / 2, 128), // 缩略图用更少颜色
        progressive: false,
        adaptiveFiltering: true
      })
      .toBuffer()

    let finalBuffer = compressedBuffer;
    let finalFormat = 'png';
    
    // If file is still large, try more aggressive compression
    if (compressedBuffer.length > config.detection.largeSizeThreshold) {
      console.log(`📦 File still large (${(compressedBuffer.length/1024).toFixed(0)}KB), trying aggressive compression...`);
      
      try {
        // Try WebP format for better compression
        const webpBuffer = await image
          .webp({
            quality: config.webp.quality,
            lossless: config.webp.lossless,
            nearLossless: false,
            smartSubsample: true,
            effort: config.webp.effort
          })
          .toBuffer();
        
        // Use WebP if it meets the savings threshold
        if (webpBuffer.length < compressedBuffer.length * config.detection.webpSavingsThreshold) {
          finalBuffer = webpBuffer;
          finalFormat = 'webp';
          console.log(`✅ WebP compression saved ${((compressedBuffer.length - webpBuffer.length)/1024).toFixed(0)}KB`);
        }
      } catch (webpError) {
        console.log('WebP compression failed, keeping PNG');
      }
      
      // If still too large, try more aggressive PNG compression
      if (finalBuffer.length > config.maxFileSize && finalFormat === 'png') {
        try {
          const aggressivePng = await image
            .png({
              compressionLevel: config.png.compressionLevel,
              palette: true,
              colors: config.png.aggressiveColors,  // Use configured aggressive color count
              progressive: false,
              adaptiveFiltering: false
            })
            .toBuffer();
            
          if (aggressivePng.length < finalBuffer.length) {
            finalBuffer = aggressivePng;
            console.log(`✅ Aggressive PNG compression saved ${((compressedBuffer.length - aggressivePng.length)/1024).toFixed(0)}KB`);
          }
        } catch (aggressiveError) {
          console.log('Aggressive PNG compression failed');
        }
      }
    }

    const finalSize = finalBuffer.length;
    const thumbnailSize = thumbnailBuffer.length
    const compressionRatio = ((inputBuffer.length - finalSize) / inputBuffer.length) * 100

    return {
      success: true,
      originalBuffer: inputBuffer,
      compressedBuffer: finalBuffer,
      thumbnailBuffer,
      originalSize: inputBuffer.length,
      compressedSize: finalSize,
      thumbnailSize,
      compressionRatio,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: finalFormat,  // Use final format after compression
        hasAlpha: Boolean(metadata.hasAlpha)
      }
    }
  } catch (error) {
    return null
  }
}

/**
 * Validate if image is suitable for coloring pages
 */
export function validateColoringPageImage(metadata: {
  width: number
  height: number
  format: string
  size: number
}): { valid: boolean; warnings: string[] } {
  const warnings: string[] = []
  
  if (metadata.width < 500 || metadata.height < 500) {
    warnings.push('Image resolution is low, recommend at least 500x500 pixels')
  }
  
  if (metadata.width > 4000 || metadata.height > 4000) {
    warnings.push('Image resolution is very high, may affect loading speed')
  }
  
  const sizeInMB = metadata.size / 1024 / 1024
  if (sizeInMB > 5) {
    warnings.push('File is large, consider compression')
  }
  
  if (metadata.format !== 'png') {
    warnings.push('Recommend using PNG format for best results')
  }
  
  return {
    valid: true,
    warnings
  }
}