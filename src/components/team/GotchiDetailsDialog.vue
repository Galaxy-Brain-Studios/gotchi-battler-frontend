<script setup>
  import SiteDialog from '../common/SiteDialog.vue'
  import GotchiDetails from './GotchiDetails.vue'

  defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    gotchi: {
      type: Object,
      required: true
    },
    teamId: {
      type: Number,
      default: null
    },
    isLeader: {
      type: Boolean,
      default: false
    }
  })
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="medium"
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <GotchiDetails
      v-if="gotchi"
      :gotchi="gotchi"
      :isLeader="isLeader"
      :teamId="teamId"
    />
  </SiteDialog>
</template>

<style scoped>
</style>