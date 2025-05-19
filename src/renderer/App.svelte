<script lang="ts">
  import UseStore from './UseStore.svelte'
  import UseRune from './UseRune.svelte'

  let showRune = true
  let showStore = true
</script>

<button onclick={() => (showRune = !showRune)}>Show Rune</button>
<button onclick={() => (showStore = !showStore)}>Show Store</button>
{#if showRune}
  <UseRune />
{/if}
{#if showStore}
  <UseStore />
{/if}
