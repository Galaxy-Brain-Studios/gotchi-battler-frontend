<script setup>
  defineProps({
    numButtons: {
      type: Number,
      default: 2
    }
  })
</script>
<template>
  <div
    class="site-button-group"
    :style="{
      '--site-button-group-count': numButtons
    }"
  >
    <slot />
  </div>
</template>
<style>
  .site-button-group {
    position: relative;
    --button-corner-size: 0.5rem;
    --button-color-border: #49DBFB;
    --button-color-background: #004E79;
    --site-button-group-count: 2;
    display: grid;
    grid-template-columns: repeat(var(--site-button-group-count), minmax(auto, 1fr));
  }
  .site-button-group::before {
    content: '';
    position: absolute;
    top: 0;
    right: var(--button-corner-size);
    bottom: 0;
    left: var(--button-corner-size);
    box-shadow: 0 0 0 2px var(--button-color-border);
    background: var(--button-color-background);
  }
</style>