<script setup>
  import SiteIcon from './SiteIcon.vue'

  defineProps({
    label: {
      type: String,
      required: true
    },
    active: {
      type: Boolean,
      default: false
    },
    iconName: {
      type: String,
      default: null
    }
  })
</script>

<template>
  <button
    type="button"
    class="site-button-icon button-reset"
    :class="{
      'site-button-icon--active': active
    }"
  >
    <span class="sr-only">
      {{ label }}
    </span>
    <slot>
      <SiteIcon
        :name="iconName"
        :width="1"
        :height="1"
      />
    </slot>
  </button>
</template>

<style scoped>
  .site-button-icon {
    display: inline-grid;
    place-items: center;
    opacity: 0.6;
    color: var(--c-white);
    padding: 0;
  }
  .site-button-icon--active {
    opacity: 1;
  }
  .site-button-icon:hover {
    opacity: 1;
  }
  .site-button-icon:focus-visible {
    outline: 1px solid var(--c-light-blue);
    opacity: 1;
  }
</style>
