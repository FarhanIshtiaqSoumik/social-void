'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Flame, Users, User, Loader2, Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useAppStore } from '@/stores/app-store'

interface SearchUser {
  id: string
  username: string
  name: string | null
  avatar: string | null
  isVerified: boolean
}

interface NewChatModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChatCreated: (chatId: string) => void
}

export function NewChatModal({ open, onOpenChange, onChatCreated }: NewChatModalProps) {
  const { token, user } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SearchUser[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<SearchUser[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [voidMode, setVoidMode] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch suggested users when modal opens
  useEffect(() => {
    if (!open || !token || !user) return

    const fetchSuggestions = async () => {
      setIsLoadingSuggestions(true)
      try {
        const res = await fetch(
          `/api/users?type=search&q=`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.ok) {
          const data = await res.json()
          // Filter out current user and limit to 6
          setSuggestedUsers(
            (data.users as SearchUser[])
              .filter((u) => u.id !== user.id)
              .slice(0, 6)
          )
        }
      } catch (err) {
        console.error('Suggestions error:', err)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }

    fetchSuggestions()
  }, [open, token, user])

  // Search users with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `/api/users?type=search&q=${encodeURIComponent(searchQuery)}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )
        if (res.ok) {
          const data = await res.json()
          // Filter out current user
          setSearchResults(
            (data.users as SearchUser[]).filter((u) => u.id !== user?.id)
          )
        }
      } catch (err) {
        console.error('Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, token, user?.id])

  const toggleUser = useCallback(
    (u: SearchUser) => {
      setSelectedUsers((prev) => {
        const exists = prev.find((p) => p.id === u.id)
        if (exists) {
          return prev.filter((p) => p.id !== u.id)
        }
        // For DM, only allow one user
        if (!isGroup && prev.length >= 1) {
          return [u]
        }
        return [...prev, u]
      })
    },
    [isGroup]
  )

  const removeUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((p) => p.id !== userId))
  }, [])

  const handleCreate = useCallback(async () => {
    if (selectedUsers.length === 0 || isCreating) return

    setIsCreating(true)
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userIds: selectedUsers.map((u) => u.id),
          name: isGroup ? groupName : undefined,
          isGroup,
          voidMode,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        onChatCreated(data.chat.id)
        // Reset form
        setSearchQuery('')
        setSearchResults([])
        setSelectedUsers([])
        setIsGroup(false)
        setGroupName('')
        setVoidMode(false)
        onOpenChange(false)
      }
    } catch (err) {
      console.error('Create chat error:', err)
    } finally {
      setIsCreating(false)
    }
  }, [
    selectedUsers,
    isCreating,
    isGroup,
    groupName,
    voidMode,
    token,
    onChatCreated,
    onOpenChange,
  ])

  // Reset state when modal closes
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setSearchQuery('')
        setSearchResults([])
        setSelectedUsers([])
        setIsGroup(false)
        setGroupName('')
        setVoidMode(false)
      }
      onOpenChange(open)
    },
    [onOpenChange]
  )

  const canCreate = selectedUsers.length > 0 && (!isGroup || groupName.trim().length > 0)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 flex flex-col gap-3 overflow-hidden">
          {/* Group / DM toggle */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              {isGroup ? (
                <Users className="size-4 text-muted-foreground" />
              ) : (
                <User className="size-4 text-muted-foreground" />
              )}
              <Label className="text-sm">
                {isGroup ? 'Group Chat' : 'Direct Message'}
              </Label>
            </div>
            <Switch checked={isGroup} onCheckedChange={setIsGroup} />
          </div>

          {/* Group name */}
          <AnimatePresence>
            {isGroup && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="shrink-0"
              >
                <Input
                  placeholder="Group name..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="h-9"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Void mode toggle */}
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Flame className="size-4 text-primary" />
              <Label className="text-sm">Void Mode</Label>
              <span className="text-[10px] text-muted-foreground">
                (auto-expire messages)
              </span>
            </div>
            <Switch checked={voidMode} onCheckedChange={setVoidMode} />
          </div>

          <Separator className="shrink-0" />

          {/* Selected users chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 shrink-0">
              {selectedUsers.map((u) => (
                <Badge
                  key={u.id}
                  variant="secondary"
                  className="gap-1 pr-1 py-1 text-xs"
                >
                  {u.name || u.username}
                  <button
                    onClick={() => removeUser(u.id)}
                    className="ml-0.5 p-0.5 rounded-full hover:bg-muted-foreground/20"
                  >
                    <X className="size-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Search users */}
          <div className="relative shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Scrollable content area */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {/* Search results */}
            {searchQuery.trim() ? (
              <div className="space-y-1">
                {isSearching ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((u) => {
                    const isSelected = selectedUsers.some((s) => s.id === u.id)
                    return (
                      <UserRow
                        key={u.id}
                        user={u}
                        isSelected={isSelected}
                        onToggle={() => toggleUser(u)}
                      />
                    )
                  })
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No users found
                  </p>
                )}
              </div>
            ) : (
              /* Suggested Users section */
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Suggested Users
                </h4>
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </div>
                ) : suggestedUsers.length > 0 ? (
                  suggestedUsers.map((u) => {
                    const isSelected = selectedUsers.some((s) => s.id === u.id)
                    return (
                      <SuggestedUserRow
                        key={u.id}
                        user={u}
                        isSelected={isSelected}
                        onToggle={() => toggleUser(u)}
                      />
                    )
                  })
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No suggestions available
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Create button - always visible at bottom */}
        <div className="mt-auto pt-3 border-t border-border">
          <Button
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isCreating ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                {isGroup ? 'Create Group' : 'Start Conversation'}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── User Row (search result) ──────────────────────────────────────────────────

function UserRow({
  user,
  isSelected,
  onToggle,
}: {
  user: SearchUser
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
        isSelected
          ? 'bg-primary/10 ring-1 ring-primary/30'
          : 'hover:bg-muted'
      }`}
      type="button"
    >
      <Avatar className="size-8">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {(user.name || user.username).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {user.name || user.username}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          @{user.username}
        </p>
      </div>
      {isSelected && (
        <Badge className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
          Selected
        </Badge>
      )}
    </button>
  )
}

// ── Suggested User Row ─────────────────────────────────────────────────────────

function SuggestedUserRow({
  user,
  isSelected,
  onToggle,
}: {
  user: SearchUser
  isSelected: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
      <Avatar className="size-8">
        {user.avatar && <AvatarImage src={user.avatar} alt={user.username} />}
        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
          {(user.name || user.username).charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {user.name || user.username}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          @{user.username}
        </p>
      </div>
      <Button
        variant={isSelected ? 'default' : 'outline'}
        size="icon"
        className={`size-7 shrink-0 ${
          isSelected
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'hover:bg-primary hover:text-primary-foreground'
        }`}
        onClick={onToggle}
        type="button"
      >
        {isSelected ? (
          <X className="size-3.5" />
        ) : (
          <Plus className="size-3.5" />
        )}
      </Button>
    </div>
  )
}
