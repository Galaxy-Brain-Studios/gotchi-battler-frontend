<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '@/data/accountStore'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteError from '../common/SiteError.vue'

  const accountStore = useAccountStore()
  const { signingInStatus } = storeToRefs(accountStore)
</script>

<template>
  <div class="site-sign-in">
    <SiteButtonPrimary
      :disabled="signingInStatus.loading"
      @click="accountStore.signIntoSession"
    >
      Sign In
    </SiteButtonPrimary>
    <slot />
    <SiteError v-if="signingInStatus.error">
      {{ signingInStatus.errorMessage }}
    </SiteError>
  </div>
</template>

<style scoped>
  .site-sign-in {
    display: grid;
    place-items: center;
    gap: 1rem;
  }
</style>
