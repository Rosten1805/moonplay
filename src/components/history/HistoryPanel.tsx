'use client'

import { useState, useEffect, useCallback } from 'react'
import { History, Trash2, RefreshCw, Music2, Video, Clock } from 'lucide-react'
import { HistoryItem as HistoryItemType } from '@/types'
import { HistoryItem } from './HistoryItem'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

export function HistoryPanel() {
  const [history, setHistory] = useState<HistoryItemType[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/history')
      const data = await res.json()
      setHistory(Array.isArray(data) ? data : [])
    } catch {
      setHistory([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  const deleteItem = async (id: string) => {
    setHistory((h) => h.filter((item) => item.id !== id))
    await fetch(`/api/history/${id}`, { method: 'DELETE' })
  }

  const clearAll = async () => {
    setHistory([])
    await fetch('/api/history', { method: 'DELETE' })
  }

  const mp3Count = history.filter((h) => h.format === 'mp3').length
  const mp4Count = history.filter((h) => h.format === 'mp4').length

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="h-5 w-5 text-accent" strokeWidth={1.5} />
          <h2 className="font-orbitron text-base font-semibold tracking-wider text-synth-text">
            HISTORY
          </h2>
          {history.length > 0 && (
            <span className="font-mono text-sm text-synth-text-dim">({history.length})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={fetchHistory} className="gap-2">
            <RefreshCw className="h-4 w-4" />
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="gap-2 text-synth-text-dim hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {history.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total', value: history.length, icon: Clock, color: 'text-accent' },
            { label: 'MP3', value: mp3Count, icon: Music2, color: 'text-accent' },
            { label: 'MP4', value: mp4Count, icon: Video, color: 'text-pink-accent' },
          ].map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="flex items-center gap-3 rounded-xl border border-synth-border bg-synth-bg-2/60 p-4"
              >
                <Icon className={`h-5 w-5 ${stat.color} shrink-0`} strokeWidth={1.5} />
                <div>
                  <div className={`font-orbitron text-2xl font-bold leading-none ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-synth-text-dim uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-synth-text-dim">
          <RefreshCw className="h-6 w-6 animate-spin mr-3" />
          <span className="text-base">Loading history...</span>
        </div>
      ) : history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-synth-text-dim space-y-4">
          <History className="h-14 w-14 opacity-20" strokeWidth={1} />
          <div className="text-center">
            <p className="font-orbitron text-sm uppercase tracking-wider">No downloads yet</p>
            <p className="text-sm mt-2 opacity-60">Your completed downloads will appear here</p>
          </div>
        </div>
      ) : (
        <ScrollArea className="max-h-[600px]">
          <div className="space-y-3 pr-2">
            {history.map((item) => (
              <HistoryItem key={item.id} item={item} onDelete={deleteItem} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
