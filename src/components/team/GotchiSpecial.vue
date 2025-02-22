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
      default: 'small'  // 'small', 'large', 'icon'
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    forSpecial: {
      type: Boolean,
      default: true
    },
    forSpecialShowClass: {
      type: Boolean,
      default: false
    }
  })

  const store = useSpecialsStore()
  const { specialsById } = storeToRefs(store)

  const name = computed(() => specialsById.value[props.id]?.name)
  const gotchiClass = computed(() => specialsById.value[props.id]?.class)
  const leader = computed(() => specialsById.value[props.id]?.leader)
</script>

<template>
  <div
    class="gotchi-special"
    :class="{
      [`gotchi-special--variant-${variant}`]: true,
      'gotchi-special--full-width': fullWidth
    }"
    :style="{
      '--gotchi-special-color-background': forSpecial ? `var(--c-special-${id})` : undefined
    }"
  >
    <SiteIcon
      v-if="variant === 'small' || variant === 'icon'"
      :name="`special-${id}`"
      class="gotchi-special__icon"
      :width="0.75"
      :height="0.75"
    />
    <div
      v-if="variant !== 'icon'"
      class="gotchi-special__label"
    >
      <SiteIcon
        v-if="!forSpecial"
        name="special-leader"
        class="gotchi-special__leader-badge-icon"
        :width="0.75"
        :height="0.75"
      />
      <template v-if="forSpecial">
        {{ forSpecialShowClass ? gotchiClass : name }}
      </template>
      <template v-else>
        {{ leader }}
      </template> 
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
    width: 100%;
    justify-content: center;
  }
  .gotchi-special__label {
    display: flex;
    align-items: center;
  }
  .gotchi-special--variant-large .gotchi-special__label {
    padding: 0.25rem 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .gotchi-special--variant-icon {
    justify-content: center;
    padding: 0.25rem 0.4rem;
  }
  .gotchi-special--variant-small {
    padding: 0.25rem 0.4rem;
  }
  .gotchi-special--variant-small .gotchi-special__icon {
    width: 0.75rem;
  }
  .gotchi-special--variant-small .gotchi-special__label {
    font-size: 0.625rem;
    line-height: 0.625rem;
  }
  .gotchi-special__leader-badge-icon {
    height: 1.5rem !important;
    width: 1.5rem !important;
    margin-right: 0.5rem;
    color: var(--c-light-yellow);
  }
</style>