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

  set(
    name: StoreName,
    value: StoreSchemas[StoreName]
  ): void {
    this.stores[name].set(value)
  }

  update(name: StoreName, partial: Partial<StoreSchemas[typeof name]>): void {
    this.stores[name].set({ ...this.stores[name].store, ...partial })
  }
}

export const storeManager = new StoreManager()
