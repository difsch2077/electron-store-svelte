import { contextBridge, ipcRenderer } from 'electron'
import type { DEFAULT_VALUES, StoreName, StoreSchemas } from '../common/stores'

// Custom APIs for renderer
const api = {}

const electronStores = {
  get(name: StoreName): Promise<(typeof DEFAULT_VALUES)[StoreName]> {
    // @ts-ignore ignore
    return ipcRenderer.invoke('store-get', name)
  },
  set: <K extends keyof StoreSchemas[StoreName]>(
    name: StoreName,
    key: K,
    value: StoreSchemas[StoreName][K]
  ) => ipcRenderer.invoke('store-set', { name, key, value }),
  update: (
    name: StoreName,
    partial: Partial<StoreSchemas[typeof name]>
  ) => ipcRenderer.invoke('store-update', { name, partial })
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('electronStores', electronStores)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore ignore
  window.api = api
  // @ts-ignore ignore
  window.electronStores = electronStores
}


declare global {
  interface Window {
    api: typeof api
    electronStores: typeof electronStores
  }
}
