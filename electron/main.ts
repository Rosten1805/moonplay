import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron'
import path from 'path'
import http from 'http'

const isDev = !app.isPackaged
const PORT = 3000

let mainWindow: BrowserWindow | null = null

function waitForServer(retries = 60): Promise<void> {
  return new Promise((resolve, reject) => {
    const attempt = (remaining: number) => {
      const req = http.get(`http://127.0.0.1:${PORT}`, () => {
        req.destroy()
        resolve()
      })
      req.on('error', () => {
        if (remaining <= 0) { reject(new Error('Next.js server did not start in time')); return }
        setTimeout(() => attempt(remaining - 1), 500)
      })
      req.end()
    }
    attempt(retries)
  })
}

function startProductionServer(): Promise<void> {
  const standaloneDir = path.join(process.resourcesPath, 'app', '.next', 'standalone')
  const serverScript = path.join(standaloneDir, 'server.js')

  // Point yt-dlp to the bundled ffmpeg/ffprobe binaries.
  const fftoolsDir = path.join(process.resourcesPath, 'fftools')
  process.env.FFMPEG_PATH = path.join(fftoolsDir, 'ffmpeg.exe')

  // Default download location: user's Windows Downloads/Moonplay folder
  if (!process.env.MOONPLAY_DOWNLOADS_DIR) {
    process.env.MOONPLAY_DOWNLOADS_DIR = path.join(app.getPath('downloads'), 'Moonplay')
  }

  process.env.PORT = String(PORT)
  process.env.HOSTNAME = '127.0.0.1'

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require(serverScript)

  return waitForServer()
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0C0118',
    title: 'Moonplay',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`)
  mainWindow.on('closed', () => { mainWindow = null })
}

ipcMain.handle('dialog:openFolder', async () => {
  if (!mainWindow) return null
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select download folder',
  })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('shell:openPath', async (_, folderPath: string) => {
  const err = await shell.openPath(folderPath)
  if (err) console.error('openPath error:', err)
})

app.whenReady().then(async () => {
  if (!isDev) {
    try {
      await startProductionServer()
    } catch (err) {
      dialog.showErrorBox('Moonplay — Error', `No se pudo arrancar el servidor.\n\n${err}`)
      app.quit()
      return
    }
  }
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
