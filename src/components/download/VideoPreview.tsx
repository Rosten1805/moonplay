'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Download, Eye, User, Clock, Music2, Video, ListMusic, Loader2 } from 'lucide-react'
import { useDownloadStore } from '@/store/downloadStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDuration, formatViewCount, hasPlaylistParam, getPlaylistUrl } from '@/lib/utils'
import { AUDIO_QUALITIES, VIDEO_QUALITIES, DownloadFormat, VideoInfo } from '@/types'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function VideoPreview() {
  const {
    mediaInfo,
    inputUrl,
    selectedFormat,
    setSelectedFormat,
    selectedQuality,
    setSelectedQuality,
    startDownload,
    fetchInfo,
  } = useDownloadStore()

  const [downloading, setDownloading] = useState(false)
  const [loadingPlaylist, setLoadingPlaylist] = useState(false)

  if (!mediaInfo || mediaInfo.isPlaylist) return null

  const video = mediaInfo as VideoInfo
  const qualities = selectedFormat === 'mp3' ? AUDIO_QUALITIES : VIDEO_QUALITIES
  const playlistUrl = hasPlaylistParam(inputUrl) ? getPlaylistUrl(inputUrl) : null

  const handleDownloadSingle = async () => {
    setDownloading(true)
    try {
      const id = await startDownload({
        url: video.url,
        title: video.title,
        thumbnail: video.thumbnail || '',
        duration: video.duration,
        format: selectedFormat,
        quality: selectedQuality,
      })
      if (id) {
        toast({ title: '▶ Download started', description: video.title } as any)
      } else {
        throw new Error('Failed to queue download')
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Unknown error', variant: 'error' } as any)
    } finally {
      setDownloading(false)
    }
  }

  const handleDownloadPlaylist = async () => {
    if (!playlistUrl) return
    setLoadingPlaylist(true)
    try {
      await fetchInfo(playlistUrl)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Could not load playlist' } as any)
    } finally {
      setLoadingPlaylist(false)
    }
  }

  return (
    <div className="rounded-xl border border-synth-border bg-synth-card backdrop-blur-md shadow-card overflow-hidden animate-slide-up">
      <div className="flex gap-5 p-5">
        {/* Thumbnail — 16:9, larger */}
        <div className="relative shrink-0 w-52 h-[117px] rounded-xl overflow-hidden bg-synth-bg-3">
          {video.thumbnail ? (
            <Image src={video.thumbnail} alt={video.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music2 className="h-10 w-10 text-synth-text-dim" />
            </div>
          )}
          {video.duration > 0 && (
            <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/80 text-white text-xs font-mono leading-none">
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="flex-1 min-w-0 flex flex-col justify-between gap-3 py-1">
          <div>
            <h3 className="text-base font-semibold text-synth-text leading-snug line-clamp-2 mb-2">
              {video.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-synth-text-dim">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0" />
                {video.uploader}
              </span>
              {video.viewCount ? (
                <span className="flex items-center gap-1.5">
                  <Eye className="h-3.5 w-3.5 shrink-0" />
                  {formatViewCount(video.viewCount)}
                </span>
              ) : null}
              {video.duration > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {formatDuration(video.duration)}
                </span>
              )}
            </div>
          </div>

          {/* Format + Quality */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center rounded-xl border border-synth-border overflow-hidden h-10">
              {(['mp3', 'mp4'] as DownloadFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    setSelectedFormat(fmt)
                    setSelectedQuality(fmt === 'mp3' ? 'best' : '1080p')
                  }}
                  className={cn(
                    'flex items-center gap-2 px-4 h-full text-sm font-medium uppercase tracking-wide transition-all duration-200',
                    selectedFormat === fmt
                      ? fmt === 'mp3'
                        ? 'bg-accent/15 text-accent'
                        : 'bg-pink-muted text-pink-accent'
                      : 'text-synth-text-dim hover:text-synth-text'
                  )}
                >
                  {fmt === 'mp3' ? <Music2 className="h-3.5 w-3.5" /> : <Video className="h-3.5 w-3.5" />}
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>

            <Select value={selectedQuality} onValueChange={setSelectedQuality}>
              <SelectTrigger className="h-10 w-32 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {qualities.map((q) => (
                  <SelectItem key={q} value={q} className="text-sm">
                    {q === 'best' ? '✦ Best' : q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-stretch border-t border-synth-border/50">
        <button
          onClick={handleDownloadSingle}
          disabled={downloading}
          className={cn(
            'flex-1 flex items-center justify-center gap-2.5 py-4 text-base font-semibold uppercase tracking-wide transition-all duration-200 disabled:opacity-50',
            selectedFormat === 'mp3'
              ? 'text-accent hover:bg-accent/8'
              : 'text-pink-accent hover:bg-pink-muted'
          )}
        >
          {downloading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}
          {downloading ? 'Queueing…' : `Download ${selectedFormat.toUpperCase()}`}
        </button>

        {playlistUrl && (
          <>
            <div className="w-px bg-synth-border/50" />
            <button
              onClick={handleDownloadPlaylist}
              disabled={loadingPlaylist}
              className="flex items-center justify-center gap-2 px-5 py-4 text-sm font-medium uppercase tracking-wide text-synth-text-dim hover:text-accent hover:bg-accent/8 transition-all duration-200 disabled:opacity-50"
              title="Load & download full playlist"
            >
              {loadingPlaylist ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ListMusic className="h-4 w-4" />
              )}
              {loadingPlaylist ? 'Loading…' : 'Full Playlist'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
