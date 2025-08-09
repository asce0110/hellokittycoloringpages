import { createClient } from '@supabase/supabase-js'

// 客户端配置 (用于前端)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 服务端配置 (用于后端API路由，绕过RLS)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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
    }
  }
}