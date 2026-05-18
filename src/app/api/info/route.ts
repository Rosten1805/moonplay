import { NextRequest, NextResponse } from 'next/server'
import { getVideoInfo } from '@/lib/ytdlp'
import { isYouTubeUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  if (!isYouTubeUrl(url)) {
    return NextResponse.json({ error: 'Only YouTube URLs are supported' }, { status: 400 })
  }

  try {
    const info = await getVideoInfo(url)
    return NextResponse.json(info)
  } catch (err: any) {
    const message = err.message || 'Failed to fetch video info'

    // yt-dlp not installed (Windows: "no se reconoce", Unix: "not found", "No such file")
    if (
      message.includes('no se reconoce') ||
      message.includes('not found') ||
      message.includes('No such file') ||
      message.includes('ENOENT') ||
      message.includes('spawn') ||
      message.includes('command not found')
    ) {
      const isWindows = process.platform === 'win32'
      const errorMsg = isWindows
        ? 'yt-dlp no está instalado. Ejecuta en PowerShell (como Administrador):\n  winget install yt-dlp.yt-dlp\n  winget install Gyan.FFmpeg\nLuego reinicia la app.'
        : `yt-dlp no encontrado en ${process.env.YTDLP_PATH || 'yt-dlp'}. Error: ${message}`
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }

    if (message.includes('unavailable') || message.includes('Private video')) {
      return NextResponse.json({ error: 'Video no disponible o es privado' }, { status: 404 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
