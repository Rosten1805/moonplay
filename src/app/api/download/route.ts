import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import { downloadManager } from '@/lib/downloadManager'
import { DownloadJob, DownloadFormat } from '@/types'
import { isYouTubeUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { url, title, thumbnail, duration, format, quality, outputPath } = body

  if (!url || !isYouTubeUrl(url)) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  if (!['mp3', 'mp4'].includes(format)) {
    return NextResponse.json({ error: 'Invalid format. Use mp3 or mp4' }, { status: 400 })
  }

  const defaultDir = process.env.MOONPLAY_DOWNLOADS_DIR || path.join(process.cwd(), 'downloads')
  const resolvedOutput =
    outputPath && path.isAbsolute(outputPath) ? outputPath : defaultDir

  const job: DownloadJob = {
    id: uuidv4(),
    url,
    title: title || 'Unknown',
    thumbnail: thumbnail || '',
    duration: duration || 0,
    format: format as DownloadFormat,
    quality: quality || 'best',
    status: 'pending',
    progress: 0,
    speed: '',
    eta: '',
    createdAt: new Date().toISOString(),
  }

  downloadManager.startDownload(job, resolvedOutput)

  return NextResponse.json({ job }, { status: 201 })
}
