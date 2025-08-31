import { createClient } from '@supabase/supabase-js'

// 客户端配置 (用于前端)
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase client configuration missing')
    // Return a mock client that will fail gracefully
    return null as any
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = createSupabaseClient()

// 服务端配置 (用于后端API路由，绕过RLS)
function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Supabase admin configuration missing')
    return null as any
  }
  
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

export const supabaseAdmin = createSupabaseAdminClient()

// 数据库类型定义 (运行 supabase gen types typescript 生成)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name?: string
          role: 'user' | 'admin'
          is_pro_user: boolean
          generations_today: number
          total_generations: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string
          role?: 'user' | 'admin'
          is_pro_user?: boolean
          generations_today?: number
          total_generations?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'user' | 'admin'
          is_pro_user?: boolean
          generations_today?: number
          total_generations?: number
          updated_at?: string
        }
      }
      generation_history: {
        Row: {
          id: string
          user_id: string
          prompt: string
          image_url: string
          style: string
          complexity: string
          is_favorite: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          image_url: string
          style: string
          complexity: string
          is_favorite?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          image_url?: string
          style?: string
          complexity?: string
          is_favorite?: boolean
        }
      }
      library_images: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          thumbnail_url: string
          tags: string[]
          category: string
          difficulty: 'easy' | 'medium' | 'complex'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url: string
          thumbnail_url: string
          tags: string[]
          category: string
          difficulty: 'easy' | 'medium' | 'complex'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          thumbnail_url?: string
          tags?: string[]
          category?: string
          difficulty?: 'easy' | 'medium' | 'complex'
          is_active?: boolean
          updated_at?: string
        }
      }
      user_favorites: {
        Row: {
          id: string
          user_id: string
          generation_id: string | null
          library_image_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          generation_id?: string | null
          library_image_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          generation_id?: string | null
          library_image_id?: string | null
        }
      }
      banner_images: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          is_active: boolean
          display_order: number
          image_type: 'library' | 'hero' | 'general'
          paired_image_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url: string
          is_active?: boolean
          display_order?: number
          image_type?: 'library' | 'hero' | 'general'
          paired_image_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string
          is_active?: boolean
          display_order?: number
          image_type?: 'library' | 'hero' | 'general'
          paired_image_id?: string | null
          updated_at?: string
        }
      }
      pricing_plans: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          currency: string
          billing_cycle: string
          features: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          currency?: string
          billing_cycle: string
          features: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          currency?: string
          billing_cycle?: string
          features?: string[]
          is_active?: boolean
          updated_at?: string
        }
      }
      system_settings: {
        Row: {
          key: string
          value: string
          description: string
          updated_at: string
        }
        Insert: {
          key: string
          value: string
          description: string
          updated_at?: string
        }
        Update: {
          key?: string
          value?: string
          description?: string
          updated_at?: string
        }
      }
      user_subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          stripe_subscription_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_id: string
          stripe_subscription_id: string
          status: string
          current_period_start: string
          current_period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_id?: string
          stripe_subscription_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          updated_at?: string
        }
      }
      analytics_stats: {
        Row: {
          id: string
          stat_date: string
          total_users: number
          new_users_today: number
          total_generations: number
          generations_today: number
          total_downloads: number
          downloads_today: number
          active_pro_subscriptions: number
          total_revenue: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stat_date: string
          total_users?: number
          new_users_today?: number
          total_generations?: number
          generations_today?: number
          total_downloads?: number
          downloads_today?: number
          active_pro_subscriptions?: number
          total_revenue?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stat_date?: string
          total_users?: number
          new_users_today?: number
          total_generations?: number
          generations_today?: number
          total_downloads?: number
          downloads_today?: number
          active_pro_subscriptions?: number
          total_revenue?: number
          updated_at?: string
        }
      }
      prompt_templates: {
        Row: {
          id: string
          title: string
          description: string
          prompt: string
          category: string
          tags: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          prompt: string
          category: string
          tags?: string[]
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          prompt?: string
          category?: string
          tags?: string[]
          is_active?: boolean
          updated_at?: string
        }
      }
      color_references: {
        Row: {
          id: string
          library_image_id: string
          reference_image_url: string
          color_palette: string[]
          description: string
          is_primary: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          library_image_id: string
          reference_image_url: string
          color_palette: string[]
          description: string
          is_primary?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          library_image_id?: string
          reference_image_url?: string
          color_palette?: string[]
          description?: string
          is_primary?: boolean
          updated_at?: string
        }
      }
    }
  }
}