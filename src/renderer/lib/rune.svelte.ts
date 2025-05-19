import { storageDefaultValues } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

function createStore<T extends StorageName>(name: T) {
  // 使用$state管理核心状态

  let currentValue = $state(storageDefaultValues(name))

  let isInited = false
  let isAfterMainChange = false
  let isFirstTime = true
  window.electronStores.get(name).then((value) => {
    currentValue = value
    isInited = true
    isFirstTime = true // necessary
  })

  window.electronStores.onStoreChange((changedName, newValue, source) => {
    if (changedName === name && source !== 'rune') {
      currentValue = newValue as StorageSchemas[T]
      isAfterMainChange = true
    }
  })

  $effect.root(() => {
    $effect(() => {
      // $state.snapshot or JSON.stringify should at the top of $effect!
      // $state.snapshot or JSON.stringify is necessary to trigger $effect
      const value = $state.snapshot(currentValue)
      if (isInited && !isFirstTime && !isAfterMainChange) {
        window.electronStores.set(name, value as StorageSchemas[T], 'rune')
      }
      isAfterMainChange = false
      isFirstTime = false
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

export const uiStore = createStore('ui')
export const timeStore = createStore('time')
