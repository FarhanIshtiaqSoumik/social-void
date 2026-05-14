'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'

interface EditProfileModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onProfileUpdated: () => void
}

const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'fun-emoji', 'lorelei', 'micah', 'notionists', 'pixel-art', 'personas']
const AVATAR_SEEDS = ['void1', 'void2', 'void3', 'void4', 'void5', 'void6', 'void7', 'void8', 'void9', 'void10', 'shadow', 'dark', 'light', 'fire', 'ice', 'storm', 'mist', 'dawn', 'dusk', 'star', 'moon', 'sun', 'nova', 'cosmic']

const avatarOptions = AVATAR_STYLES.flatMap(style =>
  AVATAR_SEEDS.slice(0, 3).map(seed => ({
    url: `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`,
    label: `${style} - ${seed}`
  }))
).slice(0, 24)

export function EditProfileModal({ open, onOpenChange, onProfileUpdated }: EditProfileModalProps) {
  const { user, token, setUser } = useAppStore()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [website, setWebsite] = useState('')
  const [avatar, setAvatar] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Populate form with current user data
  useEffect(() => {
    if (open && user) {
      setName(user.name || '')
      setBio(user.bio || '')
      setWebsite(user.website || '')
      setAvatar(user.avatar || '')
      setIsPrivate(user.isPrivate || false)
      setAvatarPreview(user.avatar || null)
    }
  }, [open, user])

  // Update avatar preview
  useEffect(() => {
    if (avatar) {
      setAvatarPreview(avatar)
    } else {
      setAvatarPreview(null)
    }
  }, [avatar])

  const handleSave = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await fetch('/api/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name || null,
          bio: bio || null,
          website: website || null,
          avatar: avatar || null,
          isPrivate,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // Update the store with new user data
        const updatedUser = {
          ...user!,
          ...data.user,
        }
        setUser(updatedUser, token)
        // Also update localStorage
        localStorage.setItem('void-user', JSON.stringify(updatedUser))

        toast({
          title: 'Profile Updated',
          description: 'Your profile has been saved successfully.',
        })
        onProfileUpdated()
        onOpenChange(false)
      } else {
        const data = await res.json()
        toast({
          title: 'Update Failed',
          description: data.error || 'Something went wrong',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your profile information. Changes will be visible immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Avatar Preview + Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Avatar className="size-16 border-2 border-border shrink-0">
                {avatarPreview && <AvatarImage src={avatarPreview} alt="Preview" />}
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold font-mono">
                  V
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label>Avatar</Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Choose an avatar from the grid below
                </p>
              </div>
            </div>

            {/* Avatar Selection Grid */}
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {avatarOptions.map((option) => {
                const isSelected = avatar === option.url
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setAvatar(option.url)}
                    className={`relative size-10 sm:size-12 rounded-lg overflow-hidden transition-all ${
                      isSelected
                        ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
                        : 'ring-1 ring-border hover:ring-primary/50 hover:scale-105'
                    }`}
                    title={option.label}
                    disabled={isLoading}
                  >
                    <img
                      src={option.url}
                      alt={option.label}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                )
              })}
            </div>

            {/* Clear avatar option */}
            {avatar && (
              <button
                type="button"
                onClick={() => setAvatar('')}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
                disabled={isLoading}
              >
                Remove avatar
              </button>
            )}
          </div>

          <Separator />

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">Display Name</Label>
            <Input
              id="edit-name"
              placeholder="Your display name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              maxLength={50}
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="edit-bio">Bio</Label>
            <Textarea
              id="edit-bio"
              placeholder="Tell the void about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={isLoading}
              maxLength={160}
              className="min-h-20 resize-none"
            />
            <p className="text-[11px] text-muted-foreground text-right">
              {bio.length}/160
            </p>
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="edit-website">Website</Label>
            <Input
              id="edit-website"
              placeholder="https://yourwebsite.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Separator />

          {/* Private Account Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="edit-private" className="cursor-pointer">
                Private Account
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Only approved followers can see your posts
              </p>
            </div>
            <Switch
              id="edit-private"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90 text-white min-w-[80px]"
          >
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              'Save'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
