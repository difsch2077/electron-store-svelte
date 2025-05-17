import { writable } from 'svelte/store';
import type { StoreName, StoreSchemas } from '../../../common/stores';

// 创建强类型 Store 代理
function createStore<T extends StoreName>(name: T) {
  const { subscribe, set } = writable<StoreSchemas[T]>(getDefaultValues(name));

  // 初始化加载
  window.electronStores.get(name).then(set);

  // 监听主进程更新
  window.electronStores.onUpdate((update) => {
    if (update.name === name) set(update.value);
  });

  return {
    subscribe,
    set: (key: keyof StoreSchemas[T], value: StoreSchemas[T][typeof key]) => {
      return window.electronStores.set(name, key, value);
    }
  };
}

// 导出具体 Store
export const configStore = createStore('config');
export const userStore = createStore('user');