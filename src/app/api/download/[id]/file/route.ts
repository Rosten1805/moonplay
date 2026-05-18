import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { downloadManager } from '@/lib/downloadManager'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const job = downloadManager.getJob(params.id)
  if (!job || !job.filePath) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 })
  }

  const filePath = job.filePath
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }

  const filename = path.basename(filePath)
  const stat = fs.statSync(filePath)
  const mimeType = job.format === 'mp3' ? 'audio/mpeg' : 'video/mp4'

  const nodeStream = fs.createReadStream(filePath)
  const webStream = new ReadableStream({
    start(controller) {
      nodeStream.on('data', (chunk) => controller.enqueue(chunk))
      nodeStream.on('end', () => {
        controller.close()
        // Clean up file after serving — important in cloud environments
        fs.unlink(filePath, () => {})
      })
      nodeStream.on('error', (err) => controller.error(err))
    },
    cancel() {
      nodeStream.destroy()
    },
  })

  return new NextResponse(webStream, {
    headers: {
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      'Content-Type': mimeType,
      'Content-Length': String(stat.size),
    },
  })
}
