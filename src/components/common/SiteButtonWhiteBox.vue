<script setup>
  import './SiteButtonWhite.vue' // for styles

  defineProps({
    small: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    interactive: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <div
    class="site-button-white__container"
    :class="{
      'site-button-white__container--small': small,
      'site-button-white__container--is-active': active,
      'site-button-white__container--interactive': interactive
    }"
  >
    <div class="site-button-white__corner site-button-white__corner-1" />
    <div class="site-button-white__corner site-button-white__corner-2" />
    <div class="site-button-white__corner site-button-white__corner-3" />
    <div class="site-button-white__corner site-button-white__corner-4" />
    <div class="site-button-white__button">
      <slot />
    </div>
  </div>
</template>

<style scoped>
</style>
