'use client'

import { type ReactNode } from 'react'
import { type LucideIcon, Settings, FolderOpen, RotateCcw, Terminal, Cpu } from 'lucide-react'
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
