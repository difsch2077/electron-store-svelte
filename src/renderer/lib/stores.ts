import { Writable, writable } from 'svelte/store'
import { getDefaultValues } from '../../common/stores'
import type { StoreName, StoreSchemas } from '../../common/stores'

function createStore(name: StoreName): Writable<StoreSchemas[typeof name]> {
  const { subscribe, set } = writable<StoreSchemas[typeof name]>(getDefaultValues(name))

  // 初始化加载
  window.electronStores.get(name).then(set)

  return {
    subscribe,
    set: (value: StoreSchemas[StoreName]) => {
      return window.electronStores.set(name, value)
    },
    update: (partial: Partial<StoreSchemas[typeof name]>) => {
      return window.electronStores.update(name, partial)
    }
  } as Writable<StoreSchemas[typeof name]>
}

// 导出具体 Store
export const configStore = createStore('config') as Writable<{ theme: 'light' | 'dark'; fontSize: number }>
export const userStore = createStore('user') as Writable<{ id: string; name: string }>
