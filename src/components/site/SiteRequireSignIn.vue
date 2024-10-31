<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '@/data/accountStore'
  import SiteSignIn from './SiteSignIn.vue'

  const accountStore = useAccountStore()
  const { signedSession } = storeToRefs(accountStore)
</script>

<template>
  <SiteSignIn v-if="!signedSession">
    <slot name="signin-message"></slot>
  </SiteSignIn>
  <div v-else>
    <slot>
      Signed-in content here
    </slot>
  </div>
</template>

<style scoped>
</style>
