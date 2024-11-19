<script setup>
  import { computed } from 'vue'
  import useShop from '../../data/useShop'
  import SourceItemsCommon from './SourceItemsCommon.vue'

  defineProps({
    itemIdsInTeam: {
      type: Array,
      default: null
    }
  })

  const { items, fetchItemsStatus } = useShop()

  const ITEM_QUANTITY = 10

  const itemsWithQuantity = computed(() => {
    if (!items.value) { return null }
    return items.value.map(item => ({
      ...item,
      quantity: ITEM_QUANTITY
    }))
  })
</script>

<template>
  <SourceItemsCommon
    :items="itemsWithQuantity"
    :fetchStatus="fetchItemsStatus"
    :itemIdsInTeam="itemIdsInTeam"
    @update:itemQuantitiesById="$emit('update:itemQuantitiesById', $event)"
  >
    <template #items="slotProps">
      <slot
        name="items"
        v-bind="slotProps"
      />
    </template>
  </SourceItemsCommon>
</template>