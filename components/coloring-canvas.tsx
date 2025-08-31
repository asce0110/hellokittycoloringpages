"use client"

import React, { useRef, useEffect, useState } from "react"
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
  { undo: () => void; reset: () => void; download: (filename: string) => void; print: () => void },
  ColoringCanvasProps
>(({ imageUrl, strokeColor = "#000000", activeColor, activeTool, brushSize, tonerMode = "darken", tonerIntensity = 0.3, onHistoryChange }, ref) => {
  const imageCanvasRef = useRef<HTMLCanvasElement>(null)
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null)
  const [history, setHistory] = useState<ImageData[]>([])
  const isDrawing = useRef(false)
  
  // Smart Fill 拖拽相关状态
  const isDragFilling = useRef(false)
  const dragFillTimeout = useRef<NodeJS.Timeout | null>(null)
  const lastFillPosition = useRef<{ x: number, y: number } | null>(null)
  const dragFillStarted = useRef(false)
  const continuousFillTimer = useRef<NodeJS.Timeout | null>(null)
  const lastFillTime = useRef(0)

  // Toner 工具相关状态
  const isTonerDrawing = useRef(false)

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
      
      // 🎯 保持图片比例的尺寸计算
      const maxWidth = 500
      const maxHeight = 600
      const aspectRatio = img.width / img.height
      
      let canvasWidth, canvasHeight
      if (aspectRatio > 1) {
        // 横向图片
        canvasWidth = Math.min(maxWidth, img.width)
        canvasHeight = canvasWidth / aspectRatio
      } else {
        // 纵向图片
        canvasHeight = Math.min(maxHeight, img.height)
        canvasWidth = canvasHeight * aspectRatio
      }
      
      // 确保尺寸为整数
      canvasWidth = Math.round(canvasWidth)
      canvasHeight = Math.round(canvasHeight)

      imageCanvas.width = canvasWidth
      imageCanvas.height = canvasHeight
      drawingCanvas.width = canvasWidth
      drawingCanvas.height = canvasHeight
      
      imageCanvas.style.width = canvasWidth + 'px'
      imageCanvas.style.height = canvasHeight + 'px'
      drawingCanvas.style.width = canvasWidth + 'px'
      drawingCanvas.style.height = canvasHeight + 'px'
      
      // 白色背景
      imageCtx.fillStyle = 'white'
      imageCtx.fillRect(0, 0, canvasWidth, canvasHeight)
      
      // 绘制图片保持比例
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

  // 改进的智能填充 - 使用扫描线算法解决条纹问题
  const fillArea = (x: number, y: number, saveHistory: boolean = true) => {
    // 🚨 明显的调试信息：Smart Fill被调用
    console.log(`🚨 Smart Fill 被触发! brushSize: ${brushSize}, 位置: (${x.toFixed(1)}, ${y.toFixed(1)})`)
    
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
      
      // 🎯 超严格线条检测 - 专门针对复杂图像
      const isLinePixel = (px: number, py: number): boolean => {
        if (px < 0 || px >= width || py < 0 || py >= height) return true
        
        const pixelIndex = (py * width + px) * 4
        
        // 检查原图线条 - 使用更智能的阈值检测
        const r = imagePixels[pixelIndex]
        const g = imagePixels[pixelIndex + 1] 
        const b = imagePixels[pixelIndex + 2]
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
        
        // 检查用户绘制的线条
        const drawingR = drawingPixels[pixelIndex]
        const drawingG = drawingPixels[pixelIndex + 1]
        const drawingB = drawingPixels[pixelIndex + 2]
        const drawingA = drawingPixels[pixelIndex + 3]
        const hasDrawing = drawingA > 50 // 降低阈值，更敏感检测用户绘制内容
        
        // 🎨 简化但有效的线条检测 - 基于Brush Size调整敏感度
        const brushSensitivity = Math.max(1, Math.min(100, brushSize))
        
        // 动态亮度阈值：小值=严格，大值=宽松
        const brightnessThreshold = 50 + (brushSensitivity - 1) * 1.5 // 50到199的范围
        const isOriginalLine = brightness < brightnessThreshold
        
        if (hasDrawing) {
          const drawingBrightness = (drawingR * 0.299 + drawingG * 0.587 + drawingB * 0.114)
          const isUserLine = drawingBrightness < 120
          return isOriginalLine || isUserLine
        }
        
        return isOriginalLine
      }
      
      // 颜色匹配函数 - 允许轻微的颜色差异（处理抗锯齿）
      const isMatchingColor = (px: number, py: number, targetR: number, targetG: number, targetB: number): boolean => {
        const pixelIndex = (py * width + px) * 4
        const currentR = drawingPixels[pixelIndex] || 0
        const currentG = drawingPixels[pixelIndex + 1] || 0
        const currentB = drawingPixels[pixelIndex + 2] || 0
        const currentA = drawingPixels[pixelIndex + 3] || 0
        
        // 对于透明像素，视为匹配空白区域
        if (currentA < 10) {
          return targetR === 0 && targetG === 0 && targetB === 0
        }
        
        // 🎨 基于Brush Size的动态颜色容差
        // 小画笔 = 严格匹配，大画笔 = 宽松匹配
        const brushSensitivity = Math.max(1, Math.min(100, brushSize))
        const tolerance = 1 + (brushSensitivity - 1) * 0.08 // 1到9的范围
        return Math.abs(currentR - targetR) <= tolerance && 
               Math.abs(currentG - targetG) <= tolerance && 
               Math.abs(currentB - targetB) <= tolerance
      }
      
      const targetPixelIndex = (targetY * width + targetX) * 4
      
      // 检查点击的是否是线条
      if (isLinePixel(targetX, targetY)) {
        return
      }

      // 获取目标区域的原始颜色
      const targetR = drawingPixels[targetPixelIndex] || 0
      const targetG = drawingPixels[targetPixelIndex + 1] || 0
      const targetB = drawingPixels[targetPixelIndex + 2] || 0
      
      // 如果已经是目标颜色，不需要填充
      if (targetR === fr && targetG === fg && targetB === fb) return

      // 使用扫描线填充算法 - 更可靠地处理大区域
      const fillScanline = () => {
        const visited = new Array(width * height).fill(false)
        const stack: Array<{x: number, y: number}> = [{x: targetX, y: targetY}]
        let filledPixels = 0
        // 🎨 基于Brush Size的动态填充范围控制
        const brushSensitivity = Math.max(1, Math.min(100, brushSize))
        const maxPixels = Math.floor(10000 + (brushSensitivity - 1) * 8000) // 10k到800k的范围
        
        while (stack.length > 0 && filledPixels < maxPixels) {
          const {x: seedX, y: seedY} = stack.pop()!
          
          if (seedX < 0 || seedX >= width || seedY < 0 || seedY >= height) continue
          if (visited[seedY * width + seedX]) continue
          if (isLinePixel(seedX, seedY)) continue
          if (!isMatchingColor(seedX, seedY, targetR, targetG, targetB)) continue
          
          // 寻找扫描线的左右边界
          let leftX = seedX
          let rightX = seedX
          
          // 向左扫描
          while (leftX >= 0 && 
                 !visited[seedY * width + leftX] &&
                 !isLinePixel(leftX, seedY) && 
                 isMatchingColor(leftX, seedY, targetR, targetG, targetB)) {
            leftX--
          }
          leftX++ // 回退到有效位置
          
          // 向右扫描
          while (rightX < width && 
                 !visited[seedY * width + rightX] &&
                 !isLinePixel(rightX, seedY) && 
                 isMatchingColor(rightX, seedY, targetR, targetG, targetB)) {
            rightX++
          }
          rightX-- // 回退到有效位置
          
          // 填充这条扫描线
          for (let fillX = leftX; fillX <= rightX; fillX++) {
            const fillIndex = (seedY * width + fillX) * 4
            if (visited[seedY * width + fillX]) continue
            
            visited[seedY * width + fillX] = true
            drawingPixels[fillIndex] = fr
            drawingPixels[fillIndex + 1] = fg
            drawingPixels[fillIndex + 2] = fb
            drawingPixels[fillIndex + 3] = 255
            filledPixels++
          }
          
          // 检查上下两行，寻找新的种子点
          for (let dy of [-1, 1]) {
            const checkY = seedY + dy
            if (checkY < 0 || checkY >= height) continue
            
            let inSpan = false
            for (let checkX = leftX; checkX <= rightX; checkX++) {
              const shouldFill = !visited[checkY * width + checkX] &&
                                !isLinePixel(checkX, checkY) && 
                                isMatchingColor(checkX, checkY, targetR, targetG, targetB)
              
              if (shouldFill && !inSpan) {
                stack.push({x: checkX, y: checkY})
                inSpan = true
              } else if (!shouldFill && inSpan) {
                inSpan = false
              }
            }
          }
        }
        
        return filledPixels
      }
      
      const filledPixels = fillScanline()
      
      // 如果填充了像素，进行后处理以消除小的间隙
      if (filledPixels > 0) {
        // 间隙填充 - 处理1-2像素的小洞
        for (let pass = 0; pass < 2; pass++) {
          let gapsFilled = 0
          for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
              const pixelIndex = (y * width + x) * 4
              
              // 跳过已填充的像素和明显的线条
              if (drawingPixels[pixelIndex + 3] > 10) continue
              if (isLinePixel(x, y)) continue
              
              // 检查周围是否被我们的颜色包围
              let surroundingFilled = 0
              const neighbors = [
                [-1, -1], [0, -1], [1, -1],
                [-1,  0],          [1,  0],
                [-1,  1], [0,  1], [1,  1]
              ]
              
              for (const [dx, dy] of neighbors) {
                const nx = x + dx
                const ny = y + dy
                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const neighborIndex = (ny * width + nx) * 4
                  if (drawingPixels[neighborIndex] === fr && 
                      drawingPixels[neighborIndex + 1] === fg && 
                      drawingPixels[neighborIndex + 2] === fb) {
                    surroundingFilled++
                  }
                }
              }
              
              // 如果大部分邻居都是我们的颜色，填充这个间隙
              if (surroundingFilled >= 5) {
                drawingPixels[pixelIndex] = fr
                drawingPixels[pixelIndex + 1] = fg
                drawingPixels[pixelIndex + 2] = fb
                drawingPixels[pixelIndex + 3] = 255
                gapsFilled++
              }
            }
          }
          
          if (gapsFilled === 0) break // 没有更多间隙需要填充
        }
      }
      
      // 更新画布
      drawingCtx.putImageData(drawingData, 0, 0)
      
      if (saveHistory) {
        saveToHistory(drawingData)
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.log('Fill area error:', errorMessage)
    }
  }

  // 拖拽填充函数 - 与主填充函数保持一致的线条检测
  const performDragFill = (x: number, y: number) => {
    // 🚨 明显的调试信息：拖拽填充被调用
    console.log(`🚨 拖拽填充 被触发! brushSize: ${brushSize}, 位置: (${x.toFixed(1)}, ${y.toFixed(1)})`)
    
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
    
    // 🎯 与主填充函数一致的简化线条检测
    const isLinePixel = (px: number, py: number): boolean => {
      if (px < 0 || px >= width || py < 0 || py >= height) return true
      const pixelIndex = (py * width + px) * 4
      
      const r = imagePixels[pixelIndex]
      const g = imagePixels[pixelIndex + 1] 
      const b = imagePixels[pixelIndex + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
      
      const drawingR = drawingPixels[pixelIndex]
      const drawingG = drawingPixels[pixelIndex + 1]
      const drawingB = drawingPixels[pixelIndex + 2]
      const drawingA = drawingPixels[pixelIndex + 3]
      const hasDrawing = drawingA > 50
      
      // 与主填充函数相同的逻辑
      const brushSensitivity = Math.max(1, Math.min(100, brushSize))
      const brightnessThreshold = 50 + (brushSensitivity - 1) * 1.5
      const isOriginalLine = brightness < brightnessThreshold
      
      if (hasDrawing) {
        const drawingBrightness = (drawingR * 0.299 + drawingG * 0.587 + drawingB * 0.114)
        const isUserLine = drawingBrightness < 120
        return isOriginalLine || isUserLine
      }
      
      return isOriginalLine
    }
    
    // 颜色匹配函数（与主填充函数一致）
    const isMatchingColor = (px: number, py: number, targetR: number, targetG: number, targetB: number): boolean => {
      const pixelIndex = (py * width + px) * 4
      const currentR = drawingPixels[pixelIndex] || 0
      const currentG = drawingPixels[pixelIndex + 1] || 0
      const currentB = drawingPixels[pixelIndex + 2] || 0
      const currentA = drawingPixels[pixelIndex + 3] || 0
      
      // 对于透明像素，视为匹配空白区域
      if (currentA < 10) {
        return targetR === 0 && targetG === 0 && targetB === 0
      }
      
      // 允许轻微的颜色差异
      // 基于Brush Size的动态颜色容差（与主填充函数一致）
      const brushSensitivity = Math.max(1, Math.min(100, brushSize))
      const tolerance = 1 + (brushSensitivity - 1) * 0.08
      return Math.abs(currentR - targetR) <= tolerance && 
             Math.abs(currentG - targetG) <= tolerance && 
             Math.abs(currentB - targetB) <= tolerance
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
    
    // 优化的小范围填充 - 适合拖拽操作
    const fillRadius = 12 // 增加填充半径以获得更好的拖拽效果
    let filledPixels = 0
    
    // 以目标点为中心，填充周围区域
    for (let dy = -fillRadius; dy <= fillRadius; dy++) {
      for (let dx = -fillRadius; dx <= fillRadius; dx++) {
        const px = targetX + dx
        const py = targetY + dy
        
        // 检查是否在圆形范围内
        if (dx * dx + dy * dy > fillRadius * fillRadius) continue
        
        // 边界检查
        if (px < 0 || px >= width || py < 0 || py >= height) continue
        
        // 跳过线条
        if (isLinePixel(px, py)) continue
        
        // 使用改进的颜色匹配
        if (isMatchingColor(px, py, targetR, targetG, targetB)) {
          const pixelIndex = (py * width + px) * 4
          drawingPixels[pixelIndex] = fr
          drawingPixels[pixelIndex + 1] = fg
          drawingPixels[pixelIndex + 2] = fb
          drawingPixels[pixelIndex + 3] = 255
          filledPixels++
        }
      }
    }
    
    if (filledPixels > 0) {
      drawingCtx.putImageData(drawingData, 0, 0)
    }
    
    return filledPixels > 0
  }

  const startDrawing = (x: number, y: number) => {
    const drawingCtx = drawingCanvasRef.current?.getContext("2d")
    if (!drawingCtx) return
    
    isDrawing.current = true
    drawingCtx.strokeStyle = activeColor
    drawingCtx.lineWidth = brushSize
    drawingCtx.lineCap = "round"
    drawingCtx.lineJoin = "round"
    
    // 立即绘制一个点（用于单击时显示）
    drawingCtx.fillStyle = activeColor
    drawingCtx.beginPath()
    drawingCtx.arc(x, y, brushSize / 2, 0, 2 * Math.PI)
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
    const radius = Math.max(1, Math.floor(brushSize / 2))
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
    if (!canvas) return null

    const rect = canvas.getBoundingClientRect()
    let clientX, clientY

    if ("touches" in e.nativeEvent) {
      if (e.nativeEvent.touches.length === 0) return null
      clientX = e.nativeEvent.touches[0].clientX
      clientY = e.nativeEvent.touches[0].clientY
    } else {
      clientX = e.nativeEvent.clientX
      clientY = e.nativeEvent.clientY
    }

    // 计算精确的画布坐标，考虑缩放比例
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  const handleInteractionStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
    
    const coords = getCoords(e)
    if (!coords) return
    
    // Smart Fill 模式现在由全局事件处理器管理
    // 这里保留空逻辑以保持结构完整性
  }

  const handleInteractionEnd = () => {
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
        
        // 使用更高分辨率以确保打印质量和水印清晰度
        const scaleFactor = 3 // 增加到3倍以获得更好的水印清晰度
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

  React.useImperativeHandle(ref, () => ({
    undo: handleUndo,
    reset: handleReset,
    download: handleDownload,
    print: handlePrint,
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
    <div className="flex items-center justify-center w-full touch-none">
      <div className="relative">
        <canvas ref={imageCanvasRef} className="absolute top-0 left-0 pointer-events-none" />
        <canvas
          ref={drawingCanvasRef}
          className={cn("relative z-10", {
            "cursor-crosshair": activeTool === "dropper",
            "cursor-grab": activeTool === "brush",
            "cursor-cell": activeTool === "toner", // 表示深浅调节工具
          })}
          style={{ touchAction: 'none' }}
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