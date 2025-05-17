import { Writable, writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, ValueSchemas } from '../../common/stores'

function createStore<T extends StoreName>(name: T): Writable<ValueSchemas[T]> {
  const { subscribe, set } = writable<ValueSchemas[T]>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

  // 监听主进程的store变更
  const unsubscribeStoreChange = window.electronStores.onStoreChange((changedName, newValue) => {
    if (changedName === name) {
      set(newValue as ValueSchemas[T])
    }
  })

  const store = {
    subscribe,
    set: (value: ValueSchemas[T]) => {
      return window.electronStores.set(name, value)
    },
    update: (updater: (value: ValueSchemas[T]) => ValueSchemas[T]) => {
      return window.electronStores.get(name).then(currentValue => {
        const newValue = updater(currentValue)
        return window.electronStores.set(name, newValue)
      })
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

  return store as Writable<ValueSchemas[typeof name]>
}

export const uiStore = createStore('ui')