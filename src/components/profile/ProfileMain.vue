<script setup>
  import useProfile from '@/data/useProfile'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import DEFAULT_IMAGE_URL from './defaultProfileImage.png'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })

  const { fetchProfile, profile, fetchProfileStatus } = useProfile(props.address)
  fetchProfile()

  const escapeUrl = url => CSS.escape(url)
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
        <div
          class="profile-main__image"
          :style="{
            '--image-url': `url(${escapeUrl(profile.imageUrl || DEFAULT_IMAGE_URL)})`
          }"
        />
        <div
          class="profile-main__name"
          :class="{
            'profile-main__name--unset': !profile.name
          }"
        >
          <template v-if="profile.name">
            {{ profile.name }}
          </template>
          <template v-else>
            Noname
          </template>
        </div>
        <div class="profile-main__address">
          {{ profile.address }}
        </div>
      </div>
      <div class="profile-main__nav">
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
      grid-template-rows: auto auto;
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
    background-color: rgba(255, 255, 255, 0.2);
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .profile-main__name {
    text-align: center;
    font-size: 1.125rem;
    font-weight: bold;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
  .profile-main__name--unset {
    opacity: 0.6;
  }

  .profile-main__address {
    text-align: center;
    opacity: 0.5;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
</style>