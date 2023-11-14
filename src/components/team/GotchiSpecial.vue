<script setup>
  import SiteIcon from '../common/SiteIcon.vue'
  import { storeToRefs } from 'pinia'
  import { useSpecialsStore } from '../../data/specialsStore'
  import { computed } from 'vue'

  const props = defineProps({
    id: {
      type: [Number, String],
      required: true
    },
    variant: {
      type: String,
      default: 'small'
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  })

  const store = useSpecialsStore()
  const { specialsById } = storeToRefs(store)

  const label = computed(() => {
    if (props.id === 'leader') {
      return "Leader's ability"
    }
    return specialsById.value[props.id]?.['class']
  })
</script>

<template>
  <div
    class="gotchi-special"
    :class="{
      [`gotchi-special--variant-${variant}`]: true,
      [`gotchi-special--type-${id}`]: true,
      'gotchi-special--full-width': fullWidth
    }"
  >
    <SiteIcon
      v-if="variant === 'small'"
      :name="`special-${id}`"
      class="gotchi-special__icon"
    />
    <div class="gotchi-special__label">
      {{ label }}
    </div>
    <slot name="after" />
  </div>
</template>

<style scoped>
  .gotchi-special {
    --gotchi-special-color-text: var(--c-white);
    --gotchi-special-color-background: rgba(0, 0, 0, 0.2);
    display: flex;
    gap: 0.25rem;
    align-items: center;
    color: var(--gotchi-special-color-text);
    background: var(--gotchi-special-color-background);
    font-weight: normal; /* reset any parent bold styles */
  }
  .gotchi-special--full-width {
    justify-content: center;
  }
  .gotchi-special--variant-large .gotchi-special__label {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .gotchi-special--variant-small {
    padding: 0.2rem 0.4rem;
  }
  .gotchi-special--variant-small .gotchi-special__icon {
    width: 0.75rem;
  }
  .gotchi-special--variant-small .gotchi-special__label {
    font-size: 0.725rem;
    line-height: 0.625rem;
  }
  .gotchi-special--type-1 {
    --gotchi-special-color-background: #3E80BE;
  }
  .gotchi-special--type-2 {
    --gotchi-special-color-background: #F98A25;
  }
  .gotchi-special--type-3 {
    --gotchi-special-color-background: #D9322A;
  }
  .gotchi-special--type-4 {
    --gotchi-special-color-background: #D46DC3;
  }
  .gotchi-special--type-5 {
    --gotchi-special-color-background: #6C6C6C;
  }
  .gotchi-special--type-6 {
    --gotchi-special-color-background: #ECBE11;
  }
  .gotchi-special--type-7 {
    --gotchi-special-color-background: #8D33EE;
  }
  .gotchi-special--type-8 {
    --gotchi-special-color-background: #1CA806;
  }
</style>