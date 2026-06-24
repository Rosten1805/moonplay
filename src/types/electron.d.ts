declare global {
  interface Window {
    electronAPI?: {
      selectFolder: () => Promise<string | null>
      openPath: (path: string) => Promise<void>
    }
  }
}

export {}
