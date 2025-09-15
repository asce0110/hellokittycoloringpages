# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 full-stack application for AI-powered printable coloring pages, targeting the domain `coloringpagesprintable.net`. The platform combines AI image generation, user management, and SEO optimization for the "coloring pages printable" market.

## Tech Stack

- **Framework**: Next.js 15.1.7 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL) 
- **AI Services**: OpenAI DALL-E + Stability AI
- **Storage**: AWS S3
- **Deployment**: Cloudflare Pages

## Development Commands

```bash
# Development
npm run dev              # Start development server

# Build & Deploy
npm run build           # Production build
npm run pages:build     # Build for Cloudflare Pages
npm run deploy          # Deploy to Cloudflare Pages

# Database & Content
npm run seed:prompts    # Seed AI prompt templates
npm run db:migrate      # Run database migrations

# Code Quality
npm run lint            # ESLint (configured to ignore build errors)
```

## Architecture Overview

### App Router Structure
- `app/[slug]/` - Dynamic SEO-friendly routes
- `app/admin/` - Admin dashboard with analytics
- `app/api/` - Backend API endpoints
- `app/library/` - Main coloring pages gallery
- `app/create/` - AI generation interface

### Key Systems

#### AI Content Generation
- Dual AI provider support (OpenAI DALL-E + Stability AI)
- Template-based prompt system with variable substitution
- User limit management (5 free, 50 pro daily)
- Generated content stored in Supabase with S3 file storage

#### SEO Architecture  
- SEO URL generation and reconstruction system
- Structured JSON-LD schema markup
- Mobile-first responsive design with dedicated mobile components
- Content targeting "coloring pages printable" and related keywords

#### User Management
- Supabase Auth integration
- Role-based permissions (user/pro/admin)
- Usage tracking and subscription management
- Favorites and generation history

### Database Schema (Supabase)
- `users` - User accounts and subscription status
- `library_images` - Curated coloring page collection
- `generation_history` - AI-generated user content
- `user_favorites` - User bookmarking system
- `analytics_stats` - Usage analytics
- `prompt_templates` - AI generation templates

## Component Organization

- `components/ui/` - shadcn/ui components
- `components/mobile-*` - Mobile-specific layouts
- `components/blog/` - Blog/MDX components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and configurations

## Special Considerations

### SEO Focus
- All content should target "coloring pages printable" keywords
- URLs should be SEO-friendly with proper slug generation
- Meta descriptions should emphasize "free", "printable", "AI-generated"
- Keyword density: "coloring pages printable" (1.0-1.5%)

### Image Processing
- High-resolution print-ready formats required
- Browser-based image compression with fallbacks
- S3 integration for file storage and CDN delivery

### Mobile Optimization
- Dedicated mobile components and layouts
- Touch-friendly interfaces for generation and browsing
- Responsive image handling

### Performance
- Startup preloading system implemented
- Image optimization and compression
- CDN integration for static assets

## Business Logic

- Freemium model with daily generation limits
- User analytics and admin dashboard
- Multi-difficulty content organization (easy/medium/complex)
- Print optimization for physical coloring pages

## Key Library Utilities

### Core Business Logic (`lib/`)
- `supabase.ts` - Database client configuration
- `database.ts` - Database operations and queries
- `types.ts` - TypeScript type definitions
- `utils.ts` - General utility functions

### SEO System (`lib/seo-*`)
- `seo-url-generator.ts` - Dynamic SEO URL creation
- `seo-url-reconstructor.ts` - URL parsing and reconstruction
- `seo-slug-parser.ts` - SEO-friendly slug handling
- `seo-image-manager.ts` - Image metadata for SEO

### Image Processing (`lib/*compression*`, `lib/print-utils.ts`)
- `image-compression-safe.ts` - Browser-based image compression
- `simple-compression.ts/js` - Fallback compression utilities
- `print-utils.ts` - Print optimization functions

### AI & Content (`lib/ai-*`, `lib/coloring-*`)
- `ai-prompts-data.ts` - AI generation templates
- `ai-recommendation-engine.ts` - Content recommendation logic
- `coloring-data.ts` - Static coloring page data
- `creative-taxonomy.ts` - Content categorization system

### Performance & Caching (`lib/*preload*`, `lib/cache-*`)
- `startup-preloader.ts` - Application startup optimization
- `cache-prewarming.ts` - Content preloading strategies
- `simple-preloader.ts` - Resource preloading utilities

## Configuration Details

### Next.js Configuration
- **Cloudflare Pages optimized**: `trailingSlash: true`, `images.unoptimized: true`
- **Webpack fallbacks**: Disabled Node.js modules (fs, net, tls, crypto) for client-side
- **Package optimization**: Lucide React icons optimized for bundle size

### Tailwind CSS
- **Custom color palette**: "kitty" theme colors integrated
- **shadcn/ui integration**: Complete Radix UI component library
- **Mobile-first approach**: Responsive design patterns established

### MDX Support
- **Blog system**: `/content/blog/` directory with frontmatter support
- **Component integration**: React components usable in MDX content
- **Syntax highlighting**: Code blocks with rehype-highlight
- `app/[slug]/` - Dynamic SEO-friendly routes
- `app/admin/` - Admin dashboard with analytics
- `app/api/` - Backend API endpoints
- `app/library/` - Main coloring pages gallery
- `app/create/` - AI generation interface

### Key Systems

#### AI Content Generation
- Dual AI provider support (OpenAI DALL-E + Stability AI)
- Template-based prompt system with variable substitution
- User limit management (5 free, 50 pro daily)
- Generated content stored in Supabase with S3 file storage

#### SEO Architecture  
- SEO URL generation and reconstruction system
- Structured JSON-LD schema markup
- Mobile-first responsive design with dedicated mobile components
- Content targeting "coloring pages printable" and related keywords

#### User Management
- Supabase Auth integration
- Role-based permissions (user/pro/admin)
- Usage tracking and subscription management
- Favorites and generation history

### Database Schema (Supabase)
- `users` - User accounts and subscription status
- `library_images` - Curated coloring page collection
- `generation_history` - AI-generated user content
- `user_favorites` - User bookmarking system
- `analytics_stats` - Usage analytics
- `prompt_templates` - AI generation templates

## Component Organization

- `components/ui/` - shadcn/ui components
- `components/mobile-*` - Mobile-specific layouts
- `components/blog/` - Blog/MDX components
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and configurations

## Special Considerations

### SEO Focus
- All content should target "coloring pages printable" keywords
- URLs should be SEO-friendly with proper slug generation
- Meta descriptions should emphasize "free", "printable", "AI-generated"
- Keyword density: "coloring pages printable" (1.0-1.5%)

### Image Processing
- High-resolution print-ready formats required
- Browser-based image compression with fallbacks
- S3 integration for file storage and CDN delivery

### Mobile Optimization
- Dedicated mobile components and layouts
- Touch-friendly interfaces for generation and browsing
- Responsive image handling

### Performance
- Startup preloading system implemented
- Image optimization and compression
- CDN integration for static assets

## Business Logic

- Freemium model with daily generation limits
- User analytics and admin dashboard
- Multi-difficulty content organization (easy/medium/complex)
- Print optimization for physical coloring pages

## SEO关键词策略 (基于真实Google Ads数据)

### 主要目标关键词
1. **主关键词**: coloring pages printable (135K搜索量, 0.16竞争度)
2. **次要关键词**: printable coloring pages (165K搜索量, 0.37竞争度) 
3. **长期目标**: coloring pages (823K搜索量, 0.42竞争度)
4. **差异化优势**: ai coloring pages (1K搜索量, 0.04竞争度)

### 阶段性实施计划
- 阶段1: 重点优化低竞争高价值关键词
- 阶段2: 扩展到相关高价值关键词
- 阶段3: 挑战主流大词

### 页面关键词分配
- 首页: 主关键词 + 品牌定位
- 分类页: 长尾关键词组合
- 详情页: 特定主题长尾词

### 关键词密度指导
- **主关键词**: "coloring pages printable" (1.0-1.5%)
- **次要关键词**: "printable coloring pages" (0.5-0.8%)
- **支持关键词**: "ai coloring pages", "free coloring sheets" 等
- **长尾关键词**: 自然分布在内容中

### 内容策略指南
- 在每个页面自然融入关键词
- 避免关键词堆砌
- 保持语义多样性
- 关注用户搜索意图匹配

### 文案优化方向
- 突出"可打印"、"免费"、"AI生成"等特点
- 强调高质量、多样性、易用性
- 使用长尾关键词变体

### 建议文案模板
- 标题: "[关键词] | [品牌特色]"
- 描述: "[关键词]的简洁描述，突出价值主张"

### 技术SEO建议
- 保持干净的URL结构
- 优化元数据和结构化数据
- 建立内部链接网络
- 使用语义HTML标签

### 监控与调整
- 每月审核关键词排名
- 跟踪点击率和转化率
- 根据数据动态调整策略

### 当前实施状态
- ✅ 网站标题已优化为: "Free Printable Coloring Pages | Download & Print Instantly"
- ✅ Meta描述已优化: 突出免费、可打印、AI生成等核心价值
- ✅ 关键词标签已重新排列: 优先展示主关键词
- ✅ 首页H1标题已匹配主关键词策略
- ✅ 域名 coloringpagesprintable.net 完美匹配EMD关键词策略

### 下一步行动计划
1. 激活AI涂色页面生成系统(500个提示词库)
2. 优化分类页面的长尾关键词
3. 建立内链结构支持关键词策略
4. 配置新域名DNS和部署
5. 设置301重定向保护SEO权重

### 竞争对手分析
- 定期检查竞争对手的关键词策略
- 识别未被充分利用的关键词机会
- 学习和借鉴优秀实践

### 合规性与用户体验
- 确保内容对人类和搜索引擎都有价值
- 避免过度优化和关键词堆砌
- 保持内容的自然性和吸引力

### 关键词工具推荐
- Google Search Console
- Google Keyword Planner
- Ahrefs
- SEMrush

建议定期评估和更新这个SEO策略，以适应搜索引擎算法和用户需求的变化。