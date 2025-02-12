<script setup>
  import { computed } from 'vue'
  import SiteEthAddress from '../common/SiteEthAddress.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    },
    user: {
      type: Object,
      default: null
    }
  })

  const displayName = computed(() => props.user?.name?.trim() || null)
  const escapeUrl = url => CSS.escape(url)
</script>
<template>
  <RouterLink
    :to="{ name: 'profile-badges', params: { address } }"
    class="link-reset link-reset--hover-underline"
  >
    <div
      v-if="displayName"
      class="user-identity__user word-break"
    >
      <div
        v-if="user.avatar"
        class="user-identity__avatar"
        :style="{
          '--image-url': `url(${escapeUrl(user.avatar)})`
        }"
      />
      <div class="user-identity__name">
        {{ displayName }}
      </div>
    </div>
    <div
      v-else
      class="user-identity__address"
    >
      <SiteEthAddress
        :address="address"
      />
    </div>
  </RouterLink>
</template>

<style scoped>
  .user-identity__address {
    opacity: 0.5;
    font-family: monospace;
    font-size: 0.95rem;
  }

  .user-identity__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .user-identity__name {
    opacity: 0.5;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .user-identity__avatar {
    width: 1.5rem;
    height: 1.5rem;
    background-color: transparent;
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
</style>
