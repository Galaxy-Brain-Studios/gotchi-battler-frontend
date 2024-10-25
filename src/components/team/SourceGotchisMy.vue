<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteConnectWallet from '../site/SiteConnectWallet.vue'
  import SourceGotchisCommon from './SourceGotchisCommon.vue'

  const store = useAccountStore()
  const { address, myGotchis, myGotchisFetchStatus } = storeToRefs(store)
</script>

<template>
  <div
    v-if="!address"
    class="create-team__gotchis-connect-wallet"
  >
    <SiteConnectWallet />
  </div>
  <SourceGotchisCommon
    v-else
    :gotchis="myGotchis"
    :fetchStatus="myGotchisFetchStatus"
  >
    <template #gotchis="slotProps">
      <slot
        name="gotchis"
        v-bind="slotProps"
      />
    </template>
  </SourceGotchisCommon>
</template>