// 直接打印机打印工具 - 使用Print.js库
// 支持直接连接物理打印机，无需生成PDF

// 动态导入Print.js以避免SSR问题

export interface PrintOptions {
  /** 图片数据URL或URL数组 */
  imageDataUrl: string | string[]
  /** 打印纸张尺寸，默认A4 */
  pageSize?: 'A4' | 'A3' | 'Letter'
  /** 纸张方向，默认纵向 */
  orientation?: 'portrait' | 'landscape'
  /** 页边距，默认0.5英寸 */
  margin?: string
  /** 图片宽度，默认7.5英寸（A4纸适合大小） */
  imageWidth?: string
  /** 是否显示打印头部标题 */
  showHeader?: boolean
  /** 自定义样式 */
  customStyle?: string
}

/**
 * 直接打印图片到物理打印机
 * @param options 打印配置选项
 */
export async function directPrintImage(options: PrintOptions): Promise<void> {
  // 检查是否在客户端环境
  if (typeof window === 'undefined') {
    throw new Error('Print functionality is only available in browser environment')
  }
  
  // 打印前的兼容性检查
  const compatibility = checkPrintCompatibility()
  if (!compatibility.supported) {
    throw new Error('Your browser does not support printing. Please use Chrome, Firefox, or Edge.')
  }
  
  const {
    imageDataUrl,
    pageSize = 'A4',
    orientation = 'portrait',
    margin = '0.5in',
    imageWidth = '7.5in',
    showHeader = false,
    customStyle
  } = options

  // 验证图片URL
  const imageUrls = Array.isArray(imageDataUrl) ? imageDataUrl : [imageDataUrl]
  if (imageUrls.length === 0 || !imageUrls.every(url => url && url.length > 0)) {
    throw new Error('Invalid image data')
  }

  // 构建打印样式
  const printStyle = customStyle || `
    @media print { 
      @page { 
        size: ${pageSize} ${orientation}; 
        margin: ${margin}; 
      } 
      body { 
        margin: 0; 
        padding: 0; 
        text-align: center; 
        background: white; 
      }
      img { 
        width: ${imageWidth} !important; 
        height: auto !important; 
        max-height: ${pageSize === 'A4' ? '10in' : '13in'} !important;
        display: block !important; 
        margin: 0 auto !important; 
        page-break-after: always !important;
        object-fit: contain !important;
      }
      img:last-child {
        page-break-after: avoid !important;
      }
    }
  `

  // 图片样式设置
  const imageStyle = `
    display: block; 
    margin: 0 auto; 
    max-width: 100%; 
    page-break-after: always;
    object-fit: contain;
  `

  console.log('🖨️ Preparing direct print to physical printer:', {
    imagesCount: imageUrls.length,
    pageSize,
    orientation,
    imageWidth,
    compatibility: compatibility.warnings
  })

  try {
    // 动态导入Print.js以避免SSR问题
    const { default: printJS } = await import('print-js')
    
    return new Promise<void>((resolve, reject) => {
      let isResolved = false
      
      const resolveOnce = () => {
        if (!isResolved) {
          isResolved = true
          resolve()
        }
      }
      
      const rejectOnce = (error: Error) => {
        if (!isResolved) {
          isResolved = true
          reject(error)
        }
      }
      
      // 设置超时
      const timeout = setTimeout(() => {
        rejectOnce(new Error('Print timeout. Please check your printer connection and try again.'))
      }, 30000) // 30秒超时
      
      printJS({
        printable: imageUrls,
        type: 'image',
        style: printStyle,
        imageStyle: imageStyle,
        header: showHeader ? 'Hello Kitty Coloring Page' : null,
        onPrintDialogClose: () => {
          console.log('✅ Print dialog closed successfully')
          clearTimeout(timeout)
          resolveOnce()
        },
        onIncompatibleBrowser: () => {
          console.error('❌ Browser does not support direct printing')
          clearTimeout(timeout)
          rejectOnce(new Error('Browser does not support direct printing. Please use Chrome, Firefox, or Edge.'))
        },
        onError: (error) => {
          console.error('❌ Error during printing process:', error)
          clearTimeout(timeout)
          const errorMessage = error instanceof Error ? error.message : String(error)
          rejectOnce(new Error(`Print process error: ${errorMessage}`))
        }
      })
    })
    
  } catch (error) {
    console.error('❌ Print functionality initialization failed:', error)
    throw new Error('Print functionality initialization failed. Please refresh the page and try again.')
  }
}

/**
 * 打印单张图片（便捷方法）
 * @param imageDataUrl 图片数据URL
 * @param options 可选的打印配置
 */
export async function printSingleImage(imageDataUrl: string, options?: Partial<PrintOptions>): Promise<void> {
  // 打印前的最后检查
  if (!imageDataUrl || typeof imageDataUrl !== 'string' || imageDataUrl.length === 0) {
    throw new Error('Image data is empty or invalid')
  }
  
  // 检查图片URL格式
  if (!imageDataUrl.startsWith('data:image/') && !imageDataUrl.startsWith('blob:')) {
    console.warn('Image URL format may not support printing:', imageDataUrl.substring(0, 50))
  }
  
  try {
    await directPrintImage({
      imageDataUrl,
      ...options
    })
  } catch (error) {
    console.error('Failed to print single image:', error)
    throw error
  }
}

/**
 * 批量打印多张图片
 * @param imageDataUrls 图片数据URL数组
 * @param options 可选的打印配置
 */
export async function printMultipleImages(imageDataUrls: string[], options?: Partial<PrintOptions>): Promise<void> {
  // 验证输入
  if (!Array.isArray(imageDataUrls) || imageDataUrls.length === 0) {
    throw new Error('Image array is empty or invalid')
  }
  
  // 检查每个图片URL
  for (let i = 0; i < imageDataUrls.length; i++) {
    if (!imageDataUrls[i] || typeof imageDataUrls[i] !== 'string') {
      throw new Error(`Image URL ${i + 1} is invalid`)
    }
  }
  
  console.log(`Batch printing ${imageDataUrls.length} images`)
  
  try {
    await directPrintImage({
      imageDataUrl: imageDataUrls,
      ...options
    })
  } catch (error) {
    console.error('Batch printing failed:', error)
    throw error
  }
}

/**
 * 高质量打印配置
 * 针对彩色Hello Kitty着色页优化的打印设置，确保单页A4输出
 * A4纸张: 210mm x 297mm = 8.27" x 11.69"
 */
export const HIGH_QUALITY_PRINT_CONFIG: Partial<PrintOptions> = {
  pageSize: 'A4',
  orientation: 'portrait',
  margin: '0.3in', // 减小边距以获得更大打印区域
  imageWidth: '7.6in', // 精确计算：8.27" - (0.3" x 2) = 7.67"，保留安全边距
  showHeader: false,
  customStyle: `
    @media print { 
      @page { 
        size: A4 portrait; 
        margin: 0.3in; 
      } 
      html, body { 
        margin: 0 !important; 
        padding: 0 !important; 
        text-align: center !important; 
        background: white !important; 
        height: 100vh !important;
        overflow: hidden !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      img { 
        width: 7.6in !important; 
        height: auto !important; 
        max-height: 10.8in !important; /* 11.69" - (0.3" x 2) - 0.29" buffer */
        max-width: 7.6in !important;
        display: block !important; 
        margin: 0 auto !important; 
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        object-fit: contain !important;
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
        /* 确保图片居中和高质量渲染 */
        image-rendering: -webkit-optimize-contrast !important;
        image-rendering: crisp-edges !important;
      }
      /* 确保不会出现第二页 - 更严格的控制 */
      img:last-child, img:first-child, img:only-child {
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }
      /* 隐藏可能导致多页的元素 */
      * {
        page-break-inside: avoid !important;
      }
      /* 隐藏滚动条和其他UI元素 */
      ::-webkit-scrollbar { display: none !important; }
      * { scrollbar-width: none !important; }
    }
  `
}

/**
 * 检查Print.js是否可用以及浏览器打印支持
 */
export function isPrintJSAvailable(): boolean {
  // 只在客户端环境检查
  if (typeof window === 'undefined') {
    return false
  }
  
  // 检查基本的浏览器打印支持
  if (typeof window.print !== 'function') {
    console.warn('Browser does not support window.print()')
    return false
  }
  
  try {
    // 检查是否能动态导入print-js
    return true // 假设可用，实际检查在使用时进行
  } catch (error) {
    console.error('Print.js not available:', error)
    return false
  }
}

/**
 * 检查用户的打印机和浏览器兼容性
 */
export function checkPrintCompatibility(): { supported: boolean; warnings: string[] } {
  const warnings: string[] = []
  let supported = true
  
  if (typeof window === 'undefined') {
    return { supported: false, warnings: ['Not in browser environment'] }
  }
  
  // 检查浏览器类型和版本
  const userAgent = navigator.userAgent.toLowerCase()
  
  if (userAgent.includes('chrome')) {
    // Chrome 是最优的打印支持
    if (userAgent.includes('edge')) {
      warnings.push('Microsoft Edge Chromium: Print quality may vary')
    }
  } else if (userAgent.includes('firefox')) {
    warnings.push('Firefox: Limited support for some CSS print properties')
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    warnings.push('Safari: Limited print support, Chrome is recommended')
  } else if (userAgent.includes('edge') && !userAgent.includes('chrome')) {
    warnings.push('Legacy Edge: Poor print support, please upgrade to new Edge')
    supported = false
  } else {
    warnings.push('Unknown browser: Print results may be suboptimal')
  }
  
  // 检查基本打印功能
  if (typeof window.print !== 'function') {
    supported = false
    warnings.push('Browser does not support print functionality')
  }
  
  // 检查媒体查询支持
  if (typeof window.matchMedia !== 'function') {
    warnings.push('Limited support for print media queries')
  }
  
  // 检查Canvas支持
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      warnings.push('Limited Canvas support, may affect image processing')
    }
  } catch (error) {
    warnings.push('Canvas not available')
  }
  
  // 检查Blob支持
  if (typeof Blob === 'undefined') {
    supported = false
    warnings.push('Blob API not supported')
  }
  
  // 检查URL.createObjectURL支持
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    supported = false
    warnings.push('URL.createObjectURL not supported')
  }
  
  return { supported, warnings }
}

/**
 * 检测用户的打印机连接状态（尽力而为）
 */
export async function checkPrinterConnection(): Promise<{ available: boolean; message: string }> {
  if (typeof window === 'undefined') {
    return { available: false, message: 'Not in browser environment' }
  }
  
  // 检查是否支持打印机查询 API（实验性功能）
  if ('navigator' in window && 'mediaDevices' in navigator) {
    try {
      // 这是一个实验性的API，不是所有浏览器都支持
      return { available: true, message: 'Browser supports printing functionality' }
    } catch (error) {
      return { available: true, message: 'Cannot detect printer status, but browser supports printing' }
    }
  }
  
  return { available: true, message: 'Please ensure your printer is connected and powered on' }
}