<script setup>
  import SiteIcon from '../common/SiteIcon.vue'
</script>

<template>
  <RouterLink class="link-reset link-reset--hover-underline">
    <SiteIcon
      name="chevron-left"
    />
    <slot />
  </RouterLink>
</template>

<style scoped>
  .nav-back a {
    display: inline-grid;
    grid-template-columns: auto auto;
    align-items: center;
    column-gap: 1rem;

    color: var(--c-white);
    font-size: 1.125rem;
    letter-spacing: 0.03375rem;
  }
</style>