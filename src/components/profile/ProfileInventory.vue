<script setup>
  import { watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import ProfileSignIn from './ProfileSignIn.vue'
  import ItemList from '../item/ItemList.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const router = useRouter()

  const { isConnectedProfile, isConnectedSignedInProfile, fetchInventory, inventory, fetchInventoryStatus } = useProfile(props.address)

  watch(
    () => isConnectedProfile.value,
    () => {
      if (!isConnectedProfile.value) {
        router.push({ name: 'profile-address', params: { address: props.address } })
      }
    },
    { immediate: true }
  )

  watch(
    () => isConnectedSignedInProfile.value,
    () => {
      if (isConnectedSignedInProfile.value && !fetchInventoryStatus.loaded && !fetchInventoryStatus.loading) {
        fetchInventory()
      }
    },
    { immediate: true }
  )

</script>

<template>
  <div>
    <ProfileSignIn
      v-if="!isConnectedSignedInProfile"
    >
      to view your inventory
    </ProfileSignIn>
    <template v-else>
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
    </template>
  </div>
</template>

<style scoped>
</style>