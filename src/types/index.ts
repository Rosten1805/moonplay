export type DownloadFormat = 'mp3' | 'mp4'

export type DownloadStatus =
  | 'pending'
  | 'fetching'
  | 'downloading'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'

export interface VideoFormat {
  formatId: string
  ext: string
  resolution?: string
  height?: number
  width?: number
  filesize?: number
  tbr?: number
  vbr?: number
  abr?: number
  fps?: number
  vcodec?: string
  acodec?: string
  note?: string
}

export interface VideoInfo {
  id: string
  url: string
  title: string
  thumbnail: string
  duration: number
  uploader: string
  uploadDate?: string
  description?: string
  viewCount?: number
  likeCount?: number
  formats?: VideoFormat[]
  isPlaylist: false
}

export interface PlaylistEntry {
  id: string
  url: string
  title: string
  thumbnail?: string
  duration?: number
  uploader?: string
}

export interface PlaylistInfo {
  id: string
  url: string
  title: string
  thumbnail?: string
  uploader: string
  entryCount: number
  entries: PlaylistEntry[]
  isPlaylist: true
}

export interface DownloadOptions {
  url: string
  title: string
  thumbnail: string
  duration: number
  format: DownloadFormat
  quality: string
  outputPath?: string
}

export interface DownloadJob {
  id: string
  url: string
  title: string
  thumbnail: string
  duration: number
  format: DownloadFormat
  quality: string
  status: DownloadStatus
  progress: number
  speed: string
  eta: string
  fileSize?: string
  filePath?: string
  error?: string
  createdAt: string
  completedAt?: string
}

export interface DownloadProgress {
  id: string
  percent: number
  speed: string
  eta: string
  status: DownloadStatus
  fileSize?: string
  filePath?: string
  error?: string
  done?: boolean
}

export interface HistoryItem extends DownloadJob {
  completedAt: string
}

export interface AppSettings {
  downloadPath: string
  defaultFormat: DownloadFormat
  defaultVideoQuality: string
  defaultAudioQuality: string
  maxConcurrentDownloads: number
  ytdlpPath: string
  ffmpegPath: string
  embedThumbnail: boolean
  embedMetadata: boolean
}

export const AUDIO_QUALITIES = ['best', '320k', '256k', '192k', '128k', '96k'] as const
export const VIDEO_QUALITIES = ['best', '4K', '2K', '1080p', '720p', '480p', '360p'] as const

export type AudioQuality = (typeof AUDIO_QUALITIES)[number]
export type VideoQuality = (typeof VIDEO_QUALITIES)[number]
