<script setup>
  import { computed, watch } from 'vue'

  const emit = defineEmits(['update:itemQuantitiesById'])

  const props = defineProps({
    items: {
      type: Array,
      default: null
    },
    fetchStatus: {
      type: Object,
      required: true
    },
    itemIdsInTeam: {
      type: Array,
      default: null
    }
  })

  const itemQuantitiesById = computed(() => {
    if (!props.items) {
      return null
    }
    const result = {}
    if (props.items?.length) {
      for (const item of props.items) {
        if (!result[item.id]) {
          result[item.id] = 0
        }
        result[item.id] += (item.quantity || 0)
      }
    }
    return result
  })

  watch(
    () => itemQuantitiesById.value,
    () => {
      emit('update:itemQuantitiesById', itemQuantitiesById.value)
    },
    { immediate: true }
  )

  const itemQuantitiesInTeamById = computed(() => {
    const result = {}
    if (props.itemIdsInTeam?.length) {
      for (const itemId of props.itemIdsInTeam) {
        if (!result[itemId]) {
          result[itemId] = 0
        }
        result[itemId]++
      }
    }
    return result
  })

  const itemsToDisplay = computed(() => {
    if (!props.items) { return null }
    return props.items.map(item => ({
      ...item,
      availableQuantity: (item.quantity || 0) - (itemQuantitiesInTeamById.value[item.id] || 0)
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
      ></slot>
    </template>
  </div>
</template>