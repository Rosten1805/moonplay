# 🎵 Moonplay

> Local personal YouTube downloader with a synthwave aesthetic.
> Download MP3s and MP4s from YouTube, fully offline, no accounts.

**Live demo:** https://moonplay-production.up.railway.app

---

## Prerequisites

### 1 — Node.js

Install Node.js **v18+** from [nodejs.org](https://nodejs.org).

### 2 — yt-dlp

yt-dlp is the download engine. Install it with **one** of:

```bash
# Python / pip (recommended — always latest)
pip install yt-dlp

# Windows — winget
winget install yt-dlp

# macOS — Homebrew
brew install yt-dlp

# Linux
sudo curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
sudo chmod a+rx /usr/local/bin/yt-dlp
```

Verify: `yt-dlp --version`

### 3 — ffmpeg

ffmpeg handles audio conversion and video merging.

```bash
# Windows — winget
winget install ffmpeg

# Windows — Chocolatey
choco install ffmpeg

# macOS — Homebrew
brew install ffmpeg

# Ubuntu / Debian
sudo apt install ffmpeg

# Fedora / RHEL
sudo dnf install ffmpeg
```

Verify: `ffmpeg -version`

---

## Installation

```bash
# 1. Clone / copy the project
cd Moonplay

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## Usage

1. **Paste** a YouTube video or playlist URL in the input bar
2. Press **Enter** or click **Fetch** to load video info
3. Choose **MP3** or **MP4** and select quality
4. Click **Download** — progress streams in real time
5. When done, click the **folder icon** to open the download location

Downloads are saved to `./downloads/` by default (configurable in Settings).

---

## Configuration

Open the **Settings** tab in the app to:

| Setting | Default | Description |
|---------|---------|-------------|
| Download folder | `./downloads` | Where files are saved |
| Default format | `mp3` | MP3 or MP4 |
| Default audio quality | `best` | `320k`, `256k`, `192k`, `128k` |
| Default video quality | `1080p` | `4K`, `2K`, `1080p`, `720p`, … |
| Max concurrent | `3` | Parallel downloads |
| yt-dlp path | `yt-dlp` | Override if not in PATH |
| ffmpeg path | `ffmpeg` | Override if not in PATH |

Settings persist in `localStorage`.

---

## Build for production

```bash
npm run build
npm run start
```

---

## Project structure

```
Moonplay/
├── src/
│   ├── app/
│   │   ├── api/                  # Next.js API routes (backend)
│   │   │   ├── info/             # GET  video/playlist metadata
│   │   │   ├── download/         # POST start download
│   │   │   │   └── [id]/cancel   # POST cancel
│   │   │   ├── progress/[id]/    # GET  SSE progress stream
│   │   │   ├── history/          # GET/DELETE history
│   │   │   └── open-folder/      # POST open OS file manager
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── download/             # URLInput, VideoPreview, Queue, Item
│   │   ├── history/              # HistoryPanel, HistoryItem
│   │   ├── layout/               # Background, Header
│   │   ├── settings/             # SettingsPanel
│   │   └── ui/                   # shadcn-style components
│   ├── lib/
│   │   ├── downloadManager.ts    # Singleton — manages yt-dlp processes
│   │   ├── history.ts            # JSON file persistence
│   │   ├── utils.ts
│   │   └── ytdlp.ts              # yt-dlp argument builder + output parser
│   ├── store/
│   │   ├── downloadStore.ts      # Zustand — queue + fetch state
│   │   └── settingsStore.ts      # Zustand + localStorage persistence
│   └── types/
│       └── index.ts
├── data/
│   └── history.json              # Download history (auto-created)
├── downloads/                    # Downloaded files (auto-created)
├── package.json
└── README.md
```

---

## Troubleshooting

**"yt-dlp is not installed"** — Make sure `yt-dlp` is on your PATH. Try `yt-dlp --version` in terminal. If using a custom path, set it in Settings.

**"ffmpeg not found"** — ffmpeg is required for MP3 conversion and video merging. Install it and verify with `ffmpeg -version`.

**Video unavailable / private** — yt-dlp cannot download private or age-restricted videos without authentication.

**Slow downloads** — Adjust quality or concurrent download settings. Some videos are only available at high quality which requires merging streams.

**Windows: progress not updating** — Ensure yt-dlp is installed via pip (not the bundled .exe in some repos), as the pip version outputs proper newline-delimited progress.

---

## Tech stack

- **Next.js 14** (App Router) · **React 18** · **TypeScript**
- **TailwindCSS** — synthwave custom theme
- **Zustand** — state management with localStorage persistence
- **yt-dlp** — YouTube download engine
- **ffmpeg** — audio/video conversion
- **shadcn/ui** style components (Radix UI primitives)
- Server-Sent Events (SSE) for real-time progress streaming

---

*Strictly local. No cloud. No accounts. No telemetry.*
