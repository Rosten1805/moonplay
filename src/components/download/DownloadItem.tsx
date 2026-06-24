'use client'

import Image from 'next/image'
import { X, CheckCircle2, AlertCircle, XCircle, FolderOpen, Loader2, Zap } from 'lucide-react'
import { useDownloadStore } from '@/store/downloadStore'
import { DownloadJob } from '@/types'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DownloadItemProps {
  job: DownloadJob
}

const statusConfig = {
  pending: { label: 'Queued', color: 'ghost', icon: Loader2 },
  fetching: { label: 'Fetching', color: 'ghost', icon: Loader2 },
  downloading: { label: 'Downloading', color: 'default', icon: Zap },
  processing: { label: 'Converting', color: 'warning', icon: Loader2 },
  completed: { label: 'Done', color: 'success', icon: CheckCircle2 },
  failed: { label: 'Failed', color: 'error', icon: AlertCircle },
  cancelled: { label: 'Cancelled', color: 'ghost', icon: XCircle },
} as const

export function DownloadItem({ job }: DownloadItemProps) {
  const { cancelDownload, removeFromQueue } = useDownloadStore()
  const cfg = statusConfig[job.status]
  const isActive = job.status === 'downloading' || job.status === 'processing'
  const isDone = job.status === 'completed'
  const isFailed = job.status === 'failed'
  const isCancelled = job.status === 'cancelled'


  const openFolder = async () => {
    if (window.electronAPI?.openPath && job.filePath) {
      const folder = job.filePath.replace(/[/\\][^/\\]+$/, '') || job.filePath
      await window.electronAPI.openPath(folder)
    } else {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: job.filePath }),
      })
    }
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300',
        isDone
          ? 'border-emerald-500/25 bg-emerald-500/5'
          : isFailed || isCancelled
          ? 'border-synth-border/30 bg-synth-bg-2/30 opacity-60'
          : 'border-synth-border bg-synth-bg-2/70',
        isActive && 'border-accent/30'
      )}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-20 h-[45px] rounded-lg overflow-hidden bg-synth-bg-3">
        {job.thumbnail ? (
          <Image src={job.thumbnail} alt={job.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 bg-synth-bg-3" />
        )}
        {isActive && (
          <div className="absolute inset-0 bg-accent/10 animate-glow-pulse" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-start gap-2">
          <p className="text-sm font-medium text-synth-text leading-snug line-clamp-1 flex-1">
            {job.title}
          </p>
          <div className="flex items-center gap-1.5 shrink-0">
            <Badge variant={job.format === 'mp3' ? 'mp3' : 'mp4'}>{job.format}</Badge>
            <Badge variant={cfg.color as any}>{cfg.label}</Badge>
          </div>
        </div>

        {(isActive || (isDone && job.progress > 0)) && (
          <Progress value={job.progress} className="h-1.5" />
        )}

        {isActive && (
          <div className="flex items-center gap-4 text-xs font-mono">
            {job.speed && <span className="text-accent">{job.speed}</span>}
            {job.eta && <span className="text-synth-text-dim">ETA {job.eta}</span>}
            {job.progress > 0 && (
              <span className="text-synth-text-dim ml-auto">{job.progress.toFixed(1)}%</span>
            )}
          </div>
        )}

        {isFailed && job.error && (
          <p className="text-xs text-red-400 truncate">{job.error}</p>
        )}

        {isDone && (
          <div className="flex items-center gap-2 text-xs text-synth-text-dim">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>{job.fileSize && `${job.fileSize} · `}{job.quality}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1">
        {isDone && job.filePath && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-synth-text-dim hover:text-accent"
            onClick={openFolder}
            title="Open folder"
          >
            <FolderOpen className="h-4 w-4" />
          </Button>
        )}
        {isActive && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-synth-text-dim hover:text-red-400"
            onClick={() => cancelDownload(job.id)}
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {(isDone || isFailed || isCancelled) && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-synth-text-dim hover:text-synth-text opacity-0 group-hover:opacity-100"
            onClick={() => removeFromQueue(job.id)}
            title="Remove"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
