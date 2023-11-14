<script setup>
  import { DEV_MODE } from '../../appEnv'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonBox from '../common/SiteButtonBox.vue'
  import SiteEthAddress from '../common/SiteEthAddress.vue'

  const store = useAccountStore()
  const { isConnected, address, connectStatus } = storeToRefs(store)

  // In dev mode, it's handy to be able to disconnect quickly for testing by clicking the button.
  // In production, people probably wouldn't want that to happen.
</script>
<template>
  <SiteButton
    v-if="connectStatus.loading"
    icon="wallet"
  >
    Connecting...
  </SiteButton>
  <SiteButton 
    v-else-if="!isConnected"
    icon="wallet"
    @click="store.connect"
  >
    Connect Wallet
  </SiteButton>
  <template v-else>
    <SiteButton
      v-if="DEV_MODE"
      icon="wallet"
      active
      @click="store.disconnect"
    >
      <SiteEthAddress
        class="connect-wallet__address"
        :address="address"
      />
    </SiteButton>
    <SiteButtonBox
      v-else
      icon="wallet"
      active
    >
      <SiteEthAddress
        class="connect-wallet__address"
        :address="address"
      />
    </SiteButtonBox>
  </template>
</template>

<style>
</style>