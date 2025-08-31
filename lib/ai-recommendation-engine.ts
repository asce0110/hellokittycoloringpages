// AI推荐引擎 - 为着色页面网站提供个性化推荐
import { generateSlug } from './coloring-images'

// 基础类型定义
export type Difficulty = 'easy' | 'medium' | 'complex'
export type Theme = 'nature-wilderness' | 'fantasy-worlds' | 'animals-creatures' | 'architecture-cities' | 'abstract-geometric' | 'seasonal-holidays' | 'characters-people' | 'vehicles-transportation'
export type Style = 'line-art-minimal' | 'cartoon-style' | 'realistic-detailed' | 'mandala-patterns' | 'vintage-classic' | 'modern-contemporary'
export type Mood = 'calm-peaceful' | 'energetic-vibrant' | 'whimsical-quirky' | 'mysterious-dark' | 'cheerful-bright' | 'elegant-sophisticated'
export type UserType = 'Explorer' | 'Perfectionist' | 'Speed Artist' | 'Detail Master' | 'Theme Specialist' | 'Mood Matcher'
export type ProgressTrend = 'improving' | 'consistent' | 'exploring' | 'mastering'

// 推荐项目接口
export interface RecommendationItem {
  id: string
  title: string
  description: string
  theme: Theme
  style: Style
  mood: Mood
  difficulty: Difficulty
  estimatedTime: number
  confidence: number // 推荐信心度 0-100
  tags: string[]
  reasoning: string[] // AI推荐理由
  imageUrl?: string
  slug: string
}

// 用户行为数据
export interface UserBehavior {
  type: 'view' | 'like' | 'complete' | 'share' | 'download'
  item: {
    theme?: Theme
    style?: Style
    mood?: Mood
    difficulty?: Difficulty
    sessionTime?: number
  }
  timestamp?: Date
}

// 用户洞察
export interface UserInsights {
  creativityScore: number // 创造力分数 0-100
  diversityScore: number // 多样性分数 0-100
  userType: UserType
  progressTrend: ProgressTrend
  preferredThemes: Theme[]
  preferredStyles: Style[]
  preferredMoods: Mood[]
  averageSessionTime: number
  completionRate: number
  nextLevelSuggestion: string
}

// 个性化推荐数据结构
export interface PersonalizedRecommendations {
  userId: string
  insights: UserInsights
  recommendations: {
    quickStart: RecommendationItem[]
    featured: RecommendationItem[]
    trending: RecommendationItem[]
    personalized: RecommendationItem[]
    challenges: RecommendationItem[]
    seasonal: RecommendationItem[]
    social: RecommendationItem[]
  }
  timestamp: Date
}

// 用户画像
interface UserProfile {
  userId: string
  behaviors: UserBehavior[]
  preferences: {
    themes: Map<Theme, number>
    styles: Map<Style, number>
    moods: Map<Mood, number>
    difficulties: Map<Difficulty, number>
  }
  stats: {
    totalSessions: number
    totalCompletions: number
    averageSessionTime: number
    lastActivityDate: Date
  }
}

// AI推荐引擎类
export class AIRecommendationEngine {
  private userProfiles: Map<string, UserProfile> = new Map()
  private globalTrends: Map<string, number> = new Map()
  private contentLibrary: RecommendationItem[] = []

  constructor() {
    this.initializeContentLibrary()
    this.initializeGlobalTrends()
  }

  // 初始化内容库
  private initializeContentLibrary(): void {
    this.contentLibrary = [
      // 快速开始推荐
      {
        id: 'quick-hello-kitty-simple',
        title: 'Simple Hello Kitty Portrait',
        description: 'A gentle introduction to Hello Kitty coloring with clean, simple lines perfect for beginners.',
        theme: 'characters-people',
        style: 'line-art-minimal',
        mood: 'cheerful-bright',
        difficulty: 'easy',
        estimatedTime: 8,
        confidence: 95,
        tags: ['hello-kitty', 'simple', 'portrait', 'beginner'],
        reasoning: ['Perfect for getting started', 'Simple shapes build confidence', 'Classic Hello Kitty design'],
        slug: generateSlug('Simple Hello Kitty Portrait')
      },
      {
        id: 'quick-nature-butterfly',
        title: 'Peaceful Butterfly Garden',
        description: 'Delicate butterflies among flowers - a calming way to start your creative journey.',
        theme: 'nature-wilderness',
        style: 'line-art-minimal',
        mood: 'calm-peaceful',
        difficulty: 'easy',
        estimatedTime: 10,
        confidence: 90,
        tags: ['butterfly', 'flowers', 'nature', 'peaceful'],
        reasoning: ['Relaxing natural themes', 'Flowing organic shapes', 'Stress-relief benefits'],
        slug: generateSlug('Peaceful Butterfly Garden')
      },

      // 精选推荐
      {
        id: 'featured-kitty-tea-party',
        title: 'Hello Kitty Tea Party Adventure',
        description: 'Join Hello Kitty for an elegant tea party with friends, complete with delicate teacups and treats.',
        theme: 'characters-people',
        style: 'cartoon-style',
        mood: 'whimsical-quirky',
        difficulty: 'medium',
        estimatedTime: 20,
        confidence: 88,
        tags: ['hello-kitty', 'tea-party', 'friends', 'elegant'],
        reasoning: ['Popular Hello Kitty theme', 'Intermediate detail level', 'Social interaction elements'],
        slug: generateSlug('Hello Kitty Tea Party Adventure')
      },
      {
        id: 'featured-mandala-flower',
        title: 'Blooming Mandala Flower',
        description: 'A beautiful mandala design inspired by blooming flowers, perfect for mindful coloring.',
        theme: 'abstract-geometric',
        style: 'mandala-patterns',
        mood: 'calm-peaceful',
        difficulty: 'medium',
        estimatedTime: 25,
        confidence: 85,
        tags: ['mandala', 'flower', 'meditation', 'symmetry'],
        reasoning: ['Meditative mandala patterns', 'Balanced complexity', 'Therapeutic benefits'],
        slug: generateSlug('Blooming Mandala Flower')
      },

      // 趋势推荐
      {
        id: 'trending-unicorn-fantasy',
        title: 'Magical Unicorn Forest',
        description: 'A mystical unicorn in an enchanted forest with sparkling details and magical elements.',
        theme: 'fantasy-worlds',
        style: 'cartoon-style',
        mood: 'whimsical-quirky',
        difficulty: 'medium',
        estimatedTime: 18,
        confidence: 92,
        tags: ['unicorn', 'fantasy', 'magic', 'forest'],
        reasoning: ['Trending fantasy themes', 'Popular unicorn content', 'Engaging magical elements'],
        slug: generateSlug('Magical Unicorn Forest')
      },
      {
        id: 'trending-geometric-cat',
        title: 'Modern Geometric Cat',
        description: 'A stylish cat design with contemporary geometric patterns and bold angular shapes.',
        theme: 'abstract-geometric',
        style: 'modern-contemporary',
        mood: 'elegant-sophisticated',
        difficulty: 'complex',
        estimatedTime: 30,
        confidence: 87,
        tags: ['geometric', 'cat', 'modern', 'angular'],
        reasoning: ['Rising geometric art trend', 'Contemporary design appeal', 'Sophisticated styling'],
        slug: generateSlug('Modern Geometric Cat')
      },

      // 个性化推荐（基于用户历史）
      {
        id: 'personal-forest-animals',
        title: 'Woodland Creatures Gathering',
        description: 'A peaceful scene with rabbits, foxes, and deer in their natural woodland habitat.',
        theme: 'animals-creatures',
        style: 'realistic-detailed',
        mood: 'calm-peaceful',
        difficulty: 'medium',
        estimatedTime: 22,
        confidence: 90,
        tags: ['animals', 'woodland', 'nature', 'peaceful'],
        reasoning: ['Matches your nature preferences', 'Animals you love coloring', 'Perfect detail level for you'],
        slug: generateSlug('Woodland Creatures Gathering')
      },

      // 挑战推荐
      {
        id: 'challenge-detailed-castle',
        title: 'Epic Medieval Castle',
        description: 'An intricate medieval castle with towers, flags, and detailed stonework for advanced colorists.',
        theme: 'architecture-cities',
        style: 'realistic-detailed',
        mood: 'mysterious-dark',
        difficulty: 'complex',
        estimatedTime: 45,
        confidence: 85,
        tags: ['castle', 'medieval', 'architecture', 'detailed'],
        reasoning: ['Push your skill boundaries', 'Complex architectural details', 'Long-form coloring project'],
        slug: generateSlug('Epic Medieval Castle')
      },

      // 季节推荐
      {
        id: 'seasonal-spring-garden',
        title: 'Spring Garden Awakening',
        description: 'A vibrant spring garden with blooming flowers, buzzing bees, and fresh green leaves.',
        theme: 'nature-wilderness',
        style: 'cartoon-style',
        mood: 'cheerful-bright',
        difficulty: 'easy',
        estimatedTime: 15,
        confidence: 88,
        tags: ['spring', 'garden', 'flowers', 'seasonal'],
        reasoning: ['Perfect for spring season', 'Bright cheerful themes', 'Nature awakening concept'],
        slug: generateSlug('Spring Garden Awakening')
      },

      // 社区推荐
      {
        id: 'social-favorite-kitten',
        title: 'Adorable Kitten with Yarn',
        description: 'A playful kitten tangled in colorful yarn - a community favorite that everyone loves.',
        theme: 'animals-creatures',
        style: 'cartoon-style',
        mood: 'whimsical-quirky',
        difficulty: 'easy',
        estimatedTime: 12,
        confidence: 94,
        tags: ['kitten', 'yarn', 'playful', 'community-favorite'],
        reasoning: ['Top community rating', 'Loved by many users', 'High completion rate'],
        slug: generateSlug('Adorable Kitten with Yarn')
      }
    ]
  }

  // 初始化全局趋势
  private initializeGlobalTrends(): void {
    this.globalTrends.set('fantasy-themes', 85)
    this.globalTrends.set('geometric-patterns', 78)
    this.globalTrends.set('nature-scenes', 92)
    this.globalTrends.set('hello-kitty', 96)
    this.globalTrends.set('mandala-designs', 73)
    this.globalTrends.set('animal-portraits', 89)
  }

  // 更新用户偏好
  public updateUserPreference(userId: string, behavior: UserBehavior): void {
    let profile = this.userProfiles.get(userId)
    
    if (!profile) {
      profile = {
        userId,
        behaviors: [],
        preferences: {
          themes: new Map(),
          styles: new Map(),
          moods: new Map(),
          difficulties: new Map()
        },
        stats: {
          totalSessions: 0,
          totalCompletions: 0,
          averageSessionTime: 0,
          lastActivityDate: new Date()
        }
      }
      this.userProfiles.set(userId, profile)
    }

    // 添加行为记录
    profile.behaviors.push({
      ...behavior,
      timestamp: behavior.timestamp || new Date()
    })

    // 更新偏好权重
    const weight = this.getBehaviorWeight(behavior.type)
    
    if (behavior.item.theme) {
      const currentWeight = profile.preferences.themes.get(behavior.item.theme) || 0
      profile.preferences.themes.set(behavior.item.theme, currentWeight + weight)
    }
    
    if (behavior.item.style) {
      const currentWeight = profile.preferences.styles.get(behavior.item.style) || 0
      profile.preferences.styles.set(behavior.item.style, currentWeight + weight)
    }
    
    if (behavior.item.mood) {
      const currentWeight = profile.preferences.moods.get(behavior.item.mood) || 0
      profile.preferences.moods.set(behavior.item.mood, currentWeight + weight)
    }
    
    if (behavior.item.difficulty) {
      const currentWeight = profile.preferences.difficulties.get(behavior.item.difficulty) || 0
      profile.preferences.difficulties.set(behavior.item.difficulty, currentWeight + weight)
    }

    // 更新统计信息
    profile.stats.totalSessions++
    if (behavior.type === 'complete') {
      profile.stats.totalCompletions++
    }
    if (behavior.item.sessionTime) {
      profile.stats.averageSessionTime = 
        (profile.stats.averageSessionTime * (profile.stats.totalSessions - 1) + behavior.item.sessionTime) / profile.stats.totalSessions
    }
    profile.stats.lastActivityDate = new Date()
  }

  // 获取行为权重
  private getBehaviorWeight(behaviorType: UserBehavior['type']): number {
    const weights = {
      view: 1,
      like: 3,
      complete: 5,
      share: 4,
      download: 3
    }
    return weights[behaviorType]
  }

  // 生成个性化推荐
  public generateRecommendations(userId: string): PersonalizedRecommendations {
    const profile = this.userProfiles.get(userId)
    const insights = this.generateUserInsights(profile)
    
    return {
      userId,
      insights,
      recommendations: {
        quickStart: this.getQuickStartRecommendations(profile),
        featured: this.getFeaturedRecommendations(profile),
        trending: this.getTrendingRecommendations(profile),
        personalized: this.getPersonalizedRecommendations(profile),
        challenges: this.getChallengeRecommendations(profile),
        seasonal: this.getSeasonalRecommendations(profile),
        social: this.getSocialRecommendations(profile)
      },
      timestamp: new Date()
    }
  }

  // 生成用户洞察
  private generateUserInsights(profile?: UserProfile): UserInsights {
    if (!profile) {
      return {
        creativityScore: 75,
        diversityScore: 60,
        userType: 'Explorer',
        progressTrend: 'exploring',
        preferredThemes: ['characters-people', 'nature-wilderness'],
        preferredStyles: ['line-art-minimal', 'cartoon-style'],
        preferredMoods: ['cheerful-bright', 'calm-peaceful'],
        averageSessionTime: 15,
        completionRate: 0.8,
        nextLevelSuggestion: 'Try exploring more complex designs to develop your artistic skills further!'
      }
    }

    const creativityScore = Math.min(100, profile.stats.totalSessions * 3 + profile.preferences.themes.size * 5)
    const diversityScore = Math.min(100, profile.preferences.themes.size * 15 + profile.preferences.styles.size * 10)
    
    // 确定用户类型
    const completionRate = profile.stats.totalCompletions / Math.max(1, profile.stats.totalSessions)
    const averageTime = profile.stats.averageSessionTime
    
    let userType: UserType = 'Explorer'
    if (completionRate > 0.9) userType = 'Perfectionist'
    else if (averageTime < 10) userType = 'Speed Artist'
    else if (averageTime > 30) userType = 'Detail Master'
    else if (profile.preferences.themes.size < 3) userType = 'Theme Specialist'
    else if (profile.preferences.moods.size > 4) userType = 'Mood Matcher'

    const topThemes = Array.from(profile.preferences.themes.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([theme]) => theme)

    const topStyles = Array.from(profile.preferences.styles.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([style]) => style)

    const topMoods = Array.from(profile.preferences.moods.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([mood]) => mood)

    return {
      creativityScore,
      diversityScore,
      userType,
      progressTrend: creativityScore > 80 ? 'mastering' : diversityScore > 70 ? 'improving' : 'exploring',
      preferredThemes: topThemes,
      preferredStyles: topStyles,
      preferredMoods: topMoods,
      averageSessionTime: averageTime,
      completionRate,
      nextLevelSuggestion: this.generateNextLevelSuggestion(userType, creativityScore, diversityScore)
    }
  }

  // 生成下一级建议
  private generateNextLevelSuggestion(userType: UserType, creativityScore: number, diversityScore: number): string {
    const suggestions = {
      'Explorer': 'Keep discovering new themes! Try a mandala design to expand your artistic horizons.',
      'Perfectionist': 'Challenge yourself with more complex designs to push your perfection to new heights.',
      'Speed Artist': 'Try some detailed pieces to develop your patience and attention to fine details.',
      'Detail Master': 'Experiment with simpler, more expressive styles to balance your precision skills.',
      'Theme Specialist': 'Branch out into new themes to diversify your creative portfolio.',
      'Mood Matcher': 'Focus on mastering one style deeply while maintaining your emotional range.'
    }

    let suggestion = suggestions[userType]
    
    if (creativityScore > 90) {
      suggestion += ' You\'re becoming a true artist - consider sharing your techniques with the community!'
    } else if (diversityScore < 50) {
      suggestion += ' Try exploring more varied themes and styles to broaden your creative experience.'
    }

    return suggestion
  }

  // 获取快速开始推荐
  private getQuickStartRecommendations(profile?: UserProfile): RecommendationItem[] {
    return this.contentLibrary
      .filter(item => item.difficulty === 'easy' && item.estimatedTime <= 15)
      .slice(0, 4)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'quick-start')
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  // 获取精选推荐
  private getFeaturedRecommendations(profile?: UserProfile): RecommendationItem[] {
    return this.contentLibrary
      .filter(item => item.id.startsWith('featured-'))
      .slice(0, 6)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'featured')
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  // 获取趋势推荐
  private getTrendingRecommendations(profile?: UserProfile): RecommendationItem[] {
    return this.contentLibrary
      .filter(item => item.id.startsWith('trending-'))
      .slice(0, 4)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'trending')
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  // 获取个性化推荐
  private getPersonalizedRecommendations(profile?: UserProfile): RecommendationItem[] {
    if (!profile) return []
    
    return this.contentLibrary
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'personalized')
      }))
      .filter(item => item.confidence > 70)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 6)
  }

  // 获取挑战推荐
  private getChallengeRecommendations(profile?: UserProfile): RecommendationItem[] {
    const userLevel = profile ? this.getUserDifficultyLevel(profile) : 'easy'
    const challengeLevel: Difficulty = userLevel === 'easy' ? 'medium' : 'complex'
    
    return this.contentLibrary
      .filter(item => item.difficulty === challengeLevel)
      .slice(0, 3)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'challenge')
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  // 获取季节推荐
  private getSeasonalRecommendations(profile?: UserProfile): RecommendationItem[] {
    const currentSeason = this.getCurrentSeason()
    return this.contentLibrary
      .filter(item => item.tags.includes(currentSeason) || item.id.includes('seasonal'))
      .slice(0, 4)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'seasonal')
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  // 获取社区推荐
  private getSocialRecommendations(profile?: UserProfile): RecommendationItem[] {
    return this.contentLibrary
      .filter(item => item.id.includes('social') || item.tags.includes('community-favorite'))
      .slice(0, 4)
      .map(item => ({
        ...item,
        confidence: this.calculateConfidence(item, profile, 'social')
      }))
      .sort((a, b) => b.confidence - a.confidence)
  }

  // 计算推荐信心度
  private calculateConfidence(
    item: RecommendationItem, 
    profile?: UserProfile, 
    context: string = 'general'
  ): number {
    let baseConfidence = item.confidence
    
    if (!profile) return baseConfidence
    
    // 主题匹配加分
    const themeWeight = profile.preferences.themes.get(item.theme) || 0
    const themeBonus = Math.min(20, themeWeight * 2)
    
    // 风格匹配加分
    const styleWeight = profile.preferences.styles.get(item.style) || 0
    const styleBonus = Math.min(15, styleWeight * 1.5)
    
    // 心情匹配加分
    const moodWeight = profile.preferences.moods.get(item.mood) || 0
    const moodBonus = Math.min(10, moodWeight * 1)
    
    // 难度匹配加分
    const userLevel = this.getUserDifficultyLevel(profile)
    const difficultyBonus = item.difficulty === userLevel ? 10 : 
                           Math.abs(['easy', 'medium', 'complex'].indexOf(item.difficulty) - 
                                   ['easy', 'medium', 'complex'].indexOf(userLevel)) === 1 ? 5 : -5
    
    // 上下文特定加分
    let contextBonus = 0
    if (context === 'quick-start' && item.estimatedTime <= 10) contextBonus = 10
    if (context === 'challenge' && item.difficulty === 'complex') contextBonus = 15
    if (context === 'trending' && this.globalTrends.get(item.theme) || 0 > 80) contextBonus = 10
    
    const finalConfidence = Math.min(100, Math.max(0, 
      baseConfidence + themeBonus + styleBonus + moodBonus + difficultyBonus + contextBonus
    ))
    
    return Math.round(finalConfidence)
  }

  // 获取用户难度等级
  private getUserDifficultyLevel(profile: UserProfile): Difficulty {
    const difficulties = Array.from(profile.preferences.difficulties.entries())
    if (difficulties.length === 0) return 'easy'
    
    difficulties.sort(([,a], [,b]) => b - a)
    return difficulties[0][0]
  }

  // 获取当前季节
  private getCurrentSeason(): string {
    const month = new Date().getMonth()
    if (month >= 2 && month <= 4) return 'spring'
    if (month >= 5 && month <= 7) return 'summer'
    if (month >= 8 && month <= 10) return 'autumn'
    return 'winter'
  }

  // 获取用户画像（调试用）
  public getUserProfile(userId: string): UserProfile | undefined {
    return this.userProfiles.get(userId)
  }

  // 重置用户数据（调试用）
  public resetUserData(userId: string): void {
    this.userProfiles.delete(userId)
  }
}

// 导出单例实例
export const recommendationEngine = new AIRecommendationEngine()