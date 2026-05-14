'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, ImageIcon, Video, Loader2, Type, AtSign } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useAppStore } from '@/stores/app-store'
import { toast } from 'sonner'

const MAX_CAPTION_LENGTH = 2000

interface MentionUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
}

export function CreatePostModal() {
  const { showCreatePost, setShowCreatePost, token, incrementFeedRefreshKey } = useAppStore()
  const [caption, setCaption] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([''])
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image')
  const [tagsInput, setTagsInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionResults, setMentionResults] = useState<MentionUser[]>([])
  const [mentionSelectedIndex, setMentionSelectedIndex] = useState(0)
  const [mentionLoading, setMentionLoading] = useState(false)
  const mentionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Parse tags from comma-separated input
  const tags = tagsInput
    .split(',')
    .map((t) => t.trim().replace(/^#/, ''))
    .filter(Boolean)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [caption])

  // Detect @mention query from textarea
  const detectMentionQuery = useCallback((value: string): string | null => {
    // Find the last @
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex === -1) return null

    // Check if @ is at start or preceded by whitespace
    if (lastAtIndex > 0 && !/\s/.test(value[lastAtIndex - 1])) return null

    // Extract text after @
    const textAfterAt = value.slice(lastAtIndex + 1)

    // If there's a space, mention is complete
    if (textAfterAt.includes(' ')) return null

    // Only match valid username prefix
    if (textAfterAt && !/^[a-zA-Z0-9_]*$/.test(textAfterAt)) return null

    // Limit query length
    if (textAfterAt.length > 20) return null

    return textAfterAt
  }, [])

  // Fetch mention results with debounce
  const fetchMentionResults = useCallback((query: string) => {
    if (mentionDebounceRef.current) {
      clearTimeout(mentionDebounceRef.current)
    }
    mentionDebounceRef.current = setTimeout(async () => {
      setMentionLoading(true)
      try {
        const res = await fetch(`/api/users?type=search&q=${encodeURIComponent(query)}`)
        if (res.ok) {
          const data = await res.json()
          setMentionResults((data.users || []).slice(0, 5))
          setMentionSelectedIndex(0)
        }
      } catch {
        // silently fail
      } finally {
        setMentionLoading(false)
      }
    }, 300)
  }, [])

  // Handle caption change with mention detection
  const handleCaptionChange = useCallback((value: string) => {
    setCaption(value)

    // Mention detection
    const query = detectMentionQuery(value)
    setMentionQuery(query)
    if (query !== null) {
      fetchMentionResults(query.length > 0 ? query : '')
    } else {
      setMentionResults([])
      if (mentionDebounceRef.current) {
        clearTimeout(mentionDebounceRef.current)
      }
    }
  }, [detectMentionQuery, fetchMentionResults])

  // Select a mention from dropdown
  const handleMentionSelect = useCallback((mentionUser: MentionUser) => {
    const value = caption
    const lastAtIndex = value.lastIndexOf('@')
    if (lastAtIndex === -1) return

    const before = value.slice(0, lastAtIndex)
    const after = value.slice(lastAtIndex)
    const afterMatch = after.match(/^@[a-zA-Z0-9_]*/)
    const afterText = afterMatch ? after.slice(afterMatch[0].length) : after

    const newValue = `${before}@${mentionUser.username} ${afterText}`
    setCaption(newValue)
    setMentionQuery(null)
    setMentionResults([])

    // Focus and move cursor
    setTimeout(() => {
      textareaRef.current?.focus()
      const cursorPos = before.length + mentionUser.username.length + 2
      textareaRef.current?.setSelectionRange(cursorPos, cursorPos)
    }, 0)
  }, [caption])

  // Handle keydown in textarea with mention navigation
  const handleCaptionKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionSelectedIndex((prev) =>
          prev < mentionResults.length - 1 ? prev + 1 : 0
        )
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : mentionResults.length - 1
        )
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        handleMentionSelect(mentionResults[mentionSelectedIndex])
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        setMentionQuery(null)
        setMentionResults([])
        return
      }
    }
  }, [mentionQuery, mentionResults, mentionSelectedIndex, handleMentionSelect])

  const handleAddMediaUrl = useCallback(() => {
    setMediaUrls((prev) => [...prev, ''])
  }, [])

  const handleRemoveMediaUrl = useCallback((index: number) => {
    setMediaUrls((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleMediaUrlChange = useCallback((index: number, value: string) => {
    setMediaUrls((prev) => prev.map((url, i) => (i === index ? value : url)))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!token || !caption.trim()) return

    const validMediaUrls = mediaUrls.filter((url) => url.trim())

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caption: caption.trim(),
          mediaUrls: validMediaUrls,
          mediaType,
          tags,
        }),
      })

      if (res.ok) {
        toast.success('Post created!', {
          description: 'Your echo has been sent into the void.',
        })
        // Trigger feed refresh
        incrementFeedRefreshKey()
        // Reset form
        setCaption('')
        setMediaUrls([''])
        setTagsInput('')
        setMediaType('image')
        setMentionQuery(null)
        setMentionResults([])
        setShowCreatePost(false)
      } else {
        const data = await res.json()
        toast.error('Failed to create post', {
          description: data.error || 'Something went wrong.',
        })
      }
    } catch {
      toast.error('Failed to create post', {
        description: 'Network error. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [token, caption, mediaUrls, mediaType, tags, setShowCreatePost, incrementFeedRefreshKey])

  const handleClose = useCallback(() => {
    setShowCreatePost(false)
  }, [setShowCreatePost])

  const charCount = caption.length
  const isOverLimit = charCount > MAX_CAPTION_LENGTH
  const canSubmit = caption.trim() && !isOverLimit && !isSubmitting

  return (
    <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="size-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-white font-mono">V</span>
            </div>
            Create Post
          </DialogTitle>
          <DialogDescription>
            Share your thoughts with the void.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Media Type Selector */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mediaType === 'image' ? 'default' : 'outline'}
              size="sm"
              className={`gap-1.5 ${
                mediaType === 'image'
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setMediaType('image')}
            >
              <ImageIcon className="size-4" />
              Image
            </Button>
            <Button
              type="button"
              variant={mediaType === 'video' ? 'default' : 'outline'}
              size="sm"
              className={`gap-1.5 ${
                mediaType === 'video'
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setMediaType('video')}
            >
              <Video className="size-4" />
              Video
            </Button>
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={caption}
                onChange={(e) => handleCaptionChange(e.target.value)}
                onKeyDown={handleCaptionKeyDown}
                placeholder="What's on your mind? (Markdown supported, @ to mention)"
                className="w-full min-h-[100px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                maxLength={MAX_CAPTION_LENGTH + 100}
              />

              {/* Mention Autocomplete Dropdown */}
              <AnimatePresence>
                {mentionQuery !== null && mentionResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="absolute left-0 right-0 bottom-full mb-1 bg-popover border border-border rounded-lg shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      <div className="px-3 py-1.5 text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                        <AtSign className="size-3" />
                        Mention someone
                      </div>
                      {mentionResults.map((mu, idx) => (
                        <button
                          key={mu.id}
                          type="button"
                          className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
                            idx === mentionSelectedIndex
                              ? 'bg-primary/10 text-foreground'
                              : 'hover:bg-muted text-foreground'
                          }`}
                          onClick={() => handleMentionSelect(mu)}
                          onMouseEnter={() => setMentionSelectedIndex(idx)}
                        >
                          <Avatar className="size-7 shrink-0">
                            {mu.avatar && <AvatarImage src={mu.avatar} alt={mu.username} />}
                            <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                              {(mu.name || mu.username).charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate">{mu.name || mu.username}</p>
                            <p className="text-[10px] text-muted-foreground truncate">@{mu.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Mention loading indicator */}
              {mentionQuery !== null && mentionLoading && mentionResults.length === 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-1 bg-popover border border-border rounded-lg shadow-lg p-3 flex items-center gap-2 z-50">
                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Searching users...</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Type className="size-3" />
                Markdown & @mentions supported
              </span>
              <span
                className={`text-[11px] font-medium ${
                  isOverLimit ? 'text-destructive' : charCount > MAX_CAPTION_LENGTH * 0.9 ? 'text-amber-500' : 'text-muted-foreground'
                }`}
              >
                {charCount}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>

          <Separator />

          {/* Media URLs */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <ImageIcon className="size-4 text-muted-foreground" />
              Media URLs
            </label>
            <AnimatePresence>
              {mediaUrls.map((url, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2"
                >
                  <Input
                    value={url}
                    onChange={(e) => handleMediaUrlChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-9 text-sm flex-1"
                  />
                  {mediaUrls.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => handleRemoveMediaUrl(index)}
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {mediaUrls.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs w-full border-dashed"
                onClick={handleAddMediaUrl}
              >
                <Plus className="size-3.5" />
                Add another media URL
              </Button>
            )}
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="technology, art, music (comma-separated)"
              className="h-9 text-sm"
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
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
          </div>

          {/* Preview */}
          {mediaUrls.some((url) => url.trim()) && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Preview</label>
              <div className="grid grid-cols-2 gap-2">
                {mediaUrls
                  .filter((url) => url.trim())
                  .map((url, index) => (
                    <div
                      key={index}
                      className="relative rounded-lg overflow-hidden bg-muted aspect-square"
                    >
                      {mediaType === 'image' ? (
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <Video className="size-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Submit Button */}
          <Button
            className="w-full bg-primary hover:bg-primary/90 text-white h-10 font-semibold"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Posting...
              </>
            ) : (
              'Echo into the Void'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
