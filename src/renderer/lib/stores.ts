import { Writable, writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, StoreSchemas } from '../../common/stores'

function createStore(name: StoreName): Writable<StoreSchemas[typeof name]> {
  const { subscribe, set } = writable<StoreSchemas[typeof name]>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

  // 监听主进程的store变更
  const unsubscribeStoreChange = window.electronStores.onStoreChange((changedName, newValue) => {
    if (changedName === name) {
      set(newValue)
    }
  })

  const store = {
    subscribe,
    set: (value: StoreSchemas[StoreName]) => {
      return window.electronStores.set(name, value)
    },
    update: (updater: (value: StoreSchemas[typeof name]) => StoreSchemas[typeof name]) => {
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

  return store as Writable<StoreSchemas[typeof name]>
}

// 导出具体 Store
export const configStore = createStore('config') as Writable<{ theme: 'light' | 'dark'; fontSize: number }>
export const userStore = createStore('user') as Writable<{ id: string; name: string }>
