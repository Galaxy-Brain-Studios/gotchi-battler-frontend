<script setup>
  import { watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import ItemList from '../item/ItemList.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const router = useRouter()

  const { isConnectedProfile, isConnectedSignedInProfile, fetchMyFullProfile, inventory, fetchInventoryStatus } = useProfile(props.address)

  watch(
    () => isConnectedProfile.value,
    () => {
      if (!isConnectedProfile.value) {
        // Cannot view other people's inventory, redirect to their profile home
        router.push({ name: 'profile-address', params: { address: props.address } })
      }
    },
    { immediate: true }
  )

  watch(
    () => isConnectedSignedInProfile.value,
    () => {
      if (isConnectedSignedInProfile.value && !fetchInventoryStatus.loaded && !fetchInventoryStatus.loading) {
        fetchMyFullProfile()
      }
    },
    { immediate: true }
  )

</script>

<template>
  <SiteRequireSignIn v-if="isConnectedProfile">
    <template #signin-message>
      to view your inventory
    </template>

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
  </SiteRequireSignIn>
</template>

<style scoped>
</style>