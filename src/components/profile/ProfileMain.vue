<script setup>
  import { computed } from 'vue'
  import useProfile from '@/data/useProfile'
  import SiteButtonLink from '../common/SiteButtonLink.vue'

  import ProfileImage from './ProfileImage.vue'
  import ProfileName from './ProfileName.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })

  const { isConnectedProfile, fetchProfile, profile, fetchProfileStatus, setProfile } = useProfile(props.address)
  fetchProfile()

  const setSavedProfile = function (newProfile) {
    // sanity check the provided profile before setting it
    if (newProfile?.address?.toLowerCase() !== props.address.toLowerCase()) {
      console.error('Received unexpected new profile data', newProfile)
      return
    }
    setProfile(newProfile)
  }

  const links = computed(() => {
    const address = props.address.value
    const items = []

    if (isConnectedProfile.value) {
      items.push(
        {
          label: 'Badges / Achievements',
          to: { name: 'profile-badges', params: { address } }
        },
        {
          label: 'Saved Teams',
          to: { name: 'profile-teams', params: { address } }
        },
        {
          label: 'Item Inventory',
          to: { name: 'profile-inventory', params: { address } }
        }
      )

      if (profile.value?.isTournamentAdmin) {
        items.push({
          label: 'My Tournaments',
          to: { name: 'profile-tournaments', params: { address } }
        })
      }
    }

    if (items.length > 1) {
      for (let i = 0; i < items.length; i++) {
        let grouped = 'vertical-middle'
        if (i === 0) {
          grouped = 'vertical-start';
        } else if (i === items.length - 1) {
          grouped = 'vertical-end';
        }
        items[i].grouped = grouped;
      }
    }

    return items;
  })
</script>

<template>
  <div>
    <div
      v-if="fetchProfileStatus.loading"
      class="profile-main__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchProfileStatus.error"
      class="profile-main__error"
    >
      {{ fetchProfileStatus.errorMessage }}
    </div>
    <div
      v-else-if="fetchProfileStatus.loaded"
      class="profile-main__layout"
    >
      <div class="profile-main__details word-break">
        <ProfileImage
          class="profile-main__image"
          :address="profile.address"
          :imageUrl="profile.avatar"
          @saved="setSavedProfile"
        />
        <ProfileName
          :address="profile.address"
          :name="profile.name"
          @saved="setSavedProfile"
        />
        <div class="profile-main__address">
          {{ profile.address }}
        </div>
      </div>
      <div class="profile-main__nav">
        <SiteButtonLink
          v-for="(link, index) in links"
          :key="index"
          :to="link.to"
          :grouped="link.grouped"
        >
          {{ link.label }}
        </SiteButtonLink>
      </div>
      <div class="profile-main__content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped>
  .profile-main__layout {
    display: grid;
    grid-template-areas:
      "details"
      "nav"
      "-"
      "content";
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto 2rem auto;
    column-gap: 2rem;
  }

  .profile-main__details {
    grid-area: details;
  }
  .profile-main__nav {
    grid-area: nav;
  }
  .profile-main__content {
    grid-area: content;
  }

  @media (min-width: 800px) {
    .profile-main__layout {
      grid-template-areas:
        "details nav"
        "content content";
      grid-template-columns: 16.5rem minmax(0, 1fr);
      grid-template-rows: auto auto;
      row-gap: 1.5rem;
    }
  }

  @media (min-width: 1200px) {
    .profile-main__layout {
      grid-template-areas:
        "details content"
        "nav content";
      grid-template-columns: 16.5rem minmax(0, 1fr);
      grid-template-rows: minmax(0, max-content) minmax(0, 1fr);
      row-gap: 0;
    }
  }

  .profile-main__details {
    margin: 0 calc(0.5rem - 2px); /* align width to links menu below */
    border-top-left-radius: 1.5rem;
    border-top-right-radius: 1.5rem;
    padding: 2rem 1rem 1.5rem 1rem;
    background: linear-gradient(180deg, #6027E2 0%, #4C2399 98.33%);

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
  .profile-main__details > div {
    flex: 1 1 auto;
  }
  .profile-main__content {
    border: 2px solid rgba(255, 255, 255, 0.25);
    padding: 1rem 1.5rem;
    background: rgba(var(--c-black-rgb), 0.25);
  }

  .profile-main__image {
    margin-bottom: 1.25rem;
    border-radius: 1rem;
    height: 12.5rem;
    width: 12.5rem;
  }

  .profile-main__address {
    text-align: center;
    opacity: 0.5;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
</style>