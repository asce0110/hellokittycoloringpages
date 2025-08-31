#!/usr/bin/env node

// Seed script to populate AI prompts into database
// Run with: npx tsx scripts/seed-ai-prompts.ts

import { createClient } from '@supabase/supabase-js'
import { COMPLETE_AI_PROMPTS } from '../lib/generate-all-prompts'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function seedPrompts() {
  console.log('Starting to seed AI prompts...')
  console.log(`Total prompts to seed: ${COMPLETE_AI_PROMPTS.length}`)
  
  // Group prompts by category for better logging
  const promptsByCategory = COMPLETE_AI_PROMPTS.reduce((acc, prompt) => {
    if (!acc[prompt.category]) {
      acc[prompt.category] = []
    }
    acc[prompt.category].push(prompt)
    return acc
  }, {} as Record<string, typeof COMPLETE_AI_PROMPTS>)
  
  console.log('\nPrompts by category:')
  Object.entries(promptsByCategory).forEach(([category, prompts]) => {
    console.log(`  ${category}: ${prompts.length} prompts`)
  })
  
  // Group prompts by difficulty for logging
  const promptsByDifficulty = COMPLETE_AI_PROMPTS.reduce((acc, prompt) => {
    if (!acc[prompt.difficulty]) {
      acc[prompt.difficulty] = []
    }
    acc[prompt.difficulty].push(prompt)
    return acc
  }, {} as Record<string, typeof COMPLETE_AI_PROMPTS>)
  
  console.log('\nPrompts by difficulty:')
  Object.entries(promptsByDifficulty).forEach(([difficulty, prompts]) => {
    console.log(`  ${difficulty}: ${prompts.length} prompts`)
  })
  
  try {
    // Clear existing prompts (optional - comment out if you want to keep existing data)
    console.log('\nClearing existing prompts...')
    const { error: deleteError } = await supabase
      .from('ai_prompt_templates')
      .delete()
      .neq('prompt_id', '') // Delete all (workaround for Supabase delete all)
    
    if (deleteError) {
      console.error('Error clearing existing prompts:', deleteError)
      // Continue anyway - might be first run with no data
    }
    
    // Prepare prompts for insertion
    const promptsToInsert = COMPLETE_AI_PROMPTS.map(prompt => ({
      prompt_id: prompt.id,
      title: prompt.title,
      description: prompt.description,
      ai_prompt: prompt.aiPrompt,
      category: prompt.category,
      difficulty: prompt.difficulty,
      tags: prompt.tags,
      estimated_print_time: prompt.estimatedPrintTime,
      age_group: prompt.ageGroup,
      is_active: prompt.isActive,
      
      // SEO fields
      slug: prompt.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .substring(0, 100), // Limit slug length
      
      meta_title: prompt.title,
      meta_description: prompt.description,
      
      // Initial statistics
      generation_count: 0,
      download_count: 0,
      print_count: 0,
      color_online_count: 0,
      average_rating: null,
      rating_count: 0,
      
      // Feature flags
      is_featured: false,
      featured_order: null,
      
      // Seasonal tags based on holidays
      seasonal_tag: prompt.category === 'Holidays' 
        ? prompt.title.toLowerCase().includes('christmas') ? 'christmas'
        : prompt.title.toLowerCase().includes('halloween') ? 'halloween'
        : prompt.title.toLowerCase().includes('easter') ? 'easter'
        : prompt.title.toLowerCase().includes('thanksgiving') ? 'thanksgiving'
        : prompt.title.toLowerCase().includes('valentine') ? 'valentine'
        : null
        : null
    }))
    
    // Insert in batches to avoid timeout
    const batchSize = 50
    let successCount = 0
    let errorCount = 0
    
    console.log('\nInserting prompts in batches...')
    
    for (let i = 0; i < promptsToInsert.length; i += batchSize) {
      const batch = promptsToInsert.slice(i, i + batchSize)
      const batchNumber = Math.floor(i / batchSize) + 1
      const totalBatches = Math.ceil(promptsToInsert.length / batchSize)
      
      process.stdout.write(`  Batch ${batchNumber}/${totalBatches}... `)
      
      const { data, error } = await supabase
        .from('ai_prompt_templates')
        .insert(batch)
        .select()
      
      if (error) {
        console.error(`Error in batch ${batchNumber}:`, error)
        errorCount += batch.length
      } else {
        successCount += data.length
        console.log(`✓ (${data.length} prompts)`)
      }
    }
    
    // Feature some prompts (mark top 10 from each category as featured)
    console.log('\nMarking featured prompts...')
    let featuredOrder = 1
    
    for (const category of Object.keys(promptsByCategory)) {
      const { data: topPrompts } = await supabase
        .from('ai_prompt_templates')
        .select('id')
        .eq('category', category)
        .limit(2)
      
      if (topPrompts) {
        for (const prompt of topPrompts) {
          await supabase
            .from('ai_prompt_templates')
            .update({ 
              is_featured: true, 
              featured_order: featuredOrder++ 
            })
            .eq('id', prompt.id)
        }
      }
    }
    
    // Final statistics
    console.log('\n=================================')
    console.log('Seeding completed!')
    console.log(`  Successfully inserted: ${successCount} prompts`)
    console.log(`  Failed: ${errorCount} prompts`)
    console.log(`  Featured: ${featuredOrder - 1} prompts`)
    
    // Verify the data
    const { count } = await supabase
      .from('ai_prompt_templates')
      .select('*', { count: 'exact', head: true })
    
    console.log(`  Total prompts in database: ${count}`)
    console.log('=================================\n')
    
  } catch (error) {
    console.error('Unexpected error during seeding:', error)
    process.exit(1)
  }
}

// Run the seed function
seedPrompts()
  .then(() => {
    console.log('Seed script completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Seed script failed:', error)
    process.exit(1)
  })