'use client'

import { create } from 'zustand'
import { VideoInfo, PlaylistInfo, DownloadJob, DownloadProgress, DownloadFormat } from '@/types'

interface DownloadStore {
  // URL input
  inputUrl: string
  setInputUrl: (url: string) => void

  // Fetch state
  isFetching: boolean
  fetchError: string | null

  // Currently previewed media
  mediaInfo: VideoInfo | PlaylistInfo | null
  setMediaInfo: (info: VideoInfo | PlaylistInfo | null) => void

  // Selected download options
  selectedFormat: DownloadFormat
  setSelectedFormat: (f: DownloadFormat) => void
  selectedQuality: string
  setSelectedQuality: (q: string) => void

  // Active download queue (client-side mirror)
  queue: DownloadJob[]

  // Actions
  fetchInfo: (url: string) => Promise<void>
  startDownload: (options: {
    url: string
    title: string
    thumbnail: string
    duration: number
    format: DownloadFormat
    quality: string
  }) => Promise<string | null>
  startPlaylistDownload: (entries: PlaylistInfo['entries'], format: DownloadFormat, quality: string) => Promise<void>
  cancelDownload: (id: string) => Promise<void>
  updateProgress: (progress: DownloadProgress) => void
  removeFromQueue: (id: string) => void
  clearCompleted: () => void
  subscribeToProgress: (id: string) => () => void
}

export const useDownloadStore = create<DownloadStore>((set, get) => ({
  inputUrl: '',
  setInputUrl: (url) => set({ inputUrl: url }),

  isFetching: false,
  fetchError: null,

  mediaInfo: null,
  setMediaInfo: (info) => set({ mediaInfo: info }),

  selectedFormat: 'mp3',
  setSelectedFormat: (f) => set({ selectedFormat: f }),
  selectedQuality: 'best',
  setSelectedQuality: (q) => set({ selectedQuality: q }),

  queue: [],

  fetchInfo: async (url) => {
    set({ isFetching: true, fetchError: null, mediaInfo: null })
    try {
      const res = await fetch(`/api/info?url=${encodeURIComponent(url)}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch info')
      set({ mediaInfo: data, isFetching: false })
    } catch (err: any) {
      set({ isFetching: false, fetchError: err.message || 'Unknown error' })
    }
  },

  startDownload: async (options) => {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    })
    const data = await res.json()
    if (!res.ok) return null

    const job: DownloadJob = data.job
    set((s) => ({ queue: [job, ...s.queue] }))
    get().subscribeToProgress(job.id)
    return job.id
  },

  startPlaylistDownload: async (entries, format, quality) => {
    for (const entry of entries) {
      const id = await get().startDownload({
        url: entry.url,
        title: entry.title,
        thumbnail: entry.thumbnail || '',
        duration: entry.duration || 0,
        format,
        quality,
      })
      if (id) {
        // small delay to avoid hammering
        await new Promise((r) => setTimeout(r, 300))
      }
    }
  },

  cancelDownload: async (id) => {
    await fetch(`/api/download/${id}/cancel`, { method: 'POST' })
    set((s) => ({
      queue: s.queue.map((j) =>
        j.id === id ? { ...j, status: 'cancelled' } : j
      ),
    }))
  },

  updateProgress: (progress) => {
    set((s) => ({
      queue: s.queue.map((j) =>
        j.id === progress.id
          ? {
              ...j,
              status: progress.status,
              progress: progress.percent,
              speed: progress.speed,
              eta: progress.eta,
              filePath: progress.filePath ?? j.filePath,
              fileSize: progress.fileSize ?? j.fileSize,
              error: progress.error ?? j.error,
            }
          : j
      ),
    }))
  },

  removeFromQueue: (id) => {
    set((s) => ({ queue: s.queue.filter((j) => j.id !== id) }))
  },

  clearCompleted: () => {
    set((s) => ({
      queue: s.queue.filter((j) => j.status !== 'completed' && j.status !== 'failed' && j.status !== 'cancelled'),
    }))
  },

  subscribeToProgress: (id) => {
    const es = new EventSource(`/api/progress/${id}`)

    es.onmessage = (event) => {
      try {
        const progress: DownloadProgress = JSON.parse(event.data)
        get().updateProgress(progress)
        if (progress.done) es.close()
      } catch { /* ignore parse errors */ }
    }

    es.onerror = () => es.close()

    return () => es.close()
  },
}))
