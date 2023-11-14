<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })

  const addressToDisplay = computed(() => {
    if (props.address?.startsWith('0x')) {
      return `${props.address.substring(0, 4)}...${props.address.substring(props.address.length - 4)}`
    }
    return props.address
  })

</script>

<template>
  <div class="site-eth-address">
    {{ addressToDisplay }}
  </div>
</template>

<style scoped>
  .site-eth-address {
    white-space: nowrap;
    text-transform: lowercase;
  }
</style>