'use client'

import Image from 'next/image'
import { History, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HeaderProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: 'download', label: 'Download', icon: Zap },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="relative z-10 border-b border-synth-border bg-synth-bg/95 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-6">

        {/* Brand */}
        <div className="flex items-center gap-4 select-none shrink-0">
          <div className="rounded-2xl overflow-hidden w-14 h-14 shrink-0 ring-2 ring-accent/30 shadow-accent">
            <Image
              src="/logo.webp"
              alt="Moonplay"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <h1 className="font-orbitron text-2xl font-black tracking-widest leading-none text-gradient-accent">
              MOONPLAY
            </h1>
            <p className="font-mono text-[10px] text-synth-text-dim tracking-[0.25em] uppercase mt-1">
              YouTube Downloader
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium tracking-wide transition-all duration-200 border',
                  active
                    ? 'bg-accent/12 text-accent-light border-accent/30 shadow-accent-sm'
                    : 'text-synth-text-dim hover:text-synth-text hover:bg-synth-bg-3 border-transparent'
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={active ? 2 : 1.5} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(168,85,247,0.6), rgba(236,72,153,0.4), transparent)',
        }}
      />
    </header>
  )
}
