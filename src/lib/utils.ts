import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatViewCount(count: number): string {
  if (!count) return ''
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M views`
  if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K views`
  return `${count} views`
}

export function isYouTubeUrl(url: string): boolean {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(url)
}

// Only pure playlist pages — not videos that happen to have a list= param
export function isPlaylistUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return (u.pathname === '/playlist' || u.pathname.endsWith('/playlist')) &&
      u.searchParams.has('list')
  } catch {
    return false
  }
}

// Returns true for any URL that carries a playlist list= param (including video+list combos)
export function hasPlaylistParam(url: string): boolean {
  try {
    return new URL(url).searchParams.has('list')
  } catch {
    return false
  }
}

// Extract the standalone playlist URL from any URL that has list=
export function getPlaylistUrl(url: string): string | null {
  try {
    const listId = new URL(url).searchParams.get('list')
    if (!listId) return null
    return `https://www.youtube.com/playlist?list=${listId}`
  } catch {
    return null
  }
}

export function extractVideoId(url: string): string | null {
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match?.[1] ?? null
}

export function sanitizeFilename(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').slice(0, 200)
}

export function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const min = Math.floor(diff / 60_000)
  const hr = Math.floor(diff / 3_600_000)
  const day = Math.floor(diff / 86_400_000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  if (hr < 24) return `${hr}h ago`
  if (day < 30) return `${day}d ago`
  return new Date(isoDate).toLocaleDateString()
}
