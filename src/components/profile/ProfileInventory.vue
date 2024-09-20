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
    Item Inventory content {{ address }}
  </div>
</template>

<style scoped>
</style>