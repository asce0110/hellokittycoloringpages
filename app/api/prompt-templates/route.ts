import { NextRequest, NextResponse } from 'next/server'
import { PromptTemplate } from '@/lib/types'

// 默认的提示词模板 - 当数据库表不存在时使用
const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'default-classic-character',
    name: 'Classic Hello Kitty Character',
    description: 'Classic line art style featuring Hello Kitty characters',
    template: 'Create a classic coloring page featuring Hello Kitty {userInput}. The image should be clean line art with bold outlines, perfect for coloring. Style: {complexity} with clear, simple shapes suitable for printing.',
    style: 'classic',
    complexity: 'simple',
    category: 'character',
    isActive: true,
    isDefault: true,
    variables: ['{userInput}', '{complexity}'],
    exampleOutput: 'A classic Hello Kitty sitting with a bow, simple clean lines',
    sortOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'default-cute-kawaii',
    name: 'Cute Kawaii Style',
    description: 'Extra cute kawaii style with rounded features',
    template: 'Generate a super cute kawaii-style coloring page of {userInput}. Use rounded shapes, big eyes, and adorable expressions. Complexity: {complexity}. Perfect for young children who love cute characters.',
    style: 'cute',
    complexity: 'simple',
    category: 'character',
    isActive: true,
    isDefault: false,
    variables: ['{userInput}', '{complexity}'],
    exampleOutput: 'A kawaii-style cat with huge sparkly eyes and a sweet smile',
    sortOrder: 2,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'default-simple-minimalist',
    name: 'Minimalist Design',
    description: 'Clean, simple designs for easy coloring',
    template: 'Design a minimalist coloring page featuring {userInput}. Use clean, simple lines with minimal details. Perfect for beginners or those who prefer simple artwork with {complexity} complexity.',
    style: 'simple',
    complexity: 'simple',
    category: 'general',
    isActive: true,
    isDefault: false,
    variables: ['{userInput}', '{complexity}'],
    exampleOutput: 'A simple outline of Hello Kitty face with minimal details',
    sortOrder: 3,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: 'default-detailed-illustration',
    name: 'Detailed Illustration',
    description: 'Complex designs for advanced colorists',
    template: 'Create a detailed coloring page illustration of {userInput}. Include intricate patterns, decorative elements, and fine details. This detailed design should have {complexity} level details for experienced colorists.',
    style: 'detailed',
    complexity: 'complex',
    category: 'general',
    isActive: true,
    isDefault: false,
    variables: ['{userInput}', '{complexity}'],
    exampleOutput: 'Hello Kitty in an ornate garden with detailed flowers and patterns',
    sortOrder: 4,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const style = searchParams.get('style')
    const complexity = searchParams.get('complexity')
    const category = searchParams.get('category')

    let filteredTemplates = DEFAULT_TEMPLATES

    if (activeOnly) {
      filteredTemplates = filteredTemplates.filter(t => t.isActive)
    }
    
    if (style) {
      filteredTemplates = filteredTemplates.filter(t => t.style === style)
    }
    
    if (complexity) {
      filteredTemplates = filteredTemplates.filter(t => t.complexity === complexity)
    }
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category)
    }

    return NextResponse.json({
      data: filteredTemplates,
      pagination: {
        page: 1,
        limit: 20,
        total: filteredTemplates.length,
        totalPages: 1
      },
      success: true,
      message: 'Using default templates. For full functionality, please set up the database.'
    })

  } catch (error) {
    console.error('Default templates API error:', error)
    return NextResponse.json({
      data: DEFAULT_TEMPLATES,
      pagination: {
        page: 1,
        limit: 20,
        total: DEFAULT_TEMPLATES.length,
        totalPages: 1
      },
      success: true,
      message: 'Fallback to default templates'
    })
  }
}