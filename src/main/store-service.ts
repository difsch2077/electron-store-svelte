import Store from 'electron-store'
import { EventEmitter } from 'events'
import { StoreName, ValueSchemas, getDefaultValues, STORE_NAMES } from '../common/stores'

type StoreInstances = {
  [K in StoreName]: Store<ValueSchemas[K]>
}

type StoreChangeCallback = (name: StoreName, value: ValueSchemas[StoreName]) => void

export class StoreManager extends EventEmitter {
  private stores: StoreInstances

  constructor() {
    super()
    this.stores = STORE_NAMES.reduce(<T extends StoreName>(acc, name: T) => {
      const store = new Store<ValueSchemas[typeof name]>({
        name,
        defaults: getDefaultValues(name)
      })

      console.log(store.path)

      // Watch for changes to this store
      store.onDidAnyChange((newValue) => {
        this.emit('store-changed', name, newValue)
      })
      acc[name] = store
      return acc
    }, {} as StoreInstances)
  }

  get<T extends StoreName>(name: T): ValueSchemas[T] {
    return this.stores[name].store
  }

  set<T extends StoreName>(name: T, value: ValueSchemas[T], source: 'renderer' | 'main' = 'main'): void {
    this.stores[name].set(value)
    // 只有主进程发起的更新才通知渲染进程
    if (source === 'main') {
      this.emit('store-changed', name, value)
    }
  }

  onStoreChange(callback: StoreChangeCallback): void {
    this.on('store-changed', callback)
  }

  // 提供给IPC调用的set方法
  ipcSet<T extends StoreName>(name: T, value: ValueSchemas[T]): void {
    this.set(name, value, 'renderer')
  }
}

export const storeManager = new StoreManager()
