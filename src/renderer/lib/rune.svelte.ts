import { storageDefaultValues } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

function createStore<T extends StorageName>(name: T) {
  // 使用$state管理核心状态

  let currentValue = $state(storageDefaultValues(name))

  let isAfterMainChange = false
  window.electronStores.get(name).then((value) => {
    currentValue = value
    let isFirstTime = true // necessary

    $effect.root(() => {
      $effect(() => {
        // $state.snapshot or JSON.stringify should at the top of $effect!
        // $state.snapshot or JSON.stringify is necessary to trigger $effect
        const value = $state.snapshot(currentValue)
        if (!isFirstTime && !isAfterMainChange) {
          window.electronStores.set(name, value as StorageSchemas[T], 'rune')
        }
        isAfterMainChange = false
        isFirstTime = false
      })

      return () => {}
    })
  })

  const unsubscribeStoreChange = window.electronStores.onStoreChange(
    (changedName, newValue, source) => {
      if (changedName === name && source !== 'rune') {
        currentValue = newValue as StorageSchemas[T]
        isAfterMainChange = true
      }
    }
  )

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
