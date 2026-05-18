import { NextRequest, NextResponse } from 'next/server'
import { downloadManager } from '@/lib/downloadManager'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const job = downloadManager.getJob(params.id)
  if (!job) {
    return NextResponse.json({ error: 'Download not found' }, { status: 404 })
  }
  return NextResponse.json(job)
}
