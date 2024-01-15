<script setup>
  defineProps({
    name: {
      type: String,
      required: true
    },
    width: {
      type: Number,
      default: 1  /* in rem */
    },
    height: {
      type: Number,
      default: 1  /* in rem */
    }
  })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon"
    :style="{
      '--icon-width': `${width}rem`,
      '--icon-height': `${height}rem`
    }"
    aria-hidden="true"
  >
    <use :href="`#icon_${name}`"></use>
  </svg>
</template>

<style scoped>
  svg.icon {
    width: var(--icon-width);
    height: var(--icon-height);
  }
</style>
