import { NextRequest, NextResponse } from 'next/server'
import { getHistory, clearHistory } from '@/lib/history'

export const dynamic = 'force-dynamic'

export async function GET() {
  const history = await getHistory()
  return NextResponse.json(history)
}

export async function DELETE() {
  await clearHistory()
  return NextResponse.json({ success: true })
}
