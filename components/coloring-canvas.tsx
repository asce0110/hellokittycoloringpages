"use client"

import React, { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

type Tool = "dropper" | "brush"

interface ColoringCanvasProps {
  imageUrl: string
  strokeColor?: string
  activeColor: string
  activeTool: Tool
  brushSize: number
  onHistoryChange?: (canUndo: boolean) => void
}

export const ColoringCanvas = React.forwardRef<
  { undo: () => void; reset: () => void; download: (filename: string) => void; print: () => void },
  ColoringCanvasProps
>(({ imageUrl, strokeColor = "#000000", activeColor, activeTool, brushSize, onHistoryChange }, ref) => {
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

  // Draw initial image
  useEffect(() => {
    const imageCanvas = imageCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    const imageCtx = imageCanvas?.getContext("2d", { willReadFrequently: true })
    const drawingCtx = drawingCanvas?.getContext("2d", { willReadFrequently: true })

    if (!imageCanvas || !drawingCanvas || !imageCtx || !drawingCtx) {
      console.error('❌ Canvas elements not found')
      return
    }

    console.log('Loading image:', imageUrl)
    
    const loadImage = (image: HTMLImageElement) => {
      const aspectRatio = image.width / image.height
      let canvasWidth, canvasHeight
      
      if (aspectRatio > 1) {
        canvasWidth = Math.min(500, image.width)
        canvasHeight = canvasWidth / aspectRatio
      } else {
        canvasHeight = Math.min(600, image.height)
        canvasWidth = canvasHeight * aspectRatio
      }

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
      
      imageCanvas.style.backgroundColor = 'white'
      imageCtx.clearRect(0, 0, canvasWidth, canvasHeight)
      drawingCtx.clearRect(0, 0, canvasWidth, canvasHeight)
      
      imageCtx.drawImage(image, 0, 0, canvasWidth, canvasHeight)
      saveToHistory(drawingCtx.getImageData(0, 0, canvasWidth, canvasHeight))
      console.log('Image drawn to canvas successfully')
    }
    
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      console.log('Image loaded with CORS')
      loadImage(img)
    }
    img.onerror = () => {
      console.log('CORS failed, trying without CORS...')
      // Retry without crossOrigin
      const img2 = new Image()
      img2.onload = () => {
        console.log('Image loaded without CORS')
        loadImage(img2)
      }
      img2.onerror = () => {
        console.log('Image completely failed to load')
      }
      img2.src = imageUrl
    }
    img.src = imageUrl
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


  // 智能填充单个区域（原有功能）
  const fillArea = (x: number, y: number, saveHistory: boolean = true) => {
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
    
    // 边界检查
    if (targetX < 0 || targetX >= imageCanvas.width || targetY < 0 || targetY >= imageCanvas.height) {
      return
    }
    
    // 改进的线条检测 - 同时检查原图线条和用户绘制的线条
    const isLinePixel = (px: number, py: number): boolean => {
      if (px < 0 || px >= imageCanvas.width || py < 0 || py >= imageCanvas.height) return true
      
      const pixelIndex = (py * imageCanvas.width + px) * 4
      
      // 检查原图线条
      const r = imagePixels[pixelIndex]
      const g = imagePixels[pixelIndex + 1] 
      const b = imagePixels[pixelIndex + 2]
      const brightness = (r * 0.299 + g * 0.587 + b * 0.114)
      
      // 检查用户绘制的线条（drawing canvas上的像素）
      const drawingR = drawingPixels[pixelIndex]
      const drawingG = drawingPixels[pixelIndex + 1]
      const drawingB = drawingPixels[pixelIndex + 2]
      const drawingA = drawingPixels[pixelIndex + 3]
      
      // 如果有不透明的绘制内容，检查是否为深色（可能是用户画的线条）
      const hasDrawing = drawingA > 0
      const drawingBrightness = hasDrawing ? (drawingR * 0.299 + drawingG * 0.587 + drawingB * 0.114) : 255
      
      // 原图线条检测（亮度低于80）或用户绘制的深色线条（亮度低于100且不透明度大于128）
      return brightness < 80 || (hasDrawing && drawingA > 128 && drawingBrightness < 100)
    }
    
    const targetPixelIndex = (targetY * imageCanvas.width + targetX) * 4
    
    // 检查点击的是否是线条
    if (isLinePixel(targetX, targetY)) {
      return // 直接返回，不填充线条
    }

    // 获取目标区域的原始颜色
    const targetR = drawingPixels[targetPixelIndex] || 0
    const targetG = drawingPixels[targetPixelIndex + 1] || 0
    const targetB = drawingPixels[targetPixelIndex + 2] || 0
    
    // 如果已经是目标颜色，不需要填充
    if (targetR === fr && targetG === fg && targetB === fb) return

    // 使用改进的栓填充算法，更好地尊重线条边界
    const stack = [[targetX, targetY]]
    const visited = new Set<string>()
    let filledPixels = 0
    const maxPixels = 100000 // 增加最大像素数以支持更大的背景区域
    
    while (stack.length > 0 && filledPixels < maxPixels) {
      const [cx, cy] = stack.pop()!
      const key = `${cx},${cy}`
      
      // 检查边界和是否已访问
      if (cx < 0 || cx >= drawingCanvas.width || cy < 0 || cy >= drawingCanvas.height) continue
      if (visited.has(key)) continue
      
      visited.add(key)
      const pixelIndex = (cy * drawingCanvas.width + cx) * 4
      
      // 关键改进：使用更严格的线条检测
      if (isLinePixel(cx, cy)) {
        continue // 遇到线条就停止填充
      }
      
      // 检查是否是相同的目标颜色区域
      const currentR = drawingPixels[pixelIndex] || 0
      const currentG = drawingPixels[pixelIndex + 1] || 0
      const currentB = drawingPixels[pixelIndex + 2] || 0
      
      if (currentR !== targetR || currentG !== targetG || currentB !== targetB) continue
      
      // 填充当前像素
      drawingPixels[pixelIndex] = fr
      drawingPixels[pixelIndex + 1] = fg
      drawingPixels[pixelIndex + 2] = fb
      drawingPixels[pixelIndex + 3] = 255
      filledPixels++
      
      // 只添加 4 方向相邻像素，提高精度
      stack.push(
        [cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]
      )
    }
    
      // 更新画布
      drawingCtx.putImageData(drawingData, 0, 0)
      
      if (saveHistory) {
        saveToHistory(drawingData)
      }
    } catch (error) {
      console.log('Fill area error:', error)
    }
  }
  
  // 改进的智能拖拽填充 - 更轻量级和流畅的体验
  const performDragFill = (x: number, y: number) => {
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
    
    // 边界检查
    if (targetX < 0 || targetX >= imageCanvas.width || targetY < 0 || targetY >= imageCanvas.height) {
      return false
    }
    
    // 线条检测函数 - 检查原图和用户绘制的线条
    const isLinePixel = (px: number, py: number): boolean => {
      if (px < 0 || px >= imageCanvas.width || py < 0 || py >= imageCanvas.height) return true
      const pixelIndex = (py * imageCanvas.width + px) * 4
      
      // 检查原图线条
      const brightness = (imagePixels[pixelIndex] * 0.299 + imagePixels[pixelIndex + 1] * 0.587 + imagePixels[pixelIndex + 2] * 0.114)
      
      // 检查用户绘制的线条
      const drawingR = drawingPixels[pixelIndex]
      const drawingG = drawingPixels[pixelIndex + 1]
      const drawingB = drawingPixels[pixelIndex + 2]
      const drawingA = drawingPixels[pixelIndex + 3]
      const hasDrawing = drawingA > 0
      const drawingBrightness = hasDrawing ? (drawingR * 0.299 + drawingG * 0.587 + drawingB * 0.114) : 255
      
      return brightness < 80 || (hasDrawing && drawingA > 128 && drawingBrightness < 100)
    }
    
    // 跳过线条像素
    if (isLinePixel(targetX, targetY)) return false
    
    // 检查当前位置的颜色
    const targetPixelIndex = (targetY * imageCanvas.width + targetX) * 4
    const targetR = drawingPixels[targetPixelIndex] || 0
    const targetG = drawingPixels[targetPixelIndex + 1] || 0
    const targetB = drawingPixels[targetPixelIndex + 2] || 0
    
    // 如果已经是目标颜色，跳过
    if (targetR === fr && targetG === fg && targetB === fb) return false
    
    // 优化：使用更小的范围和更快的填充
    const fillRadius = 8 // 填充半径
    let filledPixels = 0
    
    // 以目标点为中心，填充周围区域
    for (let dy = -fillRadius; dy <= fillRadius; dy++) {
      for (let dx = -fillRadius; dx <= fillRadius; dx++) {
        const px = targetX + dx
        const py = targetY + dy
        
        // 检查是否在圆形范围内
        if (dx * dx + dy * dy > fillRadius * fillRadius) continue
        
        // 边界检查
        if (px < 0 || px >= imageCanvas.width || py < 0 || py >= imageCanvas.height) continue
        
        // 跳过线条
        if (isLinePixel(px, py)) continue
        
        const pixelIndex = (py * imageCanvas.width + px) * 4
        const currentR = drawingPixels[pixelIndex] || 0
        const currentG = drawingPixels[pixelIndex + 1] || 0
        const currentB = drawingPixels[pixelIndex + 2] || 0
        
        // 检查是否是相同的目标颜色区域
        if (currentR === targetR && currentG === targetG && currentB === targetB) {
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

  const handleDownload = (filename: string) => {
    const imageCanvas = imageCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!imageCanvas || !drawingCanvas) return
    
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = drawingCanvas.width
    tempCanvas.height = drawingCanvas.height
    const tempCtx = tempCanvas.getContext("2d")!
    
    // Set white background first
    tempCtx.fillStyle = "white"
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Draw coloring first (underneath)
    tempCtx.drawImage(drawingCanvas, 0, 0)
    
    // Draw line art on top with multiply blend mode to preserve lines
    tempCtx.globalCompositeOperation = "multiply"
    tempCtx.drawImage(imageCanvas, 0, 0)
    
    // Reset blend mode
    tempCtx.globalCompositeOperation = "source-over"
    
    const a = document.createElement("a")
    a.href = tempCanvas.toDataURL("image/png")
    a.download = filename
    a.click()
  }

  const handlePrint = () => {
    const imageCanvas = imageCanvasRef.current
    const drawingCanvas = drawingCanvasRef.current
    if (!imageCanvas || !drawingCanvas) return
    
    const tempCanvas = document.createElement("canvas")
    tempCanvas.width = drawingCanvas.width
    tempCanvas.height = drawingCanvas.height
    const tempCtx = tempCanvas.getContext("2d")!
    
    // Set white background first
    tempCtx.fillStyle = "white"
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height)
    
    // Draw coloring first (underneath)
    tempCtx.drawImage(drawingCanvas, 0, 0)
    
    // Draw line art on top with multiply blend mode to preserve lines
    tempCtx.globalCompositeOperation = "multiply"
    tempCtx.drawImage(imageCanvas, 0, 0)
    
    // Reset blend mode
    tempCtx.globalCompositeOperation = "source-over"
    
    const dataUrl = tempCanvas.toDataURL("image/png")
    const printWindow = window.open("", "_blank")
    printWindow?.document.write(
      `<img src="${dataUrl}" style="max-width: 100%;" onload="window.print(); window.close();" />`,
    )
  }

  React.useImperativeHandle(ref, () => ({
    undo: handleUndo,
    reset: handleReset,
    download: handleDownload,
    print: handlePrint,
  }))

  return (
    <div className="flex items-center justify-center w-full touch-none">
      <div className="relative">
        <canvas ref={imageCanvasRef} className="absolute top-0 left-0 pointer-events-none" />
        <canvas
          ref={drawingCanvasRef}
          className={cn("relative z-10", {
            "cursor-dropper": activeTool === "dropper",
            "cursor-brush": activeTool === "brush",
          })}
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
