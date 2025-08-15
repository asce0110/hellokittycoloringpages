import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { AIGenerationRequest } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      )
    }

    const body: AIGenerationRequest = await request.json()
    
    // 验证必填字段
    if (!body.prompt || !body.userId || !body.style || !body.complexity) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, userId, style, complexity' },
        { status: 400 }
      )
    }

    // 检查用户是否存在和每日限制
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, is_pro_user, generations_today, last_generation_date')
      .eq('id', body.userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 检查每日生成限制
    const today = new Date().toISOString().split('T')[0]
    const userGeneratedToday = user.last_generation_date?.split('T')[0] === today
    const generationsToday = userGeneratedToday ? user.generations_today : 0
    const dailyLimit = user.is_pro_user ? 50 : 5 // Pro用户50次，免费用户5次

    if (generationsToday >= dailyLimit) {
      return NextResponse.json(
        { 
          error: 'Daily generation limit reached',
          limit: dailyLimit,
          used: generationsToday
        },
        { status: 429 }
      )
    }

    // 如果指定了模板，获取模板内容
    let finalPrompt = body.prompt
    let template = null
    
    if (body.templateId) {
      try {
        const { data: dbTemplate, error: templateError } = await supabaseAdmin
          .from('prompt_templates')
          .select('template, variables')
          .eq('id', body.templateId)
          .eq('is_active', true)
          .single()

        if (templateError) {
          console.warn('Database template fetch error:', templateError.message)
          
          // 如果数据库失败，尝试从默认模板获取
          const fallbackResponse = await fetch(new URL('/api/prompt-templates', 'http://localhost:3000'))
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            const fallbackTemplate = fallbackData.data.find((t: any) => t.id === body.templateId)
            if (fallbackTemplate) {
              template = {
                template: fallbackTemplate.template,
                variables: fallbackTemplate.variables
              }
              console.log('Using fallback template:', fallbackTemplate.name)
            }
          }
        } else if (dbTemplate) {
          template = dbTemplate
        }
      } catch (fetchError) {
        console.error('Error fetching template:', fetchError)
      }
    }

    if (template) {
      // 将用户输入的内容替换到模板中的变量
      finalPrompt = template.template.replace(/{userInput}/g, body.prompt)
      
      // 处理其他预定义变量
      const complexityMappings: Record<string, string> = {
        simple: 'simple line art suitable for young children, minimal details',
        medium: 'moderate complexity with clear outlines and some details',
        complex: 'detailed illustration with intricate elements and patterns'
      }
      
      const styleMappings: Record<string, string> = {
        classic: 'classic black and white line art style',
        cute: 'cute kawaii style with simple rounded features',
        simple: 'minimalist line art with clean simple lines',
        detailed: 'detailed illustration with rich textures and patterns'
      }
      
      finalPrompt = finalPrompt
        .replace(/{complexity}/g, complexityMappings[body.complexity] || body.complexity)
        .replace(/{style}/g, styleMappings[body.style] || body.style)
    }

    // 构建AI生成的提示词
    const systemPrompt = `Create a coloring page image in ${body.style} style with ${body.complexity} complexity. The image should be:
- Black and white line art only
- Clear, bold outlines suitable for coloring
- No filled areas or shading
- High contrast between lines and white background
- Appropriate for printing and coloring
- Hello Kitty or Sanrio character theme when relevant

User request: ${finalPrompt}`

    console.log('Generating image with prompt:', systemPrompt)

    // 选择AI服务 (OpenAI DALL-E 或 Stability AI)
    const useOpenAI = process.env.OPENAI_API_KEY && !process.env.USE_STABILITY_AI
    let imageUrl: string
    let thumbnailUrl: string

    if (useOpenAI) {
      // 使用OpenAI DALL-E
      const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: systemPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        })
      })

      if (!openaiResponse.ok) {
        const error = await openaiResponse.json()
        console.error('OpenAI API error:', error)
        return NextResponse.json(
          { error: 'Failed to generate image: ' + (error.error?.message || 'Unknown error') },
          { status: 500 }
        )
      }

      const openaiResult = await openaiResponse.json()
      imageUrl = openaiResult.data[0].url
      thumbnailUrl = imageUrl // OpenAI返回的图片可以直接用作缩略图
    } else if (process.env.STABILITY_AI_API_KEY) {
      // 使用Stability AI
      const stabilityResponse = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.STABILITY_AI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text_prompts: [{ text: systemPrompt }],
          cfg_scale: 7,
          height: 1024,
          width: 1024,
          steps: 30,
          samples: 1
        })
      })

      if (!stabilityResponse.ok) {
        const error = await stabilityResponse.json()
        console.error('Stability AI API error:', error)
        return NextResponse.json(
          { error: 'Failed to generate image: ' + (error.message || 'Unknown error') },
          { status: 500 }
        )
      }

      const stabilityResult = await stabilityResponse.json()
      const base64Image = stabilityResult.artifacts[0].base64
      
      // 这里需要将base64图片上传到云存储，暂时返回数据URL
      imageUrl = `data:image/png;base64,${base64Image}`
      thumbnailUrl = imageUrl
    } else {
      return NextResponse.json(
        { error: 'No AI service configured. Please set OPENAI_API_KEY or STABILITY_AI_API_KEY' },
        { status: 503 }
      )
    }

    // 保存生成记录到数据库
    let generation: any = null
    try {
      const { data: savedGeneration, error: saveError } = await supabaseAdmin
        .from('generation_history')
        .insert({
          user_id: body.userId,
          prompt: body.prompt,
          final_prompt: finalPrompt,
          image_url: imageUrl,
          thumbnail_url: thumbnailUrl,
          style: body.style,
          complexity: body.complexity,
          template_id: body.templateId,
          is_favorite: false,
          is_public: false,
          generation_params: {
            systemPrompt,
            aiService: useOpenAI ? 'openai' : 'stability'
          },
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (saveError) {
        console.error('Error saving generation:', saveError)
        console.warn('Generation will not be saved to history, but image will still be returned')
        // 创建一个临时ID，继续返回图片
        generation = { id: `temp-${Date.now()}` }
      } else {
        generation = savedGeneration
      }
    } catch (dbError) {
      console.error('Database error during generation save:', dbError)
      generation = { id: `temp-${Date.now()}` }
    }

    // 更新用户的生成统计
    const newGenerationsToday = userGeneratedToday ? generationsToday + 1 : 1
    try {
      await supabaseAdmin
        .from('users')
        .update({
          generations_today: newGenerationsToday,
          last_generation_date: new Date().toISOString(),
          total_generations: (user.total_generations || 0) + 1
        })
        .eq('id', body.userId)
    } catch (userUpdateError) {
      console.error('Error updating user statistics:', userUpdateError)
      // 继续执行，不影响返回结果
    }

    return NextResponse.json({
      success: true,
      data: {
        id: generation?.id,
        imageUrl,
        thumbnailUrl,
        prompt: body.prompt,
        finalPrompt,
        style: body.style,
        complexity: body.complexity,
        generationsRemaining: dailyLimit - newGenerationsToday,
        createdAt: new Date().toISOString()
      },
      message: 'Image generated successfully'
    })

  } catch (error) {
    console.error('AI generation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}