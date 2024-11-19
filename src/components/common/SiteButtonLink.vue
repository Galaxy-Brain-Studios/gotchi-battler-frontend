<script setup>
  import { RouterLink } from 'vue-router'
  import SiteIcon from './SiteIcon.vue';

  defineEmits(['click'])

  defineProps({
    icon: {
      type: String,
      default: null
    },
    grouped: {
      type: String,
      default: null
    },
    /* set to use a plain anchor link instead of RouterLink (TODO: add support for icon/grouped too, when/if this is needed) */
    href: {
      type: String,
      default: null
    },
    target: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <div
    v-if="href"
    class="site-button__container site-button__container--interactive"
  >
    <a
      :href="href"
      :target="target"
      class="site-button__button site-button__button--link link-reset"
      @click="$emit('click', $event)"
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
      class="site-button__container site-button__container--interactive"
      :class="{
        'site-button__container--is-active': isActive,
        'site-button__container--is-grouped': !!grouped,
        'site-button__container--is-grouped--vertical': grouped && grouped.startsWith('vertical'),
        'site-button__container--is-grouped--start': grouped === 'start',
        'site-button__container--is-grouped--middle': grouped === 'middle',
        'site-button__container--is-grouped--end': grouped === 'end',
        'site-button__container--is-grouped--vertical-start': grouped === 'vertical-start',
        'site-button__container--is-grouped--vertical-middle': grouped === 'vertical-middle',
        'site-button__container--is-grouped--vertical-end': grouped === 'vertical-end'
      }"
    >
      <a
        :href="href"
        :aria-current="isActive ? 'page' : undefined"
        class="site-button__button site-button__button--link link-reset"
        :class="{
          'site-button--has-icon': icon
        }"
        :target="target"
        @click="$emit('click', $event); navigate($event)"
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
