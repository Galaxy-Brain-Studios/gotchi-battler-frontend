<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '@/data/accountStore'
  import SiteConnectWallet from '../site/SiteConnectWallet.vue'
  import SourceItemsMyInventory from './SourceItemsMyInventory.vue'

  defineProps({
    itemIdsInTeam: {
      type: Array,
      default: null
    },
    additionalItems: {
      type: Array,
      default: null
    }
  })

  const store = useAccountStore()
  const { address } = storeToRefs(store)
</script>

<template>
  <div
    v-if="!address"
    class="create-team-source__connect-wallet"
  >
    <SiteConnectWallet />
  </div>
  <SourceItemsMyInventory
    v-else
    :address="address"
    :itemIdsInTeam="itemIdsInTeam"
    :additionalItems="additionalItems"
  >
    <template #items="slotProps">
      <slot
        name="items"
        v-bind="slotProps"
      />
    </template>
  </SourceItemsMyInventory>
</template>
