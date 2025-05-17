<script lang="ts">
  import { uiStore } from './lib/stores'

  // 直接使用 $ 语法自动订阅
  function toggleTheme(): void {
    uiStore.update((config) => ({
      ...config,
      theme: config.theme === 'light' ? 'dark' : 'light'
    }))
  }
</script>

<button on:click={toggleTheme}>
  Current Theme: {$uiStore.theme}
</button>
