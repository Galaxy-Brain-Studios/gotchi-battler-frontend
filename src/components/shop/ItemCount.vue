<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import ItemCountSignIn from './ItemCountSignIn.vue'
  import ItemCountForUser from './ItemCountForUser.vue'

  // If the user is not connected, there will be a Connect button elsewhere in the dialog
  // If the user is connected but not signed in, show a button for them to sign in
  // If the user is connected and signed in, we can fetch and display their item count
  // Set the blockNumber to ensure we fetch a recent-enough item count (e.g. after a purchase)

  const props = defineProps({
    itemId: {
      type: [String, Number],
      required: true
    },
    blockNumber: {
      type: Number,
      default: null
    }
  })

  const store = useAccountStore()
  const { address: connectedAddress, signedSession } = storeToRefs(store)

  // Item counts are protected behind session sign-in
  const canFetchItemCountForUser = computed(() => !!(connectedAddress.value && signedSession.value))
  // Ensure there is a new instance of the count component if the address or item changes
  const itemCountForUserKey = computed(() => `${connectedAddress.value}__${props.itemId}`)
</script>

<template>
  <div>
    <ItemCountForUser
      v-if="canFetchItemCountForUser"
      :key="itemCountForUserKey"
      :itemId="itemId"
      :blockNumber="blockNumber"
    />
    <ItemCountSignIn v-else-if="connectedAddress && !signedSession" />
  </div>
</template>

<style scoped>
</style>
