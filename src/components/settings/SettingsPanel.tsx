'use client'

import { type ReactNode, useState, useEffect, useRef } from 'react'
import { type LucideIcon, Settings, FolderOpen, RotateCcw, Terminal, Cpu, Cookie, CheckCircle2, XCircle, Upload, Trash2 } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AUDIO_QUALITIES, VIDEO_QUALITIES, DownloadFormat } from '@/types'
import { toast } from '@/components/ui/use-toast'

function CookiesSection() {
  const [cookiesExist, setCookiesExist] = useState<boolean | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const checkCookies = async () => {
    const res = await fetch('/api/cookies')
    const data = await res.json()
    setCookiesExist(data.exists)
  }

  useEffect(() => { checkCookies() }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    await fetch('/api/cookies', { method: 'POST', body: form })
    await checkCookies()
    setUploading(false)
    toast({ title: 'Cookies cargadas', description: 'YouTube cookies actualizadas correctamente' } as any)
  }

  const handleDelete = async () => {
    await fetch('/api/cookies', { method: 'DELETE' })
    await checkCookies()
    toast({ title: 'Cookies eliminadas' } as any)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {cookiesExist === true && <CheckCircle2 className="h-4 w-4 text-green-400" />}
        {cookiesExist === false && <XCircle className="h-4 w-4 text-red-400" />}
        {cookiesExist === null && <div className="h-4 w-4 rounded-full bg-synth-border/50" />}
        <span className="text-sm text-synth-text">
          {cookiesExist === true ? 'Cookies cargadas — YouTube desbloqueado' : 'Sin cookies — YouTube puede bloquear descargas'}
        </span>
      </div>

      <p className="text-xs text-synth-text-dim leading-relaxed">
        Exporta tus cookies de YouTube con la extensión{' '}
        <span className="text-accent font-mono">Get cookies.txt LOCALLY</span>{' '}
        (Chrome/Firefox), elige el dominio <span className="font-mono">youtube.com</span> y sube el archivo aquí.
      </p>

      <div className="flex gap-2">
        <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={handleUpload} />
        <Button
          size="sm"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? 'Subiendo...' : 'Subir cookies.txt'}
        </Button>
        {cookiesExist && (
          <Button size="sm" variant="ghost" onClick={handleDelete} className="gap-2 text-red-400 hover:text-red-300">
            <Trash2 className="h-3.5 w-3.5" />
            Eliminar
          </Button>
        )}
      </div>
    </div>
  )
}

export function SettingsPanel() {
  const { settings, updateSettings, resetSettings } = useSettingsStore()

  const handleReset = () => {
    resetSettings()
    toast({ title: 'Settings reset', description: 'All settings restored to defaults' } as any)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-5 w-5 text-accent" strokeWidth={1.5} />
          <h2 className="font-orbitron text-base font-semibold tracking-wider text-synth-text">SETTINGS</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>

      <div className="space-y-7">
        <Section title="Downloads" icon={FolderOpen}>
          <Field label="Download folder">
            <Input
              value={settings.downloadPath}
              onChange={(e) => updateSettings({ downloadPath: e.target.value })}
              placeholder="./downloads"
              className="font-mono text-xs"
            />
            <p className="text-[10px] text-synth-text-dim mt-1">
              Relative to the app folder, or an absolute path
            </p>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Default format">
              <Select
                value={settings.defaultFormat}
                onValueChange={(v) => updateSettings({ defaultFormat: v as DownloadFormat })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp3">MP3 (audio)</SelectItem>
                  <SelectItem value="mp4">MP4 (video)</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field label="Max concurrent">
              <Select
                value={String(settings.maxConcurrentDownloads)}
                onValueChange={(v) => updateSettings({ maxConcurrentDownloads: parseInt(v) })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Default audio quality">
              <Select
                value={settings.defaultAudioQuality}
                onValueChange={(v) => updateSettings({ defaultAudioQuality: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIO_QUALITIES.map((q) => (
                    <SelectItem key={q} value={q}>{q === 'best' ? '✦ Best' : q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Default video quality">
              <Select
                value={settings.defaultVideoQuality}
                onValueChange={(v) => updateSettings({ defaultVideoQuality: v })}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_QUALITIES.map((q) => (
                    <SelectItem key={q} value={q}>{q === 'best' ? '✦ Best' : q}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        <Separator />

        <Section title="File options" icon={Cpu}>
          <div className="space-y-3">
            <SwitchField
              label="Embed thumbnail"
              description="Add cover art to downloaded files"
              checked={settings.embedThumbnail}
              onCheckedChange={(v) => updateSettings({ embedThumbnail: v })}
            />
            <SwitchField
              label="Embed metadata"
              description="Add title, artist, etc. to file tags"
              checked={settings.embedMetadata}
              onCheckedChange={(v) => updateSettings({ embedMetadata: v })}
            />
          </div>
        </Section>

        <Separator />

        <Section title="YouTube cookies" icon={Cookie}>
          <CookiesSection />
        </Section>

        <Separator />

        <Section title="Binary paths" icon={Terminal}>
          <p className="text-xs text-synth-text-dim mb-3">
            Leave as default if yt-dlp and ffmpeg are in your PATH, or provide full paths.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="yt-dlp path">
              <Input
                value={settings.ytdlpPath}
                onChange={(e) => updateSettings({ ytdlpPath: e.target.value })}
                placeholder="yt-dlp"
                className="font-mono text-xs"
              />
            </Field>
            <Field label="ffmpeg path">
              <Input
                value={settings.ffmpegPath}
                onChange={(e) => updateSettings({ ffmpegPath: e.target.value })}
                placeholder="ffmpeg"
                className="font-mono text-xs"
              />
            </Field>
          </div>
        </Section>

        <Separator />

        <div className="rounded-xl border border-synth-border/50 bg-synth-bg-2/40 p-5 space-y-2">
          <p className="font-orbitron text-sm text-accent tracking-widest">MOONPLAY v0.1.0</p>
          <p className="text-sm text-synth-text-dim">
            Local personal YouTube downloader. Powered by yt-dlp & ffmpeg.
            No cloud, no accounts, fully offline after setup.
          </p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-accent" strokeWidth={1.5} />
        <span className="text-sm font-medium uppercase tracking-widest text-synth-text-dim">
          {title}
        </span>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function SwitchField({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <div>
        <p className="text-base text-synth-text">{label}</p>
        <p className="text-sm text-synth-text-dim mt-0.5">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
