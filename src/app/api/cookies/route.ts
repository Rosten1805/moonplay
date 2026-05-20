import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { COOKIES_PATH } from '@/lib/ytdlp'

export async function GET() {
  const exists = fs.existsSync(COOKIES_PATH)
  return NextResponse.json({ exists })
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  fs.mkdirSync(path.dirname(COOKIES_PATH), { recursive: true })
  fs.writeFileSync(COOKIES_PATH, buffer)

  return NextResponse.json({ ok: true })
}

export async function DELETE() {
  if (fs.existsSync(COOKIES_PATH)) fs.unlinkSync(COOKIES_PATH)
  return NextResponse.json({ ok: true })
}
