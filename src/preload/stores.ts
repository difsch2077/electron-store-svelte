import { contextBridge, ipcRenderer } from 'electron';
import type { StoreName, StoreSchemas } from '../common/stores';

declare global {
  interface Window {
    electronStores: {
      get<T extends StoreName>(name: T): Promise<StoreSchemas[T]>;
      set<T extends StoreName>(
        name: T,
        key: keyof StoreSchemas[T],
        value: StoreSchemas[T][typeof key]
      ): Promise<void>;
    };
  }
}

contextBridge.exposeInMainWorld('electronStores', {
  get: (name: StoreName) => ipcRenderer.invoke('store-get', name),
  set: (name: StoreName, key: string, value: unknown) => 
    ipcRenderer.invoke('store-set', { name, key, value }),
});
