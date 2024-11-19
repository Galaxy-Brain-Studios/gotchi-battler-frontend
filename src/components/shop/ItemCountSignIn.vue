<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '@/data/accountStore'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
  import SiteError from '../common/SiteError.vue'

  const accountStore = useAccountStore()
  const { signingInStatus } = storeToRefs(accountStore)
</script>

<template>
  <div class="item-count-sign-in">
    <div class="item-count-sign-in__layout">
      <SiteButtonSmall
        :disabled="signingInStatus.loading"
        class="item-count-sign-in__button"
        @click="accountStore.signIntoSession"
      >
        Sign In
      </SiteButtonSmall>
      <div>
        to see how many you own
      </div>
    </div>
    <SiteError
      v-if="signingInStatus.error"
      small
      class="item-count-sign-in__error"
    >
      {{ signingInStatus.errorMessage }}
    </SiteError>
  </div>
</template>

<style scoped>
  .item-count-sign-in__layout {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .item-count-sign-in__button {
    flex: none
  }

  .item-count-sign-in__error {
    margin-top: 1rem;
  }
</style>