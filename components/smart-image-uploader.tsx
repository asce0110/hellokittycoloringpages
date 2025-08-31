"use client"

import React, { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';

interface CompressionResult {
  originalSize: number;
  clientCompressedSize: number;
  finalSize: number;
  clientCompressionRatio: number;
  serverCompressionRatio: number;
  totalCompressionRatio: number;
  processingTime: number;
  uploadTime: number;
  finalUrl?: string;
}

interface CompressionStep {
  step: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  message: string;
  size?: number;
  time?: number;
}

export default function SmartImageUploader() {
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [compressionSteps, setCompressionSteps] = useState<CompressionStep[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStep = useCallback((stepName: string, updates: Partial<CompressionStep>) => {
    setCompressionSteps(prev => {
      const existingIndex = prev.findIndex(step => step.step === stepName);
      if (existingIndex >= 0) {
        const newSteps = [...prev];
        newSteps[existingIndex] = { ...newSteps[existingIndex], ...updates };
        return newSteps;
      } else {
        return [...prev, { step: stepName, status: 'pending', message: '', ...updates }];
      }
    });
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setCompressionResult(null);
    setCompressionSteps([]);

    const overallStartTime = Date.now();
    const originalSize = file.size;

    try {
      // 步骤1: 客户端预处理和压缩
      updateStep('client-analysis', {
        status: 'processing',
        message: `分析原始图片 (${(originalSize / 1024 / 1024).toFixed(1)}MB)...`
      });

      // 智能压缩配置
      const compressionOptions = {
        // 核心：调整尺寸 - 这是最有效的减小体积方法
        maxWidthOrHeight: originalSize > 5 * 1024 * 1024 ? 1920 : 2400, // 大文件用更小尺寸
        
        // 使用Web Worker避免UI卡顿
        useWebWorker: true,
        
        // 根据原始文件大小调整质量
        initialQuality: originalSize > 10 * 1024 * 1024 ? 0.7 : 0.8,
        
        // 输出格式：WebP通常体积更小
        fileType: 'image/webp',
        
        // 最大输出大小：确保不会超过合理范围
        maxSizeMB: Math.min(2, originalSize / (1024 * 1024) * 0.3), // 目标：减少到原来的30%以下
        
        // 压缩过程中的回调
        onProgress: (progress: number) => {
          updateStep('client-compression', {
            status: 'processing',
            message: `客户端压缩中... ${Math.round(progress)}%`
          });
        }
      };

      updateStep('client-analysis', {
        status: 'completed',
        message: `原始图片：${(originalSize / 1024).toFixed(1)}KB`
      });

      updateStep('client-compression', {
        status: 'processing',
        message: '开始客户端压缩...'
      });

      const clientStartTime = Date.now();
      const compressedFile = await imageCompression(file, compressionOptions);
      const clientProcessingTime = Date.now() - clientStartTime;
      const clientCompressedSize = compressedFile.size;
      const clientCompressionRatio = ((originalSize - clientCompressedSize) / originalSize) * 100;

      updateStep('client-compression', {
        status: 'completed',
        message: `客户端压缩完成：${(clientCompressedSize / 1024).toFixed(1)}KB (${clientCompressionRatio.toFixed(1)}% 减少)`,
        size: clientCompressedSize,
        time: clientProcessingTime
      });

      // 步骤2: 上传到服务器进行二次优化
      updateStep('server-upload', {
        status: 'processing',
        message: '上传到服务器进行二次优化...'
      });

      const uploadStartTime = Date.now();
      const formData = new FormData();
      formData.append('file', compressedFile);
      formData.append('type', 'smart-compressed');
      formData.append('folder', 'smart-upload');

      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`上传失败: ${response.statusText}`);
      }

      const result = await response.json();
      const uploadTime = Date.now() - uploadStartTime;

      if (!result.success) {
        throw new Error(result.error || '上传失败');
      }

      // 计算最终压缩结果
      const finalSize = result.compressedSize || clientCompressedSize;
      const serverCompressionRatio = result.compressionRatio || 0;
      const totalCompressionRatio = ((originalSize - finalSize) / originalSize) * 100;
      const totalProcessingTime = Date.now() - overallStartTime;

      updateStep('server-upload', {
        status: 'completed',
        message: `服务器处理完成：${(finalSize / 1024).toFixed(1)}KB (额外${serverCompressionRatio.toFixed(1)}% 减少)`,
        size: finalSize,
        time: uploadTime
      });

      updateStep('completion', {
        status: 'completed',
        message: `🎉 总压缩率：${totalCompressionRatio.toFixed(1)}% | 耗时：${(totalProcessingTime / 1000).toFixed(1)}s`
      });

      setCompressionResult({
        originalSize,
        clientCompressedSize,
        finalSize,
        clientCompressionRatio,
        serverCompressionRatio,
        totalCompressionRatio,
        processingTime: totalProcessingTime,
        uploadTime,
        finalUrl: result.url
      });

      console.log('🎯 智能压缩完成:', {
        original: `${(originalSize / 1024).toFixed(1)}KB`,
        clientCompressed: `${(clientCompressedSize / 1024).toFixed(1)}KB`,
        final: `${(finalSize / 1024).toFixed(1)}KB`,
        totalReduction: `${totalCompressionRatio.toFixed(1)}%`
      });

    } catch (err) {
      console.error('压缩失败:', err);
      setError(err instanceof Error ? err.message : '压缩失败');
      updateStep('error', {
        status: 'error',
        message: `❌ ${err instanceof Error ? err.message : '处理失败'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getStepIcon = (status: CompressionStep['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '🔄';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🚀 智能双层压缩系统</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          选择图片文件 (支持大文件，自动优化)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {/* 处理步骤显示 */}
      {compressionSteps.length > 0 && (
        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">📋 处理步骤</h3>
          <div className="space-y-2">
            {compressionSteps.map((step, index) => (
              <div key={step.step} className="flex items-center space-x-3">
                <span className="text-lg">{getStepIcon(step.status)}</span>
                <div className="flex-1">
                  <div className="text-sm">{step.message}</div>
                  {step.time && (
                    <div className="text-xs text-gray-500">
                      耗时: {step.time}ms
                      {step.size && ` | 大小: ${formatFileSize(step.size)}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700">❌ {error}</div>
        </div>
      )}

      {compressionResult && (
        <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">🎯 压缩效果总结</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">原始大小</div>
              <div className="text-lg font-semibold">{formatFileSize(compressionResult.originalSize)}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">客户端压缩后</div>
              <div className="text-lg font-semibold text-blue-600">
                {formatFileSize(compressionResult.clientCompressedSize)}
              </div>
              <div className="text-xs text-blue-500">
                -{compressionResult.clientCompressionRatio.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">最终大小</div>
              <div className="text-lg font-semibold text-green-600">
                {formatFileSize(compressionResult.finalSize)}
              </div>
              <div className="text-xs text-green-500">
                总计 -{compressionResult.totalCompressionRatio.toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">总耗时</div>
              <div className="text-lg font-semibold">
                {(compressionResult.processingTime / 1000).toFixed(1)}s
              </div>
            </div>
          </div>

          <div className="mb-4 p-4 bg-white rounded-lg">
            <div className="text-sm space-y-1">
              <div>💾 <strong>节省空间:</strong> {formatFileSize(compressionResult.originalSize - compressionResult.finalSize)}</div>
              <div>🔧 <strong>客户端贡献:</strong> {compressionResult.clientCompressionRatio.toFixed(1)}% 压缩</div>
              <div>⚙️ <strong>服务器优化:</strong> {compressionResult.serverCompressionRatio.toFixed(1)}% 额外压缩</div>
              <div>📈 <strong>压缩效果:</strong> 
                <span className={`ml-1 font-semibold ${
                  compressionResult.totalCompressionRatio > 70 ? 'text-green-600' :
                  compressionResult.totalCompressionRatio > 50 ? 'text-blue-600' :
                  compressionResult.totalCompressionRatio > 30 ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {compressionResult.totalCompressionRatio > 70 ? '🎉 卓越' :
                   compressionResult.totalCompressionRatio > 50 ? '👍 优秀' :
                   compressionResult.totalCompressionRatio > 30 ? '⚡ 良好' : '📝 一般'}
                </span>
              </div>
            </div>
          </div>

          {compressionResult.finalUrl && (
            <div className="text-center">
              <a 
                href={compressionResult.finalUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔗 查看压缩后图片
              </a>
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 p-6 rounded-lg">
        <h4 className="font-semibold mb-3">🧠 智能压缩策略</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium text-blue-800 mb-2">📱 客户端处理</h5>
            <ul className="space-y-1 text-blue-700">
              <li>• 智能尺寸调整 (最大1920-2400px)</li>
              <li>• 格式转换为WebP</li>
              <li>• 根据文件大小调整质量</li>
              <li>• Web Worker避免UI卡顿</li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium text-green-800 mb-2">⚙️ 服务器优化</h5>
            <ul className="space-y-1 text-green-700">
              <li>• PNG调色板优化</li>
              <li>• 高级压缩算法</li>
              <li>• 自动格式选择</li>
              <li>• 缩略图生成</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}