'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAppStore } from '@/stores/app-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  AlertTriangle,
  CheckCircle2,
  ShieldBan,
  Trash2,
  Loader2,
  User,
  FileText,
  Clock,
} from 'lucide-react'

interface Report {
  id: string
  reason: string
  status: string
  createdAt: string
  reporter: {
    id: string
    username: string
    name: string | null
  }
  reportedUser: {
    id: string
    username: string
    name: string | null
  } | null
  reportedPost: {
    id: string
    caption: string | null
  } | null
}

interface ReportsPanelProps {
  onActionComplete?: () => void
}

export function ReportsPanel({ onActionComplete }: ReportsPanelProps) {
  const { token } = useAppStore()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch('/api/admin?type=reports', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const handleAction = async (action: string, payload: Record<string, string>) => {
    if (!token) return
    const id = payload.reportId || payload.userId || payload.postId || 'unknown'
    setActionLoading(id)
    try {
      const res = await fetch('/api/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, ...payload }),
      })
      if (res.ok) {
        toast.success(`Action "${action}" applied successfully`)
        await fetchReports()
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
          <AlertTriangle className="size-4 text-primary" />
          <CardTitle className="text-base">Pending Reports</CardTitle>
        </div>
        <CardDescription>
          {reports.length} pending report{reports.length !== 1 ? 's' : ''} to review
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="size-10 text-green-500 mb-3" />
            <p className="text-sm font-medium">All clear!</p>
            <p className="text-xs text-muted-foreground">No pending reports to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={report.id}>
                {index > 0 && <Separator className="mb-4" />}
                <div className="rounded-lg border p-4 space-y-3">
                  {/* Report Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertTriangle className="size-4 text-orange-500 shrink-0" />
                      <span className="text-sm font-medium truncate">Report</span>
                      <Badge variant="outline" className="shrink-0 text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900">
                        Pending
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="size-3" />
                      {new Date(report.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">Reason:</p>
                    <p className="text-sm">{report.reason}</p>
                  </div>

                  {/* Reporter & Reported */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="size-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">Reporter:</span>
                      <span className="font-medium">@{report.reporter.username}</span>
                    </div>
                    {report.reportedUser && (
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-red-500" />
                        <span className="text-muted-foreground">Reported user:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          @{report.reportedUser.username}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Reported Post */}
                  {report.reportedPost && (
                    <div className="flex items-start gap-2 text-sm">
                      <FileText className="size-3.5 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="text-muted-foreground">Reported post: </span>
                        <span className="text-sm italic">
                          &ldquo;{(report.reportedPost.caption || 'No caption').slice(0, 80)}
                          {(report.reportedPost.caption || '').length > 80 ? '...' : ''}&rdquo;
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          disabled={actionLoading === report.id}
                        >
                          {actionLoading === report.id ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <CheckCircle2 className="size-3.5" />
                          )}
                          Resolve
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Resolve Report</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will dismiss the report as resolved. No action will be taken against the reported user or post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleAction('resolve-report', { reportId: report.id })}
                          >
                            Resolve
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {report.reportedUser && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
                            disabled={actionLoading === report.reportedUser!.id}
                          >
                            {actionLoading === report.reportedUser.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <ShieldBan className="size-3.5" />
                            )}
                            Ban User
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Ban User</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will ban @{report.reportedUser.username} from the platform. They will not be able to log in or interact.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                handleAction('ban', {
                                  userId: report.reportedUser!.id,
                                  reportId: report.id,
                                })
                              }
                            >
                              Ban User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {report.reportedPost && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-900"
                            disabled={actionLoading === report.reportedPost!.id}
                          >
                            {actionLoading === report.reportedPost.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="size-3.5" />
                            )}
                            Delete Post
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Post</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the reported post. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-red-600 hover:bg-red-700"
                              onClick={() =>
                                handleAction('delete-post', {
                                  postId: report.reportedPost!.id,
                                  reportId: report.id,
                                })
                              }
                            >
                              Delete Post
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
