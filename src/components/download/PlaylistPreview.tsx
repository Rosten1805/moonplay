'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ListMusic, Download, ChevronDown, ChevronUp, User, Loader2, Music2, Video } from 'lucide-react'
import { useDownloadStore } from '@/store/downloadStore'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDuration } from '@/lib/utils'
import { AUDIO_QUALITIES, VIDEO_QUALITIES, DownloadFormat, PlaylistInfo } from '@/types'
import { toast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

export function PlaylistPreview() {
  const {
    mediaInfo,
    selectedFormat,
    setSelectedFormat,
    selectedQuality,
    setSelectedQuality,
    startPlaylistDownload,
  } = useDownloadStore()

  const [showEntries, setShowEntries] = useState(false)
  const [downloading, setDownloading] = useState(false)

  if (!mediaInfo || !mediaInfo.isPlaylist) return null

  const playlist = mediaInfo as PlaylistInfo
  const qualities = selectedFormat === 'mp3' ? AUDIO_QUALITIES : VIDEO_QUALITIES

  const handleDownloadAll = async () => {
    setDownloading(true)
    try {
      await startPlaylistDownload(playlist.entries, selectedFormat, selectedQuality)
      toast({
        title: `▶ ${playlist.entries.length} tracks queued`,
        description: playlist.title,
      } as any)
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' } as any)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="rounded-xl border border-accent/20 bg-synth-card backdrop-blur-md shadow-card overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex gap-5 p-5">
        <div className="relative shrink-0 w-52 h-[117px] rounded-xl overflow-hidden bg-synth-bg-3">
          {playlist.thumbnail ? (
            <Image src={playlist.thumbnail} alt={playlist.title} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-accent/5">
              <ListMusic className="h-8 w-8 text-accent" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <ListMusic className="h-5 w-5 text-accent mx-auto" />
              <span className="font-orbitron text-sm text-white font-bold">{playlist.entryCount}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="default">Playlist</Badge>
              <span className="text-xs text-synth-text-dim font-mono">{playlist.entryCount} tracks</span>
            </div>
            <h3 className="text-base font-semibold text-synth-text leading-snug line-clamp-2">
              {playlist.title}
            </h3>
            <p className="flex items-center gap-1.5 mt-1.5 text-sm text-synth-text-dim">
              <User className="h-3 w-3 shrink-0" />
              {playlist.uploader}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
                  {fmt === 'mp3' ? <Music2 className="h-3 w-3" /> : <Video className="h-3 w-3" />}
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

      {/* Track list toggle */}
      {playlist.entries.length > 0 && (
        <div className="border-t border-synth-border/50">
          <button
            onClick={() => setShowEntries(!showEntries)}
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-synth-text-dim hover:text-synth-text transition-colors"
          >
            <span className="uppercase tracking-wider">
              {showEntries ? 'Hide' : 'Show'} {playlist.entries.length} tracks
            </span>
            {showEntries ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
          {showEntries && (
            <div className="max-h-52 overflow-y-auto border-t border-synth-border/30">
              {playlist.entries.map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-2 hover:bg-synth-bg-3/50 transition-colors">
                  <span className="text-[10px] text-synth-text-dim font-mono w-5 text-right shrink-0">{i + 1}</span>
                  {entry.thumbnail ? (
                    <div className="relative w-10 h-[28px] rounded overflow-hidden shrink-0 bg-synth-bg-3">
                      <Image src={entry.thumbnail} alt={entry.title} fill className="object-cover" unoptimized />
                    </div>
                  ) : (
                    <div className="w-10 h-[28px] rounded bg-synth-bg-3 shrink-0" />
                  )}
                  <span className="text-xs text-synth-text truncate flex-1">{entry.title}</span>
                  {entry.duration ? (
                    <span className="text-[10px] text-synth-text-dim font-mono shrink-0">{formatDuration(entry.duration)}</span>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Download all button */}
      <div className="border-t border-synth-border/50">
        <button
          onClick={handleDownloadAll}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2.5 py-4 text-base font-semibold uppercase tracking-wide text-accent hover:bg-accent/8 transition-all duration-200 disabled:opacity-50"
        >
          {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          {downloading ? 'Queueing…' : `Download all ${playlist.entryCount} tracks as ${selectedFormat.toUpperCase()}`}
        </button>
      </div>
    </div>
  )
}
