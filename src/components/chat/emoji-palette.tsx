'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Loader2 } from 'lucide-react'
import {
  CUSTOM_EMOJI_DATA,
  type CustomEmojiItem,
} from './custom-emojis'

// ── FontAwesome-style SVG Category Icons ────────────────────────────────────────

function getCategoryIcon(iconId: string): React.ReactNode {
  const iconSize = 14
  switch (iconId) {
    case 'void-faces':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      )
    case 'void-hands':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 11V6a2 2 0 0 0-4 0v1"/>
          <path d="M14 10V4a2 2 0 0 0-4 0v6"/>
          <path d="M10 10.5V6a2 2 0 0 0-4 0v8"/>
          <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>
        </svg>
      )
    case 'void-hearts':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      )
    case 'void-fire':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
        </svg>
      )
    case 'void-skull':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="8"/>
          <path d="M10 16v2"/>
          <path d="M14 16v2"/>
          <line x1="9" y1="10" x2="9.01" y2="10"/>
          <line x1="15" y1="10" x2="15.01" y2="10"/>
        </svg>
      )
    case 'void-party':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5.8 11.3 2 22l10.7-3.79"/>
          <path d="M4 3h.01"/>
          <path d="M22 8h.01"/>
          <path d="M15 2h.01"/>
          <path d="M22 20h.01"/>
          <path d="m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12v0c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10"/>
          <path d="m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11v0c-.11.7-.72 1.22-1.43 1.22H17"/>
          <path d="m11 2 .33.82c.34.86-.2 1.82-1.11 1.98v0C9.52 4.9 9 5.52 9 6.23V7"/>
        </svg>
      )
    case 'void-nature':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 17 3.5s0 6-5.3 7.5c0 0 3.8.5 6.3-2"/>
          <path d="M11.2 20c.6.5 1.2.8 1.8.8 2.8 0 5-3.6 5-8s-2.2-8-5-8c-1 0-1.9.5-2.6 1.3"/>
        </svg>
      )
    case 'void-symbols':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      )
    case 'gifs':
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
          <line x1="7" y1="2" x2="7" y2="22"/>
          <line x1="17" y1="2" x2="17" y2="22"/>
          <line x1="2" y1="12" x2="22" y2="12"/>
          <line x1="2" y1="7" x2="7" y2="7"/>
          <line x1="2" y1="17" x2="7" y2="17"/>
          <line x1="17" y1="17" x2="22" y2="17"/>
          <line x1="17" y1="7" x2="22" y2="7"/>
        </svg>
      )
    default:
      return (
        <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      )
  }
}

// ── Virtualized Custom Emoji Grid ────────────────────────────────────────────────

const EMOJI_SIZE = 40
const EMOJIS_PER_ROW = 8

const EmojiGrid = React.memo(function EmojiGrid({
  emojis,
  onEmojiSelect,
  onHoverEmoji,
}: {
  emojis: CustomEmojiItem[]
  onEmojiSelect: (emojiCode: string) => void
  onHoverEmoji: (emoji: CustomEmojiItem | null) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 })
  const rowHeight = EMOJI_SIZE + 4

  const totalRows = Math.ceil(emojis.length / EMOJIS_PER_ROW)
  const totalHeight = totalRows * rowHeight

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const scrollTop = container.scrollTop
    const viewportHeight = container.clientHeight
    const startRow = Math.floor(scrollTop / rowHeight)
    const endRow = Math.ceil((scrollTop + viewportHeight) / rowHeight)

    setVisibleRange({
      start: Math.max(0, startRow * EMOJIS_PER_ROW),
      end: Math.min(emojis.length, endRow * EMOJIS_PER_ROW + EMOJIS_PER_ROW),
    })
  }, [emojis.length, rowHeight])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const startRow = Math.floor(visibleRange.start / EMOJIS_PER_ROW)
  const topOffset = startRow * rowHeight

  return (
    <div
      ref={containerRef}
      className="h-64 overflow-y-auto custom-scrollbar"
      style={{ position: 'relative' }}
      onMouseLeave={() => onHoverEmoji(null)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: topOffset, left: 0, right: 0 }}>
          {Array.from(
            { length: Math.ceil((visibleRange.end - visibleRange.start) / EMOJIS_PER_ROW) },
            (_, rowIdx) => {
              const actualRow = startRow + rowIdx
              const rowStart = actualRow * EMOJIS_PER_ROW
              const rowEmojis = emojis.slice(rowStart, rowStart + EMOJIS_PER_ROW)

              return (
                <div
                  key={actualRow}
                  className="grid gap-1 px-1"
                  style={{
                    gridTemplateColumns: `repeat(${EMOJIS_PER_ROW}, 1fr)`,
                    height: rowHeight,
                  }}
                >
                  {rowEmojis.map((item) => {
                    const SvgComponent = item.svg
                    return (
                      <button
                        key={item.name}
                        onClick={() => onEmojiSelect(`:${item.name}:`)}
                        onMouseEnter={() => onHoverEmoji(item)}
                        onMouseLeave={() => onHoverEmoji(null)}
                        className="flex items-center justify-center rounded-md hover:bg-muted transition-colors group"
                        style={{ height: EMOJI_SIZE }}
                        title={item.label}
                        type="button"
                      >
                        <SvgComponent size={28} />
                      </button>
                    )
                  })}
                  {rowEmojis.length < EMOJIS_PER_ROW &&
                    Array.from({ length: EMOJIS_PER_ROW - rowEmojis.length }, (_, i) => (
                      <div key={`empty-${i}`} style={{ height: EMOJI_SIZE }} />
                    ))}
                </div>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
})

// ── GIF Types ────────────────────────────────────────────────────────────────────

interface GifItem {
  id: string
  url: string
  preview_url: string
  title: string
}

// ── GIF Grid with Search ─────────────────────────────────────────────────────────

const GifGrid = React.memo(function GifGrid({
  onGifSelect,
}: {
  onGifSelect: (gifUrl: string) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [gifs, setGifs] = useState<GifItem[]>([])
  const [loading, setLoading] = useState(false)
  const [nextPos, setNextPos] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch GIFs
  const fetchGifs = useCallback(async (query: string, pos: string, append: boolean = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (pos) params.set('pos', pos)

      const response = await fetch(`/api/gifs?${params.toString()}`)
      const data = await response.json()

      if (append) {
        setGifs(prev => [...prev, ...data.gifs])
      } else {
        setGifs(data.gifs)
      }
      setNextPos(data.next || '')
      setHasMore(!!data.next && data.gifs.length > 0)
    } catch {
      // Silently handle errors
    } finally {
      setLoading(false)
      setInitialLoaded(true)
    }
  }, [])

  // Load trending on mount or search
  useEffect(() => {
    setGifs([])
    setNextPos('')
    setHasMore(true)
    fetchGifs(debouncedQuery, '', false)
  }, [debouncedQuery, fetchGifs])

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchGifs(debouncedQuery, nextPos, true)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, nextPos, debouncedQuery, fetchGifs])

  const handleGifClick = useCallback((gif: GifItem) => {
    onGifSelect(gif.url)
  }, [onGifSelect])

  return (
    <div className="h-64 flex flex-col">
      {/* GIF search bar */}
      <div className="p-2 pb-1">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search GIFs..."
            className="w-full h-7 pl-7 pr-3 text-xs bg-muted/50 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              type="button"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
      </div>

      {/* GIF grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-1 pb-1">
        {!initialLoaded ? (
          // Loading skeletons
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="h-20 rounded-lg bg-muted animate-pulse"
              />
            ))}
          </div>
        ) : gifs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            {debouncedQuery ? 'No GIFs found' : 'Loading GIFs...'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => handleGifClick(gif)}
                className="relative rounded-lg overflow-hidden bg-muted h-20 group transition-transform active:scale-95"
                type="button"
              >
                <img
                  src={gif.preview_url}
                  alt={gif.title || 'GIF'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        )}

        {/* Load more trigger */}
        {hasMore && gifs.length > 0 && (
          <div ref={loadMoreRef} className="h-4 flex items-center justify-center">
            {loading && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
          </div>
        )}

        {/* End of results */}
        {!hasMore && gifs.length > 0 && (
          <div className="text-center py-1.5 text-[10px] text-muted-foreground">
            No more GIFs
          </div>
        )}
      </div>
    </div>
  )
})

// ── Main Emoji Palette ──────────────────────────────────────────────────────────

export interface EmojiPaletteProps {
  onEmojiSelect: (emojiCode: string) => void
  onGifSelect: (gifCategory: string) => void
  onClose: () => void
}

export const EmojiPalette = React.memo(function EmojiPalette({
  onEmojiSelect,
  onGifSelect,
  onClose,
}: EmojiPaletteProps) {
  const [activeCategory, setActiveCategory] = useState('void-faces')
  const [searchQuery, setSearchQuery] = useState('')
  const [hoveredEmoji, setHoveredEmoji] = useState<CustomEmojiItem | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Filtered emojis based on search
  const filteredEmojis = useMemo(() => {
    if (!searchQuery.trim()) return null

    const query = searchQuery.toLowerCase()
    const allEmojis = CUSTOM_EMOJI_DATA.flatMap((cat) => cat.emojis)
    const seen = new Set<string>()
    return allEmojis.filter((e) => {
      if (seen.has(e.name)) return false
      seen.add(e.name)
      return (
        e.name.toLowerCase().includes(query) ||
        e.label.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  // Active category emojis
  const activeEmojis = useMemo(() => {
    if (filteredEmojis) return filteredEmojis
    return CUSTOM_EMOJI_DATA.find((cat) => cat.id === activeCategory)?.emojis || []
  }, [activeCategory, filteredEmojis])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const handleEmojiSelect = useCallback(
    (emojiCode: string) => {
      onEmojiSelect(emojiCode)
    },
    [onEmojiSelect]
  )

  const handleGifSelect = useCallback(
    (gifUrl: string) => {
      onGifSelect(gifUrl)
    },
    [onGifSelect]
  )

  const handleHoverEmoji = useCallback((emoji: CustomEmojiItem | null) => {
    setHoveredEmoji(emoji)
  }, [])

  const allCategories = [
    ...CUSTOM_EMOJI_DATA.map((cat) => ({ id: cat.id, label: cat.label, icon: cat.icon })),
    { id: 'gifs', label: 'GIFs', icon: 'gifs' },
  ]

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className="absolute bottom-full left-0 mb-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background shadow-xl z-50 overflow-hidden"
    >
      {/* Search bar */}
      <div className="p-2 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search custom emoji..."
            className="w-full h-8 pl-8 pr-3 text-sm bg-muted/50 rounded-md border-0 focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              type="button"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category tabs */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border overflow-x-auto custom-scrollbar-horizontal"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {allCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id)
              setSearchQuery('')
            }}
            className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors ${
              activeCategory === cat.id && !searchQuery
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
            type="button"
            title={cat.label}
          >
            {getCategoryIcon(cat.icon)}
            <span className="hidden sm:inline">{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Emoji / GIF content */}
      <div className="p-1">
        {activeCategory === 'gifs' && !searchQuery ? (
          <GifGrid onGifSelect={handleGifSelect} />
        ) : (
          <>
            {filteredEmojis && filteredEmojis.length === 0 ? (
              <div className="h-64 flex items-center justify-center text-sm text-muted-foreground">
                No custom emojis found
              </div>
            ) : (
              <EmojiGrid
                emojis={activeEmojis}
                onEmojiSelect={handleEmojiSelect}
                onHoverEmoji={handleHoverEmoji}
              />
            )}
          </>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-border text-[10px] text-muted-foreground text-center">
        {activeCategory === 'gifs' && !searchQuery
          ? 'Tap a GIF to send it'
          : hoveredEmoji
            ? `:${hoveredEmoji.name}: — ${hoveredEmoji.label}`
            : 'Tap a custom emoji to insert it'}
      </div>
    </motion.div>
  )
})
