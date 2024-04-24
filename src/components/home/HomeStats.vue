<script setup>
  import { computed } from 'vue'
  import useStats from '@/data/useStats'

  const { fetchStatsStatus, stats } = useStats()

  const friendlyNumBattles = computed(() => {
    if (!fetchStatsStatus.value.loaded || !stats.value.numBattles) { return '' }
    if (stats.value.numBattles < 1000) { return stats.value.numBattles }
    return Math.floor(stats.value.numBattles / 1000) + 'K+'
  })

  const friendlyUsdPrizes = computed(() => {
    if (!fetchStatsStatus.value.loaded || !stats.value.usdPrizes) { return '' }
    if (stats.value.usdPrizes < 1000) { return stats.value.usdPrizes }
    return Math.floor(stats.value.usdPrizes / 1000) + 'K+'
  })
</script>

<template>
  <div class="home-stats">
    <template v-if="fetchStatsStatus.loading">
      ...
    </template>
    <template v-else-if="fetchStatsStatus.error">
      Error fetching stats ({{ fetchStatsStatus.errorMessage }})
    </template>
    <template v-else-if="fetchStatsStatus.loaded">
      <span class="home-stats__item">
        <b>{{ friendlyNumBattles }}</b> Battles fought.
      </span>
      <span class="home-stats__item">
        <b>{{ stats.numTournaments }}</b> Tournaments
      </span>
      finished and
      <span class="home-stats__item">
        <b>${{ friendlyUsdPrizes }}</b> in prizes
      </span>
      distributed
    </template>
  </div>
</template>

<style scoped>
  .home-stats {
    --stats-border-color: #43348d;
    border: 4px solid var(--stats-border-color);
    padding: 1rem 1.5rem;
    background: var(--c-black);
    color: rgb(141, 131, 191);
    text-align: center;
    font-size: 1.5rem;
    line-height: 3rem;
    letter-spacing: 0.03rem;
  }
  b {
    color: var(--c-white);
  }
</style>