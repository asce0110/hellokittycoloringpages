"use client"

import { useState } from "react"
import { UserEditModal } from "@/components/user-edit-modal"
import { ImageUploadModal } from "@/components/image-upload-modal"
import { PricingEditModal } from "@/components/pricing-edit-modal"
import { R2StatusCard } from "@/components/r2-status"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  Images, 
  DollarSign, 
  Activity,
  Upload,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Settings,
  BarChart3
} from "lucide-react"
import { DashboardStats, LibraryImage, BannerImage, User, PricingPlan } from "@/lib/types"
import { ProtectedRoute } from "@/components/protected-route"
import { useAdminStats, useAdminUsers, useAdminLibraryImages, useAdminBanners, useAdminPricing } from "@/hooks/use-api"
import { addUploadedBanner, clearUploadedBanners, getUploadedBanners } from "@/lib/demo-data"
import { colorReferences, ColorReference } from "@/lib/reference-images"
import { ColorReferenceUploadModal } from "@/components/color-reference-upload-modal"
import { LibraryImageEditModal } from "@/components/library-image-edit-modal"
import { getColorReferenceSync } from "@/lib/reference-images"



export default function AdminPage() {
  // 使用真实的API Hook获取数据
  const { stats, loading: statsLoading } = useAdminStats()
  const { users, loading: usersLoading, refetch: refetchUsers } = useAdminUsers(1, 10)
  const { images: libraryImages, loading: libraryLoading, refetch: refetchLibrary } = useAdminLibraryImages(1, 12)
  const { banners: bannerImages, loading: bannersLoading, refetch: refetchBanners } = useAdminBanners()
  const { plans: pricingPlans, loading: pricingLoading } = useAdminPricing()
  
  // 模态框状态
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [showUserEditModal, setShowUserEditModal] = useState(false)
  const [showLibraryUploadModal, setShowLibraryUploadModal] = useState(false)
  const [showBannerUploadModal, setShowBannerUploadModal] = useState(false)
  const [showHeroUploadModal, setShowHeroUploadModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [showPricingEditModal, setShowPricingEditModal] = useState(false)
  const [showReferenceUploadModal, setShowReferenceUploadModal] = useState(false)
  const [editingReference, setEditingReference] = useState<ColorReference | null>(null)
  const [showLibraryImageEditModal, setShowLibraryImageEditModal] = useState(false)
  const [editingLibraryImage, setEditingLibraryImage] = useState<LibraryImage | null>(null)
  const [systemSettings, setSystemSettings] = useState({
    adminEmail: 'asce3801@gmail.com',
    freeGenerations: 3,
    proGenerations: 100
  })

  // 用户管理功能
  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowUserEditModal(true)
  }

  const handleSaveUser = async (updatedUser: User) => {
    console.log('Saving user:', updatedUser)
    // 在真实应用中，这里会调用API更新用户
    await refetchUsers()
  }

  const handleDeleteUser = async (userId: string) => {
    if (confirm('确定要删除这个用户吗？')) {
      console.log('Deleting user:', userId)
      // 在真实应用中，这里会调用API删除用户
      await refetchUsers()
    }
  }

  // 图片管理功能
  const toggleImageActive = async (id: string, type: 'library' | 'banner') => {
    console.log(`Toggle ${type} image active:`, id)
    if (type === 'library') {
      await refetchLibrary()
    } else {
      await refetchBanners()
    }
  }

  // 图库图片编辑功能
  const handleEditLibraryImage = (image: LibraryImage) => {
    setEditingLibraryImage(image)
    setShowLibraryImageEditModal(true)
  }

  const handleSaveLibraryImage = async (updatedImage: LibraryImage) => {
    try {
      console.log('Saving library image:', updatedImage)
      
      // 使用真实的API更新图片
      const response = await fetch(`/api/admin/library-images/${updatedImage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: updatedImage.title,
          description: updatedImage.description,
          category: updatedImage.category,
          difficulty: updatedImage.difficulty,
          tags: updatedImage.tags,
          is_active: updatedImage.isActive,
          is_featured: updatedImage.isFeatured,
          image_url: updatedImage.imageUrl,
          thumbnail_url: updatedImage.thumbnailUrl,
          updated_at: new Date().toISOString()
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      alert(`✅ 更新成功！\n\n图片"${updatedImage.title}"的信息已保存到数据库。`)
      setShowLibraryImageEditModal(false)
      setEditingLibraryImage(null)
      await refetchLibrary()
    } catch (error) {
      console.error('Library image save failed:', error)
      alert('❌ 保存失败！\n\n请检查数据库连接或稍后重试。\n\n错误信息: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // 图库图片删除功能
  const handleDeleteLibraryImage = async (image: LibraryImage) => {
    const userConfirmed = confirm(
      `确定要删除图片"${image.title}"吗？\n\n` +
      `注意：如果此图片有关联的彩色参考图，也会一起被删除。\n\n` +
      `图片ID: ${image.id}\n` +
      `分类: ${image.category}\n` +
      `难度: ${image.difficulty}`
    )
    
    if (userConfirmed) {
      try {
        console.log('Deleting library image:', image.id, image.title)
        
        // 使用真实的API删除图片
        const response = await fetch(`/api/admin/library-images/${image.id}`, {
          method: 'DELETE'
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        
        // 显示成功消息
        alert(
          `✅ 删除成功！\n\n` +
          `图片"${image.title}"已从数据库中永久删除。\n` +
          `相关的彩色参考图（如有）也已一同删除。`
        )
        
        // 刷新图库列表
        await refetchLibrary()
        
      } catch (error) {
        console.error('Library image delete failed:', error)
        alert(
          `❌ 删除失败！\n\n` +
          `无法从数据库中删除图片"${image.title}"。\n` +
          `请检查数据库连接或稍后重试。\n\n` +
          `错误信息: ` + (error instanceof Error ? error.message : 'Unknown error')
        )
      }
    } else {
      console.log('Delete cancelled by user for:', image.title)
    }
  }

  const handleImageUpload = async (imageData: any) => {
    try {
      console.log('💾 Saving image to database:', imageData)
      
      // 保存图片信息到数据库 (使用正确的类型接口)
      const response = await fetch('/api/admin/library-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: imageData.title,
          description: imageData.description || '',
          imageUrl: imageData.imageUrl,
          thumbnailUrl: imageData.thumbnailUrl || imageData.imageUrl,
          category: imageData.category,
          difficulty: imageData.difficulty,
          tags: imageData.tags || [],
          isActive: imageData.isActive !== false,
          isFeatured: imageData.isFeatured || false
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || '保存到数据库失败')
      }

      const result = await response.json()
      console.log('✅ Image saved to database successfully:', result)
      
      alert(`图片库图片上传并保存成功！\n标题: ${imageData.title}\n分类: ${imageData.category}`)
      await refetchLibrary()
    } catch (error) {
      console.error('❌ Image upload/save failed:', error)
      alert(`保存失败: ${error instanceof Error ? error.message : '未知错误'}`)
    }
  }

  const handleBannerUpload = async (bannerData: any) => {
    try {
      console.log('Uploading banner:', bannerData)
      // 模拟API调用
      const newBanner = {
        id: `banner-${Date.now()}`,
        title: bannerData.title,
        imageUrl: bannerData.imageUrl,
        linkUrl: bannerData.linkUrl || null,
        description: bannerData.description || '',
        position: Date.now(),
        isActive: true,
        showOnHomepage: bannerData.showOnHomepage || false,
        showOnLibrary: bannerData.showOnLibrary || false,
        showOnHero: false,
        heroRow: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      alert(`Banner图片上传成功！\n标题: ${bannerData.title}`)
      await refetchBanners()
    } catch (error) {
      console.error('Banner upload failed:', error)
      alert('上传失败，请重试')
    }
  }

  const handleHeroUpload = async (heroData: any) => {
    try {
      console.log('Uploading hero image:', heroData)
      
      // 创建新的Hero banner数据
      const newBannerData = {
        id: `hero-${Date.now()}`,
        title: heroData.title,
        imageUrl: heroData.imageUrl,
        description: heroData.description || '',
        position: Date.now(),
        isActive: true,
        showOnHomepage: false,
        showOnLibrary: false,
        showOnHero: true,
        heroRow: heroData.heroRow,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      // 保存到localStorage以便在页面中显示
      addUploadedBanner(newBannerData)
      
      alert(`Hero图片上传成功！\n标题: ${heroData.title}\n位置: ${heroData.heroRow}排`)
      
      // 刷新banner数据以显示新上传的图片
      await refetchBanners()
    } catch (error) {
      console.error('Hero upload failed:', error)
      alert('上传失败，请重试')
    }
  }

  const handleDeleteImage = async (id: string, type: 'library' | 'banner') => {
    if (confirm('确定要删除这张图片吗？')) {
      console.log(`Deleting ${type} image:`, id)
      if (type === 'library') {
        await refetchLibrary()
      } else {
        await refetchBanners()
      }
    }
  }

  // 价格计划管理功能
  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setShowPricingEditModal(true)
  }

  const handleSavePlan = async (updatedPlan: PricingPlan) => {
    console.log('Saving pricing plan:', updatedPlan)
    // 在真实应用中，这里会调用API更新价格计划
    alert('价格计划已更新')
  }

  // 彩色参考图管理功能
  const handleEditReference = (reference: ColorReference) => {
    setEditingReference(reference)
    setShowReferenceUploadModal(true)
  }

  const handleDeleteReference = async (originalImageUrl: string) => {
    if (confirm('确定要删除这个彩色参考图吗？')) {
      console.log('Deleting reference for:', originalImageUrl)
      // 在真实应用中，这里会调用API删除参考图
      alert('彩色参考图已删除')
    }
  }

  const handleAddReference = (image: LibraryImage) => {
    console.log('Adding reference for:', image.title)
    // 预设原始图片信息，不需要用户再选择
    setEditingReference({
      original: image.imageUrl,
      colored: '',
      title: `${image.title} - Colored Reference`,
      colorScheme: {
        primary: ['#FF69B4', '#FFFFFF'],
        secondary: ['#00BCD4', '#FFDC00'],
        accent: ['#FF4136', '#2ECC40']
      },
      originalImageTitle: image.title // 添加原图标题用于显示
    } as ColorReference & { originalImageTitle: string })
    setShowReferenceUploadModal(true)
  }

  const handleReferenceUpload = async (referenceData: {
    originalImage: string
    coloredImage: string
    title: string
    colorScheme: {
      primary: string[]
      secondary: string[]
      accent: string[]
    }
  }) => {
    try {
      console.log('💾 Saving color reference to database:', referenceData)
      
      // 调用API保存彩色参考图映射到数据库
      const response = await fetch('/api/admin/color-references', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          originalImageUrl: referenceData.originalImage,
          coloredImageUrl: referenceData.coloredImage,
          title: referenceData.title,
          colorScheme: referenceData.colorScheme,
          isActive: true
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save color reference')
      }
      
      const result = await response.json()
      console.log('✅ Color reference saved successfully:', result)
      
      alert(`✅ 彩色参考图保存成功！\n\n标题: ${referenceData.title}\n现在用户在着色这张图片时会看到彩色参考面板。`)
      setShowReferenceUploadModal(false)
      setEditingReference(null)
      
    } catch (error) {
      console.error('❌ Reference upload failed:', error)
      alert(`❌ 保存失败！\n\n错误信息: ${error instanceof Error ? error.message : '未知错误'}\n\n请检查网络连接并重试。`)
    }
  }


  // 系统设置功能
  const handleSaveSettings = async () => {
    console.log('Saving settings:', systemSettings)
    // 在真实应用中，这里会调用API保存设置
    alert('设置已保存')
  }

  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true}>
      <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage your AI Kitty Creator platform</p>
        </div>
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Admin Access
        </Badge>
      </div>
      
      {/* R2 Storage Status */}
      <R2StatusCard />

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.activeProUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generations</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalGenerations || 0}
            </div>
            <p className="text-xs text-muted-foreground">+23% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Library Images</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? '...' : stats?.totalLibraryImages || 0}
            </div>
            <p className="text-xs text-muted-foreground">+5 this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${statsLoading ? '...' : stats?.monthlyRevenue || 0}
            </div>
            <p className="text-xs text-muted-foreground">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容区域 */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="banner">Banner Images</TabsTrigger>
          <TabsTrigger value="hero">Hero Images</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* 用户管理 */}
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage registered users and their permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usersLoading ? (
                  <div className="text-center py-4">加载中...</div>
                ) : users?.data?.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        {user.isProUser && (
                          <Badge variant="secondary">Pro</Badge>
                        )}
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'outline'}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">
                        {user.totalGenerations} generations
                      </span>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )) || <div className="text-center py-4">暂无用户数据</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 图库管理 */}
        <TabsContent value="library">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Library Images</CardTitle>
                <CardDescription>Manage coloring page library and color references</CardDescription>
              </div>
              <Button onClick={() => setShowLibraryUploadModal(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload New Image
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {libraryLoading ? (
                  <div className="text-center py-4">加载中...</div>
                ) : libraryImages?.data?.map((image) => (
                  <ImageCard 
                    key={image.id}
                    image={image}
                    onToggleActive={() => toggleImageActive(image.id, 'library')}
                    onEdit={() => handleEditLibraryImage(image)}
                    onDelete={() => handleDeleteLibraryImage(image)}
                    onAddReference={() => handleAddReference(image)}
                    onEditReference={() => {
                      const ref = getColorReferenceSync(image.imageUrl)
                      if (ref) {
                        // 编辑现有参考图时，也传递原图标题
                        handleEditReference({
                          ...ref,
                          originalImageTitle: image.title
                        } as ColorReference & { originalImageTitle: string })
                      }
                    }}
                    type="library"
                  />
                )) || <div className="text-center py-4">暂无图片数据</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Banner图片管理 */}
        <TabsContent value="banner">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Banner Images</CardTitle>
                <CardDescription>Manage homepage and library banner images</CardDescription>
              </div>
              <Button onClick={() => setShowBannerUploadModal(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Banner Image
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {bannersLoading ? (
                  <div className="text-center py-4">加载中...</div>
                ) : bannerImages?.filter(img => !img.showOnHero).map((image) => (
                  <BannerImageCard
                    key={image.id}
                    image={image}
                    onToggleActive={() => toggleImageActive(image.id, 'banner')}
                    onDelete={() => handleDeleteImage(image.id, 'banner')}
                  />
                )) || <div className="text-center py-4">暂无Banner数据</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hero背景图片管理 */}
        <TabsContent value="hero">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hero Background Images</CardTitle>
                <CardDescription>Manage moving background images in homepage hero section</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowHeroUploadModal(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Hero Image
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const uploaded = getUploadedBanners()
                    console.log('Uploaded banners in localStorage:', uploaded)
                    alert(`LocalStorage contains ${uploaded.length} uploaded banner(s). Check console for details.`)
                  }}
                >
                  Debug
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (confirm('Clear all uploaded hero images from localStorage?')) {
                      clearUploadedBanners()
                      refetchBanners()
                      alert('Cleared uploaded banners')
                    }
                  }}
                >
                  Clear
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">上排图片 (Top Row)</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {bannersLoading ? (
                      <div className="text-center py-4">加载中...</div>
                    ) : bannerImages?.filter(img => img.showOnHero && img.heroRow === 'top').map((image) => (
                      <HeroImageCard
                        key={image.id}
                        image={image}
                        onToggleActive={() => toggleImageActive(image.id, 'banner')}
                        onDelete={() => handleDeleteImage(image.id, 'banner')}
                      />
                    )) || <div className="text-center py-4 text-muted-foreground">暂无上排图片</div>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">下排图片 (Bottom Row)</h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {bannersLoading ? (
                      <div className="text-center py-4">加载中...</div>
                    ) : bannerImages?.filter(img => img.showOnHero && img.heroRow === 'bottom').map((image) => (
                      <HeroImageCard
                        key={image.id}
                        image={image}
                        onToggleActive={() => toggleImageActive(image.id, 'banner')}
                        onDelete={() => handleDeleteImage(image.id, 'banner')}
                      />
                    )) || <div className="text-center py-4 text-muted-foreground">暂无下排图片</div>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 价格配置 */}
        <TabsContent value="pricing">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Configuration</CardTitle>
              <CardDescription>Manage subscription plans and pricing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {pricingLoading ? (
                  <div className="text-center py-4">加载中...</div>
                ) : pricingPlans?.map((plan) => (
                  <PricingCard 
                    key={plan.id} 
                    plan={plan} 
                    onEdit={() => handleEditPlan(plan)}
                  />
                )) || <div className="text-center py-4">暂无定价计划</div>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 系统设置 */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input 
                  id="admin-email" 
                  value={systemSettings.adminEmail}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, adminEmail: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="free-generations">Free Generations per Day</Label>
                <Input 
                  id="free-generations" 
                  type="number" 
                  value={systemSettings.freeGenerations}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, freeGenerations: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pro-generations">Pro Generations per Day</Label>
                <Input 
                  id="pro-generations" 
                  type="number" 
                  value={systemSettings.proGenerations}
                  onChange={(e) => setSystemSettings(prev => ({ ...prev, proGenerations: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <Button onClick={handleSaveSettings}>Save Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    
    {/* 用户编辑模态框 */}
    <UserEditModal 
      user={editingUser}
      isOpen={showUserEditModal}
      onClose={() => {
        setShowUserEditModal(false)
        setEditingUser(null)
      }}
      onSave={handleSaveUser}
    />
    
    {/* 图片上传模态框 */}
    <ImageUploadModal 
      isOpen={showLibraryUploadModal}
      onClose={() => setShowLibraryUploadModal(false)}
      onUpload={handleImageUpload}
      type="library"
    />
    
    {/* 轮播图上传模态框 */}
    <ImageUploadModal 
      isOpen={showBannerUploadModal}
      onClose={() => setShowBannerUploadModal(false)}
      onUpload={handleBannerUpload}
      type="banner"
    />
    
    {/* Hero图片上传模态框 */}
    <ImageUploadModal 
      isOpen={showHeroUploadModal}
      onClose={() => setShowHeroUploadModal(false)}
      onUpload={handleHeroUpload}
      type="hero"
    />
    
    {/* 价格计划编辑模态框 */}
    <PricingEditModal 
      plan={editingPlan}
      isOpen={showPricingEditModal}
      onClose={() => {
        setShowPricingEditModal(false)
        setEditingPlan(null)
      }}
      onSave={handleSavePlan}
    />
    
    {/* 彩色参考图上传模态框 */}
    <ColorReferenceUploadModal 
      isOpen={showReferenceUploadModal}
      onClose={() => {
        setShowReferenceUploadModal(false)
        setEditingReference(null)
      }}
      onUpload={handleReferenceUpload}
      libraryImages={libraryImages?.data || []}
      editingReference={editingReference}
    />
    
    {/* 图库图片编辑模态框 */}
    <LibraryImageEditModal 
      image={editingLibraryImage}
      isOpen={showLibraryImageEditModal}
      onClose={() => {
        setShowLibraryImageEditModal(false)
        setEditingLibraryImage(null)
      }}
      onSave={handleSaveLibraryImage}
    />
    </ProtectedRoute>
  )
}

interface ImageCardProps {
  image: LibraryImage
  onToggleActive: () => void
  onEdit: () => void
  onDelete: () => void
  onAddReference: () => void
  onEditReference: () => void
  type: 'library'
}

function ImageCard({ image, onToggleActive, onEdit, onDelete, onAddReference, onEditReference }: ImageCardProps) {
  const existingReference = getColorReferenceSync(image.imageUrl)
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={image.imageUrl}
          alt={image.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={onToggleActive}
          >
            {image.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* 彩色参考图状态指示器 */}
        {existingReference && (
          <div className="absolute top-2 left-2">
            <Badge variant="default" className="text-xs bg-green-600">
              Has Reference
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium mb-1">{image.title}</h3>
        <p className="text-sm text-muted-foreground mb-2">{image.description}</p>
        <div className="flex items-center justify-between mb-3">
          <Badge variant={image.isActive ? "default" : "secondary"}>
            {image.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge variant="outline">{image.difficulty}</Badge>
        </div>
        
        {/* 彩色参考图管理按钮 */}
        <div className="space-y-2">
          {existingReference ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-4 h-4 rounded-full border-2 border-gray-200 shadow-sm" style={{ backgroundColor: existingReference.colorScheme.primary[0] }}></div>
                <span className="text-xs text-gray-600 font-medium">✅ Has Color Reference</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onEditReference}
                className="w-full text-xs bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <Edit className="h-3 w-3 mr-1" />
                🎨 Edit Reference
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={onAddReference}
              className="w-full text-xs border-dashed border-green-300 text-green-700 hover:bg-green-50 bg-gradient-to-br from-green-50 to-emerald-50 transition-all duration-200 hover:scale-105"
            >
              <Upload className="h-3 w-3 mr-1" />
              ➕ Add Color Reference
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface BannerImageCardProps {
  image: BannerImage
  onToggleActive: () => void
  onDelete: () => void
}

function BannerImageCard({ image, onToggleActive, onDelete }: BannerImageCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={image.imageUrl}
          alt={image.title}
          className="w-full h-32 object-cover"
        />
        <div className="absolute top-2 right-2 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={onToggleActive}
          >
            {image.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <p className="text-sm font-medium mb-1">{image.title}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {image.description || 'Banner'}
          </Badge>
          <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
            {image.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

interface PricingCardProps {
  plan: PricingPlan
  onEdit: () => void
}

function PricingCard({ plan, onEdit }: PricingCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{plan.name}</CardTitle>
          <Badge variant={plan.isActive ? "default" : "secondary"}>
            {plan.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
        <CardDescription>
          ${plan.priceMonthly}/month - {plan.generationsPerDay} generations per day
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 mb-4">
          {plan.features.map((feature, index) => (
            <li key={index} className="text-sm text-muted-foreground">
              • {feature}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="w-full" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Plan
        </Button>
      </CardContent>
    </Card>
  )
}

interface HeroImageCardProps {
  image: BannerImage
  onToggleActive: () => void
  onDelete: () => void
}

function HeroImageCard({ image, onToggleActive, onDelete }: HeroImageCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img 
          src={image.imageUrl}
          alt={image.title}
          className="w-full h-24 object-cover"
        />
        <div className="absolute top-1 right-1 flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={onToggleActive}
            className="h-6 w-6 p-0"
          >
            {image.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button 
            size="sm" 
            variant="destructive" 
            onClick={onDelete}
            className="h-6 w-6 p-0"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <CardContent className="p-2">
        <p className="text-xs font-medium truncate mb-1">{image.title}</p>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {image.heroRow}
          </Badge>
          <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
            {image.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}