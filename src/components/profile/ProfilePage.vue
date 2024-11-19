<script setup>
  import { watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import { useRouter } from 'vue-router'
  import ProfileMain from './ProfileMain.vue'

  const props = defineProps({
    address: {
      type: String,
      default: null
    }
  })

  const store = useAccountStore()
  const { isConnected, address: connectedAddress } = storeToRefs(store)
  const router = useRouter()

  watch(
    () => [props.address, isConnected.value, connectedAddress.value],
    () => {
      if (!props.address && isConnected.value && connectedAddress.value) {
        router.push({ name: 'profile-address', params: { address: connectedAddress.value } })
      }
    },
    { immediate: true }
  )
</script>

<template>
  <ProfileMain
    v-if="address"
    :key="address"
    :address="address"
  />
  <div v-else>
    No wallet connected.
  </div>
</template>

<style scoped>
</style>