<script setup>
  import GotchiItemBadge from './GotchiItemBadge.vue'
  import GotchiItemBadgeEmpty from './GotchiItemBadgeEmpty.vue'

  defineProps({
    itemId: {
      type: Number,
      default: null
    }
  })
</script>

<template>
  <div class="gotchi-item-badge">
    <GotchiItemBadge
      v-if="itemId"
      :id="itemId"
    />
    <GotchiItemBadgeEmpty v-else />
  </div>
</template>

<style scoped>
  .gotchi-item-badge {
    height: 1.5rem;
    display: flex;
  }
  .gotchi-item-badge > * {
    flex: 1 1 auto;
  }
</style>
