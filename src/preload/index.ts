import { contextBridge, ipcRenderer } from 'electron'
import type { StorageName, StorageSchemas } from '../common/storage'

// Custom APIs for renderer
const api = {}

type StorageChangeCallback = (
  name: string,
  value: unknown,
  source: 'store' | 'rune' | 'main'
) => void

class StorageChangeManager {
  private callbacks = new Map<string, Set<StorageChangeCallback>>()

  add(uid: string, callback: StorageChangeCallback): StorageChangeCallback {
    if (!this.callbacks.has(uid)) {
      this.callbacks.set(uid, new Set())
    }
    this.callbacks.get(uid)!.add(callback)
    return callback
  }

  remove(uid: string, callback: StorageChangeCallback): void {
    const callbacks = this.callbacks.get(uid)
    if (callbacks) {
      callbacks.delete(callback)
      if (callbacks.size === 0) {
        this.callbacks.delete(uid)
      }
    }
  }

  notify<T extends StorageName>(
    name: T,
    value: StorageSchemas[T],
    source: 'store' | 'rune' | 'main'
  ): void {
    const callbackValues = this.callbacks.values()
    for (const callbacks of callbackValues) {
      if (callbacks) {
        callbacks.forEach((cb) => cb(name, value, source))
      }
    }
  }
}

const storageChangeManager = new StorageChangeManager()

ipcRenderer.on('storage-changed', (_, { name, value, source }) => {
  storageChangeManager.notify(name as StorageName, value, source)
})

const electronStores = {
  get<T extends StorageName>(name: T): Promise<StorageSchemas[T]> {
    return ipcRenderer.invoke('storage-get', name)
  },
  set: <T extends StorageName>(
    name: T,
    value: StorageSchemas[T],
    source: 'store' | 'rune'
  ): void => {
    ipcRenderer.invoke('storage-ipc-set', { name, value, source })
  },
  onStorageChange: <T extends StorageName>(
    callback: (name: T, value: StorageSchemas[T], source: 'store' | 'rune' | 'main') => void
  ) => {
    const uid = Math.random().toString(36).substr(2, 8)
    // @ts-ignore ignore
    const wrappedCallback = storageChangeManager.add(uid, callback)
    return () => storageChangeManager.remove(uid, wrappedCallback)
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
