"use client"

import React, { useState } from 'react';

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  processingTime: number;
  compressedFile: File | null;
}

export default function UPNGCompressor() {
  const [compressionResult, setCompressionResult] = useState<CompressionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.includes('image/')) {
      setError('请上传图片文件');
      return;
    }

    setIsProcessing(true);
    setError(null);
    const startTime = Date.now();

    try {
      // 动态导入UPNG (需要先安装: pnpm add upng-js @types/upng-js)
      const UPNG = await import('upng-js');
      
      console.log(`📄 开始处理: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`);

      const arrayBuffer = await file.arrayBuffer();
      
      // 如果是PNG文件，使用UPNG优化
      if (file.type === 'image/png') {
        console.log('🎯 使用UPNG进行PNG优化...');
        
        // 解码PNG
        const decoded = UPNG.decode(arrayBuffer);
        console.log(`📋 图片信息: ${decoded.width}x${decoded.height}`);
        
        // 重新编码，使用最佳压缩设置
        const recompressed = UPNG.encode(
          [decoded.data], 
          decoded.width, 
          decoded.height, 
          0, // cnum=0 无调色板真彩色
          [255] // 完全不透明
        );
        
        const compressedBlob = new Blob([recompressed], { type: 'image/png' });
        const compressedFile = new File([compressedBlob], file.name, { type: 'image/png' });
        
        const processingTime = Date.now() - startTime;
        const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
        
        setCompressionResult({
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio,
          processingTime,
          compressedFile
        });
        
        console.log(`✅ UPNG压缩完成: ${compressionRatio.toFixed(1)}% 减少`);
        
      } else {
        // 对于非PNG文件，使用Canvas进行压缩
        console.log('🎯 使用Canvas进行通用压缩...');
        
        const compressedFile = await compressWithCanvas(file);
        
        const processingTime = Date.now() - startTime;
        const compressionRatio = ((file.size - compressedFile.size) / file.size) * 100;
        
        setCompressionResult({
          originalSize: file.size,
          compressedSize: compressedFile.size,
          compressionRatio,
          processingTime,
          compressedFile
        });
      }
      
    } catch (err) {
      console.error('压缩失败:', err);
      setError(err instanceof Error ? err.message : '压缩失败');
    } finally {
      setIsProcessing(false);
    }
  };

  // Canvas压缩方法（用于非PNG文件）
  const compressWithCanvas = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      img.onload = () => {
        // 设置画布尺寸
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图像
        ctx?.drawImage(img, 0, 0);
        
        // 转换为压缩格式
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { type: 'image/png' });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas压缩失败'));
          }
        }, 'image/png', 0.9);
      };
      
      img.onerror = () => reject(new Error('图片加载失败'));
      img.src = URL.createObjectURL(file);
    });
  };

  // 上传压缩后的文件
  const uploadCompressedFile = async () => {
    if (!compressionResult?.compressedFile) return;

    try {
      const formData = new FormData();
      formData.append('file', compressionResult.compressedFile);
      formData.append('type', 'test');
      formData.append('folder', 'upng-compressed');

      const response = await fetch('/api/upload/', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ 上传成功:', result.url);
        alert('压缩并上传成功！');
      } else {
        console.error('上传失败:', result.error);
        alert('上传失败: ' + result.error);
      }
    } catch (error) {
      console.error('上传错误:', error);
      alert('上传错误: ' + error);
    }
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🔧 UPNG前端压缩测试</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          选择图片文件 (推荐PNG格式)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>

      {isProcessing && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span>正在处理图片...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-700">❌ {error}</div>
        </div>
      )}

      {compressionResult && (
        <div className="mb-6 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">📊 压缩结果</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600">原始大小</div>
              <div className="text-lg font-semibold">{formatFileSize(compressionResult.originalSize)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">压缩后大小</div>
              <div className="text-lg font-semibold">{formatFileSize(compressionResult.compressedSize)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">压缩率</div>
              <div className="text-lg font-semibold text-green-600">
                {compressionResult.compressionRatio.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">处理时间</div>
              <div className="text-lg font-semibold">{compressionResult.processingTime}ms</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-2">节省空间</div>
            <div className="text-lg font-semibold text-blue-600">
              {formatFileSize(compressionResult.originalSize - compressionResult.compressedSize)}
            </div>
          </div>

          {compressionResult.compressionRatio > 10 && (
            <div className="mb-4 p-3 bg-green-100 rounded">
              <span className="text-green-700">
                🎉 {compressionResult.compressionRatio > 50 ? '优秀' : '良好'}的压缩效果！
              </span>
            </div>
          )}

          <button
            onClick={uploadCompressedFile}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🚀 上传压缩后的文件
          </button>
        </div>
      )}

      <div className="text-sm text-gray-600">
        <h4 className="font-semibold mb-2">💡 说明:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>PNG文件使用UPNG.js进行专业优化</li>
          <li>其他格式使用Canvas进行通用压缩</li>
          <li>所有处理都在浏览器中完成，保护隐私</li>
          <li>大文件可能需要较长处理时间</li>
        </ul>
      </div>
    </div>
  );
}