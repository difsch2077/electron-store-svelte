const STORAGE_DEFAULT_VALUES = {
  ui: {
    theme: 'light' as 'light' | 'dark',
    fontSize: 14
  },
  time: {
    time_value1: 0 as number,
    time_value2: 0 as number
  }
}

export type StorageName = keyof typeof STORAGE_DEFAULT_VALUES
export const STORAGE_NAMES = Object.keys(STORAGE_DEFAULT_VALUES) as StorageName[]

export type StorageSchemas = {
  [K in StorageName]: (typeof STORAGE_DEFAULT_VALUES)[K]
}

export function storageDefaultValues<T extends StorageName>(storeName: T): StorageSchemas[T] {
  return JSON.parse(JSON.stringify(STORAGE_DEFAULT_VALUES[storeName]))
}
