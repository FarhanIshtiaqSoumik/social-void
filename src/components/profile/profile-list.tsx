'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Heart, MessageCircle, FileText, ImageOff } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { CommentsSection } from '@/components/feed/comments-section'

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

interface ProfileListProps {
  posts: Post[]
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) return `${diffDays}d`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function ProfileList({ posts }: ProfileListProps) {
  const { token } = useAppStore()
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [postStates, setPostStates] = useState<Record<string, {
    isLiked: boolean
    likeCount: number
    showComments: boolean
  }>>({})

  const handleImageLoad = (key: string) => {
    setLoadedImages((prev) => new Set(prev).add(key))
  }

  const getPostState = useCallback((post: Post) => {
    return postStates[post.id] || {
      isLiked: post.isLiked,
      likeCount: post._count.likes,
      showComments: false,
    }
  }, [postStates])

  const handleLike = useCallback(async (postId: string) => {
    if (!token) return

    const currentState = postStates[postId] || { isLiked: false, likeCount: 0 }
    const newLiked = !currentState.isLiked

    // Optimistic update
    setPostStates((prev) => ({
      ...prev,
      [postId]: {
        ...currentState,
        isLiked: newLiked,
        likeCount: newLiked ? currentState.likeCount + 1 : currentState.likeCount - 1,
      },
    }))

    try {
      const res = await fetch('/api/posts/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      })

      if (!res.ok) {
        // Revert on error
        setPostStates((prev) => ({
          ...prev,
          [postId]: {
            ...(prev[postId] || currentState),
            isLiked: !newLiked,
            likeCount: newLiked ? currentState.likeCount - 1 : currentState.likeCount + 1,
          },
        }))
      }
    } catch {
      // Revert on error
      setPostStates((prev) => ({
        ...prev,
        [postId]: {
          ...(prev[postId] || currentState),
          isLiked: !newLiked,
          likeCount: newLiked ? currentState.likeCount - 1 : currentState.likeCount + 1,
        },
      }))
    }
  }, [token, postStates])

  const handleToggleComments = useCallback((postId: string) => {
    setPostStates((prev) => {
      const currentState = prev[postId] || { isLiked: false, likeCount: 0, showComments: false }
      return {
        ...prev,
        [postId]: {
          ...currentState,
          showComments: !currentState.showComments,
        },
      }
    })
  }, [])

  // Empty state
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <FileText className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">The Void is Empty</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No posts yet. When posts are made, they&apos;ll appear here in the void.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => {
        const hasMedia = post.mediaUrls && post.mediaUrls.length > 0
        const timeAgo = formatTimeAgo(post.createdAt)
        const state = getPostState(post)

        return (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
            className="rounded-xl border border-border bg-card overflow-hidden hover:border-border/80 transition-colors"
          >
            {/* Post Header */}
            <div className="flex items-center gap-3 p-3 sm:p-4 pb-2">
              <Avatar className="size-9">
                {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.username} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {(post.author.name || post.author.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold truncate">
                    {post.author.name || post.author.username}
                  </span>
                  {post.author.isVerified && (
                    <svg className="size-3.5 text-blue-500 fill-blue-500/10" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" fill="none" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">@{post.author.username}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">{timeAgo}</span>
            </div>

            {/* Caption */}
            {post.caption && (
              <div className="px-4 pb-2">
                <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-headings:my-1">
                  <ReactMarkdown>{post.caption}</ReactMarkdown>
                </div>
              </div>
            )}

            {/* Media */}
            {hasMedia && (
              <div className={`px-4 pb-2 ${post.mediaUrls.length > 1 ? 'grid grid-cols-2 gap-1' : ''}`}>
                {post.mediaUrls.slice(0, 4).map((url, i) => {
                  const imgKey = `${post.id}-${i}`
                  const isLoaded = loadedImages.has(imgKey)

                  return (
                    <div
                      key={i}
                      className={`relative overflow-hidden rounded-lg bg-muted ${
                        post.mediaUrls!.length === 1 ? 'max-h-96' : 'aspect-square'
                      } ${post.mediaUrls!.length === 3 && i === 0 ? 'col-span-2 aspect-video' : ''}`}
                    >
                      {!isLoaded && (
                        <div className="absolute inset-0 bg-muted animate-pulse" />
                      )}
                      <img
                        src={url}
                        alt={`Post media ${i + 1}`}
                        loading="lazy"
                        onLoad={() => handleImageLoad(imgKey)}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${
                          isLoaded ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      {/* Show "+N more" overlay on the 4th image if there are more */}
                      {i === 3 && post.mediaUrls!.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-lg font-semibold">
                            +{post.mediaUrls!.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1">
                {post.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Engagement */}
            <div className="flex items-center gap-4 px-3 sm:px-4 py-2.5 border-t border-border/50">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 text-sm transition-colors min-h-[44px] px-1 ${
                  state.isLiked
                    ? 'text-red-500 hover:text-red-500'
                    : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className={`size-4 ${state.isLiked ? 'fill-current' : ''}`} />
                <span>{state.likeCount > 0 ? state.likeCount : ''}</span>
              </button>
              <button
                onClick={() => handleToggleComments(post.id)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] px-1"
              >
                <MessageCircle className="size-4" />
                <span>{post._count.comments > 0 ? post._count.comments : ''}</span>
              </button>
            </div>

            {/* Comments Section */}
            <AnimatePresence>
              {state.showComments && (
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
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.article>
        )
      })}
    </div>
  )
}
