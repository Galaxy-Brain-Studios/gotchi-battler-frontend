<script setup>
</script>

<template>
  <div class="gotchi-item-empty">
    No Item
  </div>
</template>

<style scoped>
  .gotchi-item-empty {
    display: grid;
    place-items: center;

    opacity: 0.25;
    background: var(--c-black);
    color: var(--c-white);
    font-size: 0.625rem;
    line-height: 0.75rem;
    text-transform: uppercase;
  }
</style>
