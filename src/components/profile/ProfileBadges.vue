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
    Badges content {{ address }}
  </div>
</template>

<style scoped>
</style>