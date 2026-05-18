import { NextRequest } from 'next/server'
import { downloadManager } from '@/lib/downloadManager'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  const encoder = new TextEncoder()

  let removeProgress: (() => void) | null = null
  let removeComplete: (() => void) | null = null
  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null

  const send = (data: object) => {
    try {
      streamController?.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
    } catch { /* stream closed */ }
  }

  const close = () => {
    removeProgress?.()
    removeComplete?.()
    try { streamController?.close() } catch { /* already closed */ }
  }

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller

      // If download no longer tracked, it may have completed already
      if (!downloadManager.isActive(id)) {
        send({ id, percent: 100, speed: '', eta: '', status: 'completed', done: true })
        controller.close()
        return
      }

      // Send heartbeat comment so connection stays open
      try {
        controller.enqueue(encoder.encode(': connected\n\n'))
      } catch { return }

      removeProgress = downloadManager.addProgressListener(id, (progress) => {
        send(progress)
        if (progress.done) close()
      })

      removeComplete = downloadManager.addCompleteListener(id, () => {
        close()
      })
    },
    cancel() {
      removeProgress?.()
      removeComplete?.()
    },
  })

  // Clean up on client disconnect
  req.signal.addEventListener('abort', close)

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-store, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
