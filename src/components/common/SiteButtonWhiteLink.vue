<script setup>
  import { RouterLink } from 'vue-router'
  import './SiteButtonWhite.vue'

  defineProps({
    /* set to use a plain anchor link instead of RouterLink */
    href: {
      type: String,
      default: null
    },
    /* optionally provide with href */
    target: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <div
    v-if="href"
    class="site-button-white__container site-button-white__container--link"
  >
    <div class="site-button-white__corner site-button-white__corner-1" />
    <div class="site-button-white__corner site-button-white__corner-2" />
    <div class="site-button-white__corner site-button-white__corner-3" />
    <div class="site-button-white__corner site-button-white__corner-4" />
    <a
      :href="href"
      :target="target"
      class="site-button-white__button site-button-white__button--link link-reset"
    >
      <slot />
    </a>
  </div>
  <RouterLink
    v-else
    custom
    v-slot="{ isActive, href, navigate }"
  >
    <div
      class="site-button-white__container site-button-white__container--link"
      :class="{
        'site-button-white__container--is-active': isActive,
      }"
    >
      <div class="site-button-white__corner site-button-white__corner-1" />
      <div class="site-button-white__corner site-button-white__corner-2" />
      <div class="site-button-white__corner site-button-white__corner-3" />
      <div class="site-button-white__corner site-button-white__corner-4" />
      <a
        :href="href"
        :aria-current="isActive ? 'page' : undefined"
        class="site-button-white__button site-button-white__button--link link-reset"
        @click="navigate"
      >
        <slot />
      </a>
    </div>
  </RouterLink>
</template>
