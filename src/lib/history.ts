import fs from 'fs/promises'
import path from 'path'
import { HistoryItem, DownloadJob } from '@/types'

const HISTORY_FILE = path.join(process.cwd(), 'data', 'history.json')
const MAX_HISTORY = 200

async function ensureFile(): Promise<void> {
  await fs.mkdir(path.dirname(HISTORY_FILE), { recursive: true })
  try {
    await fs.access(HISTORY_FILE)
  } catch {
    await fs.writeFile(HISTORY_FILE, '[]', 'utf-8')
  }
}

export async function getHistory(): Promise<HistoryItem[]> {
  await ensureFile()
  try {
    const raw = await fs.readFile(HISTORY_FILE, 'utf-8')
    return JSON.parse(raw) as HistoryItem[]
  } catch {
    return []
  }
}

export async function addToHistory(job: DownloadJob): Promise<void> {
  if (job.status !== 'completed') return

  await ensureFile()
  const history = await getHistory()

  const item: HistoryItem = {
    ...job,
    completedAt: job.completedAt || new Date().toISOString(),
  }

  const updated = [item, ...history.filter((h) => h.id !== job.id)].slice(0, MAX_HISTORY)
  await fs.writeFile(HISTORY_FILE, JSON.stringify(updated, null, 2), 'utf-8')
}

export async function removeFromHistory(id: string): Promise<void> {
  const history = await getHistory()
  await fs.writeFile(
    HISTORY_FILE,
    JSON.stringify(history.filter((h) => h.id !== id), null, 2),
    'utf-8'
  )
}

export async function clearHistory(): Promise<void> {
  await fs.writeFile(HISTORY_FILE, '[]', 'utf-8')
}
