// 智能时间过滤工具
// 根据可用数据智能选择最合适的时间范围

export interface TimeRange {
  label: string // 显示标签，如 "New This Week"
  description: string // 描述文本
  filterDate: Date | string // 过滤起始日期 (支持Date对象或ISO字符串)
  period: 'week' | 'month' | 'quarter' | 'year' // 时间段类型
}

/**
 * 获取智能时间范围配置
 * 优先级：本周 > 本月 > 本季度 > 本年
 */
export function getTimeRanges(): TimeRange[] {
  const now = new Date()
  
  // 本周开始时间 (周一)
  const startOfWeek = new Date(now)
  const day = startOfWeek.getDay()
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // adjust when day is sunday
  startOfWeek.setDate(diff)
  startOfWeek.setHours(0, 0, 0, 0)
  
  // 本月开始时间
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  // 本季度开始时间
  const currentQuarter = Math.floor(now.getMonth() / 3)
  const startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1)
  
  // 本年开始时间
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  
  return [
    {
      label: 'New This Week',
      description: 'Our team carefully curates and adds new high-quality Hello Kitty coloring pages every week.',
      filterDate: startOfWeek,
      period: 'week'
    },
    {
      label: 'New This Month',
      description: 'Discover the freshest Hello Kitty coloring pages added this month.',
      filterDate: startOfMonth,
      period: 'month'
    },
    {
      label: 'New This Quarter',
      description: 'Explore the latest Hello Kitty coloring pages from this quarter.',
      filterDate: startOfQuarter,
      period: 'quarter'
    },
    {
      label: 'New This Year',
      description: 'Browse all the amazing Hello Kitty coloring pages added this year.',
      filterDate: startOfYear,
      period: 'year'
    }
  ]
}

/**
 * 根据给定的图片数据，智能选择最合适的时间范围
 * @param images 图片数据数组
 * @param minCount 最少需要的图片数量（默认为4）
 * @returns 最合适的时间范围配置
 */
export function getOptimalTimeRange<T extends { createdAt: Date | string }>(
  images: T[], 
  minCount: number = 4
): TimeRange {
  const timeRanges = getTimeRanges()
  
  // 按优先级检查每个时间范围，使用动态最小数量要求
  for (let i = 0; i < timeRanges.length; i++) {
    const range = timeRanges[i]
    const filteredImages = images.filter(image => {
      const imageDate = new Date(image.createdAt)
      const filterDate = range.filterDate instanceof Date 
        ? range.filterDate 
        : new Date(range.filterDate)
      return imageDate >= filterDate
    })
    
    // 为不同时间范围使用不同的最小数量要求
    let requiredCount = minCount
    if (range.period === 'week') {
      requiredCount = 1 // 本周只要有1张图片就显示
    } else if (range.period === 'month') {
      requiredCount = Math.max(2, Math.floor(minCount * 0.75)) // 本月要求75%
    } else if (range.period === 'quarter') {
      requiredCount = Math.max(3, Math.floor(minCount * 0.9)) // 本季度要求90%
    }
    
    console.log(`🔍 时间范围检查 - ${range.label}: ${filteredImages.length}张图片 (需要${requiredCount}张)`)
    
    if (filteredImages.length >= requiredCount) {
      console.log(`✅ 选中时间范围: ${range.label}`)
      return range
    }
  }
  
  // 如果所有时间范围都没有足够的图片，选择有最多图片的时间范围
  let bestRange = timeRanges[timeRanges.length - 1]
  let maxCount = 0
  
  for (const range of timeRanges) {
    const filteredImages = images.filter(image => {
      const imageDate = new Date(image.createdAt)
      const filterDate = range.filterDate instanceof Date 
        ? range.filterDate 
        : new Date(range.filterDate)
      return imageDate >= filterDate
    })
    
    if (filteredImages.length > maxCount) {
      maxCount = filteredImages.length
      bestRange = range
    }
  }
  
  console.log(`⚠️ 所有时间范围图片不足要求，选择图片最多的范围: ${bestRange.label} (${maxCount}张图片)`)
  return bestRange
}

/**
 * 过滤指定时间范围内的图片
 * @param images 图片数据数组
 * @param timeRange 时间范围配置
 * @returns 过滤后的图片数组
 */
export function filterImagesByTimeRange<T extends { createdAt: Date | string }>(
  images: T[], 
  timeRange: TimeRange
): T[] {
  return images.filter(image => {
    const imageDate = new Date(image.createdAt)
    const filterDate = timeRange.filterDate instanceof Date 
      ? timeRange.filterDate 
      : new Date(timeRange.filterDate)
    return imageDate >= filterDate
  }).sort((a, b) => {
    // 按创建时间倒序排列（最新的在前）
    const dateA = new Date(a.createdAt)
    const dateB = new Date(b.createdAt)
    return dateB.getTime() - dateA.getTime()
  })
}

/**
 * 获取时间范围的查询参数
 * @param timeRange 时间范围配置
 * @returns URL查询参数字符串
 */
export function getTimeRangeQueryParams(timeRange: TimeRange): string {
  const params = new URLSearchParams()
  params.set('filter', 'new')
  params.set('period', timeRange.period)
  
  // 安全处理可能是字符串或Date对象的filterDate
  let dateString: string
  try {
    if (timeRange.filterDate instanceof Date) {
      dateString = timeRange.filterDate.toISOString()
    } else if (typeof timeRange.filterDate === 'string') {
      // 如果已经是ISO字符串，直接使用；否则解析为Date再转换
      if (timeRange.filterDate.includes('T') && timeRange.filterDate.includes('Z')) {
        dateString = timeRange.filterDate
      } else {
        dateString = new Date(timeRange.filterDate).toISOString()
      }
    } else {
      // 兜底：强制转换为Date对象
      dateString = new Date(timeRange.filterDate).toISOString()
    }
  } catch (error) {
    console.error('Error converting filterDate to ISO string:', error)
    // 如果转换失败，使用当前时间的ISO字符串作为默认值
    dateString = new Date().toISOString()
  }
  
  params.set('since', dateString)
  return params.toString()
}