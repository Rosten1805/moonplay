import { NextRequest, NextResponse } from 'next/server'
import { removeFromHistory } from '@/lib/history'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await removeFromHistory(params.id)
  return NextResponse.json({ success: true })
}
