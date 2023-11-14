<script setup>
  defineProps({
    bracket: {
      type: Object,
      required: true
    }
  })
</script>

<template>
  <div
    class="bracket-status-badge"
    :class="{
      [`bracket-status-badge--${bracket.status}`]: bracket.status
    }"
  >
    {{ bracket.statusBadge }}
  </div>
</template>

<style scoped>
  .bracket-status-badge {
    --bracket-status-badge-color-background: var(--c-white);
    padding: 0.25rem 0.5rem;
    background-color: var(--bracket-status-badge-color-background);
    color: var(--c-black);
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .bracket-status-badge--upcoming {
    --bracket-status-badge-color-background: var(--c-light-purple);
  }
  .bracket-status-badge--completed {
    --bracket-status-badge-color-background: var(--c-bright-yellow);
  }
  .bracket-status-badge--started {
    --bracket-status-badge-color-background: #79CA1A;
  }
</style>