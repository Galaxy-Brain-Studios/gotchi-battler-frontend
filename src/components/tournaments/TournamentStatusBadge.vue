<script setup>
  defineProps({
    status: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <div
    v-if="status"
    class="tournament-status-badge"
    :class="{
      'tournament-status-badge--active': status.startsWith('active'),
      'tournament-status-badge--upcoming': status === 'upcoming',
      'tournament-status-badge--registering': status === 'registering',
      'tournament-status-badge--completed': status === 'completed'
    }"
  >
    {{ status.split('_')[0] }}
  </div>
</template>

<style scoped>
  .tournament-status-badge {
    --tournament-status-badge__color-background: var(--c-white);
    --tournament-status-badge__color-text: var(--c-black);
    display: inline-flex;
    padding: 0.12rem 0.5rem;
    background-color: var(--tournament-status-badge__color-background);
    color: var(--tournament-status-badge__color-text);
    text-transform: uppercase;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0.02625rem;
  }
  .tournament-status-badge--upcoming {
    --tournament-status-badge__color-background: var(--c-bright-yellow);
    --tournament-status-badge__color-text: var(--c-black);
  }
  .tournament-status-badge--registering {
    --tournament-status-badge__color-background: #D9322A;
    --tournament-status-badge__color-text: var(--c-white);
  }
  .tournament-status-badge--active {
    --tournament-status-badge__color-background: #53BC34;
    --tournament-status-badge__color-text: var(--c-white);
  }
  .tournament-status-badge--completed {
    --tournament-status-badge__color-background: #243DAE;
    --tournament-status-badge__color-text: var(--c-white);
  }
</style>