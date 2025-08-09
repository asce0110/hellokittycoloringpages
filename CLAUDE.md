# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI Kitty Creator is a Next.js application for creating and exploring Hello Kitty coloring pages. The app combines a curated library of existing coloring pages with AI-generated custom pages. Users can browse, download, print, or color pages online using an interactive canvas.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint (note: lint errors are ignored during builds via next.config.mjs)

### Local Preview with Cloudflare Environment
**Cloudflare Commands** (configured for project):
- `pnpm run preview` - Build and serve with Cloudflare Pages simulation
- `pnpm run pages:build` - Build specifically for Cloudflare Pages
- `pnpm run deploy` - Deploy to Cloudflare Pages

**Note**: 
- Removed `@cloudflare/next-on-pages` dependency (it uses Vercel CLI internally)
- Direct Cloudflare deployment using `next build` + `wrangler pages dev`
- On Windows systems, use WSL for better compatibility
- Alternative: Use `pnpm dev` for standard Next.js development

### Package Manager
This project uses **pnpm** as the package manager, not npm or yarn.

### Component Generation
This project uses shadcn/ui components. To add new UI components:
- Use the shadcn/ui CLI or manually add components to `components/ui/`
- Components are pre-configured with the custom Tailwind theme
- See `components.json` for shadcn/ui configuration

## Deployment Architecture

### Frontend-Backend Separation
This project is designed with **frontend-backend separation** for deployment to **Cloudflare**:

- **Frontend**: Next.js application deployed to Cloudflare Pages
- **Backend**: API endpoints and server functions deployed to Cloudflare Workers/Functions
- **Architecture**: Fully decoupled for optimal Cloudflare performance and scaling

### Cloudflare Deployment
- **Target Platform**: Cloudflare Pages + Workers
- **Frontend Deployment**: Static site generation with dynamic routes
- **Backend Services**: Cloudflare Workers for API endpoints
- **Preview Environment**: Local development should simulate Cloudflare runtime environment

## Architecture

### App Structure (Next.js 15 App Router)
- **App Router**: Uses Next.js 15 app router with TypeScript
- **Layout**: Root layout (`app/layout.tsx`) includes global navigation, theme provider, and footer
- **Pages**:
  - `/` - Homepage with hero section and featured content
  - `/library` - Browse curated coloring pages with search/filter
  - `/create` - AI page generation interface
  - `/color/[id]` - Interactive coloring canvas for specific pages
  - `/community` - Community features (placeholder)

### Key Components

#### ColoringCanvas (`components/coloring-canvas.tsx`)
- **Purpose**: Interactive canvas for coloring pages online
- **Features**: 
  - Dual-canvas architecture (image layer + drawing layer)
  - Fill tool with flood-fill algorithm
  - Brush tool with configurable size
  - Undo functionality with history management
  - Download and print capabilities
- **Usage**: Imported in `/color/[id]` pages

#### UI Components (`components/ui/`)
- **Based on**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Theme**: Dark/light mode support via next-themes

### Styling System
- **Framework**: Tailwind CSS with custom configuration
- **Theme**: Custom Hello Kitty color palette (kitty-pink, kitty-blue, kitty-red)
- **Icons**: Lucide React icons
- **Fonts**: Nunito (Google Fonts)

### Configuration Notes
- **Build Config**: ESLint and TypeScript errors are ignored during builds (see next.config.mjs)
- **Images**: Unoptimized images enabled for placeholder image handling
- **Theme**: Dark mode support with class-based switching via next-themes
- **TypeScript**: Strict mode enabled with Next.js 15 and React 19 types
- **Cloudflare Config**: Static export mode enabled with trailing slashes for Cloudflare Pages compatibility
- **Wrangler**: Configured with production and preview environments

### Data Flow
- Library pages use mock data arrays for coloring page listings
- Color pages receive image URLs via query parameters
- AI generation UI is frontend-only (backend integration needed)

### Key Patterns
- Server and client components are clearly separated ("use client" directive)
- Dynamic imports used for client-heavy components (MovingImageBanner)
- Next.js 15 compatibility: `ssr: false` only allowed in client components
- Consistent error handling for download/print operations
- Responsive design with mobile-first approach
- Canvas operations use dual-layer architecture for performance
- Mock data patterns for development (actual backend integration pending)

### Important Notes
- Homepage (`app/page.tsx`) is a client component due to MovingImageBanner usage
- MovingImageBanner requires client-side rendering for animations and state management

### Build Fixes Applied
- **SSR Issue**: Fixed Next.js 15 `ssr: false` error by making homepage a client component
- **CSS Import Error**: Removed invalid `@import "tw-animate-css"` from `app/globals.css`
- **Animations**: Custom scroll animations defined directly in CSS instead of external library
- **Static Export**: Added `generateStaticParams()` to `/color/[id]` page for Cloudflare static export compatibility
- **Server/Client Separation**: Split `/color/[id]/page.tsx` into server component (with `generateStaticParams`) and client component (`coloring-page-client.tsx`)
- **404 Page**: Added missing `not-found.tsx` to prevent build errors

### Build Status: ✅ SUCCESS
- **19 static pages** generated successfully
- **12 dynamic routes** (`/color/[id]`) pre-rendered with SSG
- **Static export** ready for Cloudflare Pages deployment
- **Bundle sizes** optimized (largest page: 13.7 kB)

## New Features: User & Admin Panels

### User Management System
- **Authentication**: Context-based auth system with mock data for development
- **User Dashboard** (`/dashboard`): View generation history, favorites, and statistics
- **Settings Page** (`/settings`): Account management and preferences
- **Login/Register** (`/login`): Unified authentication interface

### Admin Panel (`/admin`)
- **User Management**: View and manage all registered users
- **Library Management**: Upload and manage coloring page library
- **Banner Images**: Manage homepage moving banner images
- **Pricing Configuration**: Configure subscription plans and limits
- **System Settings**: Application-wide configuration

### Environment Configuration
- **`.env.example`**: Template for all required environment variables
- **Database**: Ready for integration with any database (PostgreSQL, MySQL, etc.)
- **File Storage**: Cloudflare R2 configuration for image uploads
- **Payment**: Stripe integration for Pro subscriptions
- **AI APIs**: OpenAI and Stability AI for image generation

### Key Components
- **AuthProvider** (`hooks/use-auth.tsx`): Authentication context and state management
- **Navigation** (`components/navigation.tsx`): Dynamic navigation with user state
- **Type Definitions** (`lib/types.ts`): Complete TypeScript interfaces

### Database Integration
- **Real Database Support**: Full PostgreSQL/Supabase integration
- **Complete Schema**: Users, generations, library, banners, pricing, settings, favorites, subscriptions, analytics
- **API Routes**: RESTful APIs for all data operations
- **Admin Panel**: Real data management for users, content, and settings
- **User Dashboard**: Actual generation history and favorites from database

### Mock Data for Development (Legacy)
- Admin user: `asce3801@gmail.com` / `xahzjz114223`
- Regular user: `user@example.com` / `password123`
- Database schema and seed data available in `/database/` folder
- See `DATABASE_SETUP.md` for complete setup instructions

### Database Tables
- `users` - User accounts and profiles
- `generation_history` - AI generation records
- `library_images` - Template image library
- `banner_images` - Homepage/library banners
- `pricing_plans` - Subscription plans
- `system_settings` - Dynamic configuration
- `user_subscriptions` - Payment records
- `user_favorites` - User bookmarks
- `analytics_stats` - Platform metrics

### API Endpoints
**Admin APIs:**
- `/api/admin/stats` - Dashboard statistics
- `/api/admin/users` - User management
- `/api/admin/library` - Library management
- `/api/admin/banners` - Banner management
- `/api/admin/pricing` - Pricing configuration
- `/api/admin/settings` - System settings

**User APIs:**
- `/api/user/generations` - Generation history
- `/api/user/favorites` - User favorites

**Public APIs:**
- `/api/library` - Public library access
- `/api/banners` - Public banner data

### Security Features
- Role-based access control (user/admin)
- Protected routes and navigation
- Environment variable configuration for sensitive data