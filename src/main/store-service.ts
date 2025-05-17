import Store from 'electron-store'
import { EventEmitter } from 'events'
import {
  StoreName,
  StoreValue,
  StoreSchemas,
  getDefaultValues,
  STORE_NAMES
} from '../common/stores'

type StoreInstances = {
  [K in StoreName]: Store<StoreValue>
}

type StoreChangeCallback = (name: StoreName, value: StoreSchemas[StoreName]) => void

export class StoreManager extends EventEmitter {
  private stores: StoreInstances

  constructor() {
    super()
    this.stores = STORE_NAMES.reduce((acc, name: StoreName) => {
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

  get(name: StoreName): StoreValue {
    return this.stores[name].store
  }

  set(name: StoreName, value: StoreSchemas[StoreName]): void {
    this.stores[name].set(value)
  }

  onStoreChange(callback: StoreChangeCallback): void {
    this.on('store-changed', callback)
  }
}

export const storeManager = new StoreManager()
