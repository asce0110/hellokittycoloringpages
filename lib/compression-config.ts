// 图片压缩配置文件
export interface CompressionConfig {
  // 基础设置
  maxFileSize: number;          // 最大目标文件大小 (字节)
  thumbnailSize: number;        // 缩略图尺寸
  
  // PNG设置
  png: {
    compressionLevel: number;   // 0-9, 9为最高压缩
    usePalette: boolean;       // 是否使用调色板
    paletteColors: number;     // 调色板颜色数量
    aggressiveColors: number;  // 激进压缩时的颜色数量
  };
  
  // WebP设置
  webp: {
    quality: number;           // 0-100
    effort: number;           // 0-6, 压缩努力程度
    lossless: boolean;        // 是否无损
  };
  
  // 检测阈值
  detection: {
    largeSizeThreshold: number; // 启用激进压缩的文件大小阈值
    webpSavingsThreshold: number; // WebP压缩收益阈值 (0-1)
  };
}

// 默认配置 - 针对Hello Kitty线稿图优化
export const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  maxFileSize: 512 * 1024,  // 512KB目标大小
  thumbnailSize: 200,
  
  png: {
    compressionLevel: 9,
    usePalette: true,        // 线稿图用调色板效果更好
    paletteColors: 256,      // 标准调色板
    aggressiveColors: 64     // 激进模式用更少颜色
  },
  
  webp: {
    quality: 90,             // 高质量但不是无损
    effort: 6,               // 最高努力程度
    lossless: false          // 有损压缩获得更小文件
  },
  
  detection: {
    largeSizeThreshold: 512 * 1024,  // 512KB
    webpSavingsThreshold: 0.7        // WebP需要节省30%以上才使用
  }
};

// 不同场景的预设配置
export const COMPRESSION_PRESETS = {
  // 高质量模式 - 文件较大但质量最佳
  HIGH_QUALITY: {
    ...DEFAULT_COMPRESSION_CONFIG,
    maxFileSize: 1024 * 1024,  // 1MB
    png: {
      ...DEFAULT_COMPRESSION_CONFIG.png,
      paletteColors: 256
    },
    webp: {
      quality: 95,
      effort: 6,
      lossless: true
    },
    detection: {
      largeSizeThreshold: 1024 * 1024,
      webpSavingsThreshold: 0.8
    }
  } as CompressionConfig,
  
  // 平衡模式 - 默认设置
  BALANCED: DEFAULT_COMPRESSION_CONFIG,
  
  // 小文件模式 - 最小文件大小
  SMALL_FILE: {
    ...DEFAULT_COMPRESSION_CONFIG,
    maxFileSize: 256 * 1024,  // 256KB
    png: {
      ...DEFAULT_COMPRESSION_CONFIG.png,
      paletteColors: 128,
      aggressiveColors: 32
    },
    webp: {
      quality: 80,
      effort: 6,
      lossless: false
    },
    detection: {
      largeSizeThreshold: 256 * 1024,
      webpSavingsThreshold: 0.6
    }
  } as CompressionConfig
};

// 获取压缩配置的函数
export function getCompressionConfig(preset: keyof typeof COMPRESSION_PRESETS = 'BALANCED'): CompressionConfig {
  return COMPRESSION_PRESETS[preset];
}

// 配置验证函数
export function validateCompressionConfig(config: CompressionConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (config.maxFileSize < 50 * 1024) {
    errors.push('最大文件大小不能小于50KB');
  }
  
  if (config.png.compressionLevel < 0 || config.png.compressionLevel > 9) {
    errors.push('PNG压缩级别必须在0-9之间');
  }
  
  if (config.webp.quality < 0 || config.webp.quality > 100) {
    errors.push('WebP质量必须在0-100之间');
  }
  
  if (config.png.paletteColors < 2 || config.png.paletteColors > 256) {
    errors.push('PNG调色板颜色数量必须在2-256之间');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// 根据文件类型和大小智能选择配置
export function getSmartCompressionConfig(fileSize: number, fileType: string): CompressionConfig {
  // 大文件使用小文件模式
  if (fileSize > 5 * 1024 * 1024) {  // 5MB+
    return COMPRESSION_PRESETS.SMALL_FILE;
  }
  
  // 中等文件使用平衡模式
  if (fileSize > 1 * 1024 * 1024) {  // 1MB+
    return COMPRESSION_PRESETS.BALANCED;
  }
  
  // 小文件使用高质量模式
  return COMPRESSION_PRESETS.HIGH_QUALITY;
}