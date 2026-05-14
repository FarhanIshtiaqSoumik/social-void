'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  Search,
  X,
  BadgeCheck,
  UserPlus,
  UserMinus,
  MessageCircle,
  PartyPopper,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/stores/app-store'
import { toast } from 'sonner'

interface MutualFriend {
  id: string
  username: string
  name: string | null
  avatar: string | null
}

interface SuggestedUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
  bio: string | null
  mutualCount: number
  mutualFriends: MutualFriend[]
  isFollowing: boolean
  isSelf: boolean
}

interface FriendRequestItem {
  id: string
  createdAt: string
  sender: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
  receiver: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    isVerified: boolean
  }
}

type FilterType = 'all' | 'suggested' | 'most-mutual'

export function DiscoverView() {
  const { token, user, setViewingUserId, setViewingChatId } = useAppStore()
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [followLoading, setFollowLoading] = useState<string | null>(null)
  const [messageLoading, setMessageLoading] = useState<string | null>(null)

  // Friend requests state
  const [friendRequests, setFriendRequests] = useState<FriendRequestItem[]>([])
  const [sentRequests, setSentRequests] = useState<FriendRequestItem[]>([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(true)
  const [showFriendRequests, setShowFriendRequests] = useState(false)
  const [friendActionLoading, setFriendActionLoading] = useState<string | null>(null)
  const [addFriendLoading, setAddFriendLoading] = useState<string | null>(null)

  const fetchSuggestions = useCallback(async () => {
    if (!token) return

    try {
      setIsLoading(true)
      const res = await fetch('/api/users/follows?type=suggestions', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        const data = await res.json()
        setSuggestions(data.users || [])
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [token])

  const fetchFriendRequests = useCallback(async () => {
    if (!token) return
    setIsLoadingRequests(true)
    try {
      const [receivedRes, sentRes] = await Promise.all([
        fetch('/api/friends?type=received', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/friends?type=sent', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])
      if (receivedRes.ok) {
        const data = await receivedRes.json()
        setFriendRequests(data.requests || [])
      }
      if (sentRes.ok) {
        const data = await sentRes.json()
        setSentRequests(data.requests || [])
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoadingRequests(false)
    }
  }, [token])

  useEffect(() => {
    fetchSuggestions()
    fetchFriendRequests()
  }, [fetchSuggestions, fetchFriendRequests])

  // Build a set of user IDs that have pending friend requests sent by us
  const sentRequestUserIds = new Set(sentRequests.map((r) => r.receiver.id))

  const handleFollow = useCallback(
    async (userId: string, isFollowing: boolean) => {
      if (!token) return
      setFollowLoading(userId)

      // Optimistic update
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === userId ? { ...s, isFollowing: !isFollowing } : s
        )
      )

      try {
        const res = await fetch('/api/users/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId,
            action: isFollowing ? 'unfollow' : 'follow',
          }),
        })

        if (!res.ok) {
          // Revert
          setSuggestions((prev) =>
            prev.map((s) =>
              s.id === userId ? { ...s, isFollowing } : s
            )
          )
          toast.error(isFollowing ? 'Failed to unfollow' : 'Failed to follow')
        }
      } catch {
        setSuggestions((prev) =>
          prev.map((s) =>
            s.id === userId ? { ...s, isFollowing } : s
          )
        )
        toast.error('Something went wrong')
      } finally {
        setFollowLoading(null)
      }
    },
    [token]
  )

  const handleMessage = useCallback(
    async (userId: string) => {
      if (!token) return
      setMessageLoading(userId)

      try {
        const res = await fetch('/api/chats', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userIds: [userId],
            isGroup: false,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          setViewingChatId(data.chat.id)
        } else {
          toast.error('Failed to start conversation')
        }
      } catch {
        toast.error('Something went wrong')
      } finally {
        setMessageLoading(null)
      }
    },
    [token, setViewingChatId]
  )

  // Accept/reject friend request
  const handleFriendAction = useCallback(
    async (requestId: string, action: 'accept' | 'reject') => {
      if (!token) return
      setFriendActionLoading(requestId)
      try {
        const res = await fetch('/api/friends', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requestId, action }),
        })
        if (res.ok) {
          setFriendRequests((prev) => prev.filter((r) => r.id !== requestId))
          toast.success(action === 'accept' ? 'Friend request accepted!' : 'Friend request rejected')
          fetchSuggestions()
        } else {
          const data = await res.json()
          toast.error(data.error || `Failed to ${action} friend request`)
        }
      } catch {
        toast.error('Something went wrong')
      } finally {
        setFriendActionLoading(null)
      }
    },
    [token, fetchSuggestions]
  )

  // Send friend request
  const handleAddFriend = useCallback(
    async (userId: string) => {
      if (!token) return
      setAddFriendLoading(userId)
      try {
        const res = await fetch('/api/friends', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        })
        if (res.ok) {
          // Add to sent requests
          const data = await res.json()
          if (data.request) {
            setSentRequests((prev) => [...prev, data.request])
          }
          toast.success('Friend request sent!')
        } else {
          const data = await res.json()
          toast.error(data.error || 'Failed to send friend request')
        }
      } catch {
        toast.error('Something went wrong')
      } finally {
        setAddFriendLoading(null)
      }
    },
    [token]
  )

  // Filter and search
  const filteredSuggestions = suggestions
    .filter((s) => !s.isSelf)
    .filter((s) => {
      if (activeFilter === 'suggested') return s.mutualCount > 0
      if (activeFilter === 'most-mutual') return s.mutualCount >= 2
      return true
    })
    .filter((s) => {
      if (!searchQuery.trim()) return true
      const q = searchQuery.toLowerCase()
      return (
        s.username.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q))
      )
    })
    .sort((a, b) => {
      if (activeFilter === 'most-mutual') return b.mutualCount - a.mutualCount
      return b.mutualCount - a.mutualCount
    })

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'suggested', label: 'Suggested' },
    { key: 'most-mutual', label: 'Most Mutual' },
  ]

  const pendingCount = friendRequests.length

  return (
    <div className="max-w-[900px] mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <Users className="size-5 text-primary" />
          <div>
            <h1 className="text-lg sm:text-xl font-bold">People</h1>
            <p className="text-xs text-muted-foreground">
              People you may know based on mutual friends
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-primary"
          onClick={() => { fetchSuggestions(); fetchFriendRequests() }}
          disabled={isLoading}
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Friend Requests Section */}
      {pendingCount > 0 && (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <button
            onClick={() => setShowFriendRequests(!showFriendRequests)}
            className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <UserPlus className="size-5 text-primary" />
                <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full">
                  {pendingCount}
                </span>
              </div>
              <div>
                <span className="text-sm font-semibold">Friend Requests</span>
                <p className="text-xs text-muted-foreground">
                  {pendingCount} pending {pendingCount === 1 ? 'request' : 'requests'}
                </p>
              </div>
            </div>
            {showFriendRequests ? (
              <ChevronUp className="size-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="size-5 text-muted-foreground" />
            )}
          </button>

          <AnimatePresence>
            {showFriendRequests && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="border-t border-border divide-y divide-border">
                  {isLoadingRequests ? (
                    [1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <Skeleton className="size-10 rounded-full" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-4 w-24 rounded" />
                          <Skeleton className="h-3 w-32 rounded" />
                        </div>
                      </div>
                    ))
                  ) : (
                    friendRequests.map((request) => (
                      <div
                        key={request.id}
                        className="flex items-center gap-3 p-4"
                      >
                        <button
                          onClick={() => setViewingUserId(request.sender.id)}
                          className="shrink-0"
                        >
                          <Avatar className="size-10 hover:ring-2 hover:ring-primary/30 transition-all">
                            {request.sender.avatar && (
                              <AvatarImage src={request.sender.avatar} alt={request.sender.username} />
                            )}
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                              {(request.sender.name || request.sender.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setViewingUserId(request.sender.id)}
                              className="text-sm font-semibold truncate hover:text-primary transition-colors"
                            >
                              {request.sender.name || request.sender.username}
                            </button>
                            {request.sender.isVerified && (
                              <BadgeCheck className="size-3.5 text-blue-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            sent you a friend request · {formatTimeAgo(request.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-white text-xs min-h-[36px] h-8 px-3"
                            onClick={() => handleFriendAction(request.id, 'accept')}
                            disabled={friendActionLoading === request.id}
                          >
                            {friendActionLoading === request.id ? (
                              <RefreshCw className="size-3 animate-spin" />
                            ) : (
                              <UserCheck className="size-3.5 mr-1" />
                            )}
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs min-h-[36px] h-8 px-3 border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                            onClick={() => handleFriendAction(request.id, 'reject')}
                            disabled={friendActionLoading === request.id}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 pr-9 h-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:bg-background transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 size-5 rounded-full bg-muted hover:bg-muted-foreground/20 flex items-center justify-center transition-colors"
          >
            <X className="size-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all min-h-[32px] ${
              activeFilter === filter.key
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {filter.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
          {filteredSuggestions.length} {filteredSuggestions.length === 1 ? 'person' : 'people'}
        </span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PeopleCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSuggestions.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
            {suggestions.length === 0 ? (
              <PartyPopper className="size-8 text-muted-foreground" />
            ) : (
              <Search className="size-8 text-muted-foreground" />
            )}
          </div>
          <h3 className="text-lg font-semibold mb-2">
            {suggestions.length === 0
              ? "You're connected with everyone! 🎉"
              : 'No matching people'}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {suggestions.length === 0
              ? 'No suggestions right now. Check back later for new people to connect with.'
              : 'Try a different search term or filter.'}
          </p>
        </motion.div>
      ) : (
        /* People Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence mode="popLayout">
            {filteredSuggestions.map((person, index) => (
              <motion.div
                key={person.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2, delay: Math.min(index * 0.04, 0.3) }}
              >
                <PeopleCard
                  person={person}
                  currentUserId={user?.id || ''}
                  onFollow={handleFollow}
                  onMessage={handleMessage}
                  onUserClick={setViewingUserId}
                  followLoading={followLoading}
                  messageLoading={messageLoading}
                  onAddFriend={handleAddFriend}
                  addFriendLoading={addFriendLoading}
                  hasPendingRequest={sentRequestUserIds.has(person.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

function PeopleCard({
  person,
  currentUserId,
  onFollow,
  onMessage,
  onUserClick,
  followLoading,
  messageLoading,
  onAddFriend,
  addFriendLoading,
  hasPendingRequest,
}: {
  person: SuggestedUser
  currentUserId: string
  onFollow: (userId: string, isFollowing: boolean) => void
  onMessage: (userId: string) => void
  onUserClick: (userId: string) => void
  followLoading: string | null
  messageLoading: string | null
  onAddFriend: (userId: string) => void
  addFriendLoading: string | null
  hasPendingRequest: boolean
}) {
  const isOwnProfile = person.id === currentUserId

  return (
    <Card className="border-border bg-card overflow-hidden shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="p-4 flex flex-col items-center text-center">
        {/* Avatar */}
        <button
          onClick={() => onUserClick(person.id)}
          className="group mb-3"
        >
          <Avatar className="size-16 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
            {person.avatar && <AvatarImage src={person.avatar} alt={person.username} />}
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
              {(person.name || person.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>

        {/* Name & Username */}
        <button
          onClick={() => onUserClick(person.id)}
          className="group w-full"
        >
          <div className="flex items-center justify-center gap-1">
            <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
              {person.name || person.username}
            </span>
            {person.isVerified && (
              <BadgeCheck className="size-4 text-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">
            @{person.username}
          </p>
        </button>

        {/* Bio */}
        {person.bio && (
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {person.bio}
          </p>
        )}

        {/* Mutual Friends */}
        {person.mutualCount > 0 && (
          <div className="mt-3 flex items-center gap-1.5 w-full justify-center">
            <div className="flex -space-x-1.5">
              {person.mutualFriends.slice(0, 2).map((friend) => (
                <Avatar key={friend.id} className="size-5 ring-1 ring-background">
                  {friend.avatar && <AvatarImage src={friend.avatar} alt={friend.username} />}
                  <AvatarFallback className="bg-muted text-[8px] font-medium">
                    {(friend.name || friend.username).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
              {person.mutualCount} mutual {person.mutualCount === 1 ? 'friend' : 'friends'}
              {person.mutualFriends.length < person.mutualCount && (
                <span className="text-primary">
                  {' '}+{person.mutualCount - person.mutualFriends.length}
                </span>
              )}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="mt-3 w-full space-y-2">
            {/* Add Friend / Pending button */}
            {hasPendingRequest ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full min-h-[44px] sm:h-8 text-xs font-medium border-border text-muted-foreground"
                disabled
              >
                <Clock className="size-3 mr-1" />
                Pending
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="w-full min-h-[44px] sm:h-8 text-xs font-medium border-primary/30 text-primary hover:bg-primary/10"
                onClick={() => onAddFriend(person.id)}
                disabled={addFriendLoading === person.id}
              >
                {addFriendLoading === person.id ? (
                  <RefreshCw className="size-3 animate-spin" />
                ) : (
                  <UserPlus className="size-3 mr-1" />
                )}
                Add Friend
              </Button>
            )}

            {/* Follow / Unfollow */}
            <Button
              size="sm"
              className={`w-full min-h-[44px] sm:h-8 text-xs font-medium ${
                person.isFollowing
                  ? 'bg-destructive hover:bg-destructive/90 text-white'
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
              onClick={() => onFollow(person.id, person.isFollowing)}
              disabled={followLoading === person.id}
            >
              {followLoading === person.id ? (
                <RefreshCw className="size-3 animate-spin" />
              ) : person.isFollowing ? (
                <>
                  <UserMinus className="size-3 mr-1" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="size-3 mr-1" />
                  Follow
                </>
              )}
            </Button>

            {/* Message */}
            <Button
              size="sm"
              variant="outline"
              className="w-full min-h-[44px] sm:h-8 text-xs font-medium border-border hover:bg-muted"
              onClick={() => onMessage(person.id)}
              disabled={messageLoading === person.id}
            >
              {messageLoading === person.id ? (
                <RefreshCw className="size-3 animate-spin" />
              ) : (
                <>
                  <MessageCircle className="size-3 mr-1" />
                  Message
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PeopleCardSkeleton() {
  return (
    <Card className="border-border bg-card overflow-hidden shadow-none">
      <CardContent className="p-4 flex flex-col items-center text-center">
        <Skeleton className="size-16 rounded-full mb-3" />
        <Skeleton className="h-4 w-24 rounded mb-1.5" />
        <Skeleton className="h-3 w-16 rounded mb-2" />
        <Skeleton className="h-3 w-full rounded mb-1" />
        <Skeleton className="h-3 w-3/4 rounded mb-3" />
        <div className="flex items-center gap-1.5 mb-3">
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="size-5 rounded-full" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
        <Skeleton className="h-8 w-full rounded mb-2" />
        <Skeleton className="h-8 w-full rounded mb-2" />
        <Skeleton className="h-8 w-full rounded" />
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
