import { Writable, writable } from 'svelte/store'
import { storageDefaultValues } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

function createStore<T extends StorageName>(name: T): Writable<StorageSchemas[T]> {
  let currentValue = storageDefaultValues(name)
  const { subscribe, set: internalSet } = writable<StorageSchemas[T]>(currentValue)

  // 初始化加载
  window.electronStores.get(name).then((value) => {
    currentValue = value
    internalSet(value)
  })

  // 监听主进程的store变更
  const unsubscribeStoreChange = window.electronStores.onStoreChange((changedName, newValue) => {
    if (changedName === name) {
      currentValue = newValue as StorageSchemas[T]
      internalSet(newValue as StorageSchemas[T])
    }
  })

  const store = {
    subscribe,
    set: (value: StorageSchemas[T]) => {
      currentValue = value
      internalSet(value) // 先本地更新
      window.electronStores.set(name, value) // 异步更新主进程
    },
    update: (updater: (value: StorageSchemas[T]) => StorageSchemas[T]) => {
      const newValue = updater(currentValue)
      currentValue = newValue
      internalSet(newValue) // 先本地更新
      window.electronStores.set(name, newValue) // 异步更新主进程
    }
  }

  // Add cleanup on last unsubscriber
  let unsubscribers = 0
  const originalSubscribe = store.subscribe
  store.subscribe = (run, invalidate) => {
    unsubscribers++
    const unsubscribe = originalSubscribe(run, invalidate)
    return () => {
      unsubscribers--
      unsubscribe()
      if (unsubscribers === 0) {
        unsubscribeStoreChange()
      }
    }
  }

  return store as Writable<StorageSchemas[typeof name]>
}

export const uiStore = createStore('ui')
export const timeStore = createStore('time')
