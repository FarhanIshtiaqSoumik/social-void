'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, BadgeCheck, Loader2, UserPlus, UserMinus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'

interface FollowUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
  bio: string | null
  isFollowing: boolean
  isSelf: boolean
}

interface FollowersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  type: 'followers' | 'following'
}

export function FollowersModal({ open, onOpenChange, userId, type }: FollowersModalProps) {
  const { token, user, setViewingUserId } = useAppStore()
  const { toast } = useToast()
  const [users, setUsers] = useState<FollowUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [followLoadingIds, setFollowLoadingIds] = useState<Set<string>>(new Set())

  const fetchUsers = useCallback(async () => {
    if (!token || !open) return
    setIsLoading(true)
    try {
      const res = await fetch(
        `/api/users/follows?userId=${userId}&type=${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [token, userId, type, open, toast])

  useEffect(() => {
    if (open) {
      fetchUsers()
      setSearchQuery('')
    }
  }, [open, fetchUsers])

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase()
    return users.filter(
      (u) =>
        u.username.toLowerCase().includes(q) ||
        (u.name && u.name.toLowerCase().includes(q))
    )
  }, [users, searchQuery])

  const handleFollowToggle = useCallback(
    async (targetUser: FollowUser) => {
      if (!token || targetUser.isSelf) return
      setFollowLoadingIds((prev) => new Set(prev).add(targetUser.id))

      // Optimistic update
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, isFollowing: !u.isFollowing }
            : u
        )
      )

      try {
        const res = await fetch('/api/users/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: targetUser.id }),
        })
        if (res.ok) {
          const data = await res.json()
          // Ensure state matches server response
          setUsers((prev) =>
            prev.map((u) =>
              u.id === targetUser.id
                ? { ...u, isFollowing: data.following }
                : u
            )
          )
        } else {
          // Revert on error
          setUsers((prev) =>
            prev.map((u) =>
              u.id === targetUser.id
                ? { ...u, isFollowing: targetUser.isFollowing }
                : u
            )
          )
          toast({
            title: 'Error',
            description: 'Failed to update follow status',
            variant: 'destructive',
          })
        }
      } catch {
        // Revert on error
        setUsers((prev) =>
          prev.map((u) =>
            u.id === targetUser.id
              ? { ...u, isFollowing: targetUser.isFollowing }
              : u
          )
        )
        toast({
          title: 'Error',
          description: 'Network error. Please try again.',
          variant: 'destructive',
        })
      } finally {
        setFollowLoadingIds((prev) => {
          const next = new Set(prev)
          next.delete(targetUser.id)
          return next
        })
      }
    },
    [token, toast]
  )

  const handleUserClick = useCallback(
    (userId: string) => {
      onOpenChange(false)
      setViewingUserId(userId)
    },
    [onOpenChange, setViewingUserId]
  )

  const title = type === 'followers' ? 'Followers' : 'Following'
  const emptyMessage =
    type === 'followers' ? 'No followers yet' : 'Not following anyone yet'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:ring-1 text-sm"
            />
          </div>
        </div>

        {/* User List */}
        <ScrollArea className="flex-1 max-h-[50vh]">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <UserRowSkeleton key={i} />
              ))}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <UserPlus className="size-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">{emptyMessage}</p>
            </div>
          ) : (
            <div className="py-1">
              {filteredUsers.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  isFollowLoading={followLoadingIds.has(u.id)}
                  onFollowToggle={handleFollowToggle}
                  onUserClick={handleUserClick}
                  currentUserId={user?.id}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function UserRow({
  user,
  isFollowLoading,
  onFollowToggle,
  onUserClick,
  currentUserId,
}: {
  user: FollowUser
  isFollowLoading: boolean
  onFollowToggle: (user: FollowUser) => void
  onUserClick: (userId: string) => void
  currentUserId?: string
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted/50 transition-colors">
      <button
        onClick={() => onUserClick(user.id)}
        className="flex items-center gap-3 flex-1 min-w-0 text-left"
      >
        <Avatar className="size-10 shrink-0">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
            {(user.name || user.username).charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold truncate">
              {user.name || user.username}
            </span>
            {user.isVerified && (
              <BadgeCheck className="size-4 text-blue-500 fill-blue-500/10 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        </div>
      </button>

      {/* Follow/Unfollow button */}
      {!user.isSelf && currentUserId && (
        <Button
          size="sm"
          variant={user.isFollowing ? 'outline' : 'default'}
          className={`shrink-0 h-8 text-xs px-3 ${
            user.isFollowing
              ? 'border-border hover:border-destructive/30 hover:text-destructive hover:bg-destructive/5'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
          onClick={() => onFollowToggle(user)}
          disabled={isFollowLoading}
        >
          {isFollowLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : user.isFollowing ? (
            <>
              <UserMinus className="size-3.5 mr-1" />
              Following
            </>
          ) : (
            <>
              <UserPlus className="size-3.5 mr-1" />
              Follow
            </>
          )}
        </Button>
      )}
    </div>
  )
}

function UserRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <Skeleton className="size-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-20 shrink-0" />
    </div>
  )
}
