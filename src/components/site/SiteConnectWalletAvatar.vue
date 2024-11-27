<script setup>
  import { onUnmounted } from 'vue'
  import useProfile from '@/data/useProfile'
  import { registerHandler, unregisterHandler } from '@/data/useProfileUpdateNotifications'
  import SiteIcon from '../common/SiteIcon.vue'

  // Assume that the address will not change
  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })
  const { fetchProfile, profile, fetchProfileStatus, setProfile } = useProfile(props.address)

  fetchProfile()

  const handleProfileUpdate = (profile) => {
    if (profile?.address?.toLowerCase() === props.address.toLowerCase()) {
      setProfile(profile)
    }
  }
  registerHandler(handleProfileUpdate)

  onUnmounted(() => {
    unregisterHandler(handleProfileUpdate)
  })

  const escapeUrl = url => CSS.escape(url)
</script>
<template>
  <div
    v-if="fetchProfileStatus.loaded && profile?.avatar"
    class="site-connect-wallet-avatar"
    :style="{
      '--image-url': `url(${escapeUrl(profile.avatar)})`
    }"
  />
  <SiteIcon
    v-else
    name="wallet"
  />
</template>

<style scoped>
  .site-connect-wallet-avatar {
    width: 2.5rem;
    height: 2.5rem;
    margin-top: -0.75rem;
    margin-bottom: -0.75rem;
    background-color: transparent;
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>