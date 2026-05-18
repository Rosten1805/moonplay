import { exec } from 'child_process'
import { promisify } from 'util'
import { VideoInfo, PlaylistInfo, PlaylistEntry, VideoFormat, DownloadJob } from '@/types'
import { isPlaylistUrl } from './utils'

const execAsync = promisify(exec)

export function getYtDlpBin(): string {
  return process.env.YTDLP_PATH || 'yt-dlp'
}

export function getFfmpegPath(): string {
  return process.env.FFMPEG_PATH || 'ffmpeg'
}

export async function getVideoInfo(url: string): Promise<VideoInfo | PlaylistInfo> {
  if (isPlaylistUrl(url)) {
    return getPlaylistInfo(url)
  }
  return getSingleVideoInfo(url)
}

async function getSingleVideoInfo(url: string): Promise<VideoInfo> {
  const bin = getYtDlpBin()
  let stdout: string

  try {
    const result = await execAsync(
      `"${bin}" --dump-json --no-warnings --no-playlist "${url}"`,
      { maxBuffer: 15 * 1024 * 1024, timeout: 30_000 }
    )
    stdout = result.stdout
  } catch (err: any) {
    // stderr is in err.stderr for exec failures
    throw new Error(err.stderr?.split('\n')[0] || err.message || 'yt-dlp failed')
  }

  const data = JSON.parse(stdout.trim())

  return {
    id: data.id,
    url: data.webpage_url || url,
    title: data.title || 'Unknown Title',
    thumbnail: pickBestThumbnail(data.thumbnails, data.thumbnail),
    duration: data.duration || 0,
    uploader: data.uploader || data.channel || 'Unknown',
    uploadDate: data.upload_date,
    description: data.description?.slice(0, 500),
    viewCount: data.view_count,
    likeCount: data.like_count,
    formats: parseFormats(data.formats || []),
    isPlaylist: false,
  }
}

async function getPlaylistInfo(url: string): Promise<PlaylistInfo> {
  const bin = getYtDlpBin()
  let stdout: string

  try {
    const result = await execAsync(
      `"${bin}" --flat-playlist --dump-json --no-warnings "${url}"`,
      { maxBuffer: 50 * 1024 * 1024, timeout: 60_000 }
    )
    stdout = result.stdout
  } catch (err: any) {
    throw new Error(err.stderr?.split('\n')[0] || err.message || 'yt-dlp playlist fetch failed')
  }

  const lines = stdout.trim().split('\n').filter(Boolean)
  const entries: PlaylistEntry[] = []
  let playlistTitle = 'Playlist'
  let playlistUploader = 'Unknown'

  for (const line of lines) {
    try {
      const item = JSON.parse(line)

      // Flat playlist items have _type === 'url' for entries
      if (item._type === 'playlist' || item.playlist_title) {
        playlistTitle = item.title || item.playlist_title || playlistTitle
        playlistUploader = item.uploader || item.channel || playlistUploader
        continue
      }

      entries.push({
        id: item.id,
        url: item.url || item.webpage_url || `https://www.youtube.com/watch?v=${item.id}`,
        title: item.title || 'Unknown',
        thumbnail:
          pickBestThumbnail(item.thumbnails) ||
          `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`,
        duration: item.duration,
        uploader: item.uploader || item.channel,
      })
    } catch {
      /* skip malformed lines */
    }
  }

  // If no playlist info line was found, try the first entry's playlist metadata
  if (entries.length > 0) {
    const firstEntry = entries[0]
    return {
      id: `playlist_${Date.now()}`,
      url,
      title: playlistTitle,
      thumbnail: firstEntry.thumbnail,
      uploader: playlistUploader,
      entryCount: entries.length,
      entries,
      isPlaylist: true,
    }
  }

  throw new Error('Playlist appears to be empty or private')
}

function pickBestThumbnail(thumbnails?: any[], fallback?: string): string {
  if (!thumbnails?.length) return fallback || ''
  const sorted = [...thumbnails]
    .filter((t) => t.url && !t.url.includes('default.jpg'))
    .sort((a, b) => (b.width || 0) - (a.width || 0))
  return sorted[0]?.url || thumbnails[0]?.url || fallback || ''
}

function parseFormats(formats: any[]): VideoFormat[] {
  return formats
    .filter((f) => f.vcodec !== 'none' || f.acodec !== 'none')
    .map((f) => ({
      formatId: f.format_id,
      ext: f.ext,
      resolution: f.resolution,
      height: f.height,
      width: f.width,
      filesize: f.filesize,
      tbr: f.tbr,
      vbr: f.vbr,
      abr: f.abr,
      fps: f.fps,
      vcodec: f.vcodec,
      acodec: f.acodec,
      note: f.format_note,
    }))
}

export function buildYtDlpArgs(job: DownloadJob, outputDir: string): string[] {
  const outputTemplate = `${outputDir}/%(title)s.%(ext)s`
  const ffmpegPath = getFfmpegPath()

  const baseArgs = [
    '--no-warnings',
    '--newline',
    '--progress',
    '--output',
    outputTemplate,
    '--ffmpeg-location',
    ffmpegPath,
  ]

  if (job.format === 'mp3') {
    const audioQuality = getAudioQualityFlag(job.quality)
    return [
      ...baseArgs,
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      audioQuality,
      '--embed-thumbnail',
      '--add-metadata',
      job.url,
    ]
  }

  const formatStr = getVideoFormatString(job.quality)
  return [
    ...baseArgs,
    '-f',
    formatStr,
    '--merge-output-format',
    'mp4',
    job.url,
  ]
}

function getAudioQualityFlag(quality: string): string {
  const map: Record<string, string> = {
    best: '0',
    '320k': '0',
    '256k': '2',
    '192k': '4',
    '128k': '6',
    '96k': '8',
  }
  return map[quality] ?? '0'
}

function getVideoFormatString(quality: string): string {
  const map: Record<string, string> = {
    best: 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/bestvideo+bestaudio/best',
    '4K': 'bestvideo[height<=2160][ext=mp4]+bestaudio[ext=m4a]/best[height<=2160]',
    '2K': 'bestvideo[height<=1440][ext=mp4]+bestaudio[ext=m4a]/best[height<=1440]',
    '1080p': 'bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080]',
    '720p': 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]',
    '480p': 'bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480]',
    '360p': 'bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/best[height<=360]',
  }
  return map[quality] ?? map['best']
}

export interface ParsedProgress {
  percent: number
  speed: string
  eta: string
  fileSize?: string
}

export function parseProgressLine(line: string): ParsedProgress | null {
  // [download]  73.5% of 48.23MiB at  3.21MiB/s ETA 00:08
  const m = line.match(
    /\[download\]\s+(\d+\.?\d*)%\s+of\s+([\d.]+\s*\w+)\s+at\s+([\d.]+\s*\w+\/s)\s+ETA\s+([\d:]+)/
  )
  if (m) {
    return { percent: parseFloat(m[1]), fileSize: m[2], speed: m[3], eta: m[4] }
  }

  // [download] 100% of 48.23MiB in 00:15
  const done = line.match(/\[download\]\s+100%\s+of\s+([\d.]+\s*\w+)\s+in\s+([\d:]+)/)
  if (done) {
    return { percent: 100, fileSize: done[1], speed: '', eta: '0:00' }
  }

  return null
}
