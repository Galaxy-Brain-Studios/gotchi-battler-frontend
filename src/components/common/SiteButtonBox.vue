<script setup>
  import SiteIcon from './SiteIcon.vue';

  defineProps({
    icon: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <div
    class="site-button__container site-button-box"
    :class="{
      'site-button__container--is-active': active
    }"
  >
    <div
      class="site-button__button"
      :class="{
        'site-button--has-icon': icon
      }"
    >
      <SiteIcon
        v-if="icon"
        :name="icon"
        :size="1.5"
        class="site-button__icon"
      />
      <slot />
    </div>
  </div>
</template>

<style scoped>
  .site-button-box {
    display: inline-grid;
    padding: 0;
  }
  .site-button-box.site-button__container--is-active {
    --button-color-background: var(--c-medium-yellow);
    --button-background--active: var(--button-color-background)
  }
</style>