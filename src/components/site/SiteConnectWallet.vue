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
  import SiteSignIn from './SiteSignIn.vue'

  const store = useAccountStore()
  const { isConnected, address, connectStatus, signedSession } = storeToRefs(store)
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
        <div class="connect-wallet__labels">
          <SiteEthAddress
            class="connect-wallet__address"
            :address="address"
          />
          <div class="connect-wallet__sign-in-status">
            {{ signedSession ? 'Signed-in' : 'Not signed-in' }}
          </div>
        </div>
        <SiteIcon
          name="chevron-down"
          :width="0.625"
          class="connect-wallet__open-menu"
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
        <div
          v-if="!signedSession"
          class="connect-wallet__status-info"
        >
          You've connected your wallet, but are not securely signed-in.
          <div style="margin-top: 0.7rem">
            <SiteSignIn small />
          </div>
        </div>
      </template>
    </SitePopupDropdown>
  </template>
</template>

<style scoped>
  .connect-wallet__icon {
    flex: none;
    margin-left: 0.5rem;
  }
  .connect-wallet__status-info {
    max-width: 300px;
    padding: 0.25rem 0.75rem 1rem 0.75rem;
    background: var(--c-black);
    color: var(--c-white);
    font-size: 0.9rem;
    line-height: 1.5rem;
  }

  .connect-wallet__labels {
    /* avoid growing the button height too much */
    margin-top: -0.25rem;
    margin-bottom: -0.25rem;
    margin-left: 0.1rem;
    text-align: left;
  }
  .connect-wallet__sign-in-status {
    font-size: 0.8rem;
    line-height: 1.25rem;
    opacity: 0.7;
    text-transform: none;
  }

  .connect-wallet__open-menu {
    margin-right: 0.5rem;
  }
</style>