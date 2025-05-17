/* eslint-disable prettier/prettier */
import Store from 'electron-store'
import { EventEmitter } from 'events'
import {
  StoreName,
  StoreSchemas,
  getDefaultValues,
  STORE_NAMES
} from '../common/stores'

type StoreInstances = {
  [K in StoreName]: Store<StoreSchemas[K]>
}

type StoreChangeCallback = (name: StoreName, value: StoreSchemas[StoreName]) => void

export class StoreManager extends EventEmitter {
  private stores: StoreInstances

  constructor() {
    super()
    this.stores = STORE_NAMES.reduce(<T extends StoreName>(acc, name: T) => {
      const store = new Store<StoreSchemas[typeof name]>({
        name,
        defaults: getDefaultValues(name)
      })

      // Watch for changes to this store
      store.onDidAnyChange((newValue) => {
        this.emit('store-changed', name, newValue)
      })
      acc[name] = store
      return acc
    }, {} as StoreInstances)
  }

  get<T extends StoreName>(name: T): StoreSchemas[T] {
    return this.stores[name].store
  }

  set<T extends StoreName>(name: T, value: StoreSchemas[T]): void {
    this.stores[name].set(value)
  }

  onStoreChange(callback: StoreChangeCallback): void {
    this.on('store-changed', callback)
  }
}

export const storeManager = new StoreManager()
