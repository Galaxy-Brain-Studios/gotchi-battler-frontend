<script setup>
  import { RouterLink } from 'vue-router'
  import SiteIcon from './SiteIcon.vue';

  defineProps({
    icon: {
      type: String,
      default: null
    },
    grouped: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <RouterLink
    custom
    v-slot="{ isActive, href, navigate }"
  >
    <div
      class="site-button__container site-button__container--interactive"
      :class="{
        'site-button__container--is-active': isActive,
        'site-button__container--is-grouped': !!grouped,
        'site-button__container--is-grouped--start': grouped === 'start',
        'site-button__container--is-grouped--middle': grouped === 'middle',
        'site-button__container--is-grouped--end': grouped === 'end'
      }"
    >
      <a
        :href="href"
        :aria-current="isActive ? 'page' : undefined"
        class="site-button__button site-button__button--link link-reset"
        :class="{
          'site-button--has-icon': icon
        }"
        @click="navigate"
      >
        <SiteIcon
          v-if="icon"
          :name="icon"
          :size="1.5"
          class="site-button__icon"
        />
        <slot />
      </a>
    </div>
  </RouterLink>
</template>
