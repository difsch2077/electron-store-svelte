import { contextBridge, ipcRenderer } from 'electron'
import type { DEFAULT_VALUES, StoreName, StoreSchemas, StoreValue } from '../common/stores'

// Custom APIs for renderer
const api = {}

const electronStores = {
  get(name: StoreName): (typeof DEFAULT_VALUES)[StoreName] {
    // @ts-ignore ignore
    return ipcRenderer.invoke('store-get', name)
  },
  set: (
    name: StoreName,
    key: keyof StoreSchemas[StoreName],
    value: StoreValue[keyof StoreSchemas[StoreName]]
  ) => ipcRenderer.invoke('store-set', { name, key, value })
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
