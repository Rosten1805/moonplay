'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppSettings, DownloadFormat } from '@/types'

const DEFAULT_SETTINGS: AppSettings = {
  downloadPath: './downloads',
  defaultFormat: 'mp3',
  defaultVideoQuality: '1080p',
  defaultAudioQuality: 'best',
  maxConcurrentDownloads: 3,
  ytdlpPath: 'yt-dlp',
  ffmpegPath: 'ffmpeg',
  embedThumbnail: true,
  embedMetadata: true,
}

interface SettingsStore {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,
      updateSettings: (updates) =>
        set((s) => ({ settings: { ...s.settings, ...updates } })),
      resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
    }),
    { name: 'moonplay-settings' }
  )
)
