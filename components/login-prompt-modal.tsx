"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, User } from "lucide-react"
import Link from "next/link"

interface LoginPromptModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  actionText?: string
}

export function LoginPromptModal({
  open,
  onOpenChange,
  title = "Login to Continue",
  description = "Please log in to your account to use the favorites feature",
  actionText = "Favorite"
}: LoginPromptModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/30 rounded-lg p-4 my-4">
          <div className="flex items-center gap-3 text-sm">
            <User className="w-4 h-4 text-muted-foreground" />
            <div>
              <p className="font-medium">After logging in, you can:</p>
              <ul className="text-muted-foreground mt-1 space-y-1">
                <li>• Save your favorite images</li>
                <li>• Sync favorites across all devices</li>
                <li>• Manage your personal collection</li>
                <li>• Access more personalized features</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
Maybe Later
          </Button>
          <Button asChild>
            <Link href="/login" onClick={() => onOpenChange(false)}>
              Login Now
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}