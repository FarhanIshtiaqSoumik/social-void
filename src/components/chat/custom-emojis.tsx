'use client'

import React from 'react'

// ── Color Palette ────────────────────────────────────────────────────────────────
const COLORS = {
  voidRed: '#FF0000',
  voidDark: '#1a1a2e',
  white: '#FFFFFF',
  lightRed: '#FF6B6B',
  teal: '#4ECDC4',
  darkGray: '#2d2d44',
  midGray: '#3d3d5c',
  softPink: '#FF9B9B',
  deepRed: '#CC0000',
  gold: '#FFD700',
  orange: '#FF8C00',
  purple: '#8B5CF6',
  deepOrange: '#E65100',
  pink: '#FF69B4',
  lightPurple: '#C4B5FD',
  lightTeal: '#99F6E4',
  lightGold: '#FDE68A',
  skyBlue: '#38BDF8',
  rose: '#FB7185',
} as const

// ── Types ────────────────────────────────────────────────────────────────────────
export interface CustomEmojiItem {
  name: string       // e.g., 'void-grin'
  label: string      // e.g., 'Void Grin'
  category: string   // e.g., 'void-faces'
  svg: React.FC<{ size?: number; className?: string }>
}

export interface CustomEmojiCategory {
  id: string
  label: string
  icon: string
  emojis: CustomEmojiItem[]
}

// ── Void Faces (16) ──────────────────────────────────────────────────────────────

const VoidGrin: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <circle cx="16.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <path d="M6 14.5 C8 18, 16 18, 18 14.5" stroke={COLORS.teal} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M7 14.5 C9 17, 15 17, 17 14.5" fill={COLORS.white} opacity="0.9"/>
  </svg>
))

const VoidSad: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8.5" cy="10" r="1" fill={COLORS.voidDark}/>
    <circle cx="16.5" cy="10" r="1" fill={COLORS.voidDark}/>
    <path d="M7 17 C9 14.5, 15 14.5, 17 17" stroke={COLORS.purple} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M7.5 7.5 L9.5 6" stroke={COLORS.purple} strokeWidth="1" strokeLinecap="round"/>
    <path d="M16.5 7.5 L14.5 6" stroke={COLORS.purple} strokeWidth="1" strokeLinecap="round"/>
  </svg>
))

const VoidAngry: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.deepOrange} strokeWidth="1.5"/>
    <circle cx="8" cy="10" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="10" r="2" fill={COLORS.white}/>
    <circle cx="8.3" cy="10.3" r="1" fill={COLORS.deepOrange}/>
    <circle cx="16.3" cy="10.3" r="1" fill={COLORS.deepOrange}/>
    <path d="M5 7.5 L10 9" stroke={COLORS.deepOrange} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 7.5 L14 9" stroke={COLORS.deepOrange} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 16 L10 15 L12 16 L14 15 L16 16" stroke={COLORS.deepOrange} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
))

const VoidLove: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.pink} strokeWidth="1.5"/>
    <path d="M8 10 C8 8, 6 7.5, 6 9 C6 10.5, 8 12, 8 12 C8 12, 10 10.5, 10 9 C10 7.5, 8 8, 8 10Z" fill={COLORS.pink}/>
    <path d="M16 10 C16 8, 14 7.5, 14 9 C14 10.5, 16 12, 16 12 C16 12, 18 10.5, 18 9 C18 7.5, 16 8, 16 10Z" fill={COLORS.pink}/>
    <path d="M7 15 C9 17.5, 15 17.5, 17 15" stroke={COLORS.pink} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
))

const VoidShock: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.5"/>
    <circle cx="8" cy="9" r="2.5" fill={COLORS.white}/>
    <circle cx="16" cy="9" r="2.5" fill={COLORS.white}/>
    <circle cx="8" cy="9" r="1.2" fill={COLORS.voidDark}/>
    <circle cx="16" cy="9" r="1.2" fill={COLORS.voidDark}/>
    <ellipse cx="12" cy="16.5" rx="3" ry="2.5" fill={COLORS.white}/>
    <ellipse cx="12" cy="16.5" rx="2" ry="1.5" fill={COLORS.voidDark}/>
  </svg>
))

const VoidCool: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.5"/>
    <rect x="4" y="8" width="7" height="4" rx="1.5" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1"/>
    <rect x="13" y="8" width="7" height="4" rx="1.5" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1"/>
    <line x1="11" y1="9.5" x2="13" y2="9.5" stroke={COLORS.gold} strokeWidth="1"/>
    <path d="M8 16 C10 18, 14 18, 16 16" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <rect x="5" y="9" width="5" height="2" rx="0.5" fill={COLORS.gold} opacity="0.3"/>
    <rect x="14" y="9" width="5" height="2" rx="0.5" fill={COLORS.gold} opacity="0.3"/>
  </svg>
))

const VoidSleep: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.5"/>
    <path d="M6 10 L10 10" stroke={COLORS.white} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 10 L18 10" stroke={COLORS.white} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 15.5 C10 14.5, 14 14.5, 15 15.5" stroke={COLORS.purple} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <text x="18" y="6" fontSize="5" fill={COLORS.purple} fontFamily="sans-serif">z</text>
    <text x="20" y="4" fontSize="4" fill={COLORS.purple} fontFamily="sans-serif" opacity="0.7">z</text>
  </svg>
))

const VoidThink: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <circle cx="16" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <path d="M9 16 L11 14.5 L13 16 L15 14.5" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <circle cx="19" cy="19" r="1" fill={COLORS.teal} opacity="0.5"/>
    <circle cx="20.5" cy="16.5" r="1.3" fill={COLORS.teal} opacity="0.6"/>
    <circle cx="17.5" cy="20.5" r="0.8" fill={COLORS.teal} opacity="0.4"/>
  </svg>
))

const VoidLaugh: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.5"/>
    <path d="M6 8.5 L9 8" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M18 8.5 L15 8" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="8" cy="9.5" r="1.2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="1.2" fill={COLORS.white}/>
    <path d="M6 14 C8 18, 16 18, 18 14" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M7 14 C9 17, 15 17, 17 14" fill={COLORS.white}/>
    <path d="M10 14 L10 16" stroke={COLORS.voidDark} strokeWidth="0.8"/>
    <path d="M12 14 L12 16.5" stroke={COLORS.voidDark} strokeWidth="0.8"/>
    <path d="M14 14 L14 16" stroke={COLORS.voidDark} strokeWidth="0.8"/>
  </svg>
))

const VoidCry: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8.3" cy="10" r="1" fill={COLORS.voidDark}/>
    <circle cx="16.3" cy="10" r="1" fill={COLORS.voidDark}/>
    <path d="M7 14.5 C9 13, 15 13, 17 14.5" stroke={COLORS.teal} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M7 11.5 L7 15" stroke={COLORS.skyBlue} strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
    <path d="M17 11.5 L17 15" stroke={COLORS.skyBlue} strokeWidth="1" strokeLinecap="round" opacity="0.8"/>
    <path d="M7.5 15.5 L7 17" stroke={COLORS.skyBlue} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
    <path d="M17.5 15.5 L17 17" stroke={COLORS.skyBlue} strokeWidth="0.8" strokeLinecap="round" opacity="0.6"/>
  </svg>
))

const VoidWink: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <path d="M14.5 9.5 L17.5 9.5" stroke={COLORS.white} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 15 C9 17, 15 17, 17 15" stroke={COLORS.purple} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
))

const VoidSmirk: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <circle cx="16.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <path d="M9 15.5 C11 16.5, 16 15.5, 17 14" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
))

const VoidEyeRoll: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2.5" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2.5" fill={COLORS.white}/>
    <circle cx="9" cy="8.5" r="1.2" fill={COLORS.voidDark}/>
    <circle cx="17" cy="8.5" r="1.2" fill={COLORS.voidDark}/>
    <path d="M9 16 C11 14.5, 13 14.5, 15 16" stroke={COLORS.purple} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
))

const VoidNerd: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.5"/>
    <rect x="4" y="7.5" width="7" height="5" rx="1.5" fill="none" stroke={COLORS.teal} strokeWidth="1.2"/>
    <rect x="13" y="7.5" width="7" height="5" rx="1.5" fill="none" stroke={COLORS.teal} strokeWidth="1.2"/>
    <line x1="11" y1="9.5" x2="13" y2="9.5" stroke={COLORS.teal} strokeWidth="1"/>
    <circle cx="7.5" cy="10" r="1.5" fill={COLORS.teal} opacity="0.4"/>
    <circle cx="16.5" cy="10" r="1.5" fill={COLORS.teal} opacity="0.4"/>
    <path d="M8 16 C10 17.5, 14 17.5, 16 16" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <circle cx="7.5" cy="10" r="0.8" fill={COLORS.voidDark}/>
    <circle cx="16.5" cy="10" r="0.8" fill={COLORS.voidDark}/>
  </svg>
))

const VoidSilly: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.5"/>
    <circle cx="8" cy="9" r="1" fill={COLORS.white}/>
    <circle cx="16" cy="9" r="1" fill={COLORS.white}/>
    <path d="M6 8 L10 7" stroke={COLORS.white} strokeWidth="1" strokeLinecap="round"/>
    <path d="M18 8 L14 7" stroke={COLORS.white} strokeWidth="1" strokeLinecap="round"/>
    <path d="M5 14 C8 17, 16 17, 19 14" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <path d="M6 14 C9 16, 15 16, 18 14" fill={COLORS.white} opacity="0.9"/>
    <path d="M9 14 L9 15.5" stroke={COLORS.voidDark} strokeWidth="0.6"/>
    <path d="M12 14 L12 16" stroke={COLORS.voidDark} strokeWidth="0.6"/>
    <path d="M15 14 L15 15.5" stroke={COLORS.voidDark} strokeWidth="0.6"/>
  </svg>
))

const VoidBlush: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="11" fill={COLORS.voidDark} stroke={COLORS.pink} strokeWidth="1.5"/>
    <circle cx="8" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="16" cy="9.5" r="2" fill={COLORS.white}/>
    <circle cx="8.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <circle cx="16.5" cy="9.5" r="1" fill={COLORS.voidDark}/>
    <path d="M8 16 C10 17.5, 14 17.5, 16 16" stroke={COLORS.pink} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
    <ellipse cx="5" cy="13" rx="2" ry="1.2" fill={COLORS.pink} opacity="0.3"/>
    <ellipse cx="19" cy="13" rx="2" ry="1.2" fill={COLORS.pink} opacity="0.3"/>
  </svg>
))

// ── Void Hands (11) ───────────────────────────────────────────────────────────────

const VoidWave: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 18 L8 10 C8 8.5, 10 8.5, 10 10 L10 8 C10 6.5, 12 6.5, 12 8 L12 7 C12 5.5, 14 5.5, 14 7 L14 8 C14 6.5, 16 6.5, 16 8 L16 13 L18 11 C19 10, 20.5 11, 19.5 12.5 L16 17 C15 18.5, 13 20, 10 20 C8 20, 8 18, 8 18Z" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M4 8 Q6 6, 6 8 Q6 10, 4 8Z" fill={COLORS.teal} opacity="0.6"/>
    <path d="M3 12 Q5 10, 5 12 Q5 14, 3 12Z" fill={COLORS.teal} opacity="0.5"/>
    <path d="M4 16 Q6 14, 6 16 Q6 18, 4 16Z" fill={COLORS.teal} opacity="0.4"/>
  </svg>
))

const VoidThumbsUp: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M10 10 L10 5 C10 3.5, 12 3, 12.5 4.5 L13.5 10 L18 10 C19.5 10, 20 11, 19.5 12.5 L18 18 C17.5 19.5, 16.5 20, 15 20 L10 20 L10 10Z" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.2"/>
    <rect x="5" y="10" width="5" height="10" rx="1" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.2"/>
    <rect x="6" y="12" width="2" height="2" rx="0.5" fill={COLORS.gold} opacity="0.4"/>
  </svg>
))

const VoidPeace: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 20 C12 20, 6 16, 6 10 L6 6 L9 4 L12 8 L15 4 L18 6 L18 10 C18 16, 12 20, 12 20Z" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M12 9 L12 18" stroke={COLORS.teal} strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 12 L8.5 8" stroke={COLORS.teal} strokeWidth="1" strokeLinecap="round"/>
    <path d="M12 12 L15.5 8" stroke={COLORS.teal} strokeWidth="1" strokeLinecap="round"/>
  </svg>
))

const VoidClap: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 14 L8 8 L10 7 L12 8 L14 7 L16 8 L17 12 L17 16 C17 18, 15 19, 13 19 L9 19 C7 19, 6 17.5, 6 16Z" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.2"/>
    <path d="M3 7 L5 5" stroke={COLORS.gold} strokeWidth="1" strokeLinecap="round"/>
    <path d="M5 5 L5 3" stroke={COLORS.gold} strokeWidth="1" strokeLinecap="round"/>
    <path d="M5 5 L7 4" stroke={COLORS.gold} strokeWidth="1" strokeLinecap="round"/>
    <path d="M9 13 L15 13" stroke={COLORS.gold} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M10 11 L14 11" stroke={COLORS.gold} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
  </svg>
))

const VoidPoint: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M14 4 L14 14 L18 12 C19.5 11.5, 20.5 13, 19 14 L13 19 C12 19.8, 10.5 20, 9 20 L7 20 C5.5 20, 5 19, 5 17.5 L5 12 C5 10.5, 6 10, 7 10 L10 10 L10 4 C10 2.5, 14 2.5, 14 4Z" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.2"/>
    <circle cx="12" cy="8" r="0.8" fill={COLORS.gold} opacity="0.5"/>
  </svg>
))

const VoidFist: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 14 L6 10 C6 8.5, 8 8.5, 8 10 L8 8 C8 6.5, 10 6.5, 10 8 L10 7 C10 5.5, 12 5.5, 12 7 L12 8 C12 6.5, 14 6.5, 14 8 L14 7 C14 5.5, 16 5.5, 16 7 L16 14 C16 17, 14 19, 11 19 C8 19, 6 17, 6 14Z" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M8 11 L14 11" stroke={COLORS.teal} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M8 13.5 L14 13.5" stroke={COLORS.teal} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
  </svg>
))

const VoidOk: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="10" cy="9" r="4" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.2"/>
    <circle cx="10" cy="9" r="2" fill={COLORS.voidDark}/>
    <path d="M13 11 L19 18" stroke={COLORS.voidDark} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M13 11 L19 18" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M7 9 L10 12 L14 7" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
))

const VoidHeartHands: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 14 C4 10, 8 8, 10 10 L12 12 L14 10 C16 8, 20 10, 20 14 C20 18, 12 21, 12 21 C12 21, 4 18, 4 14Z" fill={COLORS.voidRed} opacity="0.8"/>
    <path d="M6 13 C6 11, 8 10, 9 11 L12 14 L15 11 C16 10, 18 11, 18 13 C18 16, 12 19, 12 19 C12 19, 6 16, 6 13Z" fill={COLORS.voidDark} stroke={COLORS.pink} strokeWidth="1"/>
  </svg>
))

const VoidCrossedFingers: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 18 L9 8 C9 6.5, 11 6.5, 11 8 L11 7 C11 5.5, 13 5.5, 13 7 L13 6.5 C13 5, 15 5, 15 6.5 L15 8 C15 6.5, 17 6.5, 17 8 L17 14 C17 17, 15 19, 12 19 C10 19, 9 18, 9 18Z" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.2"/>
    <path d="M8 8 L14 6" stroke={COLORS.gold} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
  </svg>
))

const VoidHandshake: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 10 L7 6 L10 7 L12 6 L15 7 L18 5 L21 8" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M3 10 L7 13 L10 12 L12 13 L15 12 L18 14 L21 11" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    <path d="M7 6 L7 13" stroke={COLORS.teal} strokeWidth="0.8" opacity="0.4"/>
    <path d="M18 5 L18 14" stroke={COLORS.gold} strokeWidth="0.8" opacity="0.4"/>
  </svg>
))

const VoidWriting: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M16 3 L16 10 C16 11, 15.5 12, 14 12 L14 14 L12 12 L8 12 C7 12, 6 11, 6 10 L6 3" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.2"/>
    <path d="M9 6 L13 6" stroke={COLORS.purple} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M9 8.5 L12 8.5" stroke={COLORS.purple} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M14 14 L13 18 L15 16.5 L14 14Z" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="0.8"/>
    <path d="M4 18 L20 18" stroke={COLORS.midGray} strokeWidth="1" strokeLinecap="round"/>
    <path d="M4 20 L16 20" stroke={COLORS.midGray} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
  </svg>
))

// ── Void Hearts (10) ──────────────────────────────────────────────────────────────

const PulseHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.voidRed}/>
    <path d="M5 12 L8 12 L9.5 8 L11 14 L12.5 10 L14 12 L19 12" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
))

const FireHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.voidRed}/>
    <path d="M9 8 C9 6, 12 3, 12 5 C12 3, 15 6, 15 8 C15 10, 13 11, 12 9 C11 11, 9 10, 9 8Z" fill={COLORS.orange}/>
    <path d="M10.5 8 C10.5 7, 12 5.5, 12 6.5 C12 5.5, 13.5 7, 13.5 8 C13.5 9, 12.5 9.5, 12 8.5 C11.5 9.5, 10.5 9, 10.5 8Z" fill={COLORS.gold}/>
  </svg>
))

const BrokenHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M11.5 21 C11.5 21, 3 16, 3 10 C3 6, 5.5 4, 8.5 4 C10 4, 11 5, 11.5 6 L11.5 12Z" fill={COLORS.softPink} opacity="0.7"/>
    <path d="M12.5 21 C12.5 21, 21 16, 21 10 C21 6, 18.5 4, 15.5 4 C14 4, 13 5, 12.5 6 L12.5 11Z" fill={COLORS.softPink} opacity="0.7"/>
    <path d="M11.5 6 L10 9 L13 7.5 L11.5 11 L12.5 9 L10.5 10.5 L12.5 6" stroke={COLORS.voidDark} strokeWidth="0.8" fill="none"/>
    <path d="M11 3 L12 5 L13 3" stroke={COLORS.voidDark} strokeWidth="0.8" strokeLinecap="round"/>
  </svg>
))

const VoidHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.voidDark} stroke={COLORS.voidRed} strokeWidth="1.5"/>
    <circle cx="12" cy="11" r="3" fill={COLORS.voidRed} opacity="0.6"/>
    <circle cx="12" cy="11" r="1.5" fill={COLORS.voidRed}/>
  </svg>
))

const SparkHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.voidRed}/>
    <path d="M8 9 L9 7.5 L10 9 L9 10.5Z" fill={COLORS.white} opacity="0.9"/>
    <path d="M14 8 L15.5 6 L17 8 L15.5 10Z" fill={COLORS.white} opacity="0.9"/>
    <path d="M11 12 L12 10.5 L13 12 L12 13.5Z" fill={COLORS.white} opacity="0.8"/>
    <path d="M16 11 L16.8 9.8 L17.6 11 L16.8 12.2Z" fill={COLORS.white} opacity="0.7"/>
  </svg>
))

const DoubleHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 18 C8 18, 2 14, 2 9.5 C2 7, 4 5.5, 6 5.5 C7 5.5, 7.8 6, 8 7 C8.2 6, 9 5.5, 10 5.5 C12 5.5, 14 7, 14 9.5 C14 14, 8 18, 8 18Z" fill={COLORS.voidRed} opacity="0.8"/>
    <path d="M15 19 C15 19, 9 15, 9 10.5 C9 8, 11 6.5, 13 6.5 C14 6.5, 14.8 7, 15 8 C15.2 7, 16 6.5, 17 6.5 C19 6.5, 21 8, 21 10.5 C21 15, 15 19, 15 19Z" fill={COLORS.softPink} opacity="0.9"/>
  </svg>
))

const InfinityHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 20 C12 20, 3 15, 3 9.5 C3 6.5, 5.5 4.5, 8 4.5 C9.5 4.5, 11 5.5, 12 7 C13 5.5, 14.5 4.5, 16 4.5 C18.5 4.5, 21 6.5, 21 9.5 C21 15, 12 20, 12 20Z" fill={COLORS.voidRed}/>
    <path d="M6 11 C8 9.5, 10 9.5, 12 11 C14 12.5, 16 12.5, 18 11" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.7"/>
  </svg>
))

const CrystalHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.teal} opacity="0.3" stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M7 10 L12 6 L17 10 L12 18Z" fill="none" stroke={COLORS.white} strokeWidth="0.6" opacity="0.5"/>
    <path d="M12 6 L12 18" stroke={COLORS.white} strokeWidth="0.5" opacity="0.3"/>
    <path d="M7 10 L17 10" stroke={COLORS.white} strokeWidth="0.5" opacity="0.3"/>
  </svg>
))

const VoidRainbowHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.voidRed} opacity="0.15" stroke={COLORS.voidRed} strokeWidth="0.5"/>
    <path d="M12 20 C12 20, 4 15.5, 4 10 C4 6.5, 6.5 5, 9 5 C10.5 5, 11.5 5.8, 12 7 C12.5 5.8, 13.5 5, 15 5 C17.5 5, 20 6.5, 20 10 C20 15.5, 12 20, 12 20Z" fill="none" stroke={COLORS.orange} strokeWidth="0.8"/>
    <path d="M12 19 C12 19, 5 15, 5 10 C5 7, 7 5.5, 9 5.5 C10.5 5.5, 11.5 6.3, 12 7.5" fill="none" stroke={COLORS.gold} strokeWidth="0.8"/>
    <path d="M12 19 C12 19, 19 15, 19 10 C19 7, 17 5.5, 15 5.5 C13.5 5.5, 12.5 6.3, 12 7.5" fill="none" stroke={COLORS.teal} strokeWidth="0.8"/>
    <path d="M12 18 C12 18, 6 14.5, 6 10 C6 7.5, 7.5 6, 9 6 C10.5 6, 11.5 6.8, 12 8" fill="none" stroke={COLORS.purple} strokeWidth="0.8"/>
    <path d="M12 18 C12 18, 18 14.5, 18 10 C18 7.5, 16.5 6, 15 6 C13.5 6, 12.5 6.8, 12 8" fill="none" stroke={COLORS.pink} strokeWidth="0.8"/>
  </svg>
))

const VoidGalaxyHeart: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 21 C12 21, 3 16, 3 10 C3 6, 6 4, 9 4 C10.5 4, 11.5 5, 12 6 C12.5 5, 13.5 4, 15 4 C18 4, 21 6, 21 10 C21 16, 12 21, 12 21Z" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.5"/>
    <circle cx="9" cy="9" r="0.8" fill={COLORS.white} opacity="0.8"/>
    <circle cx="14" cy="7" r="0.5" fill={COLORS.white} opacity="0.6"/>
    <circle cx="16" cy="10" r="0.6" fill={COLORS.white} opacity="0.7"/>
    <circle cx="11" cy="12" r="0.4" fill={COLORS.purple} opacity="0.8"/>
    <circle cx="8" cy="13" r="0.5" fill={COLORS.teal} opacity="0.6"/>
    <circle cx="15" cy="14" r="0.7" fill={COLORS.purple} opacity="0.7"/>
    <circle cx="12" cy="16" r="0.4" fill={COLORS.white} opacity="0.5"/>
    <path d="M9 9 L11 10 L14 7" stroke={COLORS.purple} strokeWidth="0.4" opacity="0.5"/>
    <path d="M14 7 L16 10 L15 14" stroke={COLORS.teal} strokeWidth="0.4" opacity="0.5"/>
  </svg>
))

// ── Void Fire (6) ────────────────────────────────────────────────────────────────

const TinyFlame: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3 C12 3, 8 8, 8 13 C8 16, 9.5 18, 12 18 C14.5 18, 16 16, 16 13 C16 8, 12 3, 12 3Z" fill={COLORS.deepOrange}/>
    <path d="M12 7 C12 7, 10 10, 10 13 C10 15, 10.8 16, 12 16 C13.2 16, 14 15, 14 13 C14 10, 12 7, 12 7Z" fill={COLORS.orange}/>
    <path d="M12 10 C12 10, 11 12, 11 13.5 C11 14.5, 11.5 15, 12 15 C12.5 15, 13 14.5, 13 13.5 C13 12, 12 10, 12 10Z" fill={COLORS.gold}/>
  </svg>
))

const BigFire: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 C12 2, 5 8, 5 14 C5 18.5, 8 21, 12 21 C16 21, 19 18.5, 19 14 C19 8, 12 2, 12 2Z" fill={COLORS.deepOrange}/>
    <path d="M12 6 C12 6, 8 10, 8 14.5 C8 17.5, 9.5 19.5, 12 19.5 C14.5 19.5, 16 17.5, 16 14.5 C16 10, 12 6, 12 6Z" fill={COLORS.orange}/>
    <path d="M12 10 C12 10, 10 13, 10 15 C10 17, 11 18, 12 18 C13 18, 14 17, 14 15 C14 13, 12 10, 12 10Z" fill={COLORS.gold}/>
    <path d="M12 14 C12 14, 11.5 15, 11.5 15.5 C11.5 16, 11.8 16.5, 12 16.5 C12.2 16.5, 12.5 16, 12.5 15.5 C12.5 15, 12 14, 12 14Z" fill={COLORS.white} opacity="0.8"/>
  </svg>
))

const Spark: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L13.5 9 L20 8 L14.5 12.5 L18 19 L12 14.5 L6 19 L9.5 12.5 L4 8 L10.5 9Z" fill={COLORS.gold}/>
    <path d="M12 6 L13 10 L16.5 9.5 L13.5 12 L15.5 16 L12 13.5 L8.5 16 L10.5 12 L7.5 9.5 L11 10Z" fill={COLORS.white} opacity="0.5"/>
  </svg>
))

const Star: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L14.5 8.5 L21 9.5 L16.5 14 L17.5 21 L12 17.5 L6.5 21 L7.5 14 L3 9.5 L9.5 8.5Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.5"/>
    <path d="M12 5 L13.8 9.5 L18.5 10.2 L15 13.5 L15.8 18.5 L12 16 L8.2 18.5 L9 13.5 L5.5 10.2 L10.2 9.5Z" fill={COLORS.white} opacity="0.3"/>
  </svg>
))

const Explosion: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L14 7 L18 3 L16 8 L22 8 L17 11 L21 15 L16 13 L17 19 L13 15 L12 21 L11 15 L7 19 L8 13 L3 15 L7 11 L2 8 L8 8 L6 3 L10 7Z" fill={COLORS.deepOrange} opacity="0.9"/>
    <path d="M12 6 L13.5 9 L16 7 L15 10 L18.5 10 L15.5 12 L18 14.5 L15 13 L15.5 16.5 L13 14 L12 18 L11 14 L8.5 16.5 L9 13 L6 14.5 L8.5 12 L5.5 10 L9 10 L8 7 L10.5 9Z" fill={COLORS.orange} opacity="0.8"/>
    <circle cx="12" cy="12" r="2.5" fill={COLORS.gold} opacity="0.9"/>
  </svg>
))

const Meteor: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 3 L10 10 L8 10.5 L16 18 L13 18.5 L21 21 L14 14 L16 13.5 L8 6 L11 5.5Z" fill={COLORS.voidDark} stroke={COLORS.orange} strokeWidth="1"/>
    <circle cx="16" cy="18" r="3" fill={COLORS.deepOrange} opacity="0.9"/>
    <circle cx="16" cy="18" r="1.8" fill={COLORS.orange} opacity="0.8"/>
    <circle cx="16" cy="18" r="0.8" fill={COLORS.gold}/>
    <path d="M4 4 L8 8" stroke={COLORS.gold} strokeWidth="0.8" strokeLinecap="round" opacity="0.5"/>
    <path d="M5 3 L9 7" stroke={COLORS.gold} strokeWidth="0.6" strokeLinecap="round" opacity="0.3"/>
  </svg>
))

// ── Void Skull (6) ───────────────────────────────────────────────────────────────

const Skull: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3 C7 3, 4 6.5, 4 10.5 C4 14, 6 16, 8 17 L8 19.5 C8 20, 9 20.5, 10 20.5 L14 20.5 C15 20.5, 16 20, 16 19.5 L16 17 C18 16, 20 14, 20 10.5 C20 6.5, 17 3, 12 3Z" fill={COLORS.white} stroke={COLORS.voidDark} strokeWidth="1"/>
    <ellipse cx="9" cy="10" rx="2.2" ry="2.5" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="0.5"/>
    <ellipse cx="15" cy="10" rx="2.2" ry="2.5" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="0.5"/>
    <path d="M11 14 L13 14 L12.5 15.5 L11.5 15.5Z" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="0.3"/>
    <path d="M8 20 L8 21.5" stroke={COLORS.voidDark} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 20 L12 21.5" stroke={COLORS.voidDark} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M16 20 L16 21.5" stroke={COLORS.voidDark} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

const Ghost: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 20 L5 10 C5 5, 8 2, 12 2 C16 2, 19 5, 19 10 L19 20 L17 18 L15 20 L13 18 L11 20 L9 18 L7 20Z" fill={COLORS.white} stroke={COLORS.voidDark} strokeWidth="1"/>
    <ellipse cx="9.5" cy="10" rx="1.8" ry="2" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="0.5"/>
    <ellipse cx="14.5" cy="10" rx="1.8" ry="2" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="0.5"/>
    <ellipse cx="12" cy="14" rx="2" ry="1" fill={COLORS.voidDark} opacity="0.6"/>
  </svg>
))

const Alien: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3 C7 3, 4 6, 4 10 C4 14, 6 17, 8 18 L8 20 L16 20 L16 18 C18 17, 20 14, 20 10 C20 6, 17 3, 12 3Z" fill={COLORS.teal} stroke={COLORS.voidDark} strokeWidth="1"/>
    <ellipse cx="8.5" cy="10" rx="3" ry="2" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="0.5"/>
    <ellipse cx="15.5" cy="10" rx="3" ry="2" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="0.5"/>
    <circle cx="8.5" cy="10" r="1" fill={COLORS.teal} opacity="0.8"/>
    <circle cx="15.5" cy="10" r="1" fill={COLORS.teal} opacity="0.8"/>
    <path d="M10 15 L14 15" stroke={COLORS.voidDark} strokeWidth="0.8" strokeLinecap="round"/>
  </svg>
))

const Robot: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="6" y="7" width="12" height="12" rx="2" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.2"/>
    <rect x="8" y="9.5" width="3" height="2.5" rx="0.5" fill={COLORS.teal} opacity="0.8"/>
    <rect x="13" y="9.5" width="3" height="2.5" rx="0.5" fill={COLORS.teal} opacity="0.8"/>
    <rect x="9" y="14" width="6" height="2" rx="0.5" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="0.5"/>
    <line x1="10" y1="15" x2="10" y2="15.5" stroke={COLORS.teal} strokeWidth="0.5"/>
    <line x1="12" y1="15" x2="12" y2="15.5" stroke={COLORS.teal} strokeWidth="0.5"/>
    <line x1="14" y1="15" x2="14" y2="15.5" stroke={COLORS.teal} strokeWidth="0.5"/>
    <line x1="12" y1="4" x2="12" y2="7" stroke={COLORS.voidDark} strokeWidth="1.5"/>
    <circle cx="12" cy="3.5" r="1.5" fill={COLORS.teal} opacity="0.8"/>
    <rect x="3" y="11" width="3" height="4" rx="1" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="0.8"/>
    <rect x="18" y="11" width="3" height="4" rx="1" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="0.8"/>
  </svg>
))

const Demon: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="13" r="9" fill={COLORS.deepOrange} stroke={COLORS.voidDark} strokeWidth="1"/>
    <path d="M6 8 L4 3 L8 7Z" fill={COLORS.voidDark} stroke={COLORS.deepOrange} strokeWidth="0.5"/>
    <path d="M18 8 L20 3 L16 7Z" fill={COLORS.voidDark} stroke={COLORS.deepOrange} strokeWidth="0.5"/>
    <ellipse cx="9" cy="11" rx="2" ry="1.5" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="0.5"/>
    <ellipse cx="15" cy="11" rx="2" ry="1.5" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="0.5"/>
    <circle cx="9" cy="11" r="0.7" fill={COLORS.gold}/>
    <circle cx="15" cy="11" r="0.7" fill={COLORS.gold}/>
    <path d="M9 17 C10 15.5, 14 15.5, 15 17" stroke={COLORS.voidDark} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
  </svg>
))

const Reaper: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3 C8 3, 5 6, 5 10 L5 16 L8 14 L10 16 L12 14 L14 16 L16 14 L19 16 L19 10 C19 6, 16 3, 12 3Z" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1"/>
    <circle cx="9.5" cy="9" r="1.5" fill={COLORS.purple}/>
    <circle cx="14.5" cy="9" r="1.5" fill={COLORS.purple}/>
    <circle cx="9.5" cy="9" r="0.6" fill={COLORS.white} opacity="0.8"/>
    <circle cx="14.5" cy="9" r="0.6" fill={COLORS.white} opacity="0.8"/>
    <path d="M20 2 L22 6 L17 10 L16 9Z" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="0.8"/>
    <path d="M3 18 L8 18" stroke={COLORS.voidDark} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

// ── Void Party (8) ───────────────────────────────────────────────────────────────

const Confetti: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="3" width="2" height="3" rx="0.5" fill={COLORS.teal} transform="rotate(-15 5 4.5)"/>
    <rect x="10" y="2" width="2" height="3" rx="0.5" fill={COLORS.gold} transform="rotate(10 11 3.5)"/>
    <rect x="17" y="3" width="2" height="3" rx="0.5" fill={COLORS.purple} transform="rotate(20 18 4.5)"/>
    <circle cx="6" cy="10" r="1" fill={COLORS.pink} opacity="0.8"/>
    <circle cx="18" cy="9" r="1.2" fill={COLORS.teal} opacity="0.8"/>
    <circle cx="12" cy="8" r="0.8" fill={COLORS.gold} opacity="0.8"/>
    <path d="M5 17 L4 20" stroke={COLORS.teal} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M10 15 L10 19" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M14 16 L15 20" stroke={COLORS.purple} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M19 14 L20 19" stroke={COLORS.pink} strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="7" y="13" width="2" height="2.5" rx="0.5" fill={COLORS.teal} opacity="0.7" transform="rotate(-30 8 14.25)"/>
    <rect x="15" y="12" width="2" height="2.5" rx="0.5" fill={COLORS.purple} opacity="0.7" transform="rotate(25 16 13.25)"/>
  </svg>
))

const Balloon: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <ellipse cx="12" cy="10" rx="6" ry="8" fill={COLORS.purple} opacity="0.85"/>
    <ellipse cx="10" cy="8" rx="2" ry="3" fill={COLORS.white} opacity="0.2"/>
    <path d="M12 18 L12 18.5 L11 19.5 L12 21 L13 19.5 L12 18.5Z" fill={COLORS.purple}/>
    <path d="M12 21 C12 21, 10 20, 11 22" stroke={COLORS.voidDark} strokeWidth="0.5" fill="none"/>
    <path d="M12 21 C12 21, 14 20, 13 22" stroke={COLORS.voidDark} strokeWidth="0.5" fill="none"/>
    <line x1="12" y1="21.5" x2="12" y2="23.5" stroke={COLORS.voidDark} strokeWidth="0.5"/>
  </svg>
))

const Cake: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="4" y="14" width="16" height="6" rx="2" fill={COLORS.softPink} stroke={COLORS.pink} strokeWidth="0.8"/>
    <rect x="5" y="16" width="14" height="1" fill={COLORS.white} opacity="0.3"/>
    <rect x="6" y="10" width="12" height="5" rx="1.5" fill={COLORS.pink} stroke={COLORS.rose} strokeWidth="0.5"/>
    <rect x="7" y="12" width="10" height="0.8" fill={COLORS.white} opacity="0.3"/>
    <line x1="12" y1="4" x2="12" y2="10" stroke={COLORS.voidDark} strokeWidth="1"/>
    <ellipse cx="12" cy="4" rx="1.5" ry="1.8" fill={COLORS.pink} opacity="0.9"/>
    <ellipse cx="12" cy="3.5" rx="0.8" ry="1" fill={COLORS.orange} opacity="0.8"/>
  </svg>
))

const Trophy: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M8 4 L16 4 L15 12 C15 14, 13 15, 12 15 C11 15, 9 14, 9 12Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.8"/>
    <path d="M8 6 L5 6 C4 6, 4 8, 5 8 L8 8" stroke={COLORS.gold} strokeWidth="1" fill="none"/>
    <path d="M16 6 L19 6 C20 6, 20 8, 19 8 L16 8" stroke={COLORS.gold} strokeWidth="1" fill="none"/>
    <rect x="10" y="15" width="4" height="3" fill={COLORS.gold} opacity="0.8"/>
    <rect x="8" y="18" width="8" height="2" rx="0.5" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.5"/>
  </svg>
))

const Crown: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 17 L4 8 L8 12 L12 6 L16 12 L20 8 L20 17Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="1"/>
    <rect x="4" y="17" width="16" height="3" rx="0.5" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.8"/>
    <circle cx="4" cy="7.5" r="1.2" fill={COLORS.teal}/>
    <circle cx="12" cy="5.5" r="1.2" fill={COLORS.purple}/>
    <circle cx="20" cy="7.5" r="1.2" fill={COLORS.teal}/>
  </svg>
))

const Champagne: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M9 3 L9 10 C9 12, 8 13, 8 14 L8 20 L16 20 L16 14 C16 13, 15 12, 15 10 L15 3Z" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1" opacity="0.9"/>
    <path d="M9 3 L15 3" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round"/>
    <rect x="9" y="10" width="6" height="4" rx="0.5" fill={COLORS.gold} opacity="0.3"/>
    <circle cx="11" cy="11" r="0.6" fill={COLORS.teal} opacity="0.5"/>
    <circle cx="13" cy="12.5" r="0.5" fill={COLORS.teal} opacity="0.5"/>
    <circle cx="10" cy="5" r="0.5" fill={COLORS.white} opacity="0.4"/>
    <circle cx="12" cy="4" r="0.6" fill={COLORS.white} opacity="0.3"/>
    <circle cx="14" cy="6" r="0.4" fill={COLORS.white} opacity="0.3"/>
  </svg>
))

const Gift: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <rect x="3" y="10" width="18" height="11" rx="1.5" fill={COLORS.teal} stroke={COLORS.teal} strokeWidth="0.8" opacity="0.7"/>
    <rect x="3" y="7" width="18" height="4" rx="1" fill={COLORS.teal} stroke={COLORS.teal} strokeWidth="0.8"/>
    <rect x="11" y="7" width="2" height="14" fill={COLORS.gold} opacity="0.8"/>
    <rect x="3" y="11" width="18" height="2" fill={COLORS.gold} opacity="0.4"/>
    <path d="M12 7 C12 7, 8 4, 8 6 C8 7.5, 11 7, 12 7Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.5"/>
    <path d="M12 7 C12 7, 16 4, 16 6 C16 7.5, 13 7, 12 7Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.5"/>
  </svg>
))

const Ribbon: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="9" r="4" fill={COLORS.purple} stroke={COLORS.purple} strokeWidth="1"/>
    <circle cx="12" cy="9" r="2" fill={COLORS.purple} opacity="0.5"/>
    <path d="M8 12 L4 20 L8 17 L12 20Z" fill={COLORS.purple} opacity="0.8"/>
    <path d="M16 12 L20 20 L16 17 L12 20Z" fill={COLORS.purple} opacity="0.8"/>
    <path d="M12 9 L12 7" stroke={COLORS.white} strokeWidth="0.5" opacity="0.5"/>
  </svg>
))

// ── Void Nature (12) ─────────────────────────────────────────────────────────────

const VoidMoon: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M21 12.79 C20.1 16.4, 16.8 19, 13 19 C8.6 19, 5 15.4, 5 11 C5 7.2, 7.6 3.9, 11.2 3 C10.4 4.5, 10 6.2, 10 8 C10 13, 14 17, 19 17 C19.6 17, 20.3 16.9, 21 16.8Z" fill={COLORS.voidDark} stroke={COLORS.gold} strokeWidth="1.2"/>
    <circle cx="18" cy="5" r="0.5" fill={COLORS.gold} opacity="0.6"/>
    <circle cx="20" cy="8" r="0.3" fill={COLORS.gold} opacity="0.4"/>
  </svg>
))

const VoidSun: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="5" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="1"/>
    <path d="M12 2 L12 5" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 19 L12 22" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12 L5 12" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 12 L22 12" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M4.9 4.9 L7 7" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M17 17 L19.1 19.1" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M4.9 19.1 L7 17" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M17 7 L19.1 4.9" stroke={COLORS.gold} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
))

const VoidCloud: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 18 C3.8 18, 2 16.2, 2 14 C2 12.1, 3.3 10.5, 5.1 10.1 C5 9.7, 5 9.4, 5 9 C5 6.2, 7.2 4, 10 4 C11.9 4, 13.5 5, 14.3 6.5 C15 6.2, 15.7 6, 16.5 6 C19 6, 21 8, 21 10.5 C21 10.7, 21 10.9, 20.9 11.1 C22.1 11.5, 23 12.7, 23 14 C23 15.7, 21.7 17, 20 17 L6 18Z" fill={COLORS.white} stroke={COLORS.voidDark} strokeWidth="1"/>
  </svg>
))

const VoidRain: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M6 14 C3.8 14, 2 12.2, 2 10 C2 8.1, 3.3 6.5, 5.1 6.1 C5 5.7, 5 5.4, 5 5 C5 2.2, 7.2 0, 10 0 C11.9 0, 13.5 1, 14.3 2.5 C15 2.2, 15.7 2, 16.5 2 C19 2, 21 4, 21 6.5 C21 6.7, 21 6.9, 20.9 7.1 C22.1 7.5, 23 8.7, 23 10 C23 11.7, 21.7 13, 20 13 L6 14Z" fill={COLORS.midGray} stroke={COLORS.voidDark} strokeWidth="0.8" transform="translate(0, 4)"/>
    <path d="M7 17 L6 20" stroke={COLORS.skyBlue} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M10 17 L9 20" stroke={COLORS.skyBlue} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M13 17 L12 20" stroke={COLORS.skyBlue} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M16 17 L15 20" stroke={COLORS.skyBlue} strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
))

const VoidSnow: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L12 22" stroke={COLORS.white} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12 L22 12" stroke={COLORS.white} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 5 L19 19" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round"/>
    <path d="M19 5 L5 19" stroke={COLORS.white} strokeWidth="1.2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="1.5" fill={COLORS.teal} opacity="0.6"/>
    <circle cx="12" cy="2" r="1" fill={COLORS.white}/>
    <circle cx="12" cy="22" r="1" fill={COLORS.white}/>
    <circle cx="2" cy="12" r="1" fill={COLORS.white}/>
    <circle cx="22" cy="12" r="1" fill={COLORS.white}/>
  </svg>
))

const VoidLightning: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2 L5 13 L11 13 L9 22 L19 10 L13 10Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="1"/>
  </svg>
))

const VoidRainbow: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 18 C2 10, 7 4, 12 4 C17 4, 22 10, 22 18" fill="none" stroke={COLORS.voidRed} strokeWidth="1.5"/>
    <path d="M3 18 C3 11, 7.5 5.5, 12 5.5 C16.5 5.5, 21 11, 21 18" fill="none" stroke={COLORS.orange} strokeWidth="1.5"/>
    <path d="M4 18 C4 12, 8 7, 12 7 C16 7, 20 12, 20 18" fill="none" stroke={COLORS.gold} strokeWidth="1.5"/>
    <path d="M5 18 C5 13, 8.5 8.5, 12 8.5 C15.5 8.5, 19 13, 19 18" fill="none" stroke={COLORS.teal} strokeWidth="1.5"/>
    <path d="M6 18 C6 14, 9 10, 12 10 C15 10, 18 14, 18 18" fill="none" stroke={COLORS.purple} strokeWidth="1.5"/>
  </svg>
))

const VoidLeaf: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 21 C5 21, 5 8, 17 3 C17 3, 19 15, 5 21Z" fill={COLORS.teal} stroke={COLORS.teal} strokeWidth="1" opacity="0.7"/>
    <path d="M5 21 C10 15, 14 9, 17 3" stroke={COLORS.voidDark} strokeWidth="0.8" fill="none"/>
    <path d="M9 15 L12 11" stroke={COLORS.voidDark} strokeWidth="0.5" opacity="0.5"/>
    <path d="M7 18 L10 14" stroke={COLORS.voidDark} strokeWidth="0.5" opacity="0.5"/>
  </svg>
))

const VoidFlower: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="8" r="3" fill={COLORS.pink} opacity="0.8"/>
    <circle cx="8" cy="11" r="3" fill={COLORS.pink} opacity="0.7"/>
    <circle cx="16" cy="11" r="3" fill={COLORS.pink} opacity="0.7"/>
    <circle cx="9.5" cy="14.5" r="3" fill={COLORS.pink} opacity="0.6"/>
    <circle cx="14.5" cy="14.5" r="3" fill={COLORS.pink} opacity="0.6"/>
    <circle cx="12" cy="11" r="2.5" fill={COLORS.gold}/>
    <line x1="12" y1="15" x2="12" y2="22" stroke={COLORS.teal} strokeWidth="1.5"/>
    <path d="M12 18 C10 17, 8 18, 9 20" stroke={COLORS.teal} strokeWidth="0.8" fill="none"/>
  </svg>
))

const VoidMushroom: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 14 C3 8, 7 3, 12 3 C17 3, 21 8, 21 14Z" fill={COLORS.voidRed} opacity="0.8"/>
    <circle cx="8" cy="9" r="1.5" fill={COLORS.white} opacity="0.7"/>
    <circle cx="14" cy="7" r="1" fill={COLORS.white} opacity="0.7"/>
    <circle cx="17" cy="11" r="1.2" fill={COLORS.white} opacity="0.7"/>
    <rect x="9" y="14" width="6" height="8" rx="1" fill={COLORS.voidDark} stroke={COLORS.voidRed} strokeWidth="0.8"/>
  </svg>
))

const OceanWave: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M2 12 C4 9, 6 9, 8 12 C10 15, 12 15, 14 12 C16 9, 18 9, 20 12 C22 15, 22 15, 22 15" stroke={COLORS.teal} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M2 16 C4 13, 6 13, 8 16 C10 19, 12 19, 14 16 C16 13, 18 13, 20 16" stroke={COLORS.teal} strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>
  </svg>
))

const VoidMountain: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M3 20 L9 8 L12 13 L16 6 L21 20Z" fill={COLORS.voidDark} stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M9 8 L12 13 L10.5 13Z" fill={COLORS.white} opacity="0.3"/>
    <path d="M16 6 L18 10 L16.5 10Z" fill={COLORS.white} opacity="0.3"/>
    <path d="M9 12 L16 12" stroke={COLORS.teal} strokeWidth="0.5" opacity="0.3"/>
  </svg>
))

// ── Void Symbols (15) ────────────────────────────────────────────────────────────

const VoidCheckmark: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={COLORS.teal} opacity="0.2" stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M7 12 L10.5 15.5 L17 8.5" stroke={COLORS.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
))

const VoidCross: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={COLORS.voidRed} opacity="0.2" stroke={COLORS.voidRed} strokeWidth="1.2"/>
    <path d="M8 8 L16 16" stroke={COLORS.voidRed} strokeWidth="2" strokeLinecap="round"/>
    <path d="M16 8 L8 16" stroke={COLORS.voidRed} strokeWidth="2" strokeLinecap="round"/>
  </svg>
))

const VoidExclamation: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={COLORS.gold} opacity="0.2" stroke={COLORS.gold} strokeWidth="1.2"/>
    <path d="M12 7 L12 13" stroke={COLORS.gold} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="12" cy="17" r="1.5" fill={COLORS.gold}/>
  </svg>
))

const VoidQuestion: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={COLORS.purple} opacity="0.2" stroke={COLORS.purple} strokeWidth="1.2"/>
    <path d="M9 9 C9 7, 10.5 6, 12 6 C13.5 6, 15 7, 15 9 C15 11, 12 11, 12 13" stroke={COLORS.purple} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <circle cx="12" cy="17" r="1.5" fill={COLORS.purple}/>
  </svg>
))

const VoidInfinity: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 12 C12 9, 9.5 7, 7 7 C4.5 7, 2 9, 2 12 C2 15, 4.5 17, 7 17 C9.5 17, 12 15, 12 12 C12 15, 14.5 17, 17 17 C19.5 17, 22 15, 22 12 C22 9, 19.5 7, 17 7 C14.5 7, 12 9, 12 12Z" fill="none" stroke={COLORS.teal} strokeWidth="1.5"/>
  </svg>
))

const VoidFire: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 C12 2, 6 8, 6 14 C6 18, 8.5 21, 12 21 C15.5 21, 18 18, 18 14 C18 8, 12 2, 12 2Z" fill={COLORS.deepOrange} opacity="0.9"/>
    <path d="M12 7 C12 7, 9 10, 9 14 C9 16.5, 10.2 18, 12 18 C13.8 18, 15 16.5, 15 14 C15 10, 12 7, 12 7Z" fill={COLORS.orange} opacity="0.8"/>
    <path d="M12 12 C12 12, 11 14, 11 15 C11 16, 11.5 16.5, 12 16.5 C12.5 16.5, 13 16, 13 15 C13 14, 12 12, 12 12Z" fill={COLORS.gold}/>
  </svg>
))

const VoidIce: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L12 22" stroke={COLORS.skyBlue} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12 L22 12" stroke={COLORS.skyBlue} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M5 5 L8 8" stroke={COLORS.skyBlue} strokeWidth="1" strokeLinecap="round"/>
    <path d="M16 16 L19 19" stroke={COLORS.skyBlue} strokeWidth="1" strokeLinecap="round"/>
    <path d="M19 5 L16 8" stroke={COLORS.skyBlue} strokeWidth="1" strokeLinecap="round"/>
    <path d="M8 16 L5 19" stroke={COLORS.skyBlue} strokeWidth="1" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="2" fill={COLORS.skyBlue} opacity="0.3"/>
  </svg>
))

const VoidThunder: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M13 2 L5 13 L11 13 L9 22 L19 10 L13 10Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="1"/>
    <path d="M13 2 L5 13 L11 13 L9 22" stroke={COLORS.white} strokeWidth="0.5" opacity="0.4" fill="none"/>
  </svg>
))

const VoidSkullSymbol: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 3 C7.5 3, 4 6.5, 4 10.5 C4 14, 6 16, 8 17 L8 19 L16 19 L16 17 C18 16, 20 14, 20 10.5 C20 6.5, 16.5 3, 12 3Z" fill={COLORS.voidDark} stroke={COLORS.purple} strokeWidth="1.2"/>
    <circle cx="9.5" cy="10" r="2" fill={COLORS.purple}/>
    <circle cx="14.5" cy="10" r="2" fill={COLORS.purple}/>
    <path d="M10 15 L11 14 L13 14 L14 15" stroke={COLORS.purple} strokeWidth="0.8" strokeLinecap="round" fill="none"/>
  </svg>
))

const VoidCrown: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 17 L4 8 L8 12 L12 6 L16 12 L20 8 L20 17Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="1"/>
    <rect x="4" y="17" width="16" height="3" rx="0.5" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.8"/>
    <circle cx="4" cy="7.5" r="1.2" fill={COLORS.purple}/>
    <circle cx="12" cy="5.5" r="1.2" fill={COLORS.teal}/>
    <circle cx="20" cy="7.5" r="1.2" fill={COLORS.purple}/>
  </svg>
))

const VoidStar: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L14.5 8.5 L21 9.5 L16.5 14 L17.5 21 L12 17.5 L6.5 21 L7.5 14 L3 9.5 L9.5 8.5Z" fill={COLORS.gold} stroke={COLORS.orange} strokeWidth="0.5"/>
  </svg>
))

const VoidDiamond: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 2 L22 12 L12 22 L2 12Z" fill={COLORS.teal} opacity="0.3" stroke={COLORS.teal} strokeWidth="1.2"/>
    <path d="M12 2 L12 22" stroke={COLORS.white} strokeWidth="0.5" opacity="0.4"/>
    <path d="M2 12 L22 12" stroke={COLORS.white} strokeWidth="0.5" opacity="0.4"/>
    <path d="M12 2 L22 12" stroke={COLORS.teal} strokeWidth="0.8" opacity="0.6"/>
    <path d="M12 22 L2 12" stroke={COLORS.teal} strokeWidth="0.8" opacity="0.6"/>
  </svg>
))

const VoidClover: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="7" r="4" fill={COLORS.teal} opacity="0.7"/>
    <circle cx="7" cy="12" r="4" fill={COLORS.teal} opacity="0.7"/>
    <circle cx="17" cy="12" r="4" fill={COLORS.teal} opacity="0.7"/>
    <circle cx="12" cy="17" r="4" fill={COLORS.teal} opacity="0.7"/>
    <line x1="12" y1="17" x2="12" y2="23" stroke={COLORS.voidDark} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
))

const VoidYinYang: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="10" fill={COLORS.voidDark} stroke={COLORS.white} strokeWidth="1.2"/>
    <path d="M12 2 C12 2, 12 7, 7 7 C7 7, 12 7, 12 12 C12 12, 12 17, 17 17 C17 17, 12 17, 12 22" fill={COLORS.white}/>
    <circle cx="12" cy="7" r="1.5" fill={COLORS.voidDark}/>
    <circle cx="12" cy="17" r="1.5" fill={COLORS.white}/>
  </svg>
))

const VoidSpiral: React.FC<{ size?: number; className?: string }> = React.memo(({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 12 C12 10, 14 8, 16 10 C18 12, 16 16, 12 16 C8 16, 5 12, 8 8 C11 4, 18 5, 19 11 C20 17, 14 21, 8 18" stroke={COLORS.purple} strokeWidth="1.5" strokeLinecap="round" fill="none"/>
  </svg>
))

// ── Emoji Data ────────────────────────────────────────────────────────────────────

export const CUSTOM_EMOJI_DATA: CustomEmojiCategory[] = [
  {
    id: 'void-faces',
    label: 'Void Faces',
    icon: 'void-faces',
    emojis: [
      { name: 'void-grin', label: 'Void Grin', category: 'void-faces', svg: VoidGrin },
      { name: 'void-sad', label: 'Void Sad', category: 'void-faces', svg: VoidSad },
      { name: 'void-angry', label: 'Void Angry', category: 'void-faces', svg: VoidAngry },
      { name: 'void-love', label: 'Void Love', category: 'void-faces', svg: VoidLove },
      { name: 'void-shock', label: 'Void Shock', category: 'void-faces', svg: VoidShock },
      { name: 'void-cool', label: 'Void Cool', category: 'void-faces', svg: VoidCool },
      { name: 'void-sleep', label: 'Void Sleep', category: 'void-faces', svg: VoidSleep },
      { name: 'void-think', label: 'Void Think', category: 'void-faces', svg: VoidThink },
      { name: 'void-laugh', label: 'Void Laugh', category: 'void-faces', svg: VoidLaugh },
      { name: 'void-cry', label: 'Void Cry', category: 'void-faces', svg: VoidCry },
      { name: 'void-wink', label: 'Void Wink', category: 'void-faces', svg: VoidWink },
      { name: 'void-smirk', label: 'Void Smirk', category: 'void-faces', svg: VoidSmirk },
      { name: 'void-eye-roll', label: 'Void Eye Roll', category: 'void-faces', svg: VoidEyeRoll },
      { name: 'void-nerd', label: 'Void Nerd', category: 'void-faces', svg: VoidNerd },
      { name: 'void-silly', label: 'Void Silly', category: 'void-faces', svg: VoidSilly },
      { name: 'void-blush', label: 'Void Blush', category: 'void-faces', svg: VoidBlush },
    ],
  },
  {
    id: 'void-hands',
    label: 'Void Hands',
    icon: 'void-hands',
    emojis: [
      { name: 'void-wave', label: 'Void Wave', category: 'void-hands', svg: VoidWave },
      { name: 'void-thumbs-up', label: 'Void Thumbs Up', category: 'void-hands', svg: VoidThumbsUp },
      { name: 'void-peace', label: 'Void Peace', category: 'void-hands', svg: VoidPeace },
      { name: 'void-clap', label: 'Void Clap', category: 'void-hands', svg: VoidClap },
      { name: 'void-point', label: 'Void Point', category: 'void-hands', svg: VoidPoint },
      { name: 'void-fist', label: 'Void Fist', category: 'void-hands', svg: VoidFist },
      { name: 'void-ok', label: 'Void OK', category: 'void-hands', svg: VoidOk },
      { name: 'void-heart-hands', label: 'Void Heart Hands', category: 'void-hands', svg: VoidHeartHands },
      { name: 'void-crossed-fingers', label: 'Void Crossed Fingers', category: 'void-hands', svg: VoidCrossedFingers },
      { name: 'void-handshake', label: 'Void Handshake', category: 'void-hands', svg: VoidHandshake },
      { name: 'void-writing', label: 'Void Writing', category: 'void-hands', svg: VoidWriting },
    ],
  },
  {
    id: 'void-hearts',
    label: 'Void Hearts',
    icon: 'void-hearts',
    emojis: [
      { name: 'pulse-heart', label: 'Pulse Heart', category: 'void-hearts', svg: PulseHeart },
      { name: 'fire-heart', label: 'Fire Heart', category: 'void-hearts', svg: FireHeart },
      { name: 'broken-heart', label: 'Broken Heart', category: 'void-hearts', svg: BrokenHeart },
      { name: 'void-heart', label: 'Void Heart', category: 'void-hearts', svg: VoidHeart },
      { name: 'spark-heart', label: 'Spark Heart', category: 'void-hearts', svg: SparkHeart },
      { name: 'double-heart', label: 'Double Heart', category: 'void-hearts', svg: DoubleHeart },
      { name: 'infinity-heart', label: 'Infinity Heart', category: 'void-hearts', svg: InfinityHeart },
      { name: 'crystal-heart', label: 'Crystal Heart', category: 'void-hearts', svg: CrystalHeart },
      { name: 'void-rainbow-heart', label: 'Rainbow Heart', category: 'void-hearts', svg: VoidRainbowHeart },
      { name: 'void-galaxy-heart', label: 'Galaxy Heart', category: 'void-hearts', svg: VoidGalaxyHeart },
    ],
  },
  {
    id: 'void-fire',
    label: 'Void Fire',
    icon: 'void-fire',
    emojis: [
      { name: 'tiny-flame', label: 'Tiny Flame', category: 'void-fire', svg: TinyFlame },
      { name: 'big-fire', label: 'Big Fire', category: 'void-fire', svg: BigFire },
      { name: 'spark', label: 'Spark', category: 'void-fire', svg: Spark },
      { name: 'star', label: 'Star', category: 'void-fire', svg: Star },
      { name: 'explosion', label: 'Explosion', category: 'void-fire', svg: Explosion },
      { name: 'meteor', label: 'Meteor', category: 'void-fire', svg: Meteor },
    ],
  },
  {
    id: 'void-skull',
    label: 'Void Skull',
    icon: 'void-skull',
    emojis: [
      { name: 'skull', label: 'Skull', category: 'void-skull', svg: Skull },
      { name: 'ghost', label: 'Ghost', category: 'void-skull', svg: Ghost },
      { name: 'alien', label: 'Alien', category: 'void-skull', svg: Alien },
      { name: 'robot', label: 'Robot', category: 'void-skull', svg: Robot },
      { name: 'demon', label: 'Demon', category: 'void-skull', svg: Demon },
      { name: 'reaper', label: 'Reaper', category: 'void-skull', svg: Reaper },
    ],
  },
  {
    id: 'void-party',
    label: 'Void Party',
    icon: 'void-party',
    emojis: [
      { name: 'confetti', label: 'Confetti', category: 'void-party', svg: Confetti },
      { name: 'balloon', label: 'Balloon', category: 'void-party', svg: Balloon },
      { name: 'cake', label: 'Cake', category: 'void-party', svg: Cake },
      { name: 'trophy', label: 'Trophy', category: 'void-party', svg: Trophy },
      { name: 'crown', label: 'Crown', category: 'void-party', svg: Crown },
      { name: 'champagne', label: 'Champagne', category: 'void-party', svg: Champagne },
      { name: 'gift', label: 'Gift', category: 'void-party', svg: Gift },
      { name: 'ribbon', label: 'Ribbon', category: 'void-party', svg: Ribbon },
    ],
  },
  {
    id: 'void-nature',
    label: 'Void Nature',
    icon: 'void-nature',
    emojis: [
      { name: 'void-moon', label: 'Void Moon', category: 'void-nature', svg: VoidMoon },
      { name: 'void-sun', label: 'Void Sun', category: 'void-nature', svg: VoidSun },
      { name: 'void-cloud', label: 'Void Cloud', category: 'void-nature', svg: VoidCloud },
      { name: 'void-rain', label: 'Void Rain', category: 'void-nature', svg: VoidRain },
      { name: 'void-snow', label: 'Void Snow', category: 'void-nature', svg: VoidSnow },
      { name: 'void-lightning', label: 'Void Lightning', category: 'void-nature', svg: VoidLightning },
      { name: 'void-rainbow', label: 'Void Rainbow', category: 'void-nature', svg: VoidRainbow },
      { name: 'void-leaf', label: 'Void Leaf', category: 'void-nature', svg: VoidLeaf },
      { name: 'void-flower', label: 'Void Flower', category: 'void-nature', svg: VoidFlower },
      { name: 'void-mushroom', label: 'Void Mushroom', category: 'void-nature', svg: VoidMushroom },
      { name: 'void-ocean-wave', label: 'Ocean Wave', category: 'void-nature', svg: OceanWave },
      { name: 'void-mountain', label: 'Void Mountain', category: 'void-nature', svg: VoidMountain },
    ],
  },
  {
    id: 'void-symbols',
    label: 'Void Symbols',
    icon: 'void-symbols',
    emojis: [
      { name: 'void-checkmark', label: 'Void Checkmark', category: 'void-symbols', svg: VoidCheckmark },
      { name: 'void-cross', label: 'Void Cross', category: 'void-symbols', svg: VoidCross },
      { name: 'void-exclamation', label: 'Void Exclamation', category: 'void-symbols', svg: VoidExclamation },
      { name: 'void-question', label: 'Void Question', category: 'void-symbols', svg: VoidQuestion },
      { name: 'void-infinity', label: 'Void Infinity', category: 'void-symbols', svg: VoidInfinity },
      { name: 'void-fire', label: 'Void Fire', category: 'void-symbols', svg: VoidFire },
      { name: 'void-ice', label: 'Void Ice', category: 'void-symbols', svg: VoidIce },
      { name: 'void-thunder', label: 'Void Thunder', category: 'void-symbols', svg: VoidThunder },
      { name: 'void-skull-symbol', label: 'Void Skull Symbol', category: 'void-symbols', svg: VoidSkullSymbol },
      { name: 'void-crown', label: 'Void Crown', category: 'void-symbols', svg: VoidCrown },
      { name: 'void-star', label: 'Void Star', category: 'void-symbols', svg: VoidStar },
      { name: 'void-diamond', label: 'Void Diamond', category: 'void-symbols', svg: VoidDiamond },
      { name: 'void-clover', label: 'Void Clover', category: 'void-symbols', svg: VoidClover },
      { name: 'void-yin-yang', label: 'Void Yin Yang', category: 'void-symbols', svg: VoidYinYang },
      { name: 'void-spiral', label: 'Void Spiral', category: 'void-symbols', svg: VoidSpiral },
    ],
  },
]

// ── Lookup Map ────────────────────────────────────────────────────────────────────

export const CUSTOM_EMOJI_MAP: Map<string, CustomEmojiItem> = new Map(
  CUSTOM_EMOJI_DATA.flatMap((cat) => cat.emojis).map((emoji) => [emoji.name, emoji])
)

// ── Inline Emoji Renderer ────────────────────────────────────────────────────────

export const InlineCustomEmoji = React.memo(function InlineCustomEmoji({
  name,
  size = 20,
  className,
}: {
  name: string
  size?: number
  className?: string
}) {
  const emoji = CUSTOM_EMOJI_MAP.get(name)
  if (!emoji) return null
  const SvgComponent = emoji.svg
  return <SvgComponent size={size} className={className} />
})

// ── Text with Custom Emoji Renderer ──────────────────────────────────────────────

const EMOJI_REGEX = /:([a-z0-9-]+):/g
export const MENTION_REGEX = /@([a-zA-Z0-9_]{3,20})/g

// GIF pattern: [GIF: <url>]
const GIF_REGEX = /\[GIF:\s*(https?:\/\/[^\]]+)\]/

// Combined regex that matches :emoji-name:, @username, and [GIF: url] patterns
const COMBINED_REGEX = /\[GIF:\s*(https?:\/\/[^\]]+)\]|:([a-z0-9-]+):|@([a-zA-Z0-9_]{3,20})/g

export function renderTextWithCustomEmojis(
  text: string,
  emojiSize: number = 20,
  onMentionClick?: (username: string) => void
): React.ReactNode[] {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  const regex = new RegExp(COMBINED_REGEX.source, 'g')

  while ((match = regex.exec(text)) !== null) {
    const gifUrl = match[1]       // from [GIF: url] group
    const emojiName = match[2]    // from :emoji-name: group
    const mentionUsername = match[3] // from @username group

    // Add text before this match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    if (gifUrl) {
      // It's a GIF — render as an actual image
      parts.push(
        <img
          key={`gif-${key++}`}
          src={gifUrl}
          alt="GIF"
          className="rounded-lg max-w-[200px] max-h-[150px] object-cover"
          loading="lazy"
        />
      )
    } else if (emojiName) {
      // It's a custom emoji
      const emoji = CUSTOM_EMOJI_MAP.get(emojiName)
      if (emoji) {
        const SvgComponent = emoji.svg
        parts.push(
          <span key={`emoji-${key++}`} className="inline-flex items-center align-middle mx-0.5">
            <SvgComponent size={emojiSize} />
          </span>
        )
      } else {
        // Not a custom emoji, render as-is
        parts.push(match[0])
      }
    } else if (mentionUsername && onMentionClick) {
      // It's a @mention with a click handler
      parts.push(
        <span
          key={`mention-${key++}`}
          className="text-teal-500 dark:text-teal-400 font-semibold cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation()
            onMentionClick(mentionUsername)
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.stopPropagation()
              onMentionClick(mentionUsername)
            }
          }}
        >
          @{mentionUsername}
        </span>
      )
    } else if (mentionUsername) {
      // It's a @mention without a click handler — render as styled text
      parts.push(
        <span key={`mention-${key++}`} className="text-teal-500 dark:text-teal-400 font-semibold">
          @{mentionUsername}
        </span>
      )
    } else {
      parts.push(match[0])
    }

    lastIndex = regex.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}
