import { contextBridge, ipcRenderer } from 'electron'
import type { StorageName, StorageSchemas } from '../common/storage'

// Custom APIs for renderer
const api = {}

const electronStores = {
  get<T extends StorageName>(name: T): Promise<StorageSchemas[T]> {
    return ipcRenderer.invoke('store-get', name)
  },
  set: <T extends StorageName>(name: T, value: StorageSchemas[T]): void => {
    ipcRenderer.invoke('store-ipc-set', { name, value })
  },
  onStoreChange: <T extends StorageName>(callback: (name: T, value: StorageSchemas[T]) => void) => {
    ipcRenderer.on('store-changed', (_, { name, value }) => callback(name, value))
    return () => ipcRenderer.removeAllListeners('store-changed')
  }
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
