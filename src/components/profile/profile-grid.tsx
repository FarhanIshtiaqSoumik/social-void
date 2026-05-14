'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Heart, MessageCircle, ImageOff, X, Send, Loader2, BadgeCheck } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'
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

interface ProfileGridProps {
  posts: Post[]
}

export function ProfileGrid({ posts }: ProfileGridProps) {
  const { token, user, setViewingUserId } = useAppStore()
  const { toast } = useToast()
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set())
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  // Detail view like states
  const [detailIsLiked, setDetailIsLiked] = useState(false)
  const [detailLikeCount, setDetailLikeCount] = useState(0)
  const [showDetailComments, setShowDetailComments] = useState(false)
  const [showEchoPulse, setShowEchoPulse] = useState(false)

  const handleImageLoad = (postId: string) => {
    setLoadedImages((prev) => new Set(prev).add(postId))
  }

  const handleImageError = (postId: string) => {
    setFailedImages((prev) => new Set(prev).add(postId))
  }

  const handleOpenPostDetail = useCallback((post: Post) => {
    setSelectedPost(post)
    setDetailIsLiked(post.isLiked)
    setDetailLikeCount(post._count.likes)
    setShowDetailComments(false)
  }, [])

  const handleClosePostDetail = useCallback(() => {
    setSelectedPost(null)
  }, [])

  const handleDetailLike = useCallback(async () => {
    if (!token || !selectedPost) return

    const newLiked = !detailIsLiked
    setDetailIsLiked(newLiked)
    setDetailLikeCount((prev) => (newLiked ? prev + 1 : prev - 1))

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
        body: JSON.stringify({ postId: selectedPost.id }),
      })

      if (!res.ok) {
        setDetailIsLiked(!newLiked)
        setDetailLikeCount((prev) => (newLiked ? prev - 1 : prev + 1))
      }
    } catch {
      setDetailIsLiked(!newLiked)
      setDetailLikeCount((prev) => (newLiked ? prev - 1 : prev + 1))
    }
  }, [token, selectedPost, detailIsLiked])

  // Empty state
  if (posts.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ImageOff className="size-7 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">The Void is Empty</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          No posts yet. When posts are made, they&apos;ll appear here in the void.
        </p>
      </motion.div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
        {posts.map((post, index) => {
          const hasMedia = post.mediaUrls && post.mediaUrls.length > 0
          const thumbnailUrl = hasMedia ? post.mediaUrls[0] : null
          const imageKey = `${post.id}-0`
          const isLoaded = loadedImages.has(imageKey)
          const isFailed = failedImages.has(imageKey)

          return (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => handleOpenPostDetail(post)}
              className="relative aspect-square group overflow-hidden bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-sm"
            >
              {thumbnailUrl && !isFailed ? (
                <>
                  {/* Lazy load with loading state */}
                  {!isLoaded && (
                    <div className="absolute inset-0 bg-muted animate-pulse" />
                  )}
                  <img
                    src={thumbnailUrl}
                    alt={post.caption || 'Post image'}
                    loading="lazy"
                    onLoad={() => handleImageLoad(imageKey)}
                    onError={() => handleImageError(imageKey)}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                </>
              ) : (
                /* Fallback for posts without media or failed images */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted">
                  <div className="w-2 h-2 rounded-full bg-primary/30 mb-1" />
                  {post.caption && (
                    <p className="text-[8px] text-muted-foreground px-2 text-center line-clamp-2 leading-tight">
                      {post.caption.slice(0, 40)}
                    </p>
                  )}
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex items-center gap-4 text-white">
                  <div className="flex items-center gap-1.5">
                    <Heart className="size-4 fill-white" />
                    <span className="text-sm font-semibold">{post._count.likes}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="size-4 fill-white" />
                    <span className="text-sm font-semibold">{post._count.comments}</span>
                  </div>
                </div>
              </div>

              {/* Multi-image indicator */}
              {post.mediaUrls && post.mediaUrls.length > 1 && (
                <div className="absolute top-1.5 right-1.5">
                  <div className="flex gap-0.5">
                    {post.mediaUrls.slice(0, 3).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 h-2 rounded-[1px] bg-white/80"
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.button>
          )
        })}
      </div>

      {/* Post Detail Modal/Overlay */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
            onClick={handleClosePostDetail}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-card rounded-xl max-w-lg w-full max-h-[85vh] overflow-y-auto custom-scrollbar shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-border/50">
                <button
                  onClick={() => setViewingUserId(selectedPost.author.id)}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <Avatar className="size-10 shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                    {selectedPost.author.avatar && (
                      <AvatarImage src={selectedPost.author.avatar} alt={selectedPost.author.username} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {(selectedPost.author.name || selectedPost.author.username).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {selectedPost.author.name || selectedPost.author.username}
                      </span>
                      {selectedPost.author.isVerified && (
                        <BadgeCheck className="size-4 text-blue-500 fill-blue-500/10 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      @{selectedPost.author.username}
                    </p>
                  </div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto size-8 shrink-0"
                  onClick={handleClosePostDetail}
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Media */}
              {selectedPost.mediaUrls && selectedPost.mediaUrls.length > 0 && (
                <div className="relative">
                  <img
                    src={selectedPost.mediaUrls[0]}
                    alt="Post media"
                    className="w-full max-h-96 object-cover"
                  />
                  {selectedPost.mediaUrls.length > 1 && (
                    <div className="flex gap-1 p-2 overflow-x-auto">
                      {selectedPost.mediaUrls.slice(1).map((url, i) => (
                        <img
                          key={i}
                          src={url}
                          alt={`Post media ${i + 2}`}
                          className="size-16 rounded-md object-cover shrink-0"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Caption */}
              {selectedPost.caption && (
                <div className="px-4 py-3">
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
                      }}
                    >{selectedPost.caption}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="px-4 pb-3 flex flex-wrap gap-1.5">
                  {selectedPost.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-[11px] px-2 py-0 h-5 border-primary/30 text-primary bg-primary/5"
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border/50">
                <div className="flex items-center gap-1">
                  {/* Like Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`gap-1.5 px-2 sm:px-3 min-h-[44px] ${
                      detailIsLiked
                        ? 'text-red-500 hover:text-red-500'
                        : 'text-muted-foreground hover:text-red-500'
                    }`}
                    onClick={handleDetailLike}
                  >
                    <motion.div
                      className={showEchoPulse ? 'echo-pulse' : ''}
                      animate={showEchoPulse ? { scale: [1, 1.3, 0.95, 1] } : {}}
                      transition={{ duration: 0.4 }}
                    >
                      <Heart
                        className={`size-[18px] ${detailIsLiked ? 'fill-current' : ''}`}
                      />
                    </motion.div>
                    <span className="text-xs font-medium">{detailLikeCount > 0 ? detailLikeCount : ''}</span>
                  </Button>

                  {/* Comment Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 px-2 sm:px-3 min-h-[44px] text-muted-foreground hover:text-primary"
                    onClick={() => setShowDetailComments(!showDetailComments)}
                  >
                    <MessageCircle className="size-[18px]" />
                    <span className="text-xs font-medium">
                      {selectedPost._count.comments > 0 ? selectedPost._count.comments : ''}
                    </span>
                  </Button>
                </div>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {showDetailComments && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CommentsSection
                      postId={selectedPost.id}
                      commentCount={selectedPost._count.comments}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
