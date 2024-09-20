<script setup>
  import useProfile from '@/data/useProfile'
  import SiteButtonLink from '../common/SiteButtonLink.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })

  const { fetchProfile, profile, fetchProfileStatus } = useProfile(props.address)
  fetchProfile()
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
      <div class="profile-main__sidebar">
        <div class="profile-main__details word-break">
          <div style="margin-bottom: 1.25rem; height: 12.5rem; width: 12.5rem; border-radius: 1rem; background: rgba(255, 255, 255, 0.2);">
            Image: {{ profile.imageUrl }}
          </div>
          <div>
            Name: {{ profile.name }}
          </div>
          <div>
            Address: {{ profile.address }}
          </div>
        </div>
        <div>
          <SiteButtonLink
            :to="{ name: 'profile-teams', params: { address } }"
            grouped="vertical-start"
          >
            Favorite Teams
          </SiteButtonLink>
          <SiteButtonLink
            :to="{ name: 'profile-inventory', params: { address } }"
            grouped="vertical-middle"
          >
            Item Inventory
          </SiteButtonLink>
          <SiteButtonLink
            :to="{ name: 'profile-badges', params: { address } }"
            grouped="vertical-end"
          >
            Badges / Achievements
          </SiteButtonLink>
        </div>
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
    grid-template-columns: minmax(20%, 16.5rem) minmax(0, 1fr);
    gap: 1rem;
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
</style>