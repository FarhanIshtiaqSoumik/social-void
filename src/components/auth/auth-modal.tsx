'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAppStore } from '@/stores/app-store'
import { useToast } from '@/hooks/use-toast'

const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/

export function AuthModal() {
  const { showAuthModal, setShowAuthModal, authModalTab, setUser } = useAppStore()
  const { toast } = useToast()

  const [tab, setTab] = useState<'login' | 'signup'>(authModalTab)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Signup form
  const [signupName, setSignupName] = useState('')
  const [signupUsername, setSignupUsername] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  // Inline validation errors
  const [usernameError, setUsernameError] = useState('')

  // Sync tab with store
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setShowAuthModal(false)
      resetForms()
    }
  }

  const resetForms = () => {
    setLoginEmail('')
    setLoginPassword('')
    setSignupName('')
    setSignupUsername('')
    setSignupEmail('')
    setSignupPassword('')
    setUsernameError('')
    setShowPassword(false)
    setIsLoading(false)
  }

  const handleTabChange = (newTab: 'login' | 'signup') => {
    setTab(newTab)
  }

  const validateUsername = (value: string): string => {
    if (!value) return 'Username is required'
    if (value.length < 3) return 'Username must be at least 3 characters'
    if (value.length > 20) return 'Username must be at most 20 characters'
    if (!USERNAME_REGEX.test(value)) return 'Only letters, numbers, and underscores allowed'
    return ''
  }

  const handleUsernameChange = (value: string) => {
    setSignupUsername(value)
    if (value) {
      setUsernameError(validateUsername(value))
    } else {
      setUsernameError('')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast({ title: 'Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Login Failed', description: data.error, variant: 'destructive' })
        return
      }
      localStorage.setItem('void-token', data.token)
      localStorage.setItem('void-user', JSON.stringify(data.user))
      setUser(data.user, data.token)
      setShowAuthModal(false)
      resetForms()
      toast({ title: 'Welcome back!', description: `Signed in as ${data.user.username}` })
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate username
    const uError = validateUsername(signupUsername)
    if (uError) {
      setUsernameError(uError)
      return
    }

    if (!signupEmail || !signupPassword) {
      toast({ title: 'Error', description: 'Please fill in all required fields', variant: 'destructive' })
      return
    }
    if (signupPassword.length < 6) {
      toast({ title: 'Error', description: 'Password must be at least 6 characters', variant: 'destructive' })
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'signup',
          email: signupEmail,
          password: signupPassword,
          name: signupName,
          username: signupUsername,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.field === 'username') {
          setUsernameError(data.error)
        }
        toast({ title: 'Sign Up Failed', description: data.error, variant: 'destructive' })
        return
      }
      localStorage.setItem('void-token', data.token)
      localStorage.setItem('void-user', JSON.stringify(data.user))
      setUser(data.user, data.token)
      setShowAuthModal(false)
      resetForms()
      toast({ title: 'Welcome to the Void!', description: `Account created as ${data.user.username}` })
    } catch {
      toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={showAuthModal} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>Sign in or create an account</DialogDescription>
        </DialogHeader>

        <div className="p-6 pb-0">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xl font-bold text-white font-mono">V</span>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-center mb-6">Welcome to the Void</h2>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 rounded-lg bg-muted p-1">
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'login'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabChange('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              tab === 'signup'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTabChange('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 pt-4">
          <AnimatePresence mode="wait">
            {tab === 'login' ? (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleLogin}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="you@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Sign In
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSignup}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Display Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="Your name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-username">Username</Label>
                  <Input
                    id="signup-username"
                    type="text"
                    placeholder="3-20 chars, letters, numbers, _"
                    value={signupUsername}
                    onChange={(e) => handleUsernameChange(e.target.value)}
                    disabled={isLoading}
                    className={usernameError ? 'border-destructive focus-visible:ring-destructive' : ''}
                  />
                  {usernameError && (
                    <p className="text-xs text-destructive">{usernameError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Min. 6 characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
                  Create Account
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
