import { STORAGE_DEFAULT_VALUES } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

function createStore<T extends StorageName>(name: T, initValue: StorageSchemas[T]) {
  // 使用$state管理核心状态

  let currentValue = $state(initValue)

  let isInit = false
  let isAfterMainChange = false
  window.electronStores.get(name).then((value) => {
    currentValue = value
    isInit = true
  })

  window.electronStores.onStoreChange((changedName, newValue) => {
    if (changedName === name) {
      currentValue = newValue as StorageSchemas[T]
      isAfterMainChange = true
    }
  })

  $effect.root(() => {
    $effect(() => {
      const value = $state.snapshot(currentValue) // $state.snapshot or JSON.stringify is necessary to trigger $effect
      if (isInit && !isAfterMainChange) {
        window.electronStores.set(name, value as StorageSchemas[T])
      }
      isAfterMainChange = false
    })

    return () => {}
  })

  return {
    /**
     * @deprecated Use current to align with Svelte conventions
     */
    get value() {
      return currentValue
    },
    /**
     * @deprecated Use current to align with Svelte conventions
     */
    set value(newValue) {
      currentValue = newValue
    },
    get current() {
      return currentValue
    },
    set current(newValue) {
      currentValue = newValue
    }
  }
}

export const uiStore = createStore('ui', STORAGE_DEFAULT_VALUES.ui)
export const timeStore = createStore('time', STORAGE_DEFAULT_VALUES.time)
