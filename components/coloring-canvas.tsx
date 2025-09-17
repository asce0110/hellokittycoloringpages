"use client"

import React, { useRef, useEffect, useState, useCallback } from "react"
import { cn } from "@/lib/utils"
import { showToast, showPrintCompatibilityWarning } from "@/lib/toast"

type Tool = "dropper" | "brush" | "toner"

interface ColoringCanvasProps {
  imageUrl: string
  strokeColor?: string
  activeColor: string
  activeTool: Tool
  brushSize: number
  tonerMode?: "darken" | "lighten"
  tonerIntensity?: number
  onHistoryChange?: (canUndo: boolean) => void
}

export const ColoringCanvas = React.forwardRef<
  { 
    undo: () => void; 
    reset: () => void; 
    download: (filename: string) => void; 
    print: () => void;
    saveProgress: (key?: string) => boolean;
    loadProgress: (key?: string) => boolean;
    hasProgress: (key?: string) => boolean;
    clearProgress: (key?: string) => void;
  },
  ColoringCanvasProps
>(({ imageUrl, strokeColor = "#000000", activeColor, activeTool, brushSize, tonerMode = "darken", tonerIntensity = 0.3, onHistoryChange }, ref) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [history, setHistory] = useState<ImageData[]>([])
  const isDrawing = useRef(false)
  
  // 缩放相关状态
  const [scale, setScale] = useState(1)
  const [translateX, setTranslateX] = useState(0)
  const [translateY, setTranslateY] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Canvas分辨率缩放因子
  const resolutionScale = useRef(2.5)
  
  // Smart Fill 拖拽相关状态
  const isDragFilling = useRef(false)
  const dragFillTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastFillPosition = useRef<{ x: number, y: number } | null>(null)
  const dragFillStarted = useRef(false)
  const continuousFillTimer = useRef<NodeJS.Timeout | null>(null)
  const lastFillTime = useRef(0)

  // Toner 工具相关状态
  const isTonerDrawing = useRef(false)

  // 处理鼠标滚轮缩放
  const handleWheel = useCallback((e: WheelEvent) => {
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    // 鼠标相对于容器的位置
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    
    // 计算缩放中心点相对于当前变换的位置
    const beforeZoomPointX = (mouseX - translateX) / scale
    const beforeZoomPointY = (mouseY - translateY) / scale
    
    // 计算新的缩放值
    const zoomFactor = e.deltaY < 0 ? 1.2 : 0.8
    const newScale = Math.max(0.5, Math.min(3, scale * zoomFactor))
    
    // 如果向下滚动且已经是最小缩放，重置到1.0
    if (e.deltaY > 0 && scale <= 1.0) {
      setScale(1)
      setTranslateX(0)
      setTranslateY(0)
      return
    }
    
    // 计算新的变换位置，保持鼠标位置不变
    const afterZoomPointX = beforeZoomPointX * newScale
    const afterZoomPointY = beforeZoomPointY * newScale
    
    const newTranslateX = mouseX - afterZoomPointX
    const newTranslateY = mouseY - afterZoomPointY
    
    setScale(newScale)
    setTranslateX(newTranslateX)
    setTranslateY(newTranslateY)
  }, [scale, translateX, translateY])

  // 阻止页面滚动的原生事件监听
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      handleWheel(e)
    }

    container.addEventListener('wheel', handleNativeWheel, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleNativeWheel)
    }
  }, [handleWheel])

  // 🎯 修复版本的图片加载逻辑
  useEffect(() => {
    const imageCanvas = imageCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    const imageCtx = imageCanvas?.getContext("2d", { willReadFrequently: true })
    const drawingCtx = drawingCanvas?.getContext("2d", { willReadFrequently: true })

    if (!imageCanvas || !drawingCanvas || !imageCtx || !drawingCtx) {
      console.error('❌ Canvas elements not found')
      return
    }

    console.log('🖼️ 开始加载图片:', imageUrl)
    
    // 图片初始化函数
    const initializeCanvas = (img: HTMLImageElement) => {
      console.log('✅ Image loaded successfully:', imageUrl)
      
      // 🎯 分离显示尺寸和canvas内部分辨率以提升打印质量
      const aspectRatio = img.width / img.height
      
      // 显示尺寸（用户看到的界面尺寸）
      const maxDisplayWidth = 500
      const maxDisplayHeight = 600
      let displayWidth, displayHeight
      
      if (aspectRatio > 1) {
        displayWidth = Math.min(maxDisplayWidth, img.width)
        displayHeight = displayWidth / aspectRatio
      } else {
        displayHeight = Math.min(maxDisplayHeight, img.height)
        displayWidth = displayHeight * aspectRatio
      }
      
      // 实际canvas分辨率（用于高质量绘制和打印）
      const resolutionScale = 2.5 // 2.5倍分辨率提升打印质量
      const canvasWidth = Math.round(displayWidth * resolutionScale)
      const canvasHeight = Math.round(displayHeight * resolutionScale)
      
      // 设置canvas内部分辨率
      imageCanvas.width = canvasWidth
      imageCanvas.height = canvasHeight
      drawingCanvas.width = canvasWidth
      drawingCanvas.height = canvasHeight
      
      // 设置canvas显示尺寸
      imageCanvas.style.width = Math.round(displayWidth) + 'px'
      imageCanvas.style.height = Math.round(displayHeight) + 'px'
      drawingCanvas.style.width = Math.round(displayWidth) + 'px'
      drawingCanvas.style.height = Math.round(displayHeight) + 'px'
      
      // 启用高质量渲染
      imageCtx.imageSmoothingEnabled = true
      imageCtx.imageSmoothingQuality = 'high'
      drawingCtx.imageSmoothingEnabled = true
      drawingCtx.imageSmoothingQuality = 'high'
      
      // 白色背景
      imageCtx.fillStyle = 'white'
      imageCtx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      // 绘制图片保持比例，使用高分辨率
      imageCtx.drawImage(img, 0, 0, canvasWidth, canvasHeight)
      
      // 初始化绘图历史
      const emptyData = drawingCtx.getImageData(0, 0, canvasWidth, canvasHeight)
      setHistory([emptyData])
      
      console.log('✅ Canvas initialized with proper aspect ratio:', canvasWidth, 'x', canvasHeight)
    }

    // 简化的图片加载逻辑 - 优先直接加载，失败则使用代理
    const loadImage = () => {
      const img = new Image()
      
      // 设置跨域属性（对外部图片）
      const isExternalUrl = !imageUrl.startsWith('/') && !imageUrl.includes('localhost')
      if (isExternalUrl) {
        img.crossOrigin = "anonymous"
      }
      
      img.onload = () => {
        console.log('✅ Image loaded directly:', imageUrl)
        initializeCanvas(img)
      }
      
      img.onerror = async () => {
        console.log('⚠️ Direct image load failed, trying proxy:', imageUrl)
        
        if (isExternalUrl) {
          try {
            const response = await fetch('/api/proxy-image', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ imageUrl })
            })
            
            if (response.ok) {
              const blob = await response.blob()
              const objectUrl = URL.createObjectURL(blob)
              
              const proxyImg = new Image()
              proxyImg.onload = () => {
                console.log('✅ Image loaded via proxy')
                initializeCanvas(proxyImg)
                URL.revokeObjectURL(objectUrl)
              }
              proxyImg.onerror = () => {
                console.error('❌ Proxy image failed too')
                URL.revokeObjectURL(objectUrl)
                loadFallbackImage()
              }
              proxyImg.src = objectUrl
            } else {
              console.error('❌ Proxy API failed')
              loadFallbackImage()
            }
          } catch (error) {
            console.error('❌ Proxy request failed:', error)
            loadFallbackImage()
          }
        } else {
          loadFallbackImage()
        }
      }
      
      img.src = imageUrl
    }
    
    // 最后的回退图片
    const loadFallbackImage = () => {
      console.log('🔄 Loading fallback image')
      const fallbackImg = new Image()
      fallbackImg.onload = () => initializeCanvas(fallbackImg)
      fallbackImg.onerror = () => console.error('❌ Even fallback image failed')
      fallbackImg.src = '/hello-kitty-coloring-page.png'
    }

    // 开始加载
    loadImage()
  }, [imageUrl])

  useEffect(() => {
    onHistoryChange?.(history.length > 1)
  }, [history, onHistoryChange])

  const saveToHistory = (data: ImageData) => {
    setHistory((prev) => [...prev, data])
  }

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev
      const newHistory = prev.slice(0, -1)
      const lastState = newHistory[newHistory.length - 1]
      const drawingCtx = drawingCanvasRef.current?.getContext("2d")
      if (drawingCtx && lastState) {
        drawingCtx.putImageData(lastState, 0, 0)
      }
      return newHistory
    })
  }

  const handleReset = () => {
    const drawingCanvas = drawingCanvasRef.current
    const drawingCtx = drawingCanvas?.getContext("2d")
    if (!drawingCanvas || !drawingCtx) return

    // 清空画布
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
    
    // 重置历史记录为初始状态
    const emptyImageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
    setHistory([emptyImageData])
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? [Number.parseInt(result[1], 16), Number.parseInt(result[2], 16), Number.parseInt(result[3], 16)]
      : [0, 0, 0]
  }

  // 🤖 AI智能填充算法 - 解决复杂形状不闭合问题
  const fillArea = (x: number, y: number, saveHistory: boolean = true) => {
    console.log(`🤖 AI Smart Fill 执行! brushSize: ${brushSize}, 位置: (${x.toFixed(1)}, ${y.toFixed(1)})`)
    
    const drawingCanvas = drawingCanvasRef.current
    const imageCanvas = imageCanvasRef.current
    const drawingCtx = drawingCanvas?.getContext("2d")
    const imageCtx = imageCanvas?.getContext("2d")
    if (!drawingCanvas || !imageCanvas || !drawingCtx || !imageCtx) return

    const [fr, fg, fb] = hexToRgb(activeColor)
    
    try {
      const imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
      const drawingData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
      const imagePixels = imageData.data
      const drawingPixels = drawingData.data
      
      const targetX = Math.round(x)
      const targetY = Math.round(y)
      const width = imageCanvas.width
      const height = imageCanvas.height
      
      // 边界检查
      if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
        return
      }

      // 🤖 简化的AI语义区域分析 - 轻量级智能识别
      const analyzeSemanticRegion = (centerX: number, centerY: number) => {
        try {
          const analysisRadius = Math.min(80, Math.max(25, brushSize * 2 * resolutionScale.current)) // 按分辨率缩放分析范围
          let linePixels: Array<{x: number, y: number, intensity: number}> = []
          let regionPixels: Array<{x: number, y: number}> = []
          
          // 1. 简化的区域信息收集 - 降采样避免过度计算
          const step = 2 // 隔2个像素采样一次
          for (let dy = -analysisRadius; dy <= analysisRadius; dy += step) {
            for (let dx = -analysisRadius; dx <= analysisRadius; dx += step) {
              const px = centerX + dx
              const py = centerY + dy
              
              if (px < 0 || px >= width || py < 0 || py >= height) continue
              
              const distance = Math.sqrt(dx * dx + dy * dy)
              if (distance > analysisRadius) continue
              
              const pixelIndex = (py * width + px) * 4
              const r = imagePixels[pixelIndex] || 0
              const g = imagePixels[pixelIndex + 1] || 0
              const b = imagePixels[pixelIndex + 2] || 0
              const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
              
              if (brightness < 120) {
                linePixels.push({x: px, y: py, intensity: 255 - brightness})
              } else {
                regionPixels.push({x: px, y: py})
              }
              
              // 限制收集数量，避免内存过度使用
              if (linePixels.length > 200) break
            }
            if (linePixels.length > 200) break
          }
        
        // 2. 简化的形状分析 - 基于线条密度和分布
        const analyzeShapePattern = () => {
          if (linePixels.length < 5) return { type: 'simple', confidence: 1.0 }
          
          // 简化的分析：只基于线条数量和分布范围
          const lineCount = linePixels.length
          
          // 计算线条分布的范围
          let minX = width, maxX = 0, minY = height, maxY = 0
          for (const pixel of linePixels) {
            minX = Math.min(minX, pixel.x)
            maxX = Math.max(maxX, pixel.x)
            minY = Math.min(minY, pixel.y)
            maxY = Math.max(maxY, pixel.y)
          }
          
          const rangeX = maxX - minX
          const rangeY = maxY - minY
          const aspectRatio = rangeX > 0 ? rangeY / rangeX : 1
          
          // 简化的形状识别
          if (lineCount > 50 && (aspectRatio < 0.5 || aspectRatio > 2.0)) {
            return { type: 'complex', confidence: 0.8 } // 复杂不规则形状
          } else if (lineCount > 30) {
            return { type: 'curved', confidence: 0.7 } // 中等复杂度
          } else {
            return { type: 'simple', confidence: 0.9 } // 简单形状
          }
        }
        
          const shapePattern = analyzeShapePattern()
          
          // 3. 计算形状的密度和分布
          const area = Math.PI * analysisRadius * analysisRadius
          const density = area > 0 ? linePixels.length / area : 0
          const coverage = area > 0 ? regionPixels.length / area : 0
          
          console.log(`🧠 AI分析结果:`, {
            center: `(${centerX}, ${centerY})`,
            shapeType: shapePattern.type,
            confidence: shapePattern.confidence,
            linePixels: linePixels.length,
            density: density.toFixed(3),
            coverage: coverage.toFixed(3)
          })
          
          return {
            type: shapePattern.type,
            confidence: shapePattern.confidence,
            density,
            coverage,
            linePixels,
            regionPixels,
            analysisRadius
          }
        } catch (error) {
          console.error('🚨 AI分析错误:', error)
          // 返回安全的默认值
          return {
            type: 'simple',
            confidence: 0.5,
            density: 0,
            coverage: 1,
            linePixels: [],
            regionPixels: [],
            analysisRadius: 30
          }
        }
      }

      // 🛡️ 简化的虚拟边界算法 - 防止填充泄漏
      const createVirtualBoundary = (regionAnalysis: any, startX: number, startY: number) => {
        try {
          const { type, confidence, linePixels, analysisRadius } = regionAnalysis
          
          // 只对复杂形状创建边界，简化判断逻辑
          if (confidence < 0.6 || type === 'simple' || linePixels.length < 20) {
            return null // 不需要虚拟边界
          }
          
          console.log(`🛡️ 创建虚拟边界: ${type} (置信度: ${confidence.toFixed(2)})`)
          
          // 简化边界创建 - 只使用圆形边界，性能更好
          const createBoundaryMask = () => {
            const mask = new Array(width * height).fill(false)
            
            // 统一使用圆形边界，简化逻辑
            const centerX = startX
            const centerY = startY
            
            // 基于线条分布计算合适的半径
            let maxDistance = 0
            for (const pixel of linePixels) {
              const distance = Math.sqrt(
                (pixel.x - centerX) ** 2 + (pixel.y - centerY) ** 2
              )
              maxDistance = Math.max(maxDistance, distance)
            }
            
            // 设置安全半径，限制最大范围
            const radius = Math.min(analysisRadius, maxDistance * 1.2 + 20)
            
            // 创建圆形边界
            for (let y = Math.max(0, centerY - radius); y <= Math.min(height - 1, centerY + radius); y++) {
              for (let x = Math.max(0, centerX - radius); x <= Math.min(width - 1, centerX + radius); x++) {
                const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
                if (distance <= radius) {
                  mask[y * width + x] = true
                }
              }
            }
            
            console.log(`🔮 圆形边界: 中心(${centerX}, ${centerY}), 半径(${radius.toFixed(1)})`)
            return mask
          }
          
          return createBoundaryMask()
        } catch (error) {
          console.error('🚨 虚拟边界创建错误:', error)
          return null // 出错时不使用边界
        }
      }
      
      // 🔧 增强的线条检测算法 - 多层检测避免条纹
      const isLinePixel = (px: number, py: number): boolean => {
        if (px < 0 || px >= width || py < 0 || py >= height) return true
        
        const pixelIndex = (py * width + px) * 4
        
        // 1. 原图线条检测 - 使用更精确的方法
        const r = imagePixels[pixelIndex]
        const g = imagePixels[pixelIndex + 1] 
        const b = imagePixels[pixelIndex + 2]
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        
        // 2. 用户绘制内容检测
        const drawingR = drawingPixels[pixelIndex]
        const drawingG = drawingPixels[pixelIndex + 1]
        const drawingB = drawingPixels[pixelIndex + 2]
        const drawingA = drawingPixels[pixelIndex + 3]
        const hasDrawing = drawingA > 25
        
        // 3. 动态阈值 - 根据画笔大小智能调整
        const brushSensitivity = Math.max(1, Math.min(100, brushSize))
        
        // 🎯 关键改进：多级阈值检测，避免遗漏细线
        const primaryThreshold = 60 + (brushSensitivity - 1) * 1.2 // 主要阈值
        const secondaryThreshold = 120 + (brushSensitivity - 1) * 0.8 // 次要阈值
        
        // 4. 边缘检测 - 检查周围像素的亮度变化
        let isEdge = false
        if (px > 0 && px < width - 1 && py > 0 && py < height - 1) {
          const centerBrightness = brightness
          let brightnessDiff = 0
          const neighbors = [
            [-1, 0], [1, 0], [0, -1], [0, 1] // 上下左右
          ]
          
          for (const [dx, dy] of neighbors) {
            const nx = px + dx
            const ny = py + dy
            const nIndex = (ny * width + nx) * 4
            const nR = imagePixels[nIndex]
            const nG = imagePixels[nIndex + 1] 
            const nB = imagePixels[nIndex + 2]
            const nBrightness = (nR * 0.299 + nG * 0.587 + nB * 0.114)
            brightnessDiff += Math.abs(centerBrightness - nBrightness)
          }
          
          // 如果亮度差异大，可能是边缘
          isEdge = brightnessDiff > 100
        }
        
        // 5. 综合判断
        const isPrimaryLine = brightness < primaryThreshold
        const isSecondaryLine = brightness < secondaryThreshold && isEdge
        const isOriginalLine = isPrimaryLine || isSecondaryLine
        
        if (hasDrawing) {
          const drawingBrightness = (drawingR * 0.299 + drawingG * 0.587 + drawingB * 0.114)
          const isUserLine = drawingBrightness < 100
          return isOriginalLine || isUserLine
        }
        
        return isOriginalLine
      }
      
      // 🎯 改进的颜色匹配 - 更好地处理抗锯齿和渐变
      const isMatchingColor = (px: number, py: number, targetR: number, targetG: number, targetB: number): boolean => {
        const pixelIndex = (py * width + px) * 4
        const currentR = drawingPixels[pixelIndex] || 0
        const currentG = drawingPixels[pixelIndex + 1] || 0
        const currentB = drawingPixels[pixelIndex + 2] || 0
        const currentA = drawingPixels[pixelIndex + 3] || 0
        
        // 透明像素处理
        if (currentA < 15) {
          return targetR === 0 && targetG === 0 && targetB === 0
        }
        
        // 🔧 智能颜色容差 - 考虑RGB的感知差异
        const brushSensitivity = Math.max(1, Math.min(100, brushSize))
        const baseTolerance = 2 + (brushSensitivity - 1) * 0.06
        
        // 对不同颜色通道使用不同的容差（人眼对绿色最敏感）
        const rTolerance = baseTolerance * 1.1
        const gTolerance = baseTolerance * 0.9
        const bTolerance = baseTolerance * 1.0
        
        return Math.abs(currentR - targetR) <= rTolerance && 
               Math.abs(currentG - targetG) <= gTolerance && 
               Math.abs(currentB - targetB) <= bTolerance
      }
      
      const targetPixelIndex = (targetY * width + targetX) * 4
      
      // 检查点击的是否是线条
      if (isLinePixel(targetX, targetY)) {
        console.log('🚫 点击位置是线条，跳过填充')
        return
      }

      // 获取目标区域的原始颜色
      const targetR = drawingPixels[targetPixelIndex] || 0
      const targetG = drawingPixels[targetPixelIndex + 1] || 0
      const targetB = drawingPixels[targetPixelIndex + 2] || 0
      
      // 如果已经是目标颜色，不需要填充
      if (targetR === fr && targetG === fg && targetB === fb) {
        console.log('🚫 区域已经是目标颜色，跳过填充')
        return
      }

      // 🤖 执行AI语义分析（加入错误处理）
      let regionAnalysis, virtualBoundary = null
      try {
        console.log('🧠 开始AI语义区域分析...')
        regionAnalysis = analyzeSemanticRegion(targetX, targetY)
        
        // 🛡️ 创建虚拟边界（如果需要）
        virtualBoundary = createVirtualBoundary(regionAnalysis, targetX, targetY)
      } catch (error) {
        console.error('🚨 AI分析失败，使用传统填充:', error)
        regionAnalysis = null
        virtualBoundary = null
      }
      
      // 🚀 AI增强的智能填充算法 - 支持虚拟边界约束
      const fillQueue = () => {
        const visited = new Set<string>() // 使用Set提高查找性能
        const queue: Array<{x: number, y: number}> = [{x: targetX, y: targetY}]
        let filledPixels = 0
        
        // 动态最大填充数量
        const brushSensitivity = Math.max(1, Math.min(100, brushSize))
        const maxPixels = Math.floor(15000 + (brushSensitivity - 1) * 10000)
        
        console.log(`🎯 开始填充，最大像素数: ${maxPixels}`)
        
        while (queue.length > 0 && filledPixels < maxPixels) {
          const current = queue.shift()!
          const {x: px, y: py} = current
          const key = `${px},${py}`
          
          // 边界和访问检查
          if (px < 0 || px >= width || py < 0 || py >= height) continue
          if (visited.has(key)) continue
          if (isLinePixel(px, py)) continue
          if (!isMatchingColor(px, py, targetR, targetG, targetB)) continue
          
          // 🛡️ AI虚拟边界检查 - 防止跨越形状边界
          if (virtualBoundary && !virtualBoundary[py * width + px]) {
            console.log(`🚫 虚拟边界阻止: (${px}, ${py})`)
            continue
          }
          
          // 标记为已访问
          visited.add(key)
          
          // 填充像素
          const pixelIndex = (py * width + px) * 4
          drawingPixels[pixelIndex] = fr
          drawingPixels[pixelIndex + 1] = fg
          drawingPixels[pixelIndex + 2] = fb
          drawingPixels[pixelIndex + 3] = 255
          filledPixels++
          
          // 📍 4方向扩散 (上下左右)
          const directions = [
            [0, -1], // 上
            [0, 1],  // 下
            [-1, 0], // 左
            [1, 0]   // 右
          ]
          
          for (const [dx, dy] of directions) {
            const nx = px + dx
            const ny = py + dy
            const neighborKey = `${nx},${ny}`
            
            if (!visited.has(neighborKey) && 
                nx >= 0 && nx < width && ny >= 0 && ny < height) {
              queue.push({x: nx, y: ny})
            }
          }
        }
        
        console.log(`✅ 填充完成，填充像素数: ${filledPixels}`)
        return filledPixels
      }
      
      const filledPixels = fillQueue()
      
      // 🔧 增强的后处理 - 多次间隙填充确保完整性
      if (filledPixels > 0) {
        console.log('🔧 开始后处理，消除间隙...')
        
        for (let pass = 0; pass < 3; pass++) { // 增加到3次
          let gapsFilled = 0
          
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const pixelIndex = (y * width + x) * 4
              
              // 跳过已填充的像素和线条
              if (drawingPixels[pixelIndex + 3] > 15) continue
              if (isLinePixel(x, y)) continue
              
              // 🛡️ 虚拟边界检查（后处理时也需要遵守）
              if (virtualBoundary && !virtualBoundary[y * width + x]) continue
              
              // 🎯 改进的邻居检查 - 8方向 + 权重
              let fillScore = 0
              const neighbors = [
                [-1, -1, 0.7], [0, -1, 1.0], [1, -1, 0.7], // 上排
                [-1,  0, 1.0],                [1,  0, 1.0], // 中排
                [-1,  1, 0.7], [0,  1, 1.0], [1,  1, 0.7]  // 下排
              ]
              
              for (const [dx, dy, weight] of neighbors) {
                const nx = x + dx
                const ny = y + dy
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const neighborIndex = (ny * width + nx) * 4
                  if (drawingPixels[neighborIndex] === fr && 
                      drawingPixels[neighborIndex + 1] === fg && 
                      drawingPixels[neighborIndex + 2] === fb &&
                      drawingPixels[neighborIndex + 3] > 200) {
                    fillScore += weight
                  }
                }
              }
              
              // 更智能的填充决策
              const fillThreshold = pass === 0 ? 4.0 : (pass === 1 ? 3.0 : 2.5)
              if (fillScore >= fillThreshold) {
                drawingPixels[pixelIndex] = fr
                drawingPixels[pixelIndex + 1] = fg
                drawingPixels[pixelIndex + 2] = fb
                drawingPixels[pixelIndex + 3] = 255
                gapsFilled++
              }
            }
          }
          
          console.log(`🔧 第${pass + 1}次后处理，填充间隙: ${gapsFilled}个`)
          if (gapsFilled === 0) break // 没有更多间隙需要填充
        }
      }
      
      // 更新画布
      drawingCtx.putImageData(drawingData, 0, 0)
      
      if (saveHistory) {
        saveToHistory(drawingData)
      }
      
      console.log('✅ Smart Fill 执行完成')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('❌ Fill area error:', errorMessage)
    }
  }

  // 🤖 AI增强的拖拽填充函数 - 支持智能边界检测
  const performDragFill = (x: number, y: number) => {
    console.log(`🤖 AI拖拽填充执行! brushSize: ${brushSize}, 位置: (${x.toFixed(1)}, ${y.toFixed(1)})`)
    
    const drawingCanvas = drawingCanvasRef.current
    const imageCanvas = imageCanvasRef.current
    const drawingCtx = drawingCanvas?.getContext("2d")
    const imageCtx = imageCanvas?.getContext("2d")
    if (!drawingCanvas || !imageCanvas || !drawingCtx || !imageCtx) return false

    const [fr, fg, fb] = hexToRgb(activeColor)
    const imageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height)
    const drawingData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
    const imagePixels = imageData.data
    const drawingPixels = drawingData.data
    
    const targetX = Math.round(x)
    const targetY = Math.round(y)
    const width = imageCanvas.width
    const height = imageCanvas.height
    
    // 边界检查
    if (targetX < 0 || targetX >= width || targetY < 0 || targetY >= height) {
      return false
    }
    
    // 🔧 与主填充函数完全一致的线条检测
    const isLinePixel = (px: number, py: number): boolean => {
      if (px < 0 || px >= width || py < 0 || py >= height) return true
      
      const pixelIndex = (py * width + px) * 4
      
      // 1. 原图线条检测
      const r = imagePixels[pixelIndex]
      const g = imagePixels[pixelIndex + 1] 
      const b = imagePixels[pixelIndex + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
      
      // 2. 用户绘制内容检测
      const drawingR = drawingPixels[pixelIndex]
      const drawingG = drawingPixels[pixelIndex + 1]
      const drawingB = drawingPixels[pixelIndex + 2]
      const drawingA = drawingPixels[pixelIndex + 3]
      const hasDrawing = drawingA > 25
      
      // 3. 动态阈值
      const brushSensitivity = Math.max(1, Math.min(100, brushSize))
      const primaryThreshold = 60 + (brushSensitivity - 1) * 1.2
      const secondaryThreshold = 120 + (brushSensitivity - 1) * 0.8
      
      // 4. 边缘检测
      let isEdge = false
      if (px > 0 && px < width - 1 && py > 0 && py < height - 1) {
        const centerBrightness = brightness
        let brightnessDiff = 0
        const neighbors = [
          [-1, 0], [1, 0], [0, -1], [0, 1]
        ]
        
        for (const [dx, dy] of neighbors) {
          const nx = px + dx
          const ny = py + dy
          const nIndex = (ny * width + nx) * 4
          const nR = imagePixels[nIndex]
          const nG = imagePixels[nIndex + 1] 
          const nB = imagePixels[nIndex + 2]
          const nBrightness = (nR * 0.299 + nG * 0.587 + nB * 0.114)
          brightnessDiff += Math.abs(centerBrightness - nBrightness)
        }
        
        isEdge = brightnessDiff > 100
      }
      
      // 5. 综合判断
      const isPrimaryLine = brightness < primaryThreshold
      const isSecondaryLine = brightness < secondaryThreshold && isEdge
      const isOriginalLine = isPrimaryLine || isSecondaryLine
      
      if (hasDrawing) {
        const drawingBrightness = (drawingR * 0.299 + drawingG * 0.587 + drawingB * 0.114)
        const isUserLine = drawingBrightness < 100
        return isOriginalLine || isUserLine
      }
      
      return isOriginalLine
    }
    
    // 🎯 与主填充函数完全一致的颜色匹配
    const isMatchingColor = (px: number, py: number, targetR: number, targetG: number, targetB: number): boolean => {
      const pixelIndex = (py * width + px) * 4
      const currentR = drawingPixels[pixelIndex] || 0
      const currentG = drawingPixels[pixelIndex + 1] || 0
      const currentB = drawingPixels[pixelIndex + 2] || 0
      const currentA = drawingPixels[pixelIndex + 3] || 0
      
      // 透明像素处理
      if (currentA < 15) {
        return targetR === 0 && targetG === 0 && targetB === 0
      }
      
      // 智能颜色容差
      const brushSensitivity = Math.max(1, Math.min(100, brushSize))
      const baseTolerance = 2 + (brushSensitivity - 1) * 0.06
      
      const rTolerance = baseTolerance * 1.1
      const gTolerance = baseTolerance * 0.9
      const bTolerance = baseTolerance * 1.0
      
      return Math.abs(currentR - targetR) <= rTolerance && 
             Math.abs(currentG - targetG) <= gTolerance && 
             Math.abs(currentB - targetB) <= bTolerance
    }
    
    // 跳过线条像素
    if (isLinePixel(targetX, targetY)) return false
    
    // 检查当前位置的颜色
    const targetPixelIndex = (targetY * width + targetX) * 4
    const targetR = drawingPixels[targetPixelIndex] || 0
    const targetG = drawingPixels[targetPixelIndex + 1] || 0
    const targetB = drawingPixels[targetPixelIndex + 2] || 0
    
    // 如果已经是目标颜色，跳过
    if (targetR === fr && targetG === fg && targetB === fb) return false
    
    // 初始填充半径
    const fillRadius = 15
    
    // 🤖 轻量级AI边界检测 - 适合拖拽时的快速检测
    const quickBoundaryCheck = (px: number, py: number): boolean => {
      const checkRadius = 20 // 小范围快速检测
      let lineCount = 0
      let totalChecked = 0
      
      // 快速采样周围区域
      for (let dy = -checkRadius; dy <= checkRadius; dy += 5) {
        for (let dx = -checkRadius; dx <= checkRadius; dx += 5) {
          const checkX = px + dx
          const checkY = py + dy
          
          if (checkX < 0 || checkX >= width || checkY < 0 || checkY >= height) continue
          
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > checkRadius) continue
          
          const pixelIndex = (checkY * width + checkX) * 4
          const r = imagePixels[pixelIndex]
          const g = imagePixels[pixelIndex + 1] 
          const b = imagePixels[pixelIndex + 2]
          const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
          
          totalChecked++
          if (brightness < 100) lineCount++
        }
      }
      
      // 如果周围线条密度太高，可能需要边界约束
      const lineDensity = lineCount / Math.max(1, totalChecked)
      return lineDensity > 0.3 // 30%以上是线条则需要约束
    }
    
    const needsBoundary = quickBoundaryCheck(targetX, targetY)
    let boundaryRadius = fillRadius
    
    if (needsBoundary) {
      boundaryRadius = Math.min(boundaryRadius, 25) // 限制更小的范围
      console.log(`🛡️ 拖拽检测到复杂形状，限制填充半径: ${boundaryRadius}`)
    }
    
    // 🚀 改进的拖拽填充 - 小范围队列式填充
    const baseFillRadius = 15 // 适中的填充半径
    const finalRadius = Math.min(boundaryRadius, baseFillRadius)
    const visited = new Set<string>()
    const queue: Array<{x: number, y: number}> = [{x: targetX, y: targetY}]
    let filledPixels = 0
    const maxPixels = 500 // 拖拽时限制填充数量，避免卡顿
    
    while (queue.length > 0 && filledPixels < maxPixels) {
      const current = queue.shift()!
      const {x: px, y: py} = current
      const key = `${px},${py}`
      
      // 距离检查 - 限制在半径内
      const distance = Math.sqrt((px - targetX) ** 2 + (py - targetY) ** 2)
      if (distance > finalRadius) continue
      
      // 边界和访问检查
      if (px < 0 || px >= width || py < 0 || py >= height) continue
      if (visited.has(key)) continue
      if (isLinePixel(px, py)) continue
      if (!isMatchingColor(px, py, targetR, targetG, targetB)) continue
      
      // 标记为已访问
      visited.add(key)
      
      // 填充像素
      const pixelIndex = (py * width + px) * 4
      drawingPixels[pixelIndex] = fr
      drawingPixels[pixelIndex + 1] = fg
      drawingPixels[pixelIndex + 2] = fb
      drawingPixels[pixelIndex + 3] = 255
      filledPixels++
      
      // 4方向扩散
      const directions = [
        [0, -1], [0, 1], [-1, 0], [1, 0]
      ]
      
      for (const [dx, dy] of directions) {
        const nx = px + dx
        const ny = py + dy
        const neighborKey = `${nx},${ny}`
        
        if (!visited.has(neighborKey) && 
            nx >= 0 && nx < width && ny >= 0 && ny < height) {
          queue.push({x: nx, y: ny})
        }
      }
    }
    
    if (filledPixels > 0) {
      drawingCtx.putImageData(drawingData, 0, 0)
      console.log(`✅ 拖拽填充完成，填充像素数: ${filledPixels}`)
    }
    
    return filledPixels > 0
  }

  const startDrawing = (x: number, y: number) => {
    const drawingCtx = drawingCanvasRef.current?.getContext("2d")
    if (!drawingCtx) return
    
    isDrawing.current = true
    drawingCtx.strokeStyle = activeColor
    drawingCtx.lineWidth = brushSize * resolutionScale.current // 按分辨率缩放画笔大小
    drawingCtx.lineCap = "round"
    drawingCtx.lineJoin = "round"
    
    // 立即绘制一个点（用于单击时显示）
    drawingCtx.fillStyle = activeColor
    drawingCtx.beginPath()
    drawingCtx.arc(x, y, (brushSize * resolutionScale.current) / 2, 0, 2 * Math.PI) // 按分辨率缩放
    drawingCtx.fill()
    
    // 开始路径用于拖拽绘制
    drawingCtx.beginPath()
    drawingCtx.moveTo(x, y)
  }

  const draw = (x: number, y: number) => {
    if (!isDrawing.current) return
    const drawingCtx = drawingCanvasRef.current?.getContext("2d")
    if (!drawingCtx) return
    
    drawingCtx.lineTo(x, y)
    drawingCtx.stroke()
    drawingCtx.beginPath()
    drawingCtx.moveTo(x, y)
  }

  const stopDrawing = () => {
    const drawingCtx = drawingCanvasRef.current?.getContext("2d")
    if (!drawingCtx || !isDrawing.current) return
    drawingCtx.closePath()
    isDrawing.current = false
    saveToHistory(drawingCtx.getImageData(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height))
  }

  // 着色工具核心算法 - 使用选定颜色进行着色
  const adjustColorTone = (x: number, y: number, mode: "darken" | "lighten", intensity: number, isDrawing = false) => {
    const drawingCanvas = drawingCanvasRef.current
    const drawingCtx = drawingCanvas?.getContext("2d")
    if (!drawingCanvas || !drawingCtx) return

    const imageData = drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
    const data = imageData.data
    const width = drawingCanvas.width
    const height = drawingCanvas.height
    
    // 获取目标颜色（用户选择的颜色）
    const [targetR, targetG, targetB] = hexToRgb(activeColor)
    
    // 调试信息
    console.log(`🎨 着色工具 - 目标颜色: rgb(${targetR}, ${targetG}, ${targetB}), 模式: ${mode === 'lighten' ? '浅色调' : '深色调'}, 强度: ${intensity}, 画笔大小: ${brushSize}`)
    
    // 计算受影响的像素范围
    const radius = Math.max(1, Math.floor((brushSize * resolutionScale.current) / 2))
    const centerX = Math.round(x)
    const centerY = Math.round(y)
    
    let pixelsModified = false
    
    // 遍历画笔影响范围内的像素
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const pixelX = centerX + dx
        const pixelY = centerY + dy
        
        // 检查是否在画布范围内
        if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) continue
        
        // 计算距离，实现圆形画笔效果
        const distance = Math.sqrt(dx * dx + dy * dy)
        if (distance > radius) continue
        
        const pixelIndex = (pixelY * width + pixelX) * 4
        const currentR = data[pixelIndex]
        const currentG = data[pixelIndex + 1]
        const currentB = data[pixelIndex + 2]
        const currentA = data[pixelIndex + 3]
        
        // 计算距离衰减因子，让画笔边缘有渐变效果
        const falloff = Math.max(0, 1 - (distance / radius))
        const adjustedIntensity = intensity * falloff
        
        let newR, newG, newB, newA
        
        if (currentA < 10) {
          // 透明区域：直接应用目标颜色，根据模式调整深浅
          if (mode === "darken") {
            // 深色调：使用较深的目标颜色
            newR = Math.max(0, targetR * (1 - adjustedIntensity * 0.5))
            newG = Math.max(0, targetG * (1 - adjustedIntensity * 0.5))
            newB = Math.max(0, targetB * (1 - adjustedIntensity * 0.5))
          } else {
            // 浅色调：使用较浅的目标颜色（向白色混合）
            newR = Math.min(255, targetR + (255 - targetR) * adjustedIntensity * 0.5)
            newG = Math.min(255, targetG + (255 - targetG) * adjustedIntensity * 0.5)
            newB = Math.min(255, targetB + (255 - targetB) * adjustedIntensity * 0.5)
          }
          newA = Math.min(255, adjustedIntensity * 255)
        } else {
          // 已有颜色区域：混合当前颜色与目标颜色
          if (mode === "darken") {
            // 深色调：混合后再加深
            const mixR = currentR * (1 - adjustedIntensity) + targetR * adjustedIntensity
            const mixG = currentG * (1 - adjustedIntensity) + targetG * adjustedIntensity
            const mixB = currentB * (1 - adjustedIntensity) + targetB * adjustedIntensity
            
            newR = Math.max(0, mixR * (1 - adjustedIntensity * 0.3))
            newG = Math.max(0, mixG * (1 - adjustedIntensity * 0.3))
            newB = Math.max(0, mixB * (1 - adjustedIntensity * 0.3))
          } else {
            // 浅色调：混合后再变淡
            const mixR = currentR * (1 - adjustedIntensity) + targetR * adjustedIntensity
            const mixG = currentG * (1 - adjustedIntensity) + targetG * adjustedIntensity
            const mixB = currentB * (1 - adjustedIntensity) + targetB * adjustedIntensity
            
            newR = Math.min(255, mixR + (255 - mixR) * adjustedIntensity * 0.3)
            newG = Math.min(255, mixG + (255 - mixG) * adjustedIntensity * 0.3)
            newB = Math.min(255, mixB + (255 - mixB) * adjustedIntensity * 0.3)
          }
          newA = Math.min(255, Math.max(currentA, adjustedIntensity * 255))
        }
        
        // 应用新颜色
        data[pixelIndex] = Math.round(newR)
        data[pixelIndex + 1] = Math.round(newG)
        data[pixelIndex + 2] = Math.round(newB)
        data[pixelIndex + 3] = Math.round(newA)
        
        // 调试信息：显示颜色变化效果（仅第一个像素）
        if (!pixelsModified) {
          console.log(`📊 着色效果 - 原始: rgba(${currentR}, ${currentG}, ${currentB}, ${currentA}) → 新颜色: rgba(${Math.round(newR)}, ${Math.round(newG)}, ${Math.round(newB)}, ${Math.round(newA)})`)
        }
        
        pixelsModified = true
      }
    }
    
    if (pixelsModified) {
      drawingCtx.putImageData(imageData, 0, 0)
      return true
    }
    
    return false
  }

  const startTonerDrawing = (x: number, y: number) => {
    isTonerDrawing.current = true
    adjustColorTone(x, y, tonerMode, tonerIntensity, true)
  }

  const continueTonerDrawing = (x: number, y: number) => {
    if (!isTonerDrawing.current) return
    adjustColorTone(x, y, tonerMode, tonerIntensity, true)
  }

  const stopTonerDrawing = () => {
    if (!isTonerDrawing.current) return
    
    isTonerDrawing.current = false
    const drawingCtx = drawingCanvasRef.current?.getContext("2d")
    if (drawingCtx) {
      saveToHistory(drawingCtx.getImageData(0, 0, drawingCtx.canvas.width, drawingCtx.canvas.height))
    }
  }


  const getCoords = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ): { x: number; y: number } | null => {
    const canvas = drawingCanvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return null

    // 直接使用canvas的边界信息
    const canvasRect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e.nativeEvent) {
      if (e.nativeEvent.touches.length === 0) return null
      clientX = e.nativeEvent.touches[0].clientX
      clientY = e.nativeEvent.touches[0].clientY
    } else {
      clientX = e.nativeEvent.clientX
      clientY = e.nativeEvent.clientY
    }

    // 简化的坐标转换：直接使用canvas的实际显示尺寸
    const canvasX = clientX - canvasRect.left
    const canvasY = clientY - canvasRect.top
    
    // 转换为canvas内部像素坐标
    const scaleX = canvas.width / canvasRect.width
    const scaleY = canvas.height / canvasRect.height

    return {
      x: canvasX * scaleX,
      y: canvasY * scaleY,
    }
  }

  // 双指缩放相关状态
  const [pinchState, setPinchState] = useState<{
    isActive: boolean
    initialDistance: number
    initialScale: number
    centerX: number
    centerY: number
  }>({
    isActive: false,
    initialDistance: 0,
    initialScale: 1,
    centerX: 0,
    centerY: 0
  })

  // 计算两点之间的距离
  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  // 计算两点的中心点
  const getCenter = (touch1: Touch, touch2: Touch) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2
    }
  }

  const handleInteractionStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    // 检查是否为双指触摸
    if ("touches" in e.nativeEvent && e.nativeEvent.touches.length === 2) {
      e.preventDefault()
      const touch1 = e.nativeEvent.touches[0]
      const touch2 = e.nativeEvent.touches[1]
      const distance = getDistance(touch1, touch2)
      const center = getCenter(touch1, touch2)
      
      setPinchState({
        isActive: true,
        initialDistance: distance,
        initialScale: scale,
        centerX: center.x,
        centerY: center.y
      })
      
      console.log('🤏 双指缩放开始', { distance, center, currentScale: scale })
      return // 双指操作时不执行绘图
    }
    
    // 如果是单指触摸但双指状态还活跃，重置双指状态
    if (pinchState.isActive) {
      setPinchState(prev => ({ ...prev, isActive: false }))
    }

    const coords = getCoords(e)
    if (!coords) return
    
    console.log(`🖱️ 鼠标/触摸开始 - 工具: ${activeTool}, 坐标: (${Math.round(coords.x)}, ${Math.round(coords.y)})`)

    if (activeTool === "dropper") {
      // 正常的填充逻辑
      fillArea(coords.x, coords.y)
      
      // 重置拖拽状态
      dragFillStarted.current = false
      lastFillPosition.current = coords
      
      // 立即进入拖拽准备状态
      isDragFilling.current = true
      
      // 设置长按定时器，更短的延迟
      dragFillTimeout.current = setTimeout(() => {
        if (!isDragFilling.current) return // 如果已经释放了鼠标，不进入拖拽模式
        
        dragFillStarted.current = true
        
        // 开始连续填充定时器
        const startContinuousFill = () => {
          if (!isDragFilling.current || !lastFillPosition.current) return
          
          performDragFill(lastFillPosition.current.x, lastFillPosition.current.y)
          
          continuousFillTimer.current = setTimeout(startContinuousFill, 50) // 每50ms填充一次
        }
        
        startContinuousFill()
        
      }, 150) // 缩短到150ms进入拖拽模式
      
      // 添加全局鼠标事件监听以支持连续填充
      const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
        const canvas = drawingCanvasRef.current
        if (!canvas || !isDragFilling.current) return
        
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (moveEvent.clientX - rect.left) * scaleX
        const y = (moveEvent.clientY - rect.top) * scaleY
        
        lastFillPosition.current = { x, y }
        
        // 如果拖拽模式已开始，使用节流填充
        if (dragFillStarted.current) {
          const now = Date.now()
          if (now - lastFillTime.current > 16) { // 约60fps的限制
            performDragFill(x, y)
            lastFillTime.current = now
          }
        }
      }
      
      const handleGlobalMouseUp = () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        // handleInteractionEnd 会被调用来清理状态
      }
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      
      // 为触摸设备添加类似的处理
      const handleGlobalTouchMove = (moveEvent: TouchEvent) => {
        const canvas = drawingCanvasRef.current
        if (!canvas || !isDragFilling.current || moveEvent.touches.length === 0) return
        
        const rect = canvas.getBoundingClientRect()
        const touch = moveEvent.touches[0]
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (touch.clientX - rect.left) * scaleX
        const y = (touch.clientY - rect.top) * scaleY
        
        lastFillPosition.current = { x, y }
        
        // 如果拖拽模式已开始，使用节流填充
        if (dragFillStarted.current) {
          const now = Date.now()
          if (now - lastFillTime.current > 16) { // 约60fps的限制
            performDragFill(x, y)
            lastFillTime.current = now
          }
        }
      }
      
      const handleGlobalTouchEnd = () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleGlobalTouchEnd)
        // handleInteractionEnd 会被调用来清理状态
      }
      
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
      
    } else if (activeTool === "brush") {
      startDrawing(coords.x, coords.y)
      
      // 添加全局鼠标事件监听以支持连续绘制
      const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
        const canvas = drawingCanvasRef.current
        if (!canvas || !isDrawing.current) return
        
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (moveEvent.clientX - rect.left) * scaleX
        const y = (moveEvent.clientY - rect.top) * scaleY
        draw(x, y)
      }
      
      const handleGlobalMouseUp = () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        stopDrawing()
      }
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      
      // 为触摸设备添加类似的处理
      const handleGlobalTouchMove = (moveEvent: TouchEvent) => {
        const canvas = drawingCanvasRef.current
        if (!canvas || !isDrawing.current || moveEvent.touches.length === 0) return
        
        const rect = canvas.getBoundingClientRect()
        const touch = moveEvent.touches[0]
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (touch.clientX - rect.left) * scaleX
        const y = (touch.clientY - rect.top) * scaleY
        draw(x, y)
      }
      
      const handleGlobalTouchEnd = () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleGlobalTouchEnd)
        stopDrawing()
      }
      
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
    } else if (activeTool === "toner") {
      startTonerDrawing(coords.x, coords.y)
      
      // 添加全局鼠标事件监听以支持连续深浅调节
      const handleGlobalMouseMove = (moveEvent: MouseEvent) => {
        const canvas = drawingCanvasRef.current
        if (!canvas || !isTonerDrawing.current) return
        
        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (moveEvent.clientX - rect.left) * scaleX
        const y = (moveEvent.clientY - rect.top) * scaleY
        continueTonerDrawing(x, y)
      }
      
      const handleGlobalMouseUp = () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove)
        document.removeEventListener('mouseup', handleGlobalMouseUp)
        stopTonerDrawing()
      }
      
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      
      // 为触摸设备添加类似的处理
      const handleGlobalTouchMove = (moveEvent: TouchEvent) => {
        const canvas = drawingCanvasRef.current
        if (!canvas || !isTonerDrawing.current || moveEvent.touches.length === 0) return
        
        const rect = canvas.getBoundingClientRect()
        const touch = moveEvent.touches[0]
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height
        const x = (touch.clientX - rect.left) * scaleX
        const y = (touch.clientY - rect.top) * scaleY
        continueTonerDrawing(x, y)
      }
      
      const handleGlobalTouchEnd = () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove)
        document.removeEventListener('touchend', handleGlobalTouchEnd)
        stopTonerDrawing()
      }
      
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false })
      document.addEventListener('touchend', handleGlobalTouchEnd)
    }
  }

  const handleInteractionMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    
    // 处理双指缩放
    if ("touches" in e.nativeEvent && e.nativeEvent.touches.length === 2 && pinchState.isActive) {
      const touch1 = e.nativeEvent.touches[0]
      const touch2 = e.nativeEvent.touches[1]
      const distance = getDistance(touch1, touch2)
      const center = getCenter(touch1, touch2)
      
      // 计算缩放比例
      const scaleChange = distance / pinchState.initialDistance
      const newScale = Math.max(0.5, Math.min(3, pinchState.initialScale * scaleChange))
      
      // 获取容器信息
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      
      // 计算缩放中心点相对于容器的位置
      const pinchCenterX = center.x - rect.left
      const pinchCenterY = center.y - rect.top
      
      // 计算变换，保持缩放中心点位置不变
      const beforeZoomPointX = (pinchCenterX - translateX) / scale
      const beforeZoomPointY = (pinchCenterY - translateY) / scale
      
      const afterZoomPointX = beforeZoomPointX * newScale
      const afterZoomPointY = beforeZoomPointY * newScale
      
      const newTranslateX = pinchCenterX - afterZoomPointX
      const newTranslateY = pinchCenterY - afterZoomPointY
      
      setScale(newScale)
      setTranslateX(newTranslateX)
      setTranslateY(newTranslateY)
      
      console.log('🤏 双指缩放中', { 
        distance, 
        scaleChange: scaleChange.toFixed(2), 
        newScale: newScale.toFixed(2),
        center: { x: pinchCenterX, y: pinchCenterY }
      })
      
      return // 双指操作时不执行绘图
    }
    
    const coords = getCoords(e)
    if (!coords) return
    
    // Smart Fill 模式现在由全局事件处理器管理
    // 这里保留空逻辑以保持结构完整性
  }

  const handleInteractionEnd = () => {
    // 重置双指缩放状态
    if (pinchState.isActive) {
      setPinchState(prev => ({ ...prev, isActive: false }))
      console.log('🤏 双指缩放结束')
      return
    }
    
    if (activeTool === "dropper") {
      // 清除所有定时器
      if (dragFillTimeout.current) {
        clearTimeout(dragFillTimeout.current)
        dragFillTimeout.current = null
      }
      
      if (continuousFillTimer.current) {
        clearTimeout(continuousFillTimer.current)
        continuousFillTimer.current = null
      }
      
      // 如果进行了拖拽填充，保存历史记录
      if (isDragFilling.current && dragFillStarted.current) {
        const drawingCanvas = drawingCanvasRef.current
        const drawingCtx = drawingCanvas?.getContext("2d")
        if (drawingCanvas && drawingCtx) {
          saveToHistory(drawingCtx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height))
        }
      }
      
      // 重置所有拖拽状态
      isDragFilling.current = false
      dragFillStarted.current = false
      lastFillPosition.current = null
      
    }
  }

  const handleDownload = async (filename: string) => {
    const imageCanvas = imageCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!imageCanvas || !drawingCanvas) return
    
    try {
      // 创建合并后的着色图像（不带水印，用于下载）
      const coloredImageUrl = await createDownloadImage()
      if (!coloredImageUrl) {
        console.error('❌ Failed to create download image')
        return
      }

      // 下载图像
      const a = document.createElement('a')
      a.href = coloredImageUrl
      a.download = filename
      a.click()
      
      // 清理临时URL
      setTimeout(() => URL.revokeObjectURL(coloredImageUrl), 100)
      
    } catch (error) {
      console.error('❌ Download failed:', error)
    }
  }
  
  // 创建用于下载的图像（无水印）
  const createDownloadImage = (): Promise<string> => {
    return new Promise((resolve) => {
      const imageCanvas = imageCanvasRef.current
      const drawingCanvas = drawingCanvasRef.current
      if (!imageCanvas || !drawingCanvas) {
        resolve('')
        return
      }
      
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = drawingCanvas.width
      tempCanvas.height = drawingCanvas.height
      const tempCtx = tempCanvas.getContext('2d')!
      
      // 设置白色背景
      tempCtx.fillStyle = 'white'
      tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
      
      // 绘制用户的着色（底层）
      tempCtx.drawImage(drawingCanvas, 0, 0)
      
      // 使用multiply混合模式绘制线稿（顶层）
      tempCtx.globalCompositeOperation = 'multiply'
      tempCtx.drawImage(imageCanvas, 0, 0)
      
      // 重置混合模式
      tempCtx.globalCompositeOperation = 'source-over'
      
      // 转换为Blob URL
      tempCanvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob))
        } else {
          resolve('')
        }
      }, 'image/png', 0.95)
    })
  }

  const handlePrint = async () => {
    const imageCanvas = imageCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!imageCanvas || !drawingCanvas) {
      showToast.printError.imageNotLoaded()
      return
    }
    
    try {
      console.log('🖨️ Starting print process...')
      
      // 检查打印兼容性
      const { checkPrintCompatibility } = await import('@/lib/print-utils')
      const compatibility = checkPrintCompatibility()
      
      if (!compatibility.supported) {
        showToast.printError.browserNotSupported()
        return
      }
      
      // 显示兼容性警告
      if (compatibility.warnings.length > 0) {
        showPrintCompatibilityWarning(compatibility.warnings)
      }
      
      // 创建高质量合并后的着色图像
      const coloredImageUrl = await createColoredImage()
      if (!coloredImageUrl) {
        console.error('❌ Failed to create colored image')
        showToast.printError.imageProcessingFailed()
        return
      }

      console.log('✅ Image prepared for printing, initiating print dialog...')
      
      // 动态导入print-js并使用高质量打印配置
      const { printSingleImage, HIGH_QUALITY_PRINT_CONFIG } = await import('@/lib/print-utils')
      
      // 使用专业打印配置进行打印
      await printSingleImage(coloredImageUrl, {
        ...HIGH_QUALITY_PRINT_CONFIG,
        showHeader: false, // 不显示标题，水印将在图像中
      })
      
      console.log('✅ Print dialog opened successfully')
      
      // 延迟清理临时URL，给打印对话框时间
      setTimeout(() => {
        URL.revokeObjectURL(coloredImageUrl)
      }, 5000)
      
    } catch (error) {
      console.error('❌ Printing failed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      // Handle different types of print errors
      if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
        showToast.printError.timeout()
      } else if (errorMsg.includes('browser') || errorMsg.includes('浏览器')) {
        showToast.printError.browserNotSupported()
      } else if (errorMsg.includes('printer') || errorMsg.includes('打印机')) {
        showToast.printError.printerConnection()
      } else {
        showToast.printError.printingFailed(errorMsg)
      }
    }
  }
  
  // 创建带有水印的高质量着色图像
  const createColoredImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const imageCanvas = imageCanvasRef.current
      const drawingCanvas = drawingCanvasRef.current
      if (!imageCanvas || !drawingCanvas) {
        reject(new Error('画布元素不可用'))
        return
      }
      
      try {
        // 创建用于打印的高质量临时画布
        const tempCanvas = document.createElement('canvas')
        
        // 轻微提升分辨率，因为基础canvas已经是高分辨率
        const scaleFactor = 1.5 // 从3倍减少到1.5倍，避免过度放大
        tempCanvas.width = drawingCanvas.width * scaleFactor
        tempCanvas.height = drawingCanvas.height * scaleFactor
        
        const tempCtx = tempCanvas.getContext('2d')
        if (!tempCtx) {
          reject(new Error('无法获取画布上下文'))
          return
        }
        
        // 启用高质量图像渲染
        tempCtx.imageSmoothingEnabled = true
        tempCtx.imageSmoothingQuality = 'high'
        
        // 设置纯白背景（打印优化）
        tempCtx.fillStyle = '#FFFFFF'
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
        
        // 绘制用户的着色（底层）
        tempCtx.drawImage(drawingCanvas, 0, 0, tempCanvas.width, tempCanvas.height)
        
        // 使用multiply混合模式绘制线稿（顶层）以保留线条
        tempCtx.globalCompositeOperation = 'multiply'
        tempCtx.drawImage(imageCanvas, 0, 0, tempCanvas.width, tempCanvas.height)
        
        // 重置混合模式
        tempCtx.globalCompositeOperation = 'source-over'
        
        // 添加增强型水印到右下角
        addWatermark(tempCtx, tempCanvas.width, tempCanvas.height)
        
        console.log('✅ High-quality print image created:', {
          originalSize: `${drawingCanvas.width}x${drawingCanvas.height}`,
          printSize: `${tempCanvas.width}x${tempCanvas.height}`,
          scaleFactor
        })
        
        // 转换为Blob URL以供打印使用
        tempCanvas.toBlob((blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob))
          } else {
            reject(new Error('图像Blob生成失败'))
          }
        }, 'image/png', 1.0) // 最高质量
        
      } catch (error) {
        reject(error)
      }
    })
  }
  
  // 添加网站水印到图像右下角 - 增强版本
  const addWatermark = (ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) => {
    const watermarkText = 'https://hellokittycoloringpage.net'
    
    // 计算自适应字体大小，确保在打印时清晰可见
    const fontSize = Math.max(16, canvasWidth * 0.018) // 增大基础字体大小
    const fontFamily = 'Arial, Helvetica, sans-serif'
    ctx.font = `bold ${fontSize}px ${fontFamily}` // 使用粗体增加可读性
    
    // 计算水印位置（右下角，预留足够边距）
    const margin = fontSize * 1.2
    const x = canvasWidth - margin
    const y = canvasHeight - margin
    
    // 绘制水印背景（轻微的白色背景提高对比度）
    ctx.textAlign = 'right'
    ctx.textBaseline = 'bottom'
    const textMetrics = ctx.measureText(watermarkText)
    const textWidth = textMetrics.width
    const textHeight = fontSize * 1.2
    
    // 添加半透明白色背景矩形
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.fillRect(
      x - textWidth - 8, 
      y - textHeight + 4, 
      textWidth + 16, 
      textHeight
    )
    
    // 绘制水印边框
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)'
    ctx.lineWidth = 1
    ctx.strokeRect(
      x - textWidth - 8, 
      y - textHeight + 4, 
      textWidth + 16, 
      textHeight
    )
    
    // 绘制水印文字 - 深色以确保在打印时可见
    ctx.fillStyle = 'rgba(80, 80, 80, 0.9)' // 更深的灰色，打印时更清晰
    ctx.fillText(watermarkText, x - 4, y - 4)
    
    // 添加轻微的阴影效果
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
    ctx.fillText(watermarkText, x - 3, y - 3)
    
    console.log('✅ Enhanced watermark added to print image:', {
      text: watermarkText,
      position: { x: x - 4, y: y - 4 },
      fontSize,
      dimensions: { width: textWidth, height: textHeight }
    })
  }

  // 🎯 进度保存和恢复功能
  const saveProgress = (key?: string): boolean => {
    try {
      const drawingCanvas = drawingCanvasRef.current
      if (!drawingCanvas) {
        console.error('❌ 无法保存进度：canvas未初始化')
        return false
      }

      const ctx = drawingCanvas.getContext('2d')
      if (!ctx) {
        console.error('❌ 无法保存进度：无法获取canvas上下文')
        return false
      }

      // 生成保存键
      const saveKey = key || `coloring-progress-${imageUrl}`
      
      // 使用canvas.toDataURL方法，自动压缩数据
      const dataURL = drawingCanvas.toDataURL('image/png', 0.8) // 80%质量压缩
      
      // 创建进度数据对象
      const progressData = {
        dataURL: dataURL,
        timestamp: new Date().toISOString(),
        imageUrl: imageUrl,
        dimensions: {
          width: drawingCanvas.width,
          height: drawingCanvas.height
        }
      }

      // 检查数据大小
      const dataString = JSON.stringify(progressData)
      const sizeInMB = (dataString.length * 2) / (1024 * 1024) // UTF-16编码，每字符2字节
      
      console.log(`📊 保存数据大小: ${sizeInMB.toFixed(2)} MB`)
      
      // localStorage通常限制5-10MB，我们设置4MB为安全限制
      if (sizeInMB > 4) {
        console.error('❌ 保存失败：数据过大 (', sizeInMB.toFixed(2), 'MB > 4MB)')
        throw new Error(`数据过大 (${sizeInMB.toFixed(1)}MB)，请尝试在着色较少时保存`)
      }

      // 保存到localStorage
      localStorage.setItem(saveKey, dataString)
      console.log('✅ 进度已保存:', saveKey, `(${sizeInMB.toFixed(2)}MB)`)
      return true
      
    } catch (error) {
      console.error('❌ 保存进度失败:', error)
      
      // 检查是否是存储空间问题
      if (error instanceof Error) {
        if (error.message.includes('QuotaExceededError') || error.message.includes('quota')) {
          console.error('❌ 存储空间不足，请清理浏览器缓存或删除其他保存的进度')
        }
      }
      
      return false
    }
  }

  const loadProgress = (key?: string): boolean => {
    try {
      const drawingCanvas = drawingCanvasRef.current
      if (!drawingCanvas) {
        console.error('❌ 无法加载进度：canvas未初始化')
        return false
      }

      const ctx = drawingCanvas.getContext('2d')
      if (!ctx) {
        console.error('❌ 无法加载进度：无法获取canvas上下文')
        return false
      }

      const saveKey = key || `coloring-progress-${imageUrl}`
      const savedData = localStorage.getItem(saveKey)
      
      if (!savedData) {
        console.log('ℹ️ 没有找到保存的进度:', saveKey)
        return false
      }

      const progressData = JSON.parse(savedData)
      
      // 支持新格式（dataURL）和旧格式（ImageData）
      if (progressData.dataURL) {
        // 新格式：使用dataURL，同步处理
        try {
          const img = new Image()
          img.onload = () => {
            try {
              // 清空canvas
              ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height)
              
              // 绘制图像
              ctx.drawImage(img, 0, 0, drawingCanvas.width, drawingCanvas.height)
              
              // 保存到历史记录
              const imageData = ctx.getImageData(0, 0, drawingCanvas.width, drawingCanvas.height)
              saveToHistory(imageData)
              
              console.log('✅ 进度已加载 (新格式):', saveKey, new Date(progressData.timestamp))
            } catch (error) {
              console.error('❌ 加载图像失败:', error)
            }
          }
          img.onerror = () => {
            console.error('❌ 图像数据损坏')
          }
          img.src = progressData.dataURL
          console.log('🔄 正在加载进度图像...')
          return true // 立即返回true，异步加载
        } catch (error) {
          console.error('❌ 创建图像失败:', error)
          return false
        }
      } else if (progressData.data) {
        // 旧格式：使用ImageData
        if (!progressData.width || !progressData.height) {
          console.error('❌ 保存的进度数据不完整')
          return false
        }

        // 检查canvas尺寸是否匹配
        if (progressData.width !== drawingCanvas.width || progressData.height !== drawingCanvas.height) {
          console.warn('⚠️ 保存的进度尺寸与当前canvas不匹配')
        }

        // 创建ImageData并恢复到canvas
        const imageData = new ImageData(
          new Uint8ClampedArray(progressData.data),
          progressData.width,
          progressData.height
        )
        
        ctx.putImageData(imageData, 0, 0)
        
        // 保存到历史记录以支持撤销
        saveToHistory(imageData)
        
        console.log('✅ 进度已加载 (旧格式):', saveKey, new Date(progressData.timestamp))
        return true
      } else {
        console.error('❌ 无法识别的数据格式')
        return false
      }
      
    } catch (error) {
      console.error('❌ 加载进度失败:', error)
      return false
    }
  }

  const hasProgress = (key?: string): boolean => {
    try {
      const saveKey = key || `coloring-progress-${imageUrl}`
      const savedData = localStorage.getItem(saveKey)
      return !!savedData
    } catch (error) {
      console.error('❌ 检查进度失败:', error)
      return false
    }
  }

  const clearProgress = (key?: string): void => {
    try {
      const saveKey = key || `coloring-progress-${imageUrl}`
      localStorage.removeItem(saveKey)
      console.log('🗑️ 进度已清除:', saveKey)
    } catch (error) {
      console.error('❌ 清除进度失败:', error)
    }
  }

  React.useImperativeHandle(ref, () => ({
    undo: handleUndo,
    reset: handleReset,
    download: handleDownload,
    print: handlePrint,
    saveProgress,
    loadProgress,
    hasProgress,
    clearProgress,
    // 新增的实用方法
    getCurrentState: () => {
      const imageCanvas = imageCanvasRef.current
      const drawingCanvas = drawingCanvasRef.current
      return {
        hasImage: !!(imageCanvas && drawingCanvas),
        canUndo: history.length > 1,
        imageSize: imageCanvas ? { width: imageCanvas.width, height: imageCanvas.height } : null
      }
    },
    // 暴露Canvas元素引用给Pattern工具使用
    getDrawingCanvas: () => drawingCanvasRef.current
  }))

  return (
    <div 
      ref={containerRef}
      className="flex items-center justify-center w-full touch-none overflow-hidden"
      style={{ 
        overscrollBehavior: 'none',
        touchAction: 'none'
      }}
    >
      <div 
        className="relative"
        style={{
          transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: 'transform 0.1s ease-out'
        }}
      >
        <canvas ref={imageCanvasRef} className="absolute top-0 left-0 pointer-events-none" />
        <canvas
          ref={drawingCanvasRef}
          className={cn("relative z-10", {
            "cursor-crosshair": activeTool === "dropper",
            "cursor-cell": activeTool === "toner", // 表示深浅调节工具
          })}
          style={{
            cursor: activeTool === "brush" 
              ? `url("data:image/svg+xml;charset=UTF-8,%3csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M3 21l1.5-1.5L9 15l-4-4-4.5 4.5L3 21zm0 0l4-4M8 13l2.5-2.5a4 4 0 015.5 0L18 12.5l1 1-8.5 8.5a2 2 0 01-3 0L8 13z' stroke='%23333' stroke-width='1.5' fill='none'/%3e%3ccircle cx='18' cy='6' r='2' fill='%23ff6b6b'/%3e%3c/svg%3e") 2 22, auto`
              : undefined,
            touchAction: 'none'
          }}
          onMouseDown={handleInteractionStart}
          onTouchStart={handleInteractionStart}
          onMouseMove={handleInteractionMove}
          onTouchMove={handleInteractionMove}
          onMouseUp={handleInteractionEnd}
          onTouchEnd={handleInteractionEnd}
          onMouseLeave={handleInteractionEnd}
        />
      </div>
    </div>
  )
})

ColoringCanvas.displayName = "ColoringCanvas"