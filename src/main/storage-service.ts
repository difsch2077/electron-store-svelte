import Store from 'electron-store'
import { EventEmitter } from 'events'
import { StorageName, StorageSchemas, storageDefaultValues, STORAGE_NAMES } from '../common/storage'

type StorageInstances = {
  [K in StorageName]: Store<StorageSchemas[K]>
}

export class StorageManager extends EventEmitter {
  private storages: StorageInstances

  constructor() {
    super()
    this.storages = STORAGE_NAMES.reduce(<T extends StorageName>(acc, name: T) => {
      const storage = new Store<StorageSchemas[typeof name]>({
        name,
        defaults: storageDefaultValues(name)
      })

      console.log('Storage ' + name + ': ', storage.path)

      acc[name] = storage
      return acc
    }, {} as StorageInstances)
  }

  get<T extends StorageName>(name: T): StorageSchemas[T] {
    return this.storages[name].store
  }

  set<T extends StorageName>(
    name: T,
    value: StorageSchemas[T],
    source: 'store' | 'rune' | 'main' = 'main'
  ): void {
    this.storages[name].set(value)
    this.emit('storage-changed', name, value, source)
  }

  setPartial<T extends StorageName>(
    name: T,
    value: Partial<StorageSchemas[T]>,
    source: 'store' | 'rune' | 'main' = 'main'
  ): void {
    const newValue = { ...this.get(name), ...value }
    this.set(name, newValue, source)
  }

  onStorageChange(
    callback: (
      name: StorageName,
      value: StorageSchemas[StorageName],
      source: 'store' | 'rune' | 'main'
    ) => void
  ): void {
    this.on('storage-changed', callback)
  }

  rendererSet<T extends StorageName>(
    name: T,
    value: StorageSchemas[T],
    source: 'store' | 'rune' | 'main'
  ): void {
    this.set(name, value, source)
  }
}

export const storageManager = new StorageManager()
