<script setup>
  import { computed } from 'vue'
  import useShop from '../../data/useShop'
  import SourceItemsCommon from './SourceItemsCommon.vue'

  const { items, fetchItemsStatus } = useShop()

  const itemsWithQuantity = computed(() => {
    if (!items.value) { return null }
    return items.value.map(item => ({
      ...item,
      quantity: 10
    }))
  })
</script>

<template>
  <SourceItemsCommon
    :items="itemsWithQuantity"
    :fetchStatus="fetchItemsStatus"
  >
    <template #items="slotProps">
      <slot
        name="items"
        v-bind="slotProps"
      />
    </template>
  </SourceItemsCommon>
</template>