<script setup>
  import { watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import { useRouter } from 'vue-router'

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
        router.push({ name: 'profile', params: { address: connectedAddress.value } })
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div>
    <template v-if="address">
      Profile page for {{ address }}
    </template>
    <template v-else>
      No wallet connected.
    </template>
  </div>
</template>

<style scoped>
</style>