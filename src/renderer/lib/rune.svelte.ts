import { onDestroy } from 'svelte'
import { storageDefaultValues } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

export function createRune<T extends StorageName>(name: T) {
  let currentValue = $state(storageDefaultValues(name))

  const unsubscribeStoreChange = window.electronStores.onStoreChange(
    (changedName, newValue, source) => {
      if (changedName === name && source !== 'rune') {
        currentValue = newValue as StorageSchemas[T]
        isAfterMainChange = true
      }
    }
  )

  let isAfterMainChange = false
  let cleanRoot = () => {}
  window.electronStores.get(name).then((value) => {
    currentValue = value
    let isFirstTime = true // necessary

    cleanRoot = $effect.root(() => {
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
    })
  })

  function cleanup() {
    cleanRoot()
    unsubscribeStoreChange()
  }

  try {
    onDestroy(() => {
      cleanup()
    })
  } catch {}

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
    },
    cleanup
  }
}

export const uiStore = createRune('ui')
export const timeStore = createRune('time')
