'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Shield, FileText, Heart } from 'lucide-react'
import { useAppStore } from '@/stores/app-store'
import { PrivacyPolicy } from './privacy-policy'
import { TermsOfService } from './terms-of-service'
import { Credits } from './credits'

const pageConfig: Record<string, { title: string; icon: React.ElementType; component: React.ComponentType }> = {
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    component: PrivacyPolicy,
  },
  terms: {
    title: 'Terms of Service',
    icon: FileText,
    component: TermsOfService,
  },
  credits: {
    title: 'Credits',
    icon: Heart,
    component: Credits,
  },
}

export function LegalView() {
  const { viewingLegalPage, setViewingLegalPage } = useAppStore()

  const config = viewingLegalPage ? pageConfig[viewingLegalPage] : null

  if (!config) {
    // No legal page selected — show index
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h1 className="text-2xl font-bold">Legal</h1>
          </div>
          <p className="text-muted-foreground ml-5 mb-8">
            Policies, terms, and credits.
          </p>

          <div className="space-y-3">
            {Object.entries(pageConfig).map(([key, cfg], i) => {
              const Icon = cfg.icon
              return (
                <motion.button
                  key={key}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.3 }}
                  onClick={() => setViewingLegalPage(key)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Icon className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{cfg.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {key === 'privacy' && 'How we collect, use, and protect your data'}
                      {key === 'terms' && 'Rules and guidelines for using Social Void'}
                      {key === 'credits' && 'The people and technology behind Social Void'}
                    </p>
                  </div>
                  <ArrowLeft className="size-4 text-muted-foreground rotate-180 group-hover:text-primary transition-colors" />
                </motion.button>
              )
            })}
          </div>
        </motion.div>
      </div>
    )
  }

  const Icon = config.icon
  const PageComponent = config.component

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:px-6">
      {/* Back button + Title */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => setViewingLegalPage(null)}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Back to legal pages"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          <h1 className="text-lg font-bold">{config.title}</h1>
        </div>
      </motion.div>

      {/* Page Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={viewingLegalPage}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
        >
          <PageComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
