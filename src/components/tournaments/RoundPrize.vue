<script setup>
  import prizeCurrencies from "./prizeCurrencies.json"
  import SiteIcon from '../common/SiteIcon.vue'

  defineProps({
    prize: {
      type: Object,
      required: true
    },
    size: {
      type: Number,
      default: 1 /* in rem */
    }
  })
</script>

<template>
  <div
    v-if="prize"
    class="round-prize"
    :style="{
      '--round-prize--size': (size - 0)
    }"
  >
    <div class="round-prize__amount">
      {{ prize.prize }}
    </div>
    <SiteIcon
      v-if="prizeCurrencies[prize.currency]?.icon"
      :name="prizeCurrencies[prize.currency]?.icon"
      :height="size"
      :width="size"
    />
    <div
      :class="{
        'sr-only': prizeCurrencies[prize.currency]?.icon
      }"
    >
      {{ prizeCurrencies[prize.currency]?.label || prize.currency }}
    </div>
  </div>
</template>

<style scoped>
.round-prize {
  display: flex;
  align-items: center;
  --round-prize--font-size: calc(1rem * var(--round-prize--size, 1));
  font-size: var(--round-prize--font-size);
  line-height: var(--round-prize--font-size);
  gap: calc(0.3 * var(--round-prize--font-size));
}
.round-prize-amount {
  flex: 1 0 auto;
}
.round-prize-amount + * {
  flex: none;
}
</style>