'use client'

import { motion } from 'framer-motion'
import { Code2, Database, Globe, MessageSquare, Paintbrush, Server, Shield, Zap } from 'lucide-react'

const techStack = [
  { name: 'Next.js 16', category: 'Framework', icon: Globe },
  { name: 'TypeScript', category: 'Language', icon: Code2 },
  { name: 'Prisma ORM', category: 'Database', icon: Database },
  { name: 'Socket.io', category: 'Real-time', icon: MessageSquare },
  { name: 'Tailwind CSS 4', category: 'Styling', icon: Paintbrush },
  { name: 'shadcn/ui', category: 'Components', icon: Shield },
  { name: 'Framer Motion', category: 'Animation', icon: Zap },
  { name: 'Zustand', category: 'State', icon: Server },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
}

export function Credits() {
  return (
    <div className="max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
      <motion.div
        className="max-w-3xl mx-auto pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Title */}
        <motion.div
          variants={itemVariants}
          className="text-center py-12 border-b border-border"
        >
          {/* Void Circle */}
          <motion.div
            className="relative mx-auto mb-8 w-20 h-20"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.div
              className="w-20 h-20 rounded-full bg-primary flex items-center justify-center"
              animate={{
                boxShadow: [
                  '0 0 0 0 rgba(255, 0, 0, 0.3)',
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
              <span className="text-2xl font-bold text-white font-mono">V</span>
            </motion.div>
          </motion.div>

          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
            SOCIAL <span className="text-primary">VOID</span>
          </h1>
          <p className="text-lg text-muted-foreground font-light tracking-wide">
            Credits & Attribution
          </p>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          variants={itemVariants}
          className="py-10 text-center"
        >
          <div className="relative px-6 py-8">
            {/* Decorative quotes */}
            <span className="absolute top-2 left-4 text-6xl text-primary/10 font-serif leading-none">&ldquo;</span>
            <span className="absolute bottom-2 right-4 text-6xl text-primary/10 font-serif leading-none">&rdquo;</span>

            <p className="text-base sm:text-lg leading-relaxed text-foreground/80 italic max-w-2xl mx-auto">
              This platform, Social Void, is the intellectual and technical manifestation of Farhan Ishtiaq Soumik. It represents a commitment to high-performance architecture, aesthetic design, and the democratization of digital space.
            </p>
          </div>
        </motion.div>

        {/* Creator Section */}
        <motion.div
          variants={itemVariants}
          className="py-8 text-center border-y border-border"
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-lg font-mono">F</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-widest text-muted-foreground mb-1">
                Designed and Engineered by
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold">
                Farhan Ishtiaq <span className="text-primary">Soumik</span>
              </h2>
            </div>
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          variants={itemVariants}
          className="py-10"
        >
          <h3 className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-8">
            Built With
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {techStack.map((tech, i) => {
              const Icon = tech.icon
              return (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.08, duration: 0.4 }}
                  className="flex flex-col items-center p-4 rounded-xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2 group-hover:bg-primary/20 transition-colors">
                    <Icon className="size-5" />
                  </div>
                  <p className="text-sm font-semibold">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.category}</p>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Additional Credits */}
        <motion.div
          variants={itemVariants}
          className="py-8 border-t border-border space-y-6"
        >
          <h3 className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-4">
            Acknowledgments
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Paintbrush className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Design System</p>
                <p className="text-xs text-muted-foreground">
                  shadcn/ui — Radix UI primitives with Tailwind CSS styling
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Database className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Data Layer</p>
                <p className="text-xs text-muted-foreground">
                  Prisma ORM with SQLite — Type-safe database access
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MessageSquare className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Real-time Engine</p>
                <p className="text-xs text-muted-foreground">
                  Socket.io — Bi-directional, event-based communication
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Zap className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Animation</p>
                <p className="text-xs text-muted-foreground">
                  Framer Motion — Production-ready motion for React
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          variants={itemVariants}
          className="text-center pt-8 pb-4"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <span className="text-[10px] font-bold text-white font-mono">V</span>
            </div>
            <span className="text-sm font-semibold">
              Social <span className="text-primary">Void</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Social Void. Crafted with precision.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
