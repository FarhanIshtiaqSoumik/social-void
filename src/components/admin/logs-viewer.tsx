'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAppStore } from '@/stores/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  FileText,
  RefreshCw,
  Loader2,
  Info,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from 'lucide-react'

interface LogEntry {
  id: string
  level: string
  message: string
  path: string | null
  statusCode: number | null
  createdAt: string
}

type LogLevel = 'all' | 'info' | 'warn' | 'error'

export function LogsViewer() {
  const { token } = useAppStore()
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [levelFilter, setLevelFilter] = useState<LogLevel>('all')
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchLogs = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/admin?type=logs', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, levelFilter])

  const filteredLogs = logs.filter((log) => {
    if (levelFilter === 'all') return true
    return log.level === levelFilter
  })

  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          badgeClass: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900',
        }
      case 'warn':
        return {
          icon: AlertTriangle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900',
        }
      default:
        return {
          icon: Info,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          badgeClass: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-900/40 dark:text-gray-400 dark:border-gray-800',
        }
    }
  }

  const levelCounts = {
    info: logs.filter((l) => l.level === 'info').length,
    warn: logs.filter((l) => l.level === 'warn').length,
    error: logs.filter((l) => l.level === 'error').length,
  }

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-primary" />
            <CardTitle className="text-base">System Logs</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setLoading(true)
              fetchLogs()
            }}
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <CardDescription>
          Recent system events and activity logs
        </CardDescription>

        {/* Level counts */}
        <div className="flex items-center gap-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs">
            <Info className="size-3 text-gray-500" />
            <span className="text-muted-foreground">{levelCounts.info} info</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <AlertTriangle className="size-3 text-yellow-500" />
            <span className="text-muted-foreground">{levelCounts.warn} warnings</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <XCircle className="size-3 text-red-500" />
            <span className="text-muted-foreground">{levelCounts.error} errors</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Level filter */}
        <div className="flex items-center gap-3 mb-4">
          <Select value={levelFilter} onValueChange={(v) => setLevelFilter(v as LogLevel)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Filter by level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            {filteredLogs.length} log {filteredLogs.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {/* Logs Display */}
        <div className="rounded-lg border bg-muted/30">
          <ScrollArea className="h-[400px]">
            <div className="p-3 space-y-1 font-mono text-xs" ref={scrollRef}>
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="size-8 text-muted-foreground/50 mb-2" />
                  <p className="text-muted-foreground">No logs found</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
                  const config = getLevelConfig(log.level)
                  const LevelIcon = config.icon

                  return (
                    <div
                      key={log.id}
                      className={`flex items-start gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors ${config.bgColor}`}
                    >
                      <LevelIcon className={`size-3.5 mt-0.5 shrink-0 ${config.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 h-4 ${config.badgeClass}`}>
                            {log.level.toUpperCase()}
                          </Badge>
                          {log.statusCode && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                              {log.statusCode}
                            </Badge>
                          )}
                          <span className="text-muted-foreground text-[10px]">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-0.5 text-sm break-words">{log.message}</p>
                        {log.path && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{log.path}</p>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>

        {/* Scroll to bottom button */}
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full gap-1.5"
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
        >
          <ChevronDown className="size-3.5" />
          Scroll to Latest
        </Button>
      </CardContent>
    </Card>
  )
}
