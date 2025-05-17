import { writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, StoreSchemas, StoreValue } from '../../common/stores'

declare global {
  interface Window {
    electronStores: {
      get: (name: StoreName) => Promise<StoreSchemas[StoreName]>
      set: (name: StoreName, key: string, value: unknown) => Promise<void>
      onUpdate: (
        callback: (update: { name: StoreName; value: StoreSchemas[StoreName] }) => void
      ) => void
    }
  }
}

// 创建强类型 Store 代理
function createStore(name: StoreName): {
  subscribe: (run: (value: StoreValue) => void) => () => void
  set: (key: keyof StoreName, value: StoreValue) => Promise<void>
} {
  const { subscribe, set } = writable<StoreValue>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

  // 监听主进程更新
  window.electronStores.onUpdate((update) => {
    if (update.name === name) set(update.value)
  })

  return {
    subscribe,
    set: (key: keyof StoreSchemas[StoreName], value: StoreValue[keyof StoreSchemas[StoreName]]) => {
      return window.electronStores.set(name, key, value)
    }
  }
}

// 导出具体 Store
export const configStore = createStore('config')
export const userStore = createStore('user')
