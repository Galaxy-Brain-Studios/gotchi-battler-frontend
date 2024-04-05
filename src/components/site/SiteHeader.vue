<script setup>
  import { DEV_MODE } from '../../appEnv'
  import { RouterLink } from 'vue-router'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteButtonWhiteLink from '../common/SiteButtonWhiteLink.vue'
  import SiteConnectWallet from './SiteConnectWallet.vue'
</script>

<template>
  <header class="site-header">
    <RouterLink
      to="/"
      class="site-header__home-link"
    >
      <span class="sr-only">Gotchi Battler Home</span>
      <SiteIcon
        name="battler-logo"
        :width="9.6875"
        :height="4.5"
      />
    </RouterLink>
    <nav>
      <SiteButtonWhiteLink
        to="/tournaments"
      >
        Tournaments
      </SiteButtonWhiteLink>
      <SiteButtonWhiteLink
        to="/training"
      >
        Training
      </SiteButtonWhiteLink>
      <SiteButtonWhiteLink
        to="/analyser"
      >
        Tools
      </SiteButtonWhiteLink>
      <SiteButtonWhiteLink
        href="https://gotchi-battler-1.gitbook.io/gotchi-battler/"
        target="_blank"
      >
        Game Guide
      </SiteButtonWhiteLink>
      <SiteButtonWhiteLink
        to="/about"
      >
        About
      </SiteButtonWhiteLink>
      <SiteButtonWhiteLink
        v-if="DEV_MODE"
        to="/dev"
      >
        Dev
      </SiteButtonWhiteLink>
    </nav>
    <div class="site-header__wallet">
      <SiteConnectWallet />
    </div>
  </header>
</template>

<style scoped>
  .site-header {
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: 2rem;
    align-items: center;
    padding: 1.5rem 2rem 0.5rem;
    z-index: 1;
  }
  .site-header nav {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    column-gap: 0;
    row-gap: 0.5rem;
  }
  .site-header nav > * {
    flex: none;
  }

  .site-header nav a {
    color: var(--color-white);
    opacity: 0.6;
    text-transform: uppercase;
    font-size: 1rem;
  }

  .site-header nav .router-link-active {
    font-weight: bold;
    opacity: 1;
  }
</style>