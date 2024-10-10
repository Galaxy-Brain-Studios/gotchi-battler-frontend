<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import { RouterLink } from 'vue-router'
  import SiteButton from '../common/SiteButton.vue'
  import SiteEthAddress from '../common/SiteEthAddress.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SitePopupDropdown from '../common/SitePopupDropdown.vue'
  import SiteLinksMenuWhite from '../common/SiteLinksMenuWhite.vue'
  import SiteConnectWalletAvatar from './SiteConnectWalletAvatar.vue'

  const store = useAccountStore()
  const { isConnected, address, connectStatus } = storeToRefs(store)
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
    <SitePopupDropdown :distance="16">
      <SiteButton
        icon="wallet"
        active
      >
        <template #icon>
          <SiteConnectWalletAvatar
            :key="address"
            class="connect-wallet__icon"
            :address="address"
          />
        </template>
        <SiteEthAddress
          class="connect-wallet__address"
          :address="address"
        />
        <SiteIcon
          name="chevron-down"
          :width="0.625"
        />
      </SiteButton>
      <template #popper="{ hide }">
        <SiteLinksMenuWhite
          #default="{ linkClasses, buttonClasses }"
        >
          <li>
            <RouterLink
              :to="{ name: 'profile-address', params: { address } }"
              :class="linkClasses"
              @click="hide"
            >
              My Profile
            </RouterLink>
          </li>
          <li>
            <RouterLink
              :to="{ name: 'settings' }"
              :class="linkClasses"
              @click="hide"
            >
              Settings
            </RouterLink>
          </li>
          <li>
            <button
              type="button"
              :class="buttonClasses"
              @click="store.disconnect"
            >
              Disconnect
            </button>
          </li>
        </SiteLinksMenuWhite>
      </template>
    </SitePopupDropdown>
  </template>
</template>

<style scoped>
  .connect-wallet__icon {
    flex: none;
  }
</style>