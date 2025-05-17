import { contextBridge, ipcRenderer } from 'electron'
import type { StoreName, ValueSchemas } from '../common/stores'

// Custom APIs for renderer
const api = {}

const electronStores = {
  get<T extends StoreName>(name: T): Promise<ValueSchemas[T]> {
    return ipcRenderer.invoke('store-get', name)
  },
  set: <T extends StoreName>(name: T, value: ValueSchemas[T]) =>
    ipcRenderer.invoke('store-set', { name, value }),
  onStoreChange: <T extends StoreName>(callback: (name: T, value: ValueSchemas[T]) => void) => {
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
