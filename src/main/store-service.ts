import Store from 'electron-store'
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

export class StoreManager {
  private stores: StoreInstances

  constructor() {
    this.stores = STORE_NAMES.reduce((acc, name: StoreName) => {
      acc[name] = new Store<StoreSchemas[typeof name]>({
        name,
        defaults: getDefaultValues(name)
      })
      return acc
    }, {} as StoreInstances)
  }

  get(name: StoreName): StoreValue {
    return this.stores[name].store
  }

  set(name: StoreName, key: keyof StoreSchemas[StoreName], value: StoreValue): void {
    this.stores[name].set(key as string, value)
  }
}

export const storeManager = new StoreManager()
