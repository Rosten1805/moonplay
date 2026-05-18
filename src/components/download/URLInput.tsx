'use client'

import { useRef } from 'react'
import { Search, Link2, Loader2, X, ListVideo, Music } from 'lucide-react'
import { useDownloadStore } from '@/store/downloadStore'
import { Button } from '@/components/ui/button'
import { isYouTubeUrl, isPlaylistUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function URLInput() {
  const { inputUrl, setInputUrl, isFetching, fetchError, fetchInfo, mediaInfo } = useDownloadStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFetch = () => {
    const url = inputUrl.trim()
    if (!url || !isYouTubeUrl(url)) return
    fetchInfo(url)
  }

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') handleFetch()
  }

  const handlePaste = (e: { clipboardData: DataTransfer }) => {
    const pasted = e.clipboardData.getData('text').trim()
    if (isYouTubeUrl(pasted)) {
      setTimeout(() => fetchInfo(pasted), 50)
    }
  }

  const clear = () => {
    setInputUrl('')
    useDownloadStore.setState({ mediaInfo: null })
    inputRef.current?.focus()
  }

  const isPlaylist = inputUrl && isPlaylistUrl(inputUrl)
  const isValid = inputUrl && isYouTubeUrl(inputUrl.trim())

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'group relative flex items-center gap-3 rounded-xl border bg-synth-bg-2 px-5 py-3.5',
          'transition-all duration-300',
          isFetching
            ? 'border-accent/60 shadow-accent'
            : isValid
            ? 'border-accent/40'
            : 'border-synth-border hover:border-synth-border-bright'
        )}
      >
        <div className="shrink-0">
          {isFetching ? (
            <Loader2 className="h-6 w-6 text-accent animate-spin" />
          ) : isPlaylist ? (
            <ListVideo className="h-6 w-6 text-accent" />
          ) : isValid ? (
            <Music className="h-6 w-6 text-accent" />
          ) : (
            <Link2 className="h-6 w-6 text-synth-text-dim" />
          )}
        </div>

        <input
          ref={inputRef}
          type="url"
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder="Paste YouTube URL here..."
          className="flex-1 bg-transparent text-base outline-none text-synth-text placeholder:text-synth-text-dim"
          disabled={isFetching}
          autoComplete="off"
          spellCheck={false}
        />

        {inputUrl && !isFetching && (
          <button
            onClick={clear}
            className="shrink-0 text-synth-text-dim hover:text-synth-text transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        <Button
          onClick={handleFetch}
          disabled={!isValid || isFetching}
          variant="neon"
          size="default"
          className="shrink-0 px-6"
        >
          {isFetching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Fetching...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4" />
              <span>Fetch</span>
            </>
          )}
        </Button>
      </div>

      {fetchError && (
        <div className="flex gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm animate-fade-in">
          <X className="h-4 w-4 shrink-0 mt-0.5" />
          <pre className="whitespace-pre-wrap leading-relaxed">{fetchError}</pre>
        </div>
      )}

      {!inputUrl && !mediaInfo && (
        <p className="text-center text-sm text-synth-text-dim">
          Supports single videos and playlists · Auto-detects on paste
        </p>
      )}
    </div>
  )
}
