'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  ImagePlus,
  Loader2,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/stores/app-store'
import { toast } from 'sonner'

interface CreateStoryModalProps {
  onClose: () => void
  onCreated: () => void
}

const DURATION_OPTIONS = [
  { label: '6h', value: 6 },
  { label: '12h', value: 12 },
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
]

export function CreateStoryModal({ onClose, onCreated }: CreateStoryModalProps) {
  const { token, user } = useAppStore()
  const [mediaUrl, setMediaUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [duration, setDuration] = useState(24)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [activeStoryCount, setActiveStoryCount] = useState<number | null>(null)

  // Check active story count on mount
  useEffect(() => {
    if (!token) return
    const checkStoryCount = async () => {
      try {
        const res = await fetch('/api/stories', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const ownStories = (data.authors || []).filter(
            (a: { userId: string }) => a.userId === user?.id
          )
          setActiveStoryCount(ownStories.length > 0 ? ownStories[0].storyCount : 0)
        }
      } catch {
        // Silently fail
      }
    }
    checkStoryCount()
  }, [token, user?.id])

  const handleMediaUrlChange = useCallback((url: string) => {
    setMediaUrl(url)
    setImageError(false)
    if (url.trim()) {
      setImagePreview(url.trim())
    } else {
      setImagePreview(null)
    }
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!token || !mediaUrl.trim()) return

    if (activeStoryCount !== null && activeStoryCount >= 5) {
      toast.error('You can have a maximum of 5 active stories at a time')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mediaUrl: mediaUrl.trim(),
          mediaType: 'image',
          caption: caption.trim() || null,
          duration,
        }),
      })

      if (res.ok) {
        toast.success('Story created!')
        onCreated()
        onClose()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create story')
      }
    } catch {
      toast.error('Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }, [token, mediaUrl, caption, duration, activeStoryCount, onCreated, onClose])

  const isAtLimit = activeStoryCount !== null && activeStoryCount >= 5

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="bg-card rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div className="flex items-center gap-2">
              <ImagePlus className="size-5 text-primary" />
              <h2 className="text-lg font-bold">Create Story</h2>
            </div>
            <button
              onClick={onClose}
              className="size-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
              type="button"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 space-y-4">
            {/* Max stories warning */}
            {isAtLimit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl"
              >
                <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                <p className="text-xs text-destructive">
                  You already have 5 active stories. Delete one before creating a new one.
                </p>
              </motion.div>
            )}

            {/* Image URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Image URL</label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={mediaUrl}
                onChange={(e) => handleMediaUrlChange(e.target.value)}
                disabled={isAtLimit}
                className="bg-muted/50"
              />
              <p className="text-[10px] text-muted-foreground">
                Paste a direct link to an image (JPG, PNG, GIF, WebP)
              </p>
            </div>

            {/* Image Preview */}
            {imagePreview && (
              <div className="space-y-1">
                <label className="text-sm font-medium">Preview</label>
                <div className="relative aspect-[9/16] max-h-[300px] w-full bg-muted/50 rounded-xl overflow-hidden border border-border/50">
                  {!imageError ? (
                    <img
                      src={imagePreview}
                      alt="Story preview"
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                      <AlertTriangle className="size-6" />
                      <p className="text-xs">Failed to load image</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Caption */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Caption (optional)</label>
              <Textarea
                placeholder="Add a caption to your story..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={200}
                rows={2}
                disabled={isAtLimit}
                className="bg-muted/50 resize-none"
              />
              <div className="flex justify-end">
                <span className="text-[10px] text-muted-foreground">
                  {caption.length}/200
                </span>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <Clock className="size-4 text-muted-foreground" />
                <label className="text-sm font-medium">Duration</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    disabled={isAtLimit}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      duration === opt.value
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                    type="button"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Your story will automatically disappear after the selected duration
              </p>
            </div>

            {/* Active stories count */}
            {activeStoryCount !== null && activeStoryCount > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className="size-1.5 rounded-full bg-primary" />
                <span>
                  {activeStoryCount}/5 active stories
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-border">
            <Button
              onClick={handleSubmit}
              disabled={!mediaUrl.trim() || isSubmitting || isAtLimit}
              className="w-full gap-2"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <ImagePlus className="size-4" />
                  Share Story
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
