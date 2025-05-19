<script lang="ts">
  import { uiStore, timeStore } from './lib/stores'

  function toggleTheme(): void {
    uiStore.update((config) => ({
      ...config,
      theme: config.theme === 'light' ? 'dark' : 'light'
    }))
  }

  function incrementTimeValue2(): void {
    timeStore.update((time) => ({
      ...time,
      time_value2: time.time_value2 + 1
    }))
  }
</script>

<div style="font-size: 48px;">Use Store</div>

<button on:click={toggleTheme}>
  Current Theme: {$uiStore.theme}
</button>

<div>
  <h2>Time Values</h2>
  <p>Time Value 1 (from main): {$timeStore.time_value1}</p>
  <p>Time Value 2 (from renderer): {$timeStore.time_value2}</p>
  <button on:click={incrementTimeValue2}>Increment Time Value 2</button>
</div>
