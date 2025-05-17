import { Writable, writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, StoreSchemas, StoreValue } from '../../common/stores'

function createStore(name: StoreName): Writable<StoreSchemas[name]> {
  const { subscribe, set } = writable<StoreSchemas[typeof name]>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

  return {
    subscribe,
    set:( value: StoreSchemas[StoreName]) => {
      return window.electronStores.set(name, value)
    },
    update: (partial: Partial<StoreSchemas[typeof name]>) => {
      return window.electronStores.update(name, partial)
    }
  }
}

// 导出具体 Store
export const configStore = createStore('config')
export const userStore = createStore('user')
