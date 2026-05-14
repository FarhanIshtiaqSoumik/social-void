'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin,
  LinkIcon,
  Calendar,
  BadgeCheck,
  Loader2,
  MessageSquare,
  Lock,
  Settings,
  Scale,
  LogOut,
  Ban,
  Unlock,
  MoreHorizontal,
} from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'
import { PostCard } from '@/components/feed/post-card'
import { EditProfileModal } from './edit-profile-modal'
import { FollowersModal } from './followers-modal'
import { toast as sonnerToast } from 'sonner'

interface UserProfile {
  id: string
  username: string
  name: string | null
  email: string
  avatar: string | null
  bio: string | null
  website: string | null
  isPrivate: boolean
  isVerified: boolean
  isAdmin: boolean
  createdAt: string
  _count: {
    posts: number
    followers: number
    following: number
  }
  isFollowing: boolean
}

interface Post {
  id: string
  caption: string | null
  mediaUrls: string[]
  mediaType: string
  tags: string[]
  createdAt: string
  author: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
  _count: {
    likes: number
    comments: number
  }
  isLiked: boolean
}

interface BlockedUser {
  id: string
  createdAt: string
  user: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
}

export function ProfileView() {
  const { user, token, viewingUserId, setViewingUserId, setViewingChatId, setCurrentView, setViewingLegalPage, logout } = useAppStore()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)

  // Block system state
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockLoading, setBlockLoading] = useState(false)

  const isOwnProfile = !viewingUserId || viewingUserId === user?.id

  const fetchProfile = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const url = viewingUserId
        ? `/api/users?id=${viewingUserId}`
        : '/api/users'
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setIsFollowing(data.isFollowing)
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load profile', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }, [token, viewingUserId, toast])

  // Fetch blocked status when viewing another user's profile
  const fetchBlockStatus = useCallback(async () => {
    if (!token || isOwnProfile || !viewingUserId) return
    try {
      const res = await fetch('/api/blocks', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const blockedUsers: BlockedUser[] = data.blockedUsers || []
        setIsBlocked(blockedUsers.some((b) => b.user.id === viewingUserId))
      }
    } catch {
      // Silently fail
    }
  }, [token, isOwnProfile, viewingUserId])

  const fetchPosts = useCallback(async () => {
    if (!token) return
    setIsLoadingPosts(true)
    try {
      const userId = viewingUserId || user?.id
      const res = await fetch(`/api/posts?type=user&userId=${userId}&limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setPosts(data.posts || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to load posts', variant: 'destructive' })
    } finally {
      setIsLoadingPosts(false)
    }
  }, [token, viewingUserId, user?.id, toast])

  useEffect(() => {
    fetchProfile()
    fetchPosts()
    fetchBlockStatus()
  }, [fetchProfile, fetchPosts, fetchBlockStatus])

  const handleFollowToggle = async () => {
    if (!token || !profile) return
    setFollowLoading(true)
    try {
      const res = await fetch('/api/users/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: profile.id }),
      })
      if (res.ok) {
        const data = await res.json()
        setIsFollowing(data.following)
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                _count: {
                  ...prev._count,
                  followers: prev._count.followers + (data.following ? 1 : -1),
                },
              }
            : prev
        )
        toast({
          title: data.following ? 'Following' : 'Unfollowed',
          description: data.following
            ? `You are now following @${profile.username}`
            : `You unfollowed @${profile.username}`,
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update follow status', variant: 'destructive' })
    } finally {
      setFollowLoading(false)
    }
  }

  const handleProfileUpdated = () => {
    fetchProfile()
  }

  const handleMessage = async () => {
    if (!token || !profile) return
    setMessageLoading(true)
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: [profile.id],
          isGroup: false,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setViewingChatId(data.chat.id)
      } else {
        toast({ title: 'Error', description: 'Failed to start conversation', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to start conversation', variant: 'destructive' })
    } finally {
      setMessageLoading(false)
    }
  }

  // Block user
  const handleBlock = async () => {
    if (!token || !profile) return
    setBlockLoading(true)
    try {
      const res = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: profile.id }),
      })
      if (res.ok) {
        setIsBlocked(true)
        sonnerToast.success(`Blocked @${profile.username}`)
      } else {
        const data = await res.json()
        sonnerToast.error(data.error || 'Failed to block user')
      }
    } catch {
      sonnerToast.error('Something went wrong')
    } finally {
      setBlockLoading(false)
    }
  }

  // Unblock user
  const handleUnblock = async () => {
    if (!token || !profile) return
    setBlockLoading(true)
    try {
      const res = await fetch('/api/blocks', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: profile.id }),
      })
      if (res.ok) {
        setIsBlocked(false)
        sonnerToast.success(`Unblocked @${profile.username}`)
      } else {
        const data = await res.json()
        sonnerToast.error(data.error || 'Failed to unblock user')
      }
    } catch {
      sonnerToast.error('Something went wrong')
    } finally {
      setBlockLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    toast({
      title: 'Logged Out',
      description: 'You have been logged out of Social Void.',
    })
  }

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
        <div className="flex flex-col items-center gap-4 mb-6">
          <Skeleton className="size-24 rounded-full" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="flex justify-center gap-8 mb-6">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-16" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6 text-center">
        <div className="py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold text-muted-foreground font-mono">V</span>
          </div>
          <h2 className="text-lg font-semibold mb-1">User Not Found</h2>
          <p className="text-sm text-muted-foreground">This user doesn&apos;t exist or has been voided.</p>
        </div>
      </div>
    )
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
      {/* Back button for other user profiles */}
      {!isOwnProfile && (
        <button
          onClick={() => setViewingUserId(null)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          ← Back to profile
        </button>
      )}

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center"
      >
        {/* Avatar */}
        <div className="relative mb-4">
          <Avatar className="size-20 sm:size-24 border-2 border-border">
            {profile.avatar && <AvatarImage src={profile.avatar} alt={profile.username} />}
            <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold font-mono">
              V
            </AvatarFallback>
          </Avatar>
          {profile.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5">
              <BadgeCheck className="size-4 sm:size-5 text-blue-500 fill-blue-500/10" />
            </div>
          )}
        </div>

        {/* Name & Username */}
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-xl font-bold">{profile.name || profile.username}</h1>
          {profile.isPrivate && (
            <Lock className="size-3.5 text-muted-foreground" />
          )}
        </div>
        <p className="text-sm text-muted-foreground mb-3">@{profile.username}</p>

        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          {profile.isAdmin && (
            <Badge variant="secondary" className="text-xs gap-1">
              <ShieldIcon className="size-3" />
              Admin
            </Badge>
          )}
          {profile.isPrivate && (
            <Badge variant="outline" className="text-xs gap-1">
              <Lock className="size-3" />
              Private
            </Badge>
          )}
          {isBlocked && (
            <Badge variant="destructive" className="text-xs gap-1">
              <Ban className="size-3" />
              Blocked
            </Badge>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="text-sm text-foreground/90 max-w-sm mb-3 whitespace-pre-wrap leading-relaxed">
            {profile.bio}
          </p>
        )}

        {/* Website */}
        {profile.website && (
          <a
            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-primary hover:underline mb-3"
          >
            <LinkIcon className="size-3.5" />
            {profile.website.replace(/^https?:\/\//, '')}
          </a>
        )}

        {/* Join Date */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
          <Calendar className="size-3.5" />
          <span>Joined {joinDate}</span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 sm:gap-6 mb-5">
          <button className="flex flex-col items-center group py-1 px-2 min-h-[44px] justify-center">
            <span className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors">
              {profile._count.posts}
            </span>
            <span className="text-xs text-muted-foreground">Posts</span>
          </button>
          <button
            onClick={() => setShowFollowersModal(true)}
            className="flex flex-col items-center group py-1 px-2 min-h-[44px] justify-center"
          >
            <span className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors">
              {profile._count.followers}
            </span>
            <span className="text-xs text-muted-foreground">Followers</span>
          </button>
          <button
            onClick={() => setShowFollowingModal(true)}
            className="flex flex-col items-center group py-1 px-2 min-h-[44px] justify-center"
          >
            <span className="text-base sm:text-lg font-bold group-hover:text-primary transition-colors">
              {profile._count.following}
            </span>
            <span className="text-xs text-muted-foreground">Following</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center mb-2">
          {isOwnProfile ? (
            <>
              <Button
                variant="outline"
                className="rounded-full px-5 sm:px-6 min-h-[44px]"
                onClick={() => setShowEditModal(true)}
              >
                Edit Profile
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5 sm:px-6 min-h-[44px]"
                onClick={() => setCurrentView('settings')}
              >
                <Settings className="size-4 mr-1.5" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5 sm:px-6 min-h-[44px]"
                onClick={() => setViewingLegalPage('privacy')}
              >
                <Scale className="size-4 mr-1.5" />
                Legal
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full px-5 sm:px-6 min-h-[44px] text-muted-foreground hover:text-destructive hover:border-destructive/30"
                  >
                    <LogOut className="size-4 mr-1.5" />
                    Logout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Log out of Social Void?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account. You can always log back in.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleLogout}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Logout
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          ) : (
            <>
              <Button
                className={`rounded-full px-5 sm:px-6 min-h-[44px] ${
                  isFollowing
                    ? 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
                    : 'bg-primary text-white hover:bg-primary/90'
                }`}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? (
                  <Loader2 className="size-4 animate-spin mr-1" />
                ) : isFollowing ? (
                  'Following'
                ) : (
                  'Follow'
                )}
              </Button>
              <Button
                variant="outline"
                className="rounded-full px-5 sm:px-6 min-h-[44px]"
                onClick={handleMessage}
                disabled={messageLoading}
              >
                {messageLoading ? (
                  <Loader2 className="size-4 mr-1.5 animate-spin" />
                ) : (
                  <MessageSquare className="size-4 mr-1.5" />
                )}
                Message
              </Button>

              {/* Block / Unblock */}
              {isBlocked ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="rounded-full px-5 sm:px-6 min-h-[44px] text-destructive border-destructive/30 hover:bg-destructive/10"
                      disabled={blockLoading}
                    >
                      {blockLoading ? (
                        <Loader2 className="size-4 animate-spin mr-1.5" />
                      ) : (
                        <Unlock className="size-4 mr-1.5" />
                      )}
                      Unblock
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unblock @{profile.username}?</AlertDialogTitle>
                      <AlertDialogDescription>
                        They will be able to see your profile and send you messages again.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleUnblock}>
                        Unblock
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full min-h-[44px] min-w-[44px] text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="size-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={(e) => e.preventDefault()}
                        >
                          <Ban className="size-4 mr-2" />
                          Block User
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Block @{profile.username}?</AlertDialogTitle>
                          <AlertDialogDescription>
                            They won&apos;t be able to see your profile or send you messages. You can unblock them later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleBlock}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Block
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </motion.div>

      <Separator className="my-6" />

      {/* Void History Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Void History
          </h2>
        </div>
      </div>

      {/* Posts Content - Full Post Cards */}
      {isLoadingPosts ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl font-bold text-muted-foreground font-mono">V</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">The Void is Empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">No posts yet. When posts are made, they&apos;ll appear here in the void.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDelete={(id) => setPosts(prev => prev.filter(p => p.id !== id))} />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      {isOwnProfile && (
        <EditProfileModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          onProfileUpdated={handleProfileUpdated}
        />
      )}

      {/* Followers Modal */}
      {profile && (
        <FollowersModal
          open={showFollowersModal}
          onOpenChange={setShowFollowersModal}
          userId={profile.id}
          type="followers"
        />
      )}

      {/* Following Modal */}
      {profile && (
        <FollowersModal
          open={showFollowingModal}
          onOpenChange={setShowFollowingModal}
          userId={profile.id}
          type="following"
        />
      )}
    </div>
  )
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
