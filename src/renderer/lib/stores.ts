import { writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, StoreSchemas, StoreValue } from '../../common/stores'


// 创建强类型 Store 代理
function createStore(name: StoreName): {
  subscribe: (run: (value: StoreValue) => void) => () => void
  set: <K extends keyof StoreSchemas[StoreName]>(key: K, value: StoreSchemas[StoreName][K]) => Promise<void>
} {
  const { subscribe, set } = writable<StoreSchemas[typeof name]>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

  return {
    subscribe,
    set: <K extends keyof StoreSchemas[StoreName]>(key: K, value: StoreSchemas[StoreName][K]) => {
      return window.electronStores.set(name, key, value)
    }
  }
}

// 导出具体 Store
export const configStore = createStore('config') 
export const userStore = createStore('user')
