<script setup>
  import { computed, watch } from 'vue'
  import useShop from '../../data/useShop'
  import useProfile from '@/data/useProfile'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import SourceItemsCommon from './SourceItemsCommon.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    },
    itemIdsInTeam: {
      type: Array,
      default: null
    },
    additionalItems: {
      type: Array,
      default: null
    }
  })

  const { items, fetchItemsStatus } = useShop()
  const { isConnectedSignedInProfile, fetchInventory, inventory, fetchInventoryStatus } = useProfile(props.address)

  watch(
    () => isConnectedSignedInProfile.value,
    () => {
      if (isConnectedSignedInProfile.value && !fetchInventoryStatus.value.loaded && !fetchInventoryStatus.value.loading) {
        fetchInventory()
      }
    },
    { immediate: true }
  )

  const itemsToMerge = computed(() => {
    if (!props.additionalItems?.length) { return null }
    // there are some additional items, but we need to have the full item objects from the shop
    // If there's an error fetching the shop items, this fails silently and we don't merge the additional items,
    // so the user can still access their inventory. (The error would be displayed elsewhere e.g. item slots)
    if (!fetchItemsStatus.value?.loaded || !items.value) { return null }
    const result = []
    for (const { id, quantity } of props.additionalItems) {
      const item = items.value.find(i => i.id === id)
      if (!item) {
        console.error('cannot find item details in shop', id)
      } else {
        result.push({
          ...item,
          quantity
        })
      }
    }
    return result
  })

  const allItems = computed(() => {
    if (!fetchInventoryStatus.value.loaded) { return null }
    if (!itemsToMerge.value?.length) { return inventory.value }
    const result = inventory.value?.map(item => ({ ...item })) || [] // make a copy of items as we may change quantity
    for (const item of itemsToMerge.value) {
      const matchingItem = result.find(i => i.id === item.id)
      if (matchingItem) {
        matchingItem.quantity += item.quantity
      } else {
        result.push(item)
      }
    }
    return result
  })
</script>

<template>
  <SiteRequireSignIn>
    <template #signin-message>
      to view your item inventory
    </template>  
    <SourceItemsCommon
      :items="allItems"
      :fetchStatus="fetchInventoryStatus"
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
  </SiteRequireSignIn>
</template>
