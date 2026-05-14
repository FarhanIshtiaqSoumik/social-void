'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Send, Reply, CornerDownRight, Loader2 } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/app-store'

// ── Mention username cache & helper ──────────────────────────────────────────────────
const commentMentionCache = new Map<string, string>()

function MentionText({ text, onMentionClick }: { text: string; onMentionClick?: (username: string) => void }) {
  if (!text) return null
  const parts: React.ReactNode[] = []
  const regex = /(@[a-zA-Z0-9_]{3,20})/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    const username = match[1].slice(1)
    if (onMentionClick) {
      parts.push(
        <span
          key={`mention-${key++}`}
          className="text-teal-500 dark:text-teal-400 font-semibold cursor-pointer hover:underline"
          onClick={(e) => { e.stopPropagation(); onMentionClick(username) }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onMentionClick(username) } }}
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
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <>{parts.length > 0 ? parts : text}</>
}

interface CommentAuthor {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
}

interface CommentData {
  id: string
  content: string
  createdAt: string
  postId: string
  parentId: string | null
  author: CommentAuthor
  _count: {
    likes: number
    replies: number
  }
  replies?: CommentData[]
}

interface CommentsSectionProps {
  postId: string
  commentCount: number
  onCommentAdded?: () => void
}

export function CommentsSection({ postId, commentCount, onCommentAdded }: CommentsSectionProps) {
  const { token, user, setViewingUserId } = useAppStore()

  // Handle mention click in comments
  const handleMentionClick = useCallback(async (username: string) => {
    const cachedId = commentMentionCache.get(username)
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
          commentMentionCache.set(username, data.id)
          setViewingUserId(data.id)
        }
      }
    } catch {
      // silently fail
    }
  }, [setViewingUserId, token])
  const [comments, setComments] = useState<CommentData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<{ id: string; username: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/comments?postId=${postId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments || [])
      }
    } catch {
      // Silently fail
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const handleSubmitComment = useCallback(async () => {
    if (!token || !newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/posts/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newComment.trim(),
          postId,
          parentId: replyingTo?.id || undefined,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const newCommentData = data.comment

        if (replyingTo?.id) {
          // Add reply to the parent comment's replies
          setComments((prev) =>
            prev.map((comment) => {
              if (comment.id === replyingTo.id) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), newCommentData],
                  _count: {
                    ...comment._count,
                    replies: comment._count.replies + 1,
                  },
                }
              }
              return comment
            })
          )
        } else {
          // Add as top-level comment
          setComments((prev) => [newCommentData, ...prev])
        }

        setNewComment('')
        setReplyingTo(null)
        onCommentAdded?.()
      }
    } catch {
      // Silently fail
    } finally {
      setIsSubmitting(false)
    }
  }, [token, newComment, postId, replyingTo, isSubmitting, onCommentAdded])

  const handleReply = useCallback((commentId: string, username: string) => {
    setReplyingTo({ id: commentId, username })
    inputRef.current?.focus()
  }, [])

  const handleAuthorClick = useCallback(
    (userId: string) => {
      setViewingUserId(userId)
    },
    [setViewingUserId]
  )

  if (isLoading) {
    return (
      <div className="px-4 py-3 space-y-3 border-t border-border/50">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2.5">
            <div className="size-7 rounded-full skeleton-shimmer shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-24 rounded skeleton-shimmer" />
              <div className="h-3 w-full rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="border-t border-border/50">
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="max-h-96 overflow-y-auto custom-scrollbar px-4 py-3 space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={handleReply}
              onAuthorClick={handleAuthorClick}
              onMentionClick={handleMentionClick}
            />
          ))}
        </div>
      )}

      {comments.length === 0 && (
        <div className="px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No echoes yet. Be the first to comment.
          </p>
        </div>
      )}

      {/* Reply indicator */}
      {replyingTo && (
        <>
          <Separator />
          <div className="px-4 py-2 flex items-center gap-2 bg-muted/30">
            <CornerDownRight className="size-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              Replying to{' '}
              <span className="text-primary font-medium">@{replyingTo.username}</span>
            </span>
            <button
              onClick={() => setReplyingTo(null)}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {/* New Comment Input */}
      <div className="px-4 py-3 flex items-center gap-2 border-t border-border/50">
        <Avatar className="size-7 shrink-0">
          {user?.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
          <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
            {(user?.name || user?.username || 'U').charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 flex items-center gap-2">
          <Input
            ref={inputRef}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmitComment()
              }
            }}
            placeholder={replyingTo ? `Reply to @${replyingTo.username}...` : 'Add a comment...'}
            className="h-8 text-sm border-border/50 focus-visible:ring-primary/30"
            disabled={isSubmitting}
          />
          <Button
            size="icon"
            className="size-8 shrink-0 bg-primary hover:bg-primary/90 text-white"
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* Individual Comment Item */
function CommentItem({
  comment,
  onReply,
  onAuthorClick,
  onMentionClick,
  depth = 0,
}: {
  comment: CommentData
  onReply: (id: string, username: string) => void
  onAuthorClick: (userId: string) => void
  onMentionClick?: (username: string) => void
  depth?: number
}) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  return (
    <div className={depth > 0 ? 'ml-8 pl-3 border-l-2 border-primary/20' : ''}>
      <div className="flex gap-2.5">
        <button onClick={() => onAuthorClick(comment.author.id)} className="shrink-0">
          <Avatar className="size-7 ring-1 ring-transparent hover:ring-primary/30 transition-all">
            {comment.author.avatar && (
              <AvatarImage src={comment.author.avatar} alt={comment.author.username} />
            )}
            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
              {(comment.author.name || comment.author.username).charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAuthorClick(comment.author.id)}
              className="text-xs font-semibold hover:text-primary transition-colors truncate"
            >
              {comment.author.name || comment.author.username}
            </button>
            <span className="text-[10px] text-muted-foreground">{timeAgo}</span>
          </div>
          <p className="text-sm text-foreground/90 mt-0.5 break-words"><MentionText text={comment.content} onMentionClick={onMentionClick} /></p>
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={() => onReply(comment.id, comment.author.username)}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <Reply className="size-3" />
              Reply
            </button>
            {comment._count.likes > 0 && (
              <span className="text-[11px] text-muted-foreground">
                {comment._count.likes} {comment._count.likes === 1 ? 'like' : 'likes'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onAuthorClick={onAuthorClick}
              onMentionClick={onMentionClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
