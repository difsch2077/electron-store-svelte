<script lang="ts">
  import { configStore } from './lib/stores'

  // 直接使用 $ 语法自动订阅
  function toggleTheme(): void {
    configStore.update((config) => ({
      ...config,
      theme: config.theme === 'light' ? 'dark' : 'light'
    }))
  }
</script>

<button on:click={toggleTheme}>
  当前主题: {$configStore.theme}
</button>
