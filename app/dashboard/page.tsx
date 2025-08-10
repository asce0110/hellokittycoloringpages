"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  Sparkles, 
  Heart, 
  Download, 
  Crown, 
  Calendar,
  ImageIcon,
  Palette
} from "lucide-react"
import { GenerationHistory } from "@/lib/types"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useUserGenerations, useUserFavorites } from "@/hooks/use-api"


export default function DashboardPage() {
  const { user } = useAuth()
  
  // 使用真实的API Hook获取数据
  const { generations: generationsData, loading: generationsLoading } = useUserGenerations(user?.id || '', 1, 20)
  const { favorites: favoritesData, loading: favoritesLoading, addToFavorites, removeFromFavorites } = useUserFavorites(user?.id || '')
  
  // 从API数据中提取generations和favorites
  const generations = generationsData?.data || []
  const favorites = favoritesData.filter(fav => fav.generation).map(fav => fav.generation!)

  const toggleFavorite = async (id: string) => {
    const generation = generations.find(g => g.id === id)
    if (!generation) return
    
    if (generation.isFavorite) {
      // 移除收藏
      await removeFromFavorites(id)
    } else {
      // 添加收藏
      await addToFavorites(id)
    }
  }

  const remainingGenerations = user?.isProUser ? 97 : (3 - (user?.generationsToday || 0))

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto py-8 px-4">
      <div className="grid gap-6">
        {/* 用户信息卡片 */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">{user?.name}</h1>
                  {user?.isProUser && (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro User
                    </Badge>
                  )}
                  {user?.role === 'admin' && (
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Administrator
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Today's Generations</div>
                <div className="text-2xl font-bold">{user?.generationsToday || 0}/
                  {user?.isProUser ? '100' : '3'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {remainingGenerations} remaining
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 统计卡片 */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.totalGenerations || 0}</div>
              <p className="text-xs text-muted-foreground">
                Created with AI
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Favorites</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites.length}</div>
              <p className="text-xs text-muted-foreground">
                Saved creations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                Generations created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 主要内容区域 */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Generation History
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favorites
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Your AI Generations</CardTitle>
                <CardDescription>
                  All the coloring pages you've created with AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {generationsLoading ? (
                    <div className="text-center py-8">加载中...</div>
                  ) : generations.length > 0 ? generations.map((generation) => (
                    <GenerationCard 
                      key={generation.id} 
                      generation={generation}
                      onToggleFavorite={toggleFavorite}
                    />
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">暂无生成记录</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Creations</CardTitle>
                <CardDescription>
                  Your most loved coloring pages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {favoritesLoading ? (
                    <div className="text-center py-8">加载中...</div>
                  ) : favorites.length > 0 ? favorites.map((generation) => (
                    <GenerationCard 
                      key={generation.id} 
                      generation={generation}
                      onToggleFavorite={toggleFavorite}
                    />
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">暂无收藏记录</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 管理员快速访问 */}
        {user?.role === 'admin' && (
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-red-800">Administrator Access</h3>
                  <p className="text-red-600">
                    Manage users, library images, and platform settings
                  </p>
                </div>
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link href="/admin">
                    <Crown className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 升级到Pro的卡片 */}
        {!user?.isProUser && user?.role !== 'admin' && (
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Upgrade to Pro</h3>
                  <p className="text-muted-foreground">
                    Get unlimited generations, higher resolution, and exclusive features
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      </div>
    </ProtectedRoute>
  )
}

interface GenerationCardProps {
  generation: GenerationHistory
  onToggleFavorite: (id: string) => void
}

function GenerationCard({ generation, onToggleFavorite }: GenerationCardProps) {
  return (
    <Card className="overflow-hidden group">
      <div className="relative">
        <img 
          src={generation.imageUrl} 
          alt={generation.prompt}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onToggleFavorite(generation.id)}
          >
            <Heart className={`h-4 w-4 ${generation.isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button size="sm" variant="secondary">
            <Download className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="secondary">
            <Palette className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          {generation.prompt}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{generation.createdAt ? new Date(generation.createdAt).toLocaleDateString() : 'Unknown'}</span>
          <div className="flex gap-1">
            <Badge variant="outline" className="text-xs">
              {generation.style}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {generation.complexity}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}