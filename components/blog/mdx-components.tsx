import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { InfoIcon, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

// 自定义MDX组件
export const MDXComponents = {
  // 标准HTML标签优化
  h1: ({ children, ...props }: any) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h1>
  ),
  
  h2: ({ children, ...props }: any) => (
    <h2 className="text-2xl font-semibold mt-8 mb-4 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  
  h3: ({ children, ...props }: any) => (
    <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),
  
  p: ({ children, ...props }: any) => (
    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  
  ul: ({ children, ...props }: any) => (
    <ul className="mb-4 pl-6 space-y-2 list-disc text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  ),
  
  ol: ({ children, ...props }: any) => (
    <ol className="mb-4 pl-6 space-y-2 list-decimal text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  ),
  
  li: ({ children, ...props }: any) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  
  blockquote: ({ children, ...props }: any) => (
    <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-gray-600 dark:text-gray-400" {...props}>
      {children}
    </blockquote>
  ),
  
  code: ({ children, className, ...props }: any) => {
    if (className?.includes('language-')) {
      return (
        <code className={`block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto text-sm ${className}`} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  
  pre: ({ children, ...props }: any) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
      {children}
    </pre>
  ),
  
  a: ({ href, children, ...props }: any) => {
    if (href?.startsWith('http')) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:underline"
          {...props}
        >
          {children}
        </a>
      )
    }
    return (
      <Link href={href || '#'} className="text-primary hover:underline" {...props}>
        {children}
      </Link>
    )
  },
  
  img: ({ src, alt, ...props }: any) => (
    <div className="my-6">
      <Image
        src={src}
        alt={alt || ''}
        width={800}
        height={400}
        className="rounded-lg shadow-md w-full h-auto"
        {...props}
      />
      {alt && (
        <p className="text-sm text-gray-500 text-center mt-2 italic">
          {alt}
        </p>
      )}
    </div>
  ),
  
  // 自定义组件
  ColoringTip: ({ title, children, level = 'info' }: {
    title: string
    children: React.ReactNode
    level?: 'info' | 'warning' | 'success' | 'error'
  }) => {
    const icons = {
      info: InfoIcon,
      warning: AlertTriangle,
      success: CheckCircle,
      error: XCircle,
    }
    
    const Icon = icons[level]
    
    return (
      <Alert className="my-6">
        <Icon className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          {children}
        </AlertDescription>
      </Alert>
    )
  },
  
  ColorPalette: ({ colors, title }: {
    colors: { name: string; hex: string; description?: string }[]
    title?: string
  }) => (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>{title || 'Color Palette'}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {colors.map((color, index) => (
            <div key={index} className="text-center">
              <div 
                className="w-full h-16 rounded-lg border shadow-sm mb-2"
                style={{ backgroundColor: color.hex }}
              />
              <p className="font-medium text-sm">{color.name}</p>
              <p className="text-xs text-gray-500">{color.hex}</p>
              {color.description && (
                <p className="text-xs text-gray-600 mt-1">{color.description}</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
  
  TechniqueCard: ({ title, difficulty, description, steps }: {
    title: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    description: string
    steps: string[]
  }) => {
    const difficultyColors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    }
    
    return (
      <Card className="my-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Badge variant="outline" className={difficultyColors[difficulty]}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-300">{description}</p>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={index} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    )
  },
  
  PrintableCTA: ({ pageUrl, pageName }: {
    pageUrl: string
    pageName: string
  }) => (
    <Card className="my-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
      <CardContent className="p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">Try This Technique!</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Practice with our {pageName} coloring page
        </p>
        <Button asChild>
          <Link href={pageUrl}>Download & Color Now</Link>
        </Button>
      </CardContent>
    </Card>
  ),
  
  RelatedPages: ({ pages }: {
    pages: { title: string; url: string; description: string }[]
  }) => (
    <Card className="my-6">
      <CardHeader>
        <CardTitle>Related Coloring Pages</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pages.map((page, index) => (
            <div key={index} className="border-l-4 border-primary pl-4">
              <h4 className="font-medium">
                <Link href={page.url} className="text-primary hover:underline">
                  {page.title}
                </Link>
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {page.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  ),
}