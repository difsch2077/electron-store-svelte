import { Writable, writable } from 'svelte/store'
import { storageDefaultValues } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

function createStore<T extends StorageName>(name: T): Writable<StorageSchemas[T]> {
  let currentValue = storageDefaultValues(name)
  const { subscribe, set: internalSet } = writable<StorageSchemas[T]>(currentValue)

  window.electronStores.get(name).then((value) => {
    currentValue = value
    internalSet(value)
  })

  const unsubscribeStoreChange = window.electronStores.onStoreChange(
    (changedName, newValue, source) => {
      if (changedName === name && source !== 'store') {
        currentValue = newValue as StorageSchemas[T]
        internalSet(newValue as StorageSchemas[T])
      }
    }
  )

  const store = {
    subscribe,
    set: (value: StorageSchemas[T]) => {
      currentValue = value
      internalSet(value)
      window.electronStores.set(name, value, 'store')
    },
    update: (updater: (value: StorageSchemas[T]) => StorageSchemas[T]) => {
      const newValue = updater(currentValue)
      currentValue = newValue
      internalSet(newValue)
      window.electronStores.set(name, newValue, 'store')
    }
  }

  // Add cleanup on last unsubscriber
  const originalSubscribe = store.subscribe
  store.subscribe = (run, invalidate) => {
    const unsubscribe = originalSubscribe(run, invalidate)
    return () => {
      unsubscribe()
      unsubscribeStoreChange()
    }
  }

  return store as Writable<StorageSchemas[typeof name]>
}

export const uiStore = createStore('ui')
export const timeStore = createStore('time')
