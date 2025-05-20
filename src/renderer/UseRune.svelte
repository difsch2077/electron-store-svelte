<script lang="ts">
  import { uiStore, timeStore } from './lib/storage-rune.svelte'
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  function toggleTheme() {
    uiStore.current.theme = uiStore.current.theme === 'dark' ? 'light' : 'dark'
  }

  function incrementTimeValue2(): void {
    timeStore.current.time_value2 += 1
  }
</script>

<div style="font-size: 48px;">Use Rune</div>
<button on:click={toggleTheme}>
  Current Theme: {uiStore.current.theme}
</button>

<div>
  <h2>Time Values</h2>
  <p>Time Value 1 (from main): {timeStore.current.time_value1}</p>
  <p>
    Time Value 2 (from renderer): {timeStore.current.time_value2}<button
      on:click={incrementTimeValue2}>Increment Time Value 2</button
    >
  </p>
</div>
