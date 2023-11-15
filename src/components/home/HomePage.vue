<script setup>
  import SiteHeading from '../common/SiteHeading.vue'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import TournamentsList from '../tournaments/TournamentsList.vue'
  import { useRouter } from 'vue-router'

  const router = useRouter()
  const goToTraining = function () {
    router.push({ name: 'training' })
  }
</script>

<template>
  <section class="hero-banner">
    <h2 class="hero-title">
      An Aavegotchi Auto Battler
    </h2>
    <div class="hero-text">
      Craft your ultimate Aavegotchi squad and deploy unique special moves to secure victory in thrilling gotchi battles to the death!
    </div>
    <SiteButtonPrimary
      @click="goToTraining"
    >
      START TRAINING
    </SiteButtonPrimary>
  </section>

  <div class="hero-video-container app__full-width">
    <video
      src="./hero.mp4"
      muted
      autoplay
      loop
      class="hero-video"
    ></video>
    <div class="hero-video-overlay" />
  </div>

  <main class="tournaments">
    <SiteHeading class="tournaments__header">
      Tournaments
    </SiteHeading>

    <TournamentsList :maxLength="6" />

    <div class="tournaments__link">
      <SiteButtonLink :to="{ name: 'tournaments' }">
        View All Tournaments
      </SiteButtonLink>
    </div>
  </main>
</template>

<style scoped>
  .hero-banner {
    grid-row: 2 / 3;
    z-index: 1;
  }
  .hero-video-container {
    grid-row: 1 / 3;
    z-index: 0;
    position: relative;
    overflow: hidden;
  }
  .tournaments {
    grid-row: 3 / 4;
  }

  .hero-video {
    /* video: 1280 x 720 */
    position: absolute; /* absolute position within the container so the video doesn't stretch the grid dimensions */
    left: 25%;
    width: 76%; /* An extra 1 % as there's a black line on the side of the video*/
    height: 100%;
    object-fit: cover;
    object-position: center;
    background: linear-gradient(0deg, #6469ab, #93388c, var(--c-dark-blue));
  }
  @media (prefers-reduced-motion: reduce) {
    .hero-video {
      display: none;
    }
  }
  .hero-video-overlay {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: linear-gradient(91deg, #14082F 25%, rgba(20, 8, 47, 0.00) 97.56%),
      linear-gradient(0deg, rgba(21, 9, 48, 0.50) 0%, rgba(21, 9, 48, 0.50) 100%),
      linear-gradient(180deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.00) 6rem, rgba(0, 0, 0, 0.00) 100%);
  }

  .hero-banner {
    padding-top: 1rem;
    padding-bottom: 5rem;
  }

  .hero-title {
    margin: 0 2rem 0 0;
    text-wrap: balance;
    color: var(--c-white);
    text-shadow: 0px 0px 12px rgba(0, 0, 0, 0.60);
    font-size: 3rem;
    font-weight: 700;
  }
  .hero-text {
    margin: 1rem 2rem 2rem 0;
    max-width: 40rem;
    color: var(--c-white);
    font-size: 1.125rem;
    line-height: 2rem;
    letter-spacing: 0.03375rem;
  }

  .tournaments {
    margin-top: 2rem;
  }

  .tournaments__header {
    margin-bottom: 3rem;
  }

  .tournaments__link {
    margin: 2.5rem 0 5rem;
    display: grid;
    place-content: center;
  }
</style>