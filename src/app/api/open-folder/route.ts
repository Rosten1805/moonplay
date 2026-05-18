import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import path from 'path'
import fs from 'fs'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { filePath } = await req.json()

  if (!filePath || typeof filePath !== 'string') {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
  }

  // Resolve the folder containing the file (or the folder itself)
  const resolved = path.resolve(filePath)
  const target = fs.existsSync(resolved)
    ? fs.statSync(resolved).isDirectory()
      ? resolved
      : path.dirname(resolved)
    : path.join(process.cwd(), 'downloads')

  let cmd: string
  switch (process.platform) {
    case 'win32':
      cmd = `explorer "${target}"`
      break
    case 'darwin':
      cmd = `open "${target}"`
      break
    default:
      cmd = `xdg-open "${target}"`
  }

  exec(cmd, (err) => {
    if (err) console.error('open-folder error:', err.message)
  })

  return NextResponse.json({ success: true })
}
