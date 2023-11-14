<script setup>
import { RouterView } from 'vue-router'
import SiteIcons from './components/site/SiteIcons.vue'
import SiteHeader from './components/site/SiteHeader.vue'
</script>

<template>
  <SiteIcons />
  <SiteHeader class="site-header app__full-width" />
  <RouterView />
</template>

<style>
  /* app layout technique https://ryanmulligan.dev/blog/layout-breakouts/ */
  #app {
    --app-layout__gap: clamp(1rem, 6vw, 3rem);
    --app-layout__full: minmax(var(--app-layout__gap), 1fr);
    --app-layout__content: min(84rem, 100% - var(--app-layout__gap) * 2);

    display: grid;
    grid-template-columns:
      [full-start]
        var(--app-layout__full)
        [content-start]
          var(--app-layout__content)
        [content-end]
        var(--app-layout__full)
      [full-end];

    margin-bottom: 4rem;
  }
  /* default children of #app use the content column */
  #app > * {
    grid-column: content;
  }
  /* optionally children of #app can be full width */
  #app > .app__full-width {
    grid-column: full;
  }
  .site-header {
    margin-bottom: 1.3rem;
    grid-row: 1 / 2;
  }
</style>
