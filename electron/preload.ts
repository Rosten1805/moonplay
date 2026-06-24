import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: (): Promise<string | null> =>
    ipcRenderer.invoke('dialog:openFolder'),
  openPath: (p: string): Promise<void> =>
    ipcRenderer.invoke('shell:openPath', p),
})
