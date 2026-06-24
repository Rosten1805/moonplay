'use client'

import Image from 'next/image'
import { Trash2, FolderOpen, Clock, Music2, Video } from 'lucide-react'
import { HistoryItem as HistoryItemType } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDuration, timeAgo } from '@/lib/utils'

interface HistoryItemProps {
  item: HistoryItemType
  onDelete: (id: string) => void
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const openFolder = async () => {
    if (window.electronAPI?.openPath && item.filePath) {
      const folder = item.filePath.replace(/[/\\][^/\\]+$/, '') || item.filePath
      await window.electronAPI.openPath(folder)
    } else {
      await fetch('/api/open-folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filePath: item.filePath }),
      })
    }
  }

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl border border-synth-border/50 bg-synth-bg-2/40 hover:border-synth-border hover:bg-synth-bg-2/70 transition-all duration-200">
      <div className="relative shrink-0 w-20 h-[45px] rounded-lg overflow-hidden bg-synth-bg-3">
        {item.thumbnail ? (
          <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {item.format === 'mp3' ? (
              <Music2 className="h-5 w-5 text-synth-text-dim" />
            ) : (
              <Video className="h-5 w-5 text-synth-text-dim" />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium text-synth-text truncate">{item.title}</p>
        <div className="flex items-center gap-3 text-xs text-synth-text-dim">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span>{timeAgo(item.completedAt)}</span>
          {item.duration > 0 && <span>· {formatDuration(item.duration)}</span>}
          {item.fileSize && <span>· {item.fileSize}</span>}
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2">
        <Badge variant={item.format === 'mp3' ? 'mp3' : 'mp4'}>{item.format}</Badge>
        <span className="text-xs text-synth-text-dim font-mono hidden sm:block">{item.quality}</span>

        <div className="flex items-center gap-1 ml-1">
          {item.filePath && (
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-synth-text-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onDelete(item.id)}
            title="Remove from history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
