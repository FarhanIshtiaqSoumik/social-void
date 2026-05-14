'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Compass, MessageSquare, Rss } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/stores/app-store'

export function LandingPage() {
  const { setShowAuthModal } = useAppStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 max-w-3xl mx-auto text-center pt-8 sm:pt-0">
        {/* Void Circle */}
        <motion.div
          className="relative mb-10 mt-4 sm:mt-0"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-primary flex items-center justify-center p-3 sm:p-5"
            animate={{
              boxShadow: [
                '0 0 0 0 rgba(255, 0, 0, 0.4)',
                '0 0 0 20px rgba(255, 0, 0, 0)',
                '0 0 0 0 rgba(255, 0, 0, 0)',
              ],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <img src="/logo.png" alt="Social Void" className="w-full h-full object-contain" />
          </motion.div>

          {/* Orbiting rings */}
          <motion.div
            className="absolute inset-[-8px] sm:inset-[-12px] rounded-full border border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-primary/40" />
          </motion.div>
          <motion.div
            className="absolute inset-[-16px] sm:inset-[-28px] rounded-full border border-primary/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full bg-primary/20" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-7xl font-bold tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          SOCIAL <span className="text-primary">VOID</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Enter the Void. Share your world.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <Button
            size="lg"
            className="bg-primary hover:bg-primary/90 text-white px-8 h-12 text-base rounded-full"
            onClick={() => setShowAuthModal(true, 'signup')}
          >
            Join the Void
            <ArrowRight className="ml-2 size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 h-12 text-base rounded-full border-primary/30 hover:border-primary hover:bg-primary/5"
            onClick={() => setShowAuthModal(true, 'login')}
          >
            Sign In
          </Button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-lg"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <FeatureCard
            icon={<Rss className="size-5" />}
            title="Feed"
            description="Discover stories that matter"
          />
          <FeatureCard
            icon={<MessageSquare className="size-5" />}
            title="Messenger"
            description="Real-time conversations"
          />
          <FeatureCard
            icon={<Compass className="size-5" />}
            title="Discover"
            description="Find your community"
          />
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex flex-col items-center text-center p-4 rounded-xl hover:bg-muted/50 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3">
        {icon}
      </div>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}
