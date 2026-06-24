# Moonplay

A local YouTube downloader for Windows. Download MP3s and MP4s directly to your machine — no accounts, no cloud, no tracking.

---

## Features

- Download YouTube videos as **MP3** (audio) or **MP4** (video)
- Full **playlist support** — browse and download entire playlists
- Real-time **progress bar** with speed and ETA
- **Download history** — persistent log of every file
- Configurable **settings**: download folder, quality, tool paths
- Self-contained Windows installer — **ffmpeg is bundled**, no Python required
- Synthwave UI — dark mode, neon palette

---

## Installation (end user)

Download the latest `Moonplay Setup X.X.X.exe` from [Releases](../../releases) and run it.

On first launch the app creates:

| Path | Purpose |
|------|---------|
| `C:\Users\<you>\Downloads\Moonplay\` | Default folder where files are saved |

**yt-dlp must be installed separately:**

```powershell
winget install yt-dlp.yt-dlp
```

Or download the standalone `.exe` from [github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases) and add it to your PATH.

---

## Usage

1. Paste a YouTube video or playlist URL in the input bar
2. Press **Fetch** to load video info and thumbnail
3. Choose **MP3** or **MP4** and pick quality
4. Click **Download** — progress streams in real time
5. When complete, the app navigates to History automatically
6. Click the **folder icon** on any entry to open the download location

---

## Development Setup

### Prerequisites

- Node.js 18+
- yt-dlp in PATH
- ffmpeg in PATH (the installer bundles its own; dev mode uses the system one)

### Install and run

```bash
npm install

# Next.js dev server only (http://localhost:3000)
npm run dev

# Electron + Next.js together with hot reload
npm run electron:dev
```

---

## Build the Installer

```bash
# 1. Build Next.js in standalone mode
npm run build

# 2. Copy static assets into standalone output
xcopy /E /I /Y .next\static .next\standalone\.next\static
xcopy /E /I /Y public .next\standalone\public

# 3. Compile Electron TypeScript
npm run electron:compile

# 4. Package into installer
npx electron-builder
# → dist/Moonplay Setup X.X.X.exe
```

Or run everything in one command:

```bash
npm run electron:build
```

---

## How It Works

### Architecture

```
Electron (main process)
  ├── Starts Next.js standalone server on port 3000
  ├── Opens BrowserWindow → http://localhost:3000
  └── Exposes shell:openPath via IPC (opens folders in Explorer)

Next.js (local server — runs inside the installed app)
  ├── GET  /api/info              Fetches YouTube metadata via yt-dlp --dump-json
  ├── POST /api/download          Spawns yt-dlp, returns job ID
  ├── GET  /api/progress/[id]     Streams real-time progress via Server-Sent Events
  ├── GET/DELETE /api/history     Reads/writes data/history.json
  └── POST /api/open-folder       Opens file manager (web fallback only)

yt-dlp (external subprocess)
  └── Called with format flags, --ffmpeg-location, output template
  └── stdout parsed line-by-line for progress (%, speed, ETA)

ffmpeg (bundled binary at resources/fftools/ffmpeg.exe)
  └── Used by yt-dlp for audio extraction, MP3 conversion, thumbnail embedding
```

### Download Flow — Step by Step

1. User pastes URL → `GET /api/info` → backend spawns `yt-dlp --dump-json` → returns title, thumbnail, formats, duration
2. User picks format + quality → clicks Download
3. `POST /api/download` → validates URL → resolves output path → creates job with UUID → spawns `yt-dlp` child process
4. Frontend opens `EventSource /api/progress/:id` → SSE connection stays open for the duration of the download
5. yt-dlp stdout is parsed: percentage, speed, ETA extracted via regex → emitted to SSE listeners every update
6. Long ffmpeg conversions (MP3 extraction) are kept alive by a 15-second SSE heartbeat comment
7. On exit code 0 → status = `completed` → job written to `data/history.json` → UI dispatches completion event
8. UI receives completion event → shows toast notification → auto-navigates to History tab

### Output Path Resolution

The download folder is resolved in this priority order:

| Priority | Condition | Result |
|----------|-----------|--------|
| 1 | User sets an absolute path in Settings | Used as-is |
| 2 | Running as installed Electron app | `C:\Users\<you>\Downloads\Moonplay` |
| 3 | Running in dev mode | `{project root}/downloads` |

The installed app sets `MOONPLAY_DOWNLOADS_DIR` via `app.getPath('downloads')` in Electron main before starting the Next.js server.

---

## Settings Reference

All settings are persisted in `localStorage` and configurable from the Settings tab.

| Setting | Default (installed) | Default (dev) | Description |
|---------|---------------------|---------------|-------------|
| Download folder | `~/Downloads/Moonplay` | `./downloads` | Where files are saved |
| Default format | MP3 | MP3 | Audio or video |
| Audio quality | Best | Best | 320k / 256k / 192k / 128k / 96k |
| Video quality | 1080p | 1080p | 4K / 2K / 1080p / 720p / 480p / 360p |
| yt-dlp path | `yt-dlp` | `yt-dlp` | Override if not in PATH |
| ffmpeg path | bundled | `ffmpeg` | Set automatically in installed app |
| Embed thumbnail | On | On | Embeds cover art in MP3 |
| Embed metadata | On | On | Embeds title and uploader in MP3 |

---

## Key Files

| File | Role |
|------|------|
| `electron/main.ts` | Electron entry: starts server, creates window, handles IPC |
| `electron/preload.ts` | Exposes `window.electronAPI` to the renderer via contextBridge |
| `scripts/afterPack.cjs` | Post-pack hook: copies `node_modules` into installer (electron-builder workaround) |
| `src/lib/downloadManager.ts` | Singleton: manages active yt-dlp processes, tracks job state, emits progress events |
| `src/lib/ytdlp.ts` | Builds yt-dlp argument lists; parses stdout for progress data |
| `src/lib/history.ts` | Reads and writes `data/history.json` |
| `src/store/downloadStore.ts` | Zustand: download queue, SSE subscription, completion events |
| `src/store/settingsStore.ts` | Zustand: user settings, localStorage persistence |
| `src/app/api/download/route.ts` | POST handler: validates, resolves output path, starts download job |
| `src/app/api/progress/[id]/route.ts` | SSE stream with 15s heartbeat keepalive for long ffmpeg conversions |

---

## Project Structure

```
moonplay/
├── electron/                   # Electron main process source
│   ├── main.ts                 # App entry, window creation, IPC
│   ├── preload.ts              # contextBridge: exposes electronAPI to renderer
│   └── tsconfig.json
├── scripts/
│   └── afterPack.cjs           # electron-builder post-pack hook
├── src/
│   ├── app/
│   │   ├── api/                # Backend: Next.js API routes
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx            # Tab router: Download / History / Settings
│   ├── components/
│   │   ├── download/           # URLInput, VideoPreview, PlaylistPreview, DownloadQueue, DownloadItem
│   │   ├── history/            # HistoryPanel, HistoryItem
│   │   ├── layout/             # Background (animated grid), Header (tabs)
│   │   ├── settings/           # SettingsPanel
│   │   └── ui/                 # Shared: Button, Badge, Progress, Select, Toast...
│   ├── lib/                    # Core logic
│   ├── store/                  # Zustand stores
│   └── types/                  # Shared TypeScript types
├── public/                     # Static assets (logo, icon)
├── downloads/                  # Dev download folder (contents gitignored)
└── data/                       # Runtime data (history.json, gitignored)
```

---

## Troubleshooting

**"yt-dlp not found"** — Make sure yt-dlp is on your PATH (`yt-dlp --version` in terminal), or set the full path in Settings.

**Download stuck at "Converting"** — This is normal for MP3 downloads. ffmpeg is extracting and encoding audio. Large files can take a minute.

**"ffprobe not found"** — ffprobe must be in the same folder as ffmpeg. The installer bundles both. In dev mode, install ffmpeg system-wide.

**Video unavailable / private** — yt-dlp cannot access private or age-restricted videos without cookie authentication.

**History shows no folder icon** — The file path is only available after a download completes in the current session. Previously downloaded entries without a stored path won't show it.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Electron 42 |
| UI framework | Next.js 14 (App Router, standalone output) |
| Styling | TailwindCSS 3 + Radix UI primitives |
| State | Zustand 4 (localStorage persistence) |
| Download engine | yt-dlp (external binary) |
| Media processing | ffmpeg / ffprobe (bundled via @ffmpeg-installer) |
| Progress streaming | Server-Sent Events (SSE) |
| Packaging | electron-builder (NSIS installer for Windows) |

---

*Strictly local. No cloud. No accounts. No telemetry.*
