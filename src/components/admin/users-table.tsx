'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/app-store'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  MoreHorizontal,
  Search,
  ShieldBan,
  ShieldCheck,
  EyeOff,
  Eye,
  Pause,
  Play,
  CheckCircle2,
  Loader2,
  Users,
} from 'lucide-react'

interface UserRecord {
  id: string
  username: string
  name: string | null
  email: string
  avatar: string | null
  isBanned: boolean
  isSuspended: boolean
  isShadowBanned: boolean
  isVerified: boolean
  createdAt: string
  lastSeen: string
  _count: {
    posts: number
    followers: number
  }
}

type StatusFilter = 'all' | 'active' | 'banned' | 'suspended' | 'shadow-banned'

interface UsersTableProps {
  onActionComplete?: () => void
}

export function UsersTable({ onActionComplete }: UsersTableProps) {
  const { token } = useAppStore()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/admin?type=users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users || [])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleAction = async (action: string, userId: string) => {
    if (!token) return
    setActionLoading(userId)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, userId }),
      })
      if (res.ok) {
        toast.success(`Action "${action}" applied successfully`)
        await fetchUsers()
        onActionComplete?.()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Action failed')
      }
    } catch {
      toast.error('Network error. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const getUserStatus = (user: UserRecord): { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; color: string } => {
    if (user.isBanned) return { label: 'Banned', variant: 'destructive', color: 'text-red-600' }
    if (user.isSuspended) return { label: 'Suspended', variant: 'outline', color: 'text-yellow-600' }
    if (user.isShadowBanned) return { label: 'Shadow-banned', variant: 'secondary', color: 'text-gray-500' }
    return { label: 'Active', variant: 'default', color: 'text-green-600' }
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())

    const status = getUserStatus(u).label.toLowerCase().replace('-', '')
    const filterKey = statusFilter.replace('-', '')
    const matchesStatus = statusFilter === 'all' || status === filterKey || (statusFilter === 'shadow-banned' && status === 'shadowbanned')

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="size-4 text-primary" />
          <CardTitle className="text-base">User Management</CardTitle>
        </div>
        <CardDescription>{users.length} total users registered on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="banned">Banned</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="shadow-banned">Shadow-banned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden sm:table-cell">Posts</TableHead>
                <TableHead className="hidden lg:table-cell">Followers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u) => {
                  const status = getUserStatus(u)
                  const isActing = actionLoading === u.id

                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8">
                            <AvatarImage src={u.avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {(u.name || u.username).slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate max-w-[120px]">
                              {u.name || u.username}
                              {u.isVerified && <CheckCircle2 className="inline size-3 ml-1 text-blue-500" />}
                            </p>
                            <p className="text-xs text-muted-foreground">@{u.username}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm tabular-nums">
                        {u._count.posts}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm tabular-nums">
                        {u._count.followers}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={status.variant}
                          className={
                            status.label === 'Active'
                              ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900'
                              : status.label === 'Suspended'
                              ? 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900'
                              : status.label === 'Shadow-banned'
                              ? 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-800'
                              : undefined
                          }
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8" disabled={isActing}>
                              {isActing ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <MoreHorizontal className="size-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Moderation</DropdownMenuLabel>

                            {u.isBanned ? (
                              <DropdownMenuItem onClick={() => handleAction('unban', u.id)}>
                                <ShieldCheck className="size-4 mr-2" />
                                Unban User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem variant="destructive" onClick={() => handleAction('ban', u.id)}>
                                <ShieldBan className="size-4 mr-2" />
                                Ban User
                              </DropdownMenuItem>
                            )}

                            {u.isSuspended ? (
                              <DropdownMenuItem onClick={() => handleAction('unsuspend', u.id)}>
                                <Play className="size-4 mr-2" />
                                Unsuspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction('suspend', u.id)}>
                                <Pause className="size-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            )}

                            {u.isShadowBanned ? (
                              <DropdownMenuItem onClick={() => handleAction('unshadow-ban', u.id)}>
                                <Eye className="size-4 mr-2" />
                                Unshadow-ban
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleAction('shadow-ban', u.id)}>
                                <EyeOff className="size-4 mr-2" />
                                Shadow-ban
                              </DropdownMenuItem>
                            )}

                            <DropdownMenuSeparator />

                            {!u.isVerified && (
                              <DropdownMenuItem onClick={() => handleAction('verify', u.id)}>
                                <CheckCircle2 className="size-4 mr-2" />
                                Verify User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Results count */}
        <div className="mt-3 text-xs text-muted-foreground">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </CardContent>
    </Card>
  )
}
