import { onDestroy } from 'svelte'
import { storageDefaultValues } from '../../common/storage'
import type { StorageName, StorageSchemas } from '../../common/storage'

export function createRune<T extends StorageName>(name: T) {
  let currentValue = $state(storageDefaultValues(name))

  const unSub = window.electronStores.onStorageChange((changedName, newValue, source) => {
    if (changedName === name && source !== 'rune') {
      currentValue = newValue as StorageSchemas[T]
      isAfterMainChange = true
    }
  })

  let isAfterMainChange = false
  let cleanRoot = () => {}
  let isDestory = false
  window.electronStores.get(name).then((value) => {
    currentValue = value
    let isFirstTime = true // necessary

    cleanRoot = $effect.root(() => {
      $effect(() => {
        // $state.snapshot or JSON.stringify should at the top of $effect!
        // $state.snapshot or JSON.stringify is necessary to trigger $effect
        const value = $state.snapshot(currentValue)
        if (!isFirstTime && !isAfterMainChange && !isDestory) {
          window.electronStores.set(name, value as StorageSchemas[T], 'rune')
        }
        isAfterMainChange = false
        isFirstTime = false
      })
    })
  })

  function cleanup() {
    isDestory = true
    unSub()
    cleanRoot()
  }

  try {
    onDestroy(() => {
      cleanup()
    })
  } catch {}

  return {
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
