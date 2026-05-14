'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Plus } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { StoryViewer } from './story-viewer'
import { CreateStoryModal } from './create-story-modal'

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

export function StoryCircles() {
  const { token, user } = useAppStore()
  const [authors, setAuthors] = useState<StoryAuthor[]>([])
  const [stories, setStories] = useState<StoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewingAuthorId, setViewingAuthorId] = useState<string | null>(null)
  const [showCreateStory, setShowCreateStory] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch stories on mount and every 60 seconds
  useEffect(() => {
    if (!token) return
    const fetchStories = async () => {
      try {
        const res = await fetch('/api/stories', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setAuthors(data.authors || [])
          setStories(data.stories || [])
        }
      } catch {
        // Silently fail
      } finally {
        setIsLoading(false)
      }
    }
    fetchStories()
    const interval = setInterval(fetchStories, 60000)
    return () => clearInterval(interval)
  }, [token, refreshKey])

  const handleStoryCreated = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  // Filter out own user from authors list (we show "Your Story" separately)
  const friendAuthors = authors.filter((a) => a.userId !== user?.id)
  const ownAuthor = authors.find((a) => a.userId === user?.id)

  if (isLoading) {
    return (
      <div className="flex gap-3 px-3 sm:px-4 py-3 overflow-x-auto scrollbar-hide">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 shrink-0">
            <div className="size-16 rounded-full bg-muted animate-pulse" />
            <div className="h-2 w-10 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>
    )
  }

  // Only show section if there are friends with stories or user can create their own
  if (friendAuthors.length === 0 && !user) return null

  const handleCircleClick = (authorId: string) => {
    setViewingAuthorId(authorId)
  }

  // Find the index of current viewing author in friendAuthors for navigation
  const currentAuthorIndex = viewingAuthorId
    ? friendAuthors.findIndex((a) => a.userId === viewingAuthorId)
    : -1

  const handleNavigate = (authorId: string) => {
    setViewingAuthorId(authorId)
  }

  const handleCloseViewer = () => {
    setViewingAuthorId(null)
  }

  return (
    <>
      <div className="flex gap-3 px-3 sm:px-4 py-3 overflow-x-auto scrollbar-hide border-b border-border/50">
        {/* Add Story circle (own) */}
        {user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setShowCreateStory(true)}
            className="flex flex-col items-center gap-1 shrink-0 group"
            type="button"
          >
            <div className="relative">
              <Avatar className="size-16 ring-2 ring-border group-hover:ring-primary/50 transition-all">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {(user.name || user.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 size-5 rounded-full bg-primary text-white flex items-center justify-center ring-2 ring-background">
                <Plus className="size-3" />
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[64px]">
              Your Story
            </span>
          </motion.button>
        )}

        {/* Own active stories circle (if user has stories) */}
        {ownAuthor && user && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => handleCircleClick(ownAuthor.userId)}
            className="flex flex-col items-center gap-1 shrink-0 group"
            type="button"
          >
            <div className="relative">
              <Avatar className="size-16 ring-[3px] ring-primary group-hover:ring-primary/70 transition-all shadow-sm">
                {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {(user.name || user.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {ownAuthor.storyCount > 1 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-background">
                  {ownAuthor.storyCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-primary font-medium truncate max-w-[64px]">
              You
            </span>
          </motion.button>
        )}

        {/* Friend story circles */}
        {friendAuthors.map((author, index) => (
          <motion.button
            key={author.userId}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            onClick={() => handleCircleClick(author.userId)}
            className="flex flex-col items-center gap-1 shrink-0 group"
            type="button"
          >
            <div className="relative">
              <Avatar className="size-16 ring-[3px] ring-primary/80 group-hover:ring-primary transition-all shadow-sm">
                {author.avatar && <AvatarImage src={author.avatar} alt={author.username} />}
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                  {(author.name || author.username).charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {author.storyCount > 1 && (
                <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center ring-2 ring-background">
                  {author.storyCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[64px]">
              {author.name || author.username}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Story Viewer */}
      {viewingAuthorId && (
        <StoryViewer
          key={viewingAuthorId}
          authorId={viewingAuthorId}
          stories={stories.filter((s) => s.author.id === viewingAuthorId)}
          allAuthors={friendAuthors}
          currentAuthorIndex={currentAuthorIndex}
          onClose={handleCloseViewer}
          onNavigate={handleNavigate}
        />
      )}

      {/* Create Story Modal */}
      {showCreateStory && (
        <CreateStoryModal
          onClose={() => setShowCreateStory(false)}
          onCreated={handleStoryCreated}
        />
      )}
    </>
  )
}
