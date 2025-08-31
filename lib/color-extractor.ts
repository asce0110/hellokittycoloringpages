/**
 * 客户端图像颜色提取工具
 * 使用Canvas API分析图像像素，提取主要颜色
 */

interface ColorInfo {
  hex: string
  rgb: [number, number, number]
  count: number
  percentage: number
}

/**
 * 将缩略图URL转换为原图URL
 */
function convertThumbnailToOriginal(imageUrl: string): string {
  // 检测并转换缩略图URL
  if (imageUrl.includes('/thumbnails/') && imageUrl.includes('.thumb_blob')) {
    const originalUrl = imageUrl
      .replace('/thumbnails/', '/')
      .replace('.thumb_blob', '.blob')
    console.log('🔄 Converted thumbnail URL to original:', originalUrl)
    return originalUrl
  }
  
  // 检测其他缩略图格式
  if (imageUrl.includes('thumb_') || imageUrl.includes('thumbnail')) {
    console.log('⚠️ Detected potential thumbnail URL, but format not recognized:', imageUrl)
  }
  
  return imageUrl
}

/**
 * 从图像URL提取主要颜色
 */
export async function extractColorsFromImage(imageUrl: string, maxColors: number = 8): Promise<string[]> {
  console.log('🎨 Starting color extraction for:', imageUrl)
  
  // 首先转换缩略图URL为原图URL
  const originalImageUrl = convertThumbnailToOriginal(imageUrl)
  if (originalImageUrl !== imageUrl) {
    console.log('🔄 Using original image instead of thumbnail for color extraction')
  }
  
  // 对于跨域图片，使用代理端点
  let finalImageUrl = originalImageUrl
  if (originalImageUrl.includes('coloringpagesprintable.net') || originalImageUrl.includes('r2.dev') || originalImageUrl.includes('r2.cloudflarestorage.com')) {
    console.log('🔄 Using proxy endpoint for cross-origin image:', originalImageUrl)
    finalImageUrl = `/api/proxy-image/?url=${encodeURIComponent(originalImageUrl)}` // 注意尾随斜杠
  }
  
  return new Promise((resolve) => {
    const img = new Image()
    
    // 尝试设置crossOrigin，但准备处理失败情况
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      try {
        // 检测图片是否被跨域污染
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          console.log('❌ Failed to create canvas context')
          resolve([])
          return
        }
        
        canvas.width = 10
        canvas.height = 10
        ctx.drawImage(img, 0, 0, 10, 10)
        
        // 尝试读取一个像素来测试是否被污染
        try {
          ctx.getImageData(0, 0, 1, 1)
        } catch (securityError) {
          console.log('🚫 Canvas tainted by cross-origin data, cannot extract colors')
          resolve([])
          return
        }
        
        // 如果能读取像素，执行真正的颜色提取
        const colors = extractColorsFromImageElement(img, maxColors)
        console.log(`🎨 Extracted ${colors.length} colors from image:`, colors)
        resolve(colors)
        
      } catch (error) {
        console.error('❌ Error extracting colors:', error)
        resolve([])
      }
    }
    
    img.onerror = () => {
      console.log('🔄 Image load failed, trying without crossOrigin...')
      
      // 重试不带crossOrigin的加载
      const img2 = new Image()
      img2.onload = () => {
        try {
          const colors = extractColorsFromImageElement(img2, maxColors)
          console.log(`🎨 Extracted ${colors.length} colors (no CORS):`, colors)
          resolve(colors)
        } catch (error) {
          console.error('❌ Second attempt failed:', error)
          resolve([])
        }
      }
      
      img2.onerror = () => {
        console.log('🔄 Both attempts failed, returning empty color array')
        resolve([])
      }
      
      img2.src = finalImageUrl
    }
    
    img.src = finalImageUrl
    
    // 超时处理
    setTimeout(() => {
      console.warn('⏰ Image loading timeout, returning empty colors')
      resolve([])
    }, 5000)
  })
}

/**
 * 从已加载的图像元素提取颜色
 */
function extractColorsFromImageElement(img: HTMLImageElement, maxColors: number = 8): string[] {
  // 创建Canvas用于像素分析
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('Canvas context not available')
  }
  
  // 调整Canvas大小以获得合理的采样
  const maxSize = 200 // 限制图像大小以提高性能
  const scale = Math.min(maxSize / img.width, maxSize / img.height)
  canvas.width = Math.floor(img.width * scale)
  canvas.height = Math.floor(img.height * scale)
  
  // 绘制图像到Canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  
  // 获取像素数据
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data
  
  // 分析颜色频率
  const colorMap = new Map<string, ColorInfo>()
  
  // 采样像素（每隔几个像素采样一次以提高性能）
  const step = 4 // 每4个像素采样一次
  
  for (let i = 0; i < pixels.length; i += 4 * step) {
    const r = pixels[i]
    const g = pixels[i + 1]
    const b = pixels[i + 2]
    const a = pixels[i + 3]
    
    // 跳过透明像素和极浅/极深的像素
    if (a < 100 || isGrayscale(r, g, b) || isTooLight(r, g, b) || isTooDark(r, g, b)) {
      continue
    }
    
    // 量化颜色以减少噪声
    const quantizedColor = quantizeColor(r, g, b)
    const hex = rgbToHex(quantizedColor[0], quantizedColor[1], quantizedColor[2])
    
    if (colorMap.has(hex)) {
      const existing = colorMap.get(hex)!
      existing.count++
    } else {
      colorMap.set(hex, {
        hex,
        rgb: quantizedColor,
        count: 1,
        percentage: 0
      })
    }
  }
  
  // 计算颜色百分比
  const totalPixels = Array.from(colorMap.values()).reduce((sum, color) => sum + color.count, 0)
  colorMap.forEach(color => {
    color.percentage = (color.count / totalPixels) * 100
  })
  
  // 按出现频率排序并获取主要颜色
  const sortedColors = Array.from(colorMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .filter(color => color.percentage > 1) // 只保留出现频率超过1%的颜色
    .filter(color => isValidColorForColoring(color.rgb)) // 过滤掉不合理的颜色
  
  console.log('🎨 Color analysis results:', sortedColors.map(c => ({
    hex: c.hex,
    percentage: c.percentage.toFixed(1) + '%'
  })))
  
  return sortedColors.map(color => color.hex)
}

/**
 * 检查是否为灰度色
 */
function isGrayscale(r: number, g: number, b: number): boolean {
  const threshold = 15
  return Math.abs(r - g) < threshold && Math.abs(g - b) < threshold && Math.abs(r - b) < threshold
}

/**
 * 检查颜色是否太浅（接近白色）
 */
function isTooLight(r: number, g: number, b: number): boolean {
  return (r + g + b) > 700 // 三个通道总和超过700认为太浅
}

/**
 * 检查颜色是否太深（接近黑色）
 */
function isTooDark(r: number, g: number, b: number): boolean {
  return (r + g + b) < 100 // 三个通道总和低于100认为太深
}

/**
 * 检查颜色是否适合用于着色页面
 * 过滤掉可能由压缩/量化产生的异常颜色
 */
function isValidColorForColoring(rgb: [number, number, number]): boolean {
  const [r, g, b] = rgb
  
  // 跳过过于鲜艳的绿色（通常是压缩伪影）
  if (g > 150 && g > r + 80 && g > b + 80) {
    console.log(`⚠️ Filtering out artificial green color: rgb(${r}, ${g}, ${b})`)
    return false
  }
  
  // 跳过过于鲜艳的原色（可能是量化误差）
  const maxChannel = Math.max(r, g, b)
  const minChannel = Math.min(r, g, b)
  const colorRange = maxChannel - minChannel
  
  // 如果颜色过于纯净（单一通道过于突出），可能是伪影
  if (colorRange > 180 && maxChannel > 200) {
    console.log(`⚠️ Filtering out overly saturated color: rgb(${r}, ${g}, ${b})`)
    return false
  }
  
  return true
}

/**
 * 量化颜色以减少噪声
 */
function quantizeColor(r: number, g: number, b: number): [number, number, number] {
  // 使用更细粒度的量化因子以减少颜色失真
  const factor = 16 // 减小量化因子从32到16，提供更精确的颜色识别
  
  // 确保量化后的值不超过255
  const quantizeValue = (value: number) => {
    const quantized = Math.round(value / factor) * factor
    return Math.min(255, Math.max(0, quantized))
  }
  
  return [
    quantizeValue(r),
    quantizeValue(g), 
    quantizeValue(b)
  ]
}

/**
 * RGB转HEX
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
}

/**
 * 验证颜色提取结果是否合理
 */
export function validateExtractedColors(colors: string[]): boolean {
  if (colors.length === 0) {
    console.log('⚠️ No colors extracted')
    return false
  }
  
  // 检查是否有有效的颜色值
  const validColors = colors.filter(color => {
    return /^#[0-9A-F]{6}$/i.test(color)
  })
  
  if (validColors.length !== colors.length) {
    console.log('⚠️ Some extracted colors are invalid:', colors)
    return false
  }
  
  console.log('✅ Color extraction validation passed:', validColors)
  return true
}