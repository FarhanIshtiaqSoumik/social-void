'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Eye, EyeOff, Shield, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'
import { AdminView } from '@/components/admin/admin-view'
import { useToast } from '@/hooks/use-toast'

export default function AdminPage() {
  const { setUser, user } = useAppStore()
  const { toast } = useToast()

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // On mount, check for existing admin session
  useEffect(() => {
    const validateAdminSession = async () => {
      const adminToken = localStorage.getItem('void-admin-token')
      const adminUser = localStorage.getItem('void-admin-user')

      if (!adminToken || !adminUser) {
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({ action: 'me' }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.user?.isAdmin) {
            setUser(data.user, adminToken)
            setIsAdminAuthenticated(true)
          } else {
            // Not an admin user
            localStorage.removeItem('void-admin-token')
            localStorage.removeItem('void-admin-user')
          }
        } else {
          localStorage.removeItem('void-admin-token')
          localStorage.removeItem('void-admin-user')
        }
      } catch {
        // Network error, try stored user as fallback
        try {
          const parsedUser = JSON.parse(adminUser)
          if (parsedUser?.isAdmin) {
            setUser(parsedUser, adminToken)
            setIsAdminAuthenticated(true)
          }
        } catch {
          localStorage.removeItem('void-admin-token')
          localStorage.removeItem('void-admin-user')
        }
      }
      setIsLoading(false)
    }

    validateAdminSession()
  }, [setUser])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }
    setIsLoggingIn(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'admin-login', email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Admin Login Failed', description: data.error, variant: 'destructive' })
        return
      }
      localStorage.setItem('void-admin-token', data.token)
      localStorage.setItem('void-admin-user', JSON.stringify(data.user))
      setUser(data.user, data.token)
      setIsAdminAuthenticated(true)
      toast({ title: 'Admin Access Granted', description: 'Welcome, Administrator' })
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('void-admin-token')
    localStorage.removeItem('void-admin-user')
    setUser(null, null)
    setIsAdminAuthenticated(false)
    setEmail('')
    setPassword('')
    toast({ title: 'Logged out', description: 'Admin session ended' })
  }

  // Loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
            <Shield className="size-6 text-white" />
          </div>
          <Loader2 className="size-5 animate-spin text-zinc-500" />
        </div>
      </div>
    )
  }

  // Authenticated - show admin dashboard
  if (isAdminAuthenticated && user?.isAdmin) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-zinc-100">
        {/* Admin Header */}
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-[#0a0a0f]/95 backdrop-blur">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white font-mono">V</span>
              </div>
              <span className="font-semibold text-zinc-100">
                Social <span className="text-red-500">Void</span>
              </span>
              <span className="text-xs font-medium text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full ml-1">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-zinc-500 hidden sm:block">
                {user.email}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <LogOut className="size-4 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Admin Content */}
        <main className="max-w-7xl mx-auto">
          <AdminView />
        </main>
      </div>
    )
  }

  // Not authenticated - show login form
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-full bg-red-600 flex items-center justify-center">
            <Shield className="size-7 text-white" />
          </div>
        </div>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-zinc-100 text-xl">Admin Access</CardTitle>
            <CardDescription className="text-zinc-500">
              Administrative credentials required
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/5 border border-red-500/20 mb-4">
              <Shield className="size-4 text-red-500 shrink-0" />
              <span className="text-xs text-zinc-500">Restricted area — authorized personnel only</span>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-zinc-300">Admin Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@secret.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoggingIn}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-zinc-300">Admin Password</Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoggingIn}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-red-500 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                Access Admin Panel
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Social Void Admin Panel
        </p>
      </motion.div>
    </div>
  )
}
