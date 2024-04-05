<script setup>
  import SiteIcon from './SiteIcon.vue'

  defineProps({
    small: {
      type: Boolean,
      default: false
    }
  })
</script>
<template>
  <div
    class="site-error word-break"
    :class="{
      'site-error--small': small
    }"
  >
    <SiteIcon
      name="error"
      :width="1.5"
      :height="1.5"
    />
    <slot></slot>
  </div>
</template>
<style scoped>
  .site-error {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 0.6rem;

    border-radius: 2rem;
    padding: 1rem 1.5rem;
    background: #FAE6E6;
    color: rgba(204, 0, 0, 0.8);
    font-size: 1rem;
    line-height: 1.25rem;
    letter-spacing: 0.03rem;
  }
  .site-error--small {
    padding: 0.5rem 1rem;
    border-radius: 1.25rem;
  }
</style>