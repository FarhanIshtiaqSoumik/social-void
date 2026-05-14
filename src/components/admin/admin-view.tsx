'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { UsersTable } from '@/components/admin/users-table'
import { ReportsPanel } from '@/components/admin/reports-panel'
import { LogsViewer } from '@/components/admin/logs-viewer'
import {
  BarChart3,
  Users,
  FileText,
  MessageSquare,
  AlertTriangle,
  Shield,
  Activity,
  TrendingUp,
} from 'lucide-react'
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  ComposedChart,
  Legend,
} from 'recharts'

interface Stats {
  totalUsers: number
  activeUsers: number
  totalPosts: number
  totalMessages: number
  totalChats: number
  totalReports: number
  recentUsers: {
    id: string
    username: string
    name: string | null
    avatar: string | null
    createdAt: string
  }[]
}

interface EngagementData {
  engagementData: {
    day: string
    date: string
    posts: number
    likes: number
    messages: number
  }[]
}

export function AdminView() {
  const { token, user } = useAppStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [engagement, setEngagement] = useState<EngagementData['engagementData']>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const fetchStats = useCallback(async () => {
    if (!token) return undefined
    try {
      const res = await fetch('/api/admin?type=stats', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        return await res.json() as Stats
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
    return undefined
  }, [token])

  const fetchEngagement = useCallback(async () => {
    if (!token) return undefined
    try {
      const res = await fetch('/api/admin?type=engagement', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        return data.engagementData as EngagementData['engagementData']
      }
    } catch (err) {
      console.error('Failed to fetch engagement:', err)
    }
    return undefined
  }, [token])

  const refreshData = useCallback(async () => {
    const [statsData, engagementData] = await Promise.all([fetchStats(), fetchEngagement()])
    if (statsData) setStats(statsData)
    if (engagementData) setEngagement(engagementData)
  }, [fetchStats, fetchEngagement])

  useEffect(() => {
    if (!token || !user?.isAdmin) return
    let cancelled = false
    Promise.all([fetchStats(), fetchEngagement()]).then(([statsData, engagementData]) => {
      if (cancelled) return
      if (statsData) setStats(statsData)
      if (engagementData) setEngagement(engagementData)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [token, user?.isAdmin, fetchStats, fetchEngagement])

  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="size-12 mx-auto text-muted-foreground mb-2" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to access this panel.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-pulse">
            <Shield className="size-5 text-white" />
          </div>
          <p className="text-sm text-muted-foreground">Loading admin data...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: 'bg-red-50 dark:bg-red-950/30',
      iconColor: 'text-red-600 dark:text-red-400',
    },
    {
      label: 'Active Users',
      value: stats?.activeUsers ?? 0,
      icon: Activity,
      color: 'bg-green-50 dark:bg-green-950/30',
      iconColor: 'text-green-600 dark:text-green-400',
    },
    {
      label: 'Total Posts',
      value: stats?.totalPosts ?? 0,
      icon: FileText,
      color: 'bg-amber-50 dark:bg-amber-950/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Total Messages',
      value: stats?.totalMessages ?? 0,
      icon: MessageSquare,
      color: 'bg-purple-50 dark:bg-purple-950/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      label: 'Pending Reports',
      value: stats?.totalReports ?? 0,
      icon: AlertTriangle,
      color: 'bg-orange-50 dark:bg-orange-950/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
    },
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 rounded-full bg-primary" />
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Badge variant="secondary" className="ml-2">
          <Shield className="size-3 mr-1" />
          Admin
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="w-full sm:w-auto grid grid-cols-4 sm:flex">
          <TabsTrigger value="overview" className="gap-1.5">
            <BarChart3 className="size-3.5" />
            <span className="hidden sm:inline">Overview</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1.5">
            <Users className="size-3.5" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            <AlertTriangle className="size-3.5" />
            <span className="hidden sm:inline">Reports</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5">
            <FileText className="size-3.5" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {statCards.map((stat) => (
              <Card key={stat.label} className={`border-0 ${stat.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-white/60 dark:bg-black/20 ${stat.iconColor}`}>
                      <stat.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-2xl font-bold tabular-nums">{stat.value.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Engagement Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-4 text-primary" />
                <CardTitle className="text-base">7-Day Engagement</CardTitle>
              </div>
              <CardDescription>Platform activity over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {engagement.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={engagement} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis
                        dataKey="day"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                      />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        className="fill-muted-foreground"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Bar dataKey="posts" fill="#FF0000" radius={[4, 4, 0, 0]} name="Posts" />
                      <Line
                        type="monotone"
                        dataKey="likes"
                        stroke="#FF0000"
                        strokeWidth={2}
                        dot={{ fill: '#FF0000', r: 4 }}
                        name="Likes"
                      />
                      <Line
                        type="monotone"
                        dataKey="messages"
                        stroke="#888888"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ fill: '#888888', r: 3 }}
                        name="Messages"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  No engagement data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Users */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <CardTitle className="text-base">Recent Users</CardTitle>
              </div>
              <CardDescription>Newest members on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.recentUsers?.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="size-9">
                      <AvatarImage src={u.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {(u.name || u.username).slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{u.name || u.username}</p>
                      <p className="text-xs text-muted-foreground">@{u.username}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
                {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersTable onActionComplete={refreshData} />
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports">
          <ReportsPanel onActionComplete={refreshData} />
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <LogsViewer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
