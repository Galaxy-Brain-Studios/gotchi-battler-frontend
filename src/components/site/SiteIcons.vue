<script setup>
  import icons from "./siteIcons.js"

  icons.forEach(icon => {
    icon.viewBox = icon.svg.match(/viewBox="([^"]+)"/)?.[1]
  })
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icons"
    aria-hidden="true"
  >
    <symbol
      v-for="icon in icons"
      :key="icon.id"
      :id="`icon_${icon.id}`"
      :viewBox="icon.viewBox"
      v-html="icon.svg"
    />
  </svg>
</template>

<style scoped>
  svg.icons {
    display: none;
  }
</style>