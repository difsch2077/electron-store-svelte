import { Writable, writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, ValueSchemas } from '../../common/stores'

function createStore<T extends StoreName>(name: T): Writable<ValueSchemas[T]> {
  let currentValue = getDefaultValues(name)
  const { subscribe, set: internalSet } = writable<ValueSchemas[T]>(currentValue)

  // 初始化加载
  window.electronStores.get(name).then((value) => {
    currentValue = value
    internalSet(value)
  })

  // 监听主进程的store变更
  const unsubscribeStoreChange = window.electronStores.onStoreChange((changedName, newValue) => {
    if (changedName === name) {
      currentValue = newValue as ValueSchemas[T]
      internalSet(newValue as ValueSchemas[T])
    }
  })

  const store = {
    subscribe,
    set: (value: ValueSchemas[T]) => {
      currentValue = value
      internalSet(value) // 先本地更新
      return window.electronStores.set(name, value) // 异步更新主进程
    },
    update: (updater: (value: ValueSchemas[T]) => ValueSchemas[T]) => {
      const newValue = updater(currentValue)
      currentValue = newValue
      internalSet(newValue) // 先本地更新
      return window.electronStores.set(name, newValue) // 异步更新主进程
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
export const timeStore = createStore('time')
