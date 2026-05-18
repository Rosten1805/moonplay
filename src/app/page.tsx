'use client'

import { useState } from 'react'
import { Background } from '@/components/layout/Background'
import { Header } from '@/components/layout/Header'
import { URLInput } from '@/components/download/URLInput'
import { VideoPreview } from '@/components/download/VideoPreview'
import { PlaylistPreview } from '@/components/download/PlaylistPreview'
import { DownloadQueue } from '@/components/download/DownloadQueue'
import { HistoryPanel } from '@/components/history/HistoryPanel'
import { SettingsPanel } from '@/components/settings/SettingsPanel'
import { Toaster } from '@/components/ui/toaster'

export default function Home() {
  const [tab, setTab] = useState('download')

  return (
    <div className="relative min-h-screen bg-synth-bg">
      <Background />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header activeTab={tab} onTabChange={setTab} />

        <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8">
          {tab === 'download' && (
            <>
              <div className="text-center space-y-3 mb-10">
                <h2 className="font-orbitron text-5xl sm:text-6xl font-black tracking-widest text-gradient-accent">
                  DOWNLOAD
                </h2>
                <p className="text-synth-text-dim text-base tracking-widest uppercase">
                  Paste a YouTube URL and hit fetch
                </p>
              </div>

              <URLInput />
              <VideoPreview />
              <PlaylistPreview />
              <DownloadQueue />
            </>
          )}

          {tab === 'history' && <HistoryPanel />}
          {tab === 'settings' && <SettingsPanel />}
        </main>

        <footer className="relative z-10 border-t border-synth-border/40 py-4">
          <p className="text-center text-xs text-synth-text-dim font-mono tracking-widest uppercase opacity-50">
            Moonplay · Local · No cloud · Powered by yt-dlp
          </p>
        </footer>
      </div>

      <Toaster />
    </div>
  )
}
