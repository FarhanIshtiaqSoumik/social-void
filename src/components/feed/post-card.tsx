'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { formatDistanceToNow } from 'date-fns'
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Trash2,
  BadgeCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppStore } from '@/stores/app-store'
import { CommentsSection } from './comments-section'

// ── Mention username cache ────────────────────────────────────────────────────────────
const mentionCache = new Map<string, string>()

// ── MentionText: renders @username as clickable links ────────────────────────────────
function MentionText({ text, onMentionClick }: { text: string; onMentionClick?: (username: string) => void }) {
  if (!text) return null

  const parts: React.ReactNode[] = []
  const regex = /(@[a-zA-Z0-9_]{3,20})/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const username = match[1].slice(1) // remove @
    if (onMentionClick) {
      parts.push(
        <span
          key={`mention-${key++}`}
          className="text-teal-500 dark:text-teal-400 font-semibold cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            onMentionClick(username)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onMentionClick(username)
            }
          }}
        >
          {match[1]}
        </span>
      )
    } else {
      parts.push(
        <span key={`mention-${key++}`} className="text-teal-500 dark:text-teal-400 font-semibold">
          {match[1]}
        </span>
      )
    }
    lastIndex = regex.lastIndex
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts.length > 0 ? parts : text}</>
}

export interface PostAuthor {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
}

export interface PostData {
  id: string
  caption: string
  mediaUrls: string[]
  mediaType: string
  tags: string[]
  createdAt: string
  author: PostAuthor
  _count: {
    likes: number
    comments: number
  }
  isLiked: boolean
}

interface PostCardProps {
  post: PostData
  onUpdate?: (post: PostData) => void
  onDelete?: (postId: string) => void
}

export function PostCard({ post, onUpdate, onDelete }: PostCardProps) {
  const { token, user, setViewingUserId } = useAppStore()

  // Handle mention click: resolve username to user ID and navigate
  const handleMentionClick = useCallback(async (username: string) => {
    const cachedId = mentionCache.get(username)
    if (cachedId) {
      setViewingUserId(cachedId)
      return
    }
    try {
      const res = await fetch(`/api/users?username=${encodeURIComponent(username)}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data = await res.json()
        if (data.id) {
          mentionCache.set(username, data.id)
          setViewingUserId(data.id)
        }
      }
    } catch {
      // silently fail
    }
  }, [setViewingUserId, token])
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [showEchoPulse, setShowEchoPulse] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)

  const handleLike = useCallback(async () => {
    if (!token) return

    // Optimistic update
    const newLiked = !isLiked
    setIsLiked(newLiked)
    setLikeCount((prev) => (newLiked ? prev + 1 : prev - 1))

    if (newLiked) {
      setShowEchoPulse(true)
      setTimeout(() => setShowEchoPulse(false), 400)
    }

    try {
      const res = await fetch('/api/posts/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId: post.id }),
      })

      if (!res.ok) {
        // Revert on error
        setIsLiked(!newLiked)
        setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1))
      }
    } catch {
      setIsLiked(!newLiked)
      setLikeCount((prev) => (newLiked ? prev - 1 : prev + 1))
    }
  }, [token, post.id, isLiked])

  const handleDelete = useCallback(async () => {
    if (!token || !onDelete) return

    try {
      const res = await fetch(`/api/posts?id=${post.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        onDelete(post.id)
      }
    } catch {
      // Silently fail
    }
  }, [token, post.id, onDelete])

  const handleAuthorClick = useCallback(() => {
    setViewingUserId(post.author.id)
  }, [post.author.id, setViewingUserId])

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })

  return (
    <Card className="border-border bg-card overflow-hidden shadow-none hover:shadow-sm transition-shadow">
      <CardContent className="p-0">
        {/* Author Header */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
          <button
            onClick={handleAuthorClick}
            className="flex items-center gap-3 group min-w-0"
          >
            <Avatar className="size-9 sm:size-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
              {post.author.avatar && (
                <AvatarImage src={post.author.avatar} alt={post.author.username} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {(post.author.name || post.author.username).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                  {post.author.name || post.author.username}
                </span>
                {post.author.isVerified && (
                  <BadgeCheck className="size-4 text-blue-500 fill-blue-500/10 shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                @{post.author.username}
              </p>
            </div>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <span className="text-xs text-muted-foreground mr-1">{timeAgo}</span>
            {user?.id === post.author.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-9 text-muted-foreground">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Caption */}
        {post.caption && (
          <div className="px-3 sm:px-4 pb-2">
            <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-1">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => {
                    const url = href?.startsWith('http') ? href : `https://${href}`
                    return (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 underline">
                        {children}
                      </a>
                    )
                  },
                  p: ({ children }) => {
                    // Process children to render @mentions as clickable
                    const processNode = (node: React.ReactNode, idx: number): React.ReactNode => {
                      if (typeof node === 'string') {
                        return <MentionText key={`mention-${idx}`} text={node} onMentionClick={handleMentionClick} />
                      }
                      if (Array.isArray(node)) {
                        return <React.Fragment key={`group-${idx}`}>{node.map(processNode)}</React.Fragment>
                      }
                      return node
                    }
                    return <p>{(Array.isArray(children) ? children : [children]).map(processNode)}</p>
                  },
                }}
              >{post.caption}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="px-3 sm:px-4 pb-2">
            {post.mediaUrls.length === 1 ? (
              <div className="relative rounded-xl overflow-hidden bg-muted">
                <img
                  src={post.mediaUrls[0]}
                  alt="Post media"
                  className="w-full object-cover max-h-[500px]"
                  loading="lazy"
                />
              </div>
            ) : (
              <div className="relative">
                <Carousel className="w-full">
                  <CarouselContent>
                    {post.mediaUrls.map((url, index) => (
                      <CarouselItem key={index}>
                        <div className="relative rounded-xl overflow-hidden bg-muted">
                          <img
                            src={url}
                            alt={`Post media ${index + 1}`}
                            className="w-full object-cover max-h-[500px]"
                            loading="lazy"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-2 bg-background/80 hover:bg-background border-border size-8" />
                  <CarouselNext className="right-2 bg-background/80 hover:bg-background border-border size-8" />
                </Carousel>
                <div className="flex justify-center gap-1.5 mt-2">
                  {post.mediaUrls.map((_, index) => (
                    <div
                      key={index}
                      className="size-1.5 rounded-full bg-muted-foreground/30"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="px-3 sm:px-4 pb-2 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[11px] px-2 py-0 h-5 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            {/* Echo (Like) Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`gap-1.5 px-2 sm:px-3 min-h-[44px] ${
                isLiked
                  ? 'text-red-500 hover:text-red-500'
                  : 'text-muted-foreground hover:text-red-500'
              }`}
              onClick={handleLike}
            >
              <motion.div
                className={showEchoPulse ? 'echo-pulse' : ''}
                animate={showEchoPulse ? { scale: [1, 1.3, 0.95, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className={`size-[18px] ${isLiked ? 'fill-current' : ''}`}
                />
              </motion.div>
              <span className="text-xs font-medium">{likeCount > 0 ? likeCount : ''}</span>
            </Button>

            {/* Comment Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 px-2 sm:px-3 min-h-[44px] text-muted-foreground hover:text-primary"
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className="size-[18px]" />
              <span className="text-xs font-medium">
                {post._count.comments > 0 ? post._count.comments : ''}
              </span>
            </Button>

            {/* Share Button */}
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 px-2 sm:px-3 min-h-[44px] text-muted-foreground hover:text-primary"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ url: window.location.href })
                }
              }}
            >
              <Share2 className="size-[18px]" />
            </Button>
          </div>

          {/* Bookmark Button */}
          <Button
            variant="ghost"
            size="sm"
            className={`px-2 sm:px-3 min-h-[44px] ${
              isBookmarked
                ? 'text-primary hover:text-primary'
                : 'text-muted-foreground hover:text-primary'
            }`}
            onClick={() => setIsBookmarked(!isBookmarked)}
          >
            <Bookmark
              className={`size-[18px] ${isBookmarked ? 'fill-current' : ''}`}
            />
          </Button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <CommentsSection
                postId={post.id}
                commentCount={post._count.comments}
                onCommentAdded={() => {
                  if (onUpdate) {
                    onUpdate({
                      ...post,
                      _count: { ...post._count, comments: post._count.comments + 1 },
                    })
                  }
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/* Skeleton loader for post card */
export function PostCardSkeleton() {
  return (
    <Card className="border-border bg-card overflow-hidden shadow-none">
      <CardContent className="p-4">
        {/* Author skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="size-10 rounded-full skeleton-shimmer" />
          <div className="flex-1">
            <div className="h-3.5 w-24 rounded skeleton-shimmer mb-1.5" />
            <div className="h-3 w-16 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Caption skeleton */}
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full rounded skeleton-shimmer" />
          <div className="h-3 w-3/4 rounded skeleton-shimmer" />
        </div>

        {/* Image skeleton */}
        <div className="h-64 rounded-xl skeleton-shimmer mb-3" />

        {/* Tags skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-5 w-14 rounded skeleton-shimmer" />
          <div className="h-5 w-18 rounded skeleton-shimmer" />
        </div>

        {/* Action bar skeleton */}
        <div className="flex items-center gap-3 pt-2 border-t border-border/50">
          <div className="h-8 w-16 rounded skeleton-shimmer" />
          <div className="h-8 w-16 rounded skeleton-shimmer" />
          <div className="h-8 w-10 rounded skeleton-shimmer" />
        </div>
      </CardContent>
    </Card>
  )
}
