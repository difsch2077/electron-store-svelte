import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import type { StoreName } from '../common/stores'

// Custom APIs for renderer
const api = {}

const electronStores = {
  get: (name: StoreName) => ipcRenderer.invoke('store-get', name),
  set: (name: StoreName, key: string, value: unknown) =>
    ipcRenderer.invoke('store-set', { name, key, value })
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronStores', electronStores)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore ignore
  window.electron = electronAPI
  // @ts-ignore ignore
  window.api = api
  // @ts-ignore ignore
  window.electronStores = electronStores
}
