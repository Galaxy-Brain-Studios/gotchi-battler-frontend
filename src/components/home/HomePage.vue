<script setup>
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteButtonBox from '../common/SiteButtonBox.vue'
  import HomeStats from './HomeStats.vue'
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

  <main class="home-main">
    <HomeStats class="stats" />

    <div class="home-sections">
      <section class="tournaments">
        <h3>Tournaments</h3>
        <div class="tournaments-link">
          <SiteButtonLink
            :to="{ name: 'tournaments' }"
          >
            View All Tournaments
          </SiteButtonLink>
        </div>
        <TournamentsList
          :maxLength="4"
        />
      </section>

      <section class="howto">
        <h3>How to get started</h3>
        <ol class="list-reset">
          <li>
            <SiteButtonBox small>1</SiteButtonBox>
            Connect your wallet and head to our Training room
          </li>
          <li>
            <SiteButtonBox small>2</SiteButtonBox>
            Create a Team of 5 gotchis (use training gotchis for free!)
          </li>
          <li>
            <SiteButtonBox small>3</SiteButtonBox>
            Choose your formation and leader
          </li>
          <li>
            <SiteButtonBox small>4</SiteButtonBox>
            Take on one of our Training teams to test your skills
          </li>
          <li>
            <SiteButtonBox small>4</SiteButtonBox>
            Once you're ready, enter a Tournament and battle for huge GHST prizes!
          </li>
        </ol>
      </section>

      <section class="guide">
        <h3>Game Guide</h3>
        <div class="guide-card">
          Full details on how to play the game, including information on all the special moves and leader skills can be found in our Game Guide. Check it out to get the edge on your opponents and win huge GHST prizes in the next Tournament!

          <SiteButtonLink
            href="https://gotchi-battler-1.gitbook.io/gotchi-battler/"
            target="_blank"
          >
            Go to Game Guide
          </SiteButtonLink>
        </div>
      </section>
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
  .home-main {
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

  .stats {
    position: relative; /* above video */
    margin-top: -2.75rem;
    margin-bottom: 2rem;
  }

  .home-sections {
    display: flex;
    flex-direction: column;
    row-gap: 4rem;
  }

  @media (min-width: 1200px) {
    .home-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      row-gap: 4rem;
      column-gap: 2rem;
    }
    section.tournaments {
      grid-column: 1 / 3;
    }
  }

  h3 {
    margin: 0;
    color: var(--c-white);
    text-transform: uppercase;
    font-size: 1.5rem;
    font-weight: bold;
    line-height: 2rem;
    letter-spacing: 0.045rem;
  }
  section.tournaments {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 1rem;
    row-gap: 2rem;
  }
  section.tournaments h3,
  .tournaments-link {
    flex: none;
  }
  section.tournaments > :last-child {
    width: 100%;
  }

  section.howto {
    display: flex;
    flex-direction: column;
    row-gap: 2rem;
  }
  .howto ol {
    display: flex;
    flex-direction: column;
    row-gap: 1.5rem;
  }
  .howto li {
    font-size: 1rem;
    line-height: 2rem;
    letter-spacing: 0.03rem;
  }
  .howto li > :first-child {
    margin-right: 0.75rem;
  }

  section.guide {
    display: flex;
    flex-direction: column;
    row-gap: 1.5rem;
  }
  .guide-card {
    display: flex;
    flex-direction: column;
    row-gap: 1.5rem;
    align-items: center;

    border: 2px solid rgba(255, 255, 255, 0.25);
    padding: 2rem;
    background: rgba(var(--c-black-rgb), 0.25);

    text-align: center;
    font-size: 1rem;
    line-height: 2rem;
    letter-spacing: 0.03rem;
  }
</style>