<script setup>
  defineProps({
    address: {
      type: String,
      required: true
    }
  })  
</script>

<template>
  <div>
    Favorite Teams content {{ address }}
  </div>
</template>

<style scoped>
</style>