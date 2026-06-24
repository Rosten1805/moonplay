import { spawn, ChildProcess } from 'child_process'
import path from 'path'
import fs from 'fs'
import { DownloadJob, DownloadProgress, DownloadStatus } from '@/types'
import { buildYtDlpArgs, getYtDlpBin, parseProgressLine } from './ytdlp'
import { addToHistory } from './history'

interface ActiveDownload {
  job: DownloadJob
  process: ChildProcess
  progressListeners: Set<(p: DownloadProgress) => void>
  completeListeners: Set<() => void>
}

class DownloadManager {
  private downloads = new Map<string, ActiveDownload>()

  startDownload(job: DownloadJob, outputDir: string): void {
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true })

    const bin = getYtDlpBin()
    const args = buildYtDlpArgs(job, outputDir)

    const proc = spawn(bin, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: false,
      windowsHide: true,
    })

    const updatedJob: DownloadJob = { ...job, status: 'downloading' }

    const active: ActiveDownload = {
      job: updatedJob,
      process: proc,
      progressListeners: new Set(),
      completeListeners: new Set(),
    }

    this.downloads.set(job.id, active)

    const emit = (p: DownloadProgress) => {
      active.progressListeners.forEach((cb) => {
        try { cb(p) } catch { /* ignore closed streams */ }
      })
    }

    const emitComplete = () => {
      active.completeListeners.forEach((cb) => {
        try { cb() } catch { /* ignore */ }
      })
    }

    let stdoutBuffer = ''

    proc.stdout?.on('data', (data: Buffer) => {
      stdoutBuffer += data.toString()
      const lines = stdoutBuffer.split('\n')
      stdoutBuffer = lines.pop() ?? ''

      for (const line of lines) {
        const progress = parseProgressLine(line)
        if (progress) {
          active.job.progress = progress.percent
          active.job.speed = progress.speed
          active.job.eta = progress.eta
          if (progress.fileSize) active.job.fileSize = progress.fileSize

          emit({
            id: job.id,
            percent: progress.percent,
            speed: progress.speed,
            eta: progress.eta,
            fileSize: progress.fileSize,
            status: 'downloading',
          })
        }

        const destMatch = line.match(/\[download\] Destination: (.+)/)
        if (destMatch) {
          active.job.filePath = destMatch[1].trim()
        }

        const mergeMatch = line.match(/\[Merger\] Merging formats into "(.+)"/)
        if (mergeMatch) {
          active.job.filePath = mergeMatch[1].trim()
        }

        // Capture final path after audio extraction (MP3 conversion)
        const extractMatch = line.match(/\[ExtractAudio\] Destination: (.+)/)
        if (extractMatch) {
          active.job.filePath = extractMatch[1].trim()
        }

        if (
          line.includes('[ffmpeg]') ||
          line.includes('[Merger]') ||
          line.includes('[ExtractAudio]') ||
          line.includes('[EmbedThumbnail]') ||
          line.includes('[Metadata]') ||
          line.includes('[FixupM4a]') ||
          line.includes('Converting')
        ) {
          active.job.status = 'processing'
          emit({ id: job.id, percent: 100, speed: '', eta: '', status: 'processing' })
        }
      }
    })

    proc.stderr?.on('data', (data: Buffer) => {
      const text = data.toString()
      if (text.includes('ERROR')) {
        active.job.error = text.trim().split('\n')[0]
      }
    })

    proc.on('close', (code) => {
      if (code === 0) {
        active.job.status = 'completed'
        active.job.progress = 100
        active.job.completedAt = new Date().toISOString()

        emit({
          id: job.id,
          percent: 100,
          speed: '',
          eta: '',
          status: 'completed',
          filePath: active.job.filePath,
          fileSize: active.job.fileSize,
          done: true,
        })
        emitComplete()

        addToHistory(active.job).catch(console.error)
      } else if (code !== null) {
        active.job.status = 'failed'
        const errMsg = active.job.error || `Process exited with code ${code}`

        emit({
          id: job.id,
          percent: active.job.progress,
          speed: '',
          eta: '',
          status: 'failed',
          error: errMsg,
          done: true,
        })
        emitComplete()
      }

      // Keep entry for a short while so status queries can read it
      setTimeout(() => this.downloads.delete(job.id), 120_000)
    })

    proc.on('error', (err) => {
      active.job.status = 'failed'
      active.job.error = err.message

      emit({
        id: job.id,
        percent: 0,
        speed: '',
        eta: '',
        status: 'failed',
        error: err.message,
        done: true,
      })
      emitComplete()
    })
  }

  cancelDownload(id: string): boolean {
    const active = this.downloads.get(id)
    if (!active) return false

    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(active.process.pid), '/f', '/t'])
      } else {
        active.process.kill('SIGTERM')
      }
    } catch { /* already dead */ }

    active.job.status = 'cancelled'

    active.progressListeners.forEach((cb) => {
      try {
        cb({ id, percent: active.job.progress, speed: '', eta: '', status: 'cancelled', done: true })
      } catch { /* ignore */ }
    })
    active.completeListeners.forEach((cb) => { try { cb() } catch { /* ignore */ } })

    this.downloads.delete(id)
    return true
  }

  getJob(id: string): DownloadJob | null {
    return this.downloads.get(id)?.job ?? null
  }

  addProgressListener(id: string, cb: (p: DownloadProgress) => void): () => void {
    const active = this.downloads.get(id)
    if (!active) return () => {}
    active.progressListeners.add(cb)
    return () => active.progressListeners.delete(cb)
  }

  addCompleteListener(id: string, cb: () => void): () => void {
    const active = this.downloads.get(id)
    if (!active) return () => {}
    active.completeListeners.add(cb)
    return () => active.completeListeners.delete(cb)
  }

  isActive(id: string): boolean {
    return this.downloads.has(id)
  }

  getActiveCount(): number {
    return this.downloads.size
  }
}

// Singleton — survives Next.js hot reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _moonplayDM: DownloadManager | undefined
}

export const downloadManager: DownloadManager =
  global._moonplayDM ?? (global._moonplayDM = new DownloadManager())
