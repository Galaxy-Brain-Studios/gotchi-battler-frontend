<script setup>
  import { ref, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import DEFAULT_IMAGE_URL from './defaultProfileImage.png'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteButton from '../common/SiteButton.vue'
  import ProfileImageEditDialog from './ProfileImageEditDialog.vue'

  defineEmits(['saved'])

  const store = useAccountStore()
  const { isConnected, address: connectedAddress } = storeToRefs(store)

  const props = defineProps({
    address: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: null
    }
  })

  const isConnectedProfile = computed(() => props.address && isConnected.value && connectedAddress.value && connectedAddress.value.toLowerCase() === props.address.toLowerCase())

  const isDialogOpen = ref(false)

  const escapeUrl = url => CSS.escape(url)
</script>

<template>
  <div
    class="profile-image"
    :style="{
      '--image-url': `url(${escapeUrl(imageUrl || DEFAULT_IMAGE_URL)})`
    }"
  >
    <SiteButton
      v-if="isConnectedProfile"
      class="profile-image__edit-button"
      small
      @click="isDialogOpen = true"
    >
      <span class="sr-only">Edit Profile Image</span>
      <SiteIcon
        name="add-image"
        :width="1.125"
        :height="1.125"
        style="margin-bottom: -3px;"
      />
    </SiteButton>

    <ProfileImageEditDialog
      v-if="isConnectedProfile"
      v-model:isOpen="isDialogOpen"
      :imageUrl="imageUrl"
      @saved="$emit('saved', $event)"
    />
  </div>
</template>

<style scoped>
  .profile-image {
    position: relative;
    background-color: rgba(255, 255, 255, 0.2);
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .profile-image__edit-button {
    position: absolute;
    right: 0.5rem;
    bottom: 0.5rem;
  }
</style>