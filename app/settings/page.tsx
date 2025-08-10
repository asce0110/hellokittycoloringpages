"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Crown, Settings, User, Bell, Palette } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"

export default function SettingsPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    autoSaveFavorites: false,
    highQualityDownloads: false,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Update form data when user data loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
      })
      setPreferences(prev => ({
        ...prev,
        highQualityDownloads: user.isProUser || false,
      }))
    }
  }, [user])

  const handleSaveChanges = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      // Here you would make an API call to update user data
      // For now, we'll just show a success message
      console.log('Saving changes:', { formData, preferences })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert('✅ Settings saved successfully!')
    } catch (error) {
      console.error('Save failed:', error)
      alert('❌ Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    
    const confirmed = confirm(
      `⚠️ Are you sure you want to delete your account?\n\n` +
      `This action cannot be undone. All your data will be permanently deleted:\n` +
      `• Your account information\n` +
      `• All generated coloring pages\n` +
      `• Your favorites and preferences\n` +
      `• Your subscription (if any)\n\n` +
      `Type "DELETE" in the next prompt to confirm.`
    )
    
    if (!confirmed) return
    
    const verification = prompt('Please type "DELETE" to confirm account deletion:')
    if (verification !== 'DELETE') {
      alert('Account deletion cancelled.')
      return
    }
    
    setIsDeleting(true)
    try {
      // Here you would make an API call to delete the account
      console.log('Deleting account for user:', user.id)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      alert('❌ Account deletion is not implemented yet. Please contact support.')
      
      // In a real implementation, you would:
      // 1. Call API to delete user data
      // 2. Log out the user
      // 3. Redirect to homepage
      
    } catch (error) {
      console.error('Delete failed:', error)
      alert('❌ Failed to delete account. Please contact support.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (!user) {
    return (
      <ProtectedRoute requireAuth={true}>
        <div className="container mx-auto py-8 px-4 max-w-4xl">
          <div className="text-center py-8">Loading...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Information
            </CardTitle>
            <CardDescription>
              Manage your personal information and account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Display Name</Label>
                <Input 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Account Status</p>
                <div className="flex gap-2 mt-1">
                  {user.isProUser ? (
                    <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro User
                    </Badge>
                  ) : (
                    <Badge variant="outline">Free User</Badge>
                  )}
                  {user.role === 'admin' && (
                    <Badge variant="destructive">Admin</Badge>
                  )}
                </div>
              </div>
              {!user.isProUser && (
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </Button>
              )}
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your AI Kitty Creator experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about new features and generations
                </p>
              </div>
              <Switch 
                checked={preferences.emailNotifications}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Auto-save Favorites</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save generated images to favorites
                </p>
              </div>
              <Switch 
                checked={preferences.autoSaveFavorites}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSaveFavorites: checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">High Quality Downloads</Label>
                <p className="text-sm text-muted-foreground">
                  Download images in higher resolution (Pro feature)
                </p>
              </div>
              <Switch 
                disabled={!user.isProUser} 
                checked={preferences.highQualityDownloads}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, highQualityDownloads: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Usage Statistics
            </CardTitle>
            <CardDescription>
              Track your activity and generation limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{user.generationsToday}</div>
                <p className="text-sm text-muted-foreground">Today's Generations</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{user.totalGenerations}</div>
                <p className="text-sm text-muted-foreground">Total Generations</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {user.isProUser ? "100" : "3"}
                </div>
                <p className="text-sm text-muted-foreground">Daily Limit</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions that affect your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
              <div>
                <p className="font-medium text-red-600">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Account"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  )
}