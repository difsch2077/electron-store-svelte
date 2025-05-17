// 核心定义 ========================
const DEFAULT_VALUES = {
  ui: {
    theme: 'light' as 'light' | 'dark',
    fontSize: 14
  }
} as const

export type StoreName = keyof typeof DEFAULT_VALUES
export const STORE_NAMES = Object.keys(DEFAULT_VALUES) as StoreName[]

export type ValueSchemas = {
  [K in StoreName]: (typeof DEFAULT_VALUES)[K]
}

// 工具函数 ========================
export function getDefaultValues<T extends StoreName>(storeName: T): ValueSchemas[T] {
  return JSON.parse(JSON.stringify(DEFAULT_VALUES[storeName]))
}
