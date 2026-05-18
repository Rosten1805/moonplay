'use client'

import { Download, Trash2 } from 'lucide-react'
import { useDownloadStore } from '@/store/downloadStore'
import { DownloadItem } from './DownloadItem'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function DownloadQueue() {
  const { queue, clearCompleted } = useDownloadStore()

  const active = queue.filter((j) => j.status === 'downloading' || j.status === 'processing' || j.status === 'pending')
  const finished = queue.filter((j) => j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled')
  const hasFinished = finished.length > 0

  if (queue.length === 0) return null

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Download className="h-5 w-5 text-accent" strokeWidth={1.5} />
          <h2 className="font-orbitron text-base font-semibold tracking-wider text-synth-text">
            QUEUE
          </h2>
          <span className="font-mono text-sm text-synth-text-dim">
            ({active.length} active{hasFinished ? `, ${finished.length} done` : ''})
          </span>
        </div>
        {hasFinished && (
          <Button variant="ghost" size="sm" onClick={clearCompleted} className="gap-2">
            <Trash2 className="h-4 w-4" />
            Clear done
          </Button>
        )}
      </div>

      <ScrollArea className="max-h-[500px]">
        <div className="space-y-3 pr-2">
          {queue.map((job) => (
            <DownloadItem key={job.id} job={job} />
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
