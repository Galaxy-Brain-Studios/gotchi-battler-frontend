<script setup>
  defineProps({
    size: {
      type: Number,
      default: 2
    }
  })
</script>

<template>
  <div
    class="battle-vs"
    :style="{
      '--battle-vs-size': `${size}rem`
    }"
  >
    vs.
  </div>
</template>

<style scoped>
  .battle-vs {
    position: relative;
    z-index: 0;
    width: var(--battle-vs-size);
    height: var(--battle-vs-size);
    display: grid;
    place-content: center;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .battle-vs::before {
    content: '';
    z-index: -1;
    display: block;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    transform: rotate(135deg);
    border: 2px solid var(--c-light-yellow);
    background: var(--c-medium-yellow);
  }
</style>