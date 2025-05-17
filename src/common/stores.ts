// 核心定义 ========================
const DEFAULT_VALUES = {
  config: {
    theme: 'light' as 'light' | 'dark',
    fontSize: 14
  },
  user: {
    id: '',
    name: 'Guest'
  },
  logs: [] as string[]
} as const

// 自动推导类型 ====================
export type StoreName = keyof typeof DEFAULT_VALUES
export type StoreValue = StoreSchemas[StoreName]

export const STORE_NAMES = Object.keys(DEFAULT_VALUES) as StoreName[]

export type StoreSchemas = {
  [K in StoreName]: (typeof DEFAULT_VALUES)[K]
}

// 工具函数 ========================
export function getDefaultValues(storeName: StoreName): StoreValue {
  return JSON.parse(JSON.stringify(DEFAULT_VALUES[storeName]))
}
