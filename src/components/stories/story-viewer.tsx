'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { X, ChevronLeft, ChevronRight, Pause, Volume2, VolumeX } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'

interface StoryAuthor {
  userId: string
  username: string
  name: string | null
  avatar: string | null
  hasActiveStory: boolean
  storyCount: number
  latestStoryCreatedAt: string
}

interface StoryItem {
  id: string
  mediaUrl: string
  mediaType: string
  caption: string | null
  createdAt: string
  expiresAt: string
  author: { id: string; username: string; name: string | null; avatar: string | null }
}

interface StoryViewerProps {
  authorId: string
  stories: StoryItem[]
  allAuthors: StoryAuthor[]
  currentAuthorIndex: number
  onClose: () => void
  onNavigate: (authorId: string) => void
}

const STORY_DURATION = 5000 // 5 seconds per image

export function StoryViewer({
  authorId,
  stories,
  allAuthors,
  currentAuthorIndex,
  onClose,
  onNavigate,
}: StoryViewerProps) {
  const { user, token } = useAppStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)
  const elapsedRef = useRef<number>(0)

  // Sort stories oldest to newest for viewing order
  const sortedStories = [...stories].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const sortedCurrentStory = sortedStories[currentIndex]
  const currentAuthor = sortedCurrentStory?.author

  // Navigate to next story
  const goNext = () => {
    if (currentIndex < sortedStories.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setProgress(0)
      elapsedRef.current = 0
      setImageLoaded(false)
      setImageError(false)
    } else {
      // Move to next author
      if (currentAuthorIndex < allAuthors.length - 1) {
        const nextAuthor = allAuthors[currentAuthorIndex + 1]
        onNavigate(nextAuthor.userId)
      } else {
        onClose()
      }
    }
  }

  // Navigate to previous story
  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1)
      setProgress(0)
      elapsedRef.current = 0
      setImageLoaded(false)
      setImageError(false)
    } else {
      // Move to previous author
      if (currentAuthorIndex > 0) {
        const prevAuthor = allAuthors[currentAuthorIndex - 1]
        onNavigate(prevAuthor.userId)
      }
    }
  }

  // Auto-advance timer
  useEffect(() => {
    if (isPaused || !sortedCurrentStory) return

    const duration = sortedCurrentStory.mediaType === 'video' ? 15000 : STORY_DURATION
    startTimeRef.current = Date.now() - elapsedRef.current

    progressRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min((elapsed / duration) * 100, 100)
      setProgress(newProgress)

      if (newProgress >= 100) {
        goNext()
      }
    }, 50)

    return () => {
      if (progressRef.current) {
        clearInterval(progressRef.current)
      }
    }
  }, [currentIndex, isPaused, authorId, sortedCurrentStory, goNext])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd') {
        goNext()
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        goPrev()
      } else if (e.key === 'Escape') {
        onClose()
      } else if (e.key === ' ') {
        e.preventDefault()
        setIsPaused((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goNext, goPrev, onClose])

  // Handle touch/swipe
  const touchStartRef = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX
  }
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartRef.current === null) return
    const diff = e.changedTouches[0].clientX - touchStartRef.current
    if (Math.abs(diff) > 50) {
      if (diff < 0) goNext()
      else goPrev()
    }
    touchStartRef.current = null
  }

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return `${Math.floor(diffHours / 24)}d`
  }

  const formatExpiry = (dateStr: string) => {
    const now = new Date()
    const date = new Date(dateStr)
    const diffMs = date.getTime() - now.getTime()
    const diffHours = Math.floor(diffMs / 3600000)
    const diffMins = Math.floor((diffMs % 3600000) / 60000)

    if (diffHours <= 0) return `Expires in ${diffMins}m`
    return `Expires in ${diffHours}h ${diffMins}m`
  }

  const isOwnStory = currentAuthor?.id === user?.id

  const handleDeleteStory = async () => {
    if (!token || !sortedCurrentStory) return
    try {
      const res = await fetch(`/api/stories?storyId=${sortedCurrentStory.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        goNext()
      }
    } catch {
      // Silently fail
    }
  }

  if (!sortedCurrentStory) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
        onClick={onClose}
      >
        {/* Story Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-[420px] h-[calc(100dvh-2rem)] max-h-[780px] bg-black rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Progress bars at top */}
          <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-3 pt-2">
            {sortedStories.map((story, i) => (
              <div key={story.id} className="flex-1 h-[2px] bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width:
                      i < currentIndex
                        ? '100%'
                        : i === currentIndex
                          ? `${progress}%`
                          : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-4 left-0 right-0 z-20 flex items-center justify-between px-3 pt-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-9 ring-2 ring-white/30 shrink-0">
                {currentAuthor?.avatar && (
                  <AvatarImage src={currentAuthor.avatar} alt={currentAuthor.username} />
                )}
                <AvatarFallback className="bg-primary/20 text-white text-xs font-semibold">
                  {((currentAuthor?.name || currentAuthor?.username) || '?')
                    .charAt(0)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-white text-sm font-semibold truncate leading-tight">
                  {currentAuthor?.name || currentAuthor?.username}
                </p>
                <p className="text-white/60 text-[10px] leading-tight">
                  {formatTimeAgo(sortedCurrentStory.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {/* Pause/Play toggle */}
              <button
                onClick={() => setIsPaused((prev) => !prev)}
                className="size-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                type="button"
              >
                {isPaused ? (
                  <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <Pause className="size-4" />
                )}
              </button>

              {/* Mute toggle (for video stories) */}
              {sortedCurrentStory.mediaType === 'video' && (
                <button
                  onClick={() => setIsMuted((prev) => !prev)}
                  className="size-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  type="button"
                >
                  {isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
                </button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="size-8 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>
          </div>

          {/* Story Content - Image */}
          <div className="absolute inset-0 flex items-center justify-center">
            {!imageError ? (
              <>
                {/* Loading spinner */}
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="size-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  </div>
                )}
                <img
                  key={sortedCurrentStory.id}
                  src={sortedCurrentStory.mediaUrl}
                  alt={sortedCurrentStory.caption || 'Story'}
                  className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-white/60">
                <div className="size-16 rounded-full bg-white/10 flex items-center justify-center">
                  <X className="size-8" />
                </div>
                <p className="text-sm">Failed to load story</p>
              </div>
            )}
          </div>

          {/* Caption */}
          {sortedCurrentStory.caption && (
            <div className="absolute bottom-16 left-0 right-0 z-20 px-4">
              <div className="bg-black/50 backdrop-blur-sm rounded-xl px-4 py-2.5">
                <p className="text-white text-sm leading-relaxed line-clamp-3">
                  {sortedCurrentStory.caption}
                </p>
              </div>
            </div>
          )}

          {/* Expiry info */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center">
            <span className="text-white/40 text-[10px]">
              {formatExpiry(sortedCurrentStory.expiresAt)}
            </span>
          </div>

          {/* Navigation Areas - Tap left/right to navigate */}
          <div className="absolute inset-0 z-10 flex">
            {/* Left tap area */}
            <button
              className="w-1/3 h-full"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              type="button"
              aria-label="Previous story"
            />
            {/* Center area (pause/resume on hold) */}
            <button
              className="w-1/3 h-full"
              onMouseDown={() => setIsPaused(true)}
              onMouseUp={() => setIsPaused(false)}
              onMouseLeave={() => setIsPaused(false)}
              type="button"
              aria-label="Hold to pause"
            />
            {/* Right tap area */}
            <button
              className="w-1/3 h-full"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              type="button"
              aria-label="Next story"
            />
          </div>

          {/* Navigation arrows (desktop) */}
          <div className="hidden sm:flex absolute inset-y-0 left-0 z-30 items-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="size-10 -ml-2 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
              type="button"
              aria-label="Previous"
            >
              <ChevronLeft className="size-6" />
            </button>
          </div>
          <div className="hidden sm:flex absolute inset-y-0 right-0 z-30 items-center">
            <button
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="size-10 -mr-2 rounded-full bg-black/30 hover:bg-black/50 flex items-center justify-center text-white/80 hover:text-white transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
              type="button"
              aria-label="Next"
            >
              <ChevronRight className="size-6" />
            </button>
          </div>

          {/* Own story - delete option */}
          {isOwnStory && (
            <div className="absolute bottom-4 right-4 z-30">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteStory()
                }}
                className="px-3 py-1.5 rounded-lg bg-red-500/80 hover:bg-red-500 text-white text-xs font-medium transition-colors"
                type="button"
              >
                Delete
              </button>
            </div>
          )}

          {/* Pause indicator */}
          <AnimatePresence>
            {isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-25 flex items-center justify-center pointer-events-none"
              >
                <div className="bg-black/40 rounded-full p-4">
                  <Pause className="size-8 text-white/80" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Author preview circles on the side (desktop) */}
        <div className="hidden lg:flex flex-col gap-2 ml-4 max-h-[780px] overflow-y-auto scrollbar-hide">
          {allAuthors.map((author, index) => (
            <button
              key={author.userId}
              onClick={() => onNavigate(author.userId)}
              className={`shrink-0 transition-all duration-200 ${
                index === currentAuthorIndex ? 'scale-110' : 'opacity-50 hover:opacity-80'
              }`}
              type="button"
            >
              <Avatar className={`size-12 ${index === currentAuthorIndex ? 'ring-2 ring-white' : ''}`}>
                {author.avatar && <AvatarImage src={author.avatar} alt={author.username} />}
                <AvatarFallback className="bg-white/10 text-white text-xs font-semibold">
                  {(author.name || author.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
