import { NextRequest, NextResponse } from 'next/server'
import { downloadManager } from '@/lib/downloadManager'

export const dynamic = 'force-dynamic'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const cancelled = downloadManager.cancelDownload(params.id)
  if (!cancelled) {
    return NextResponse.json({ error: 'Download not found or already finished' }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}
