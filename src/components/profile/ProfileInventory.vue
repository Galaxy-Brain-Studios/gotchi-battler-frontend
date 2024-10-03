<script setup>
  import useProfile from '@/data/useProfile'
  import ItemList from '../item/ItemList.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const { fetchInventory, inventory, fetchInventoryStatus } = useProfile(props.address)
  fetchInventory()
</script>

<template>
  <div>
    <div
      v-if="fetchInventoryStatus.loading"
      class="profile-inventory__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchInventoryStatus.error"
      class="profile-inventory__error"
    >
      {{ fetchInventoryStatus.errorMessage }}
    </div>
    <ItemList
      v-else-if="fetchInventoryStatus.loaded"
      :items="inventory"
      showCount
    />
  </div>
</template>

<style scoped>
</style>