<script setup>
  import { DEV_MODE } from '../../appEnv'
  import { RouterLink } from 'vue-router'
  import SiteIcon from '../common/SiteIcon.vue'
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
      <RouterLink
        to="/tournaments"
        class="link-reset link-reset--hover-underline"
      >
        Tournaments
      </RouterLink>
      <RouterLink
        to="/training"
        class="link-reset link-reset--hover-underline"
      >
        Training
      </RouterLink>
      <a
        href="https://gotchi-battler-1.gitbook.io/gotchi-battler/"
        target="_blank"
        class="link-reset link-reset--hover-underline"
      >
        Game Guide
      </a>
      <RouterLink
        to="/about"
        class="link-reset link-reset--hover-underline"
      >
        About
      </RouterLink>
      <RouterLink
        v-if="DEV_MODE"
        to="/dev"
        class="link-reset link-reset--hover-underline"
      >
        Dev
      </RouterLink>
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
  }
  .site-header nav {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    column-gap: 2.5rem;
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