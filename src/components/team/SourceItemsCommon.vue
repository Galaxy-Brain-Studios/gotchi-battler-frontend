<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    items: {
      type: Array,
      default: null
    },
    fetchStatus: {
      type: Object,
      required: true
    }
  })

  const itemsToDisplay = computed(() => {
    if (!props.items) { return null }
    return props.items.map(g => ({
      ...g,
      isItem: true
      // TODO anything to annotate?
    }))
  })
</script>

<template>
  <div
    v-if="fetchStatus.loading || fetchStatus.error || fetchStatus.loaded"
    class="create-team-source__items-available word-break"
  >
    <div v-if="fetchStatus.loading">
      Loading...
    </div>
    <div v-else-if="fetchStatus.error">
      {{ fetchStatus.errorMessage }}
    </div>
    <template v-else-if="fetchStatus.loaded">
      <div v-if="!itemsToDisplay?.length">
        No items available.
      </div>
      <slot
        name="items"
        :itemsToDisplay="itemsToDisplay"
      >Display {{ itemsToDisplay.length }} items</slot>
    </template>
  </div>
</template>