<script setup>
  import { watch } from 'vue'
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
    }
  })

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
</script>

<template>
  <SiteRequireSignIn>
    <template #signin-message>
      to view your item inventory
    </template>  
    <SourceItemsCommon
      :items="inventory"
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
