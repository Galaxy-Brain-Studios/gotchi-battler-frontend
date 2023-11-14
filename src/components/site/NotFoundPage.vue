<script setup>
  import { RouterLink } from 'vue-router'  
</script>

<template>
  <main>
    <p>
      Oops, looks like you fell out of the map...
    </p>
    <RouterLink
      to="/"
      class="link-reset link-reset--hover-underline"
    >
      Go back to the Home page
    </RouterLink>
  </main>
</template>