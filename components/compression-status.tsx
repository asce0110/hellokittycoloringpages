"use client"

import React from 'react'
import { CheckCircle, AlertTriangle, Info, Zap } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface CompressionResult {
  originalSize: number
  compressedSize: number
  compressionRatio: number
  metadata?: {
    width: number
    height: number
    format: string
    hasAlpha: boolean
  }
  warnings?: string[]
}

interface CompressionStatusProps {
  result: CompressionResult
  filename: string
  isVisible: boolean
  onClose?: () => void
}

export function CompressionStatus({ 
  result, 
  filename, 
  isVisible, 
  onClose 
}: CompressionStatusProps) {
  if (!isVisible) return null

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
    return `${(bytes / 1024 / 1024).toFixed(2)}MB`
  }

  const spaceSaved = result.originalSize - result.compressedSize
  const isGoodCompression = result.compressionRatio > 30
  const hasWarnings = result.warnings && result.warnings.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <h3 className="font-semibold text-gray-900">图片压缩完成</h3>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ×
            </button>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-700">{filename}</span>
          </div>

          {/* 压缩进度条 */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>压缩进度</span>
              <span className={`font-medium ${isGoodCompression ? 'text-green-600' : 'text-blue-600'}`}>
                {result.compressionRatio.toFixed(1)}% 节省空间
              </span>
            </div>
            <Progress 
              value={result.compressionRatio} 
              className={`h-2 ${isGoodCompression ? 'bg-green-100' : 'bg-blue-100'}`}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>原始: {formatSize(result.originalSize)}</span>
              <span>压缩后: {formatSize(result.compressedSize)}</span>
            </div>
          </div>

          {/* 图片信息 */}
          {result.metadata && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">尺寸:</span>
                  <span className="ml-1 font-medium">
                    {result.metadata.width}×{result.metadata.height}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">格式:</span>
                  <span className="ml-1 font-medium uppercase">
                    {result.metadata.format}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">透明度:</span>
                  <Badge variant={result.metadata.hasAlpha ? "default" : "secondary"} className="text-xs">
                    {result.metadata.hasAlpha ? '支持' : '不支持'}
                  </Badge>
                </div>
                <div>
                  <span className="text-gray-500">节省:</span>
                  <span className="ml-1 font-medium text-green-600">
                    {formatSize(spaceSaved)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 优化特性 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">✨ Hello Kitty 线稿优化</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>无损压缩</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>透明背景</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>线条锐化</span>
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>自动缩略图</span>
              </div>
            </div>
          </div>

          {/* 警告信息 */}
          {hasWarnings && (
            <div className="space-y-2">
              {result.warnings!.map((warning, index) => (
                <Alert key={index}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {warning}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* 使用建议 */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {isGoodCompression 
                ? "压缩效果很好！图片已优化为最适合着色的格式。"
                : "图片已成功上传。建议使用PNG格式以获得更好的线稿效果。"
              }
            </AlertDescription>
          </Alert>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
          >
            继续上传更多图片
          </button>
        )}
      </div>
    </div>
  )
}