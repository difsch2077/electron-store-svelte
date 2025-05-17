import { writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, StoreSchemas, StoreValue } from '../../common/stores'


// 创建强类型 Store 代理
function createStore(name: StoreName): {
  subscribe: (run: (value: StoreValue) => void) => () => void
  set: (key: keyof StoreName, value: StoreValue) => Promise<void>
} {
  const { subscribe, set } = writable<StoreValue>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

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
