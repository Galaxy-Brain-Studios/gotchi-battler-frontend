<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    trait: {
      type: String,
      required: true
    }
  })
  const TRAIT_LABELS = {
    nrg: 'Energy',
    agg: 'Aggression',
    spk: 'Spookiness',
    brn: 'Brain',
    eys: 'Eye Shape',
    eyc: 'Eye Color'
  }
  const traitImageUrl = computed(() => new URL(`./trait-${props.trait.toLowerCase()}.png`, import.meta.url).href)
  const traitLabel = computed(() => TRAIT_LABELS[props.trait.toLowerCase()])
</script>
<template>
  <img
    :src="traitImageUrl"
    :alt="traitLabel"
    class="gotchi-trait-icon"
  />
</template>
<style scoped>
  .gotchi-trait-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
</style>