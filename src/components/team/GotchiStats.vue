<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    gotchi: {
      type: Object,
      required: true
    },
    variant: {
      type: String,
      default: 'small'  /* 'smallest' or 'small' or 'large' */
    }
  })

  const stats = computed(() => {
    if (!props.gotchi) { return null }
    const gotchi = props.gotchi
    return [
      {
        label: 'Speed',
        value: gotchi.speed
      },
      {
        label: 'Health',
        value: gotchi.health
      },
      {
        label: 'Critical Hit %',
        shortLabel: 'Crit. Hit %',
        value: gotchi.crit
      },
      {
        label: 'Armor',
        value: gotchi.armor
      },
      {
        label: 'Evasiveness %',
        value: gotchi.evade
      },
      {
        label: 'Resistance %',
        value: gotchi.resist
      },
      {
        label: 'Magic Power',
        shortLabel: 'Magic Att.',
        value: gotchi.magic
      },
      {
        label: 'Physical Power',
        shortLabel: 'Phy. Att.',
        value: gotchi.physical
      },
      {
        label: 'Accuracy %',
        value: gotchi.accuracy
      }
    ]
  })

</script>

<template>
  <dl 
    v-if="stats"
    class="dl-reset gotchi-stats"
    :class="{
      [`gotchi-stats--variant-${variant}`]: !!variant
    }"
  >
    <template
      v-for="stat in stats"
      :key="stat.label"
    >
      <div class="gotchi-stats__stat">
        <dt>
          {{ variant === 'smallest' ? (stat.shortLabel || stat.label) : stat.label }}
        </dt>
        <dd>
          {{ stat.value }}
        </dd>
      </div>
    </template>
  </dl>
</template>

<style scoped>
  .gotchi-stats {
    --gotchi-stats-num-columns: 2;
    --gotchi-stats-stat-color-background: transparent;
    display: grid;
    grid-template-columns: repeat(var(--gotchi-stats-num-columns), minmax(0, 1fr));
  }

  .gotchi-stats__stat {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 1.5rem;
    align-items: center;
    background: var(--gotchi-stats-stat-color-background);
    line-height: 1.5rem;
    text-transform: uppercase;
  }

  .gotchi-stats dd {
    font-weight: bold;
    text-align: right;
  }

  .gotchi-stats--variant-small {
    --gotchi-stats-num-columns: 2;
    column-gap: 1.5rem;
    font-size: 0.875rem;
    letter-spacing: 0.02625rem;
  }
  .gotchi-stats--variant-smallest {
    column-gap: 1.5rem;
  }

  .gotchi-stats--variant-large {
    --gotchi-stats-num-columns: 3;
    --gotchi-stats-stat-color-background: rgba(255, 255, 255, 0.1);
    gap: 0.25rem;
  }

  .gotchi-stats--variant-large .gotchi-stats__stat {
    padding: 0.5rem 1.5rem;
  }

  .gotchi-stats--variant-large dt {
    font-size: 0.875rem;
    letter-spacing: 0.02625rem;
  }
  .gotchi-stats--variant-large dd {
    font-size: 1.125rem;
    letter-spacing: 0.03375rem;
  }

  .gotchi-stats--variant-smallest .gotchi-stats__stat {
    padding: 0;
    line-height: 1.25rem;
  }
  .gotchi-stats--variant-smallest dt {
    font-size: 0.625rem;
    letter-spacing: 0.01875rem;
    opacity: 0.6;
  }
  .gotchi-stats--variant-smallest dd {
    font-size: 0.75rem;
    letter-spacing: 0.0225rem;
  }
</style>
