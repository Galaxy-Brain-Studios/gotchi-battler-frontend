<script setup>
  import SiteIcon from "../common/SiteIcon.vue"
  defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })

  // Prize data includes 'place' which is a 1-based integer
  // Note that these labels are 0-based
  const defaultPlacementLabels = [
    '1st', '2nd', '3rd - 4th', '5th - 8th', '9th - 16th', '17th - 32nd', '33rd - 64th', '65th - 128th', '129th - 256th', '257th - 512th', '513th - 1024th', '1025th - 2048th'
  ]

  const doubleEliminationPlacementLabels = [
    '1st', '2nd', '3rd', '4th', '5th - 6th', '7th - 8th','9th - 12th', '13th - 16th', '17th - 24th', '25th - 32nd', '33rd - 48th', '49th - 64th', '65th - 96th', '97th - 128th', '129th - 192nd', '193rd - 256th', '257th - 384th', '385th - 512th', '513th - 768th', '769th - 1024th', '1025th - 1536th', '1537th - 2048th'
  ]

  const currencyIcons = {
    dai: 'token-dai',
    ghst: 'token-ghst'
  }
  const currencyLabels = {
    dai: 'DAI',
    ghst: 'GHST'
  }
</script>

<template>
  <div>
    <div
      v-if="!tournament?.prizes?.length"
      class="prizes-list__empty"
    >
      No prizes are available for this tournament.
    </div>
    <ol
      v-else
      class="list-reset prizes-list"
    >
      <li
        v-for="(prize, i) in tournament.prizes"
        :key="prize.place"
      >
        <div
          v-if="i < 3"
          class="prizes-list__icon"
        >
          {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '' }}
        </div>
        <div class="prizes-list__place">
          {{ tournament.isDoubleElim ? doubleEliminationPlacementLabels[i] : defaultPlacementLabels[i]}}
        </div>
        <div class="prizes-list__prize">
          <SiteIcon
            v-if="currencyIcons[prize.currency]"
            :name="currencyIcons[prize.currency]"
            :height="2"
            :width="2"
            class="prizes-list__currency-icon"
          />
          {{ prize.prize }}
          {{ currencyLabels[prize.currency] || prize.currency }}
        </div>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.prizes-list__empty {
  color: var(--c-white);
  font-size: 1.5rem;
}

.prizes-list {
  display: flex;
  flex-direction: column;
  row-gap: 1rem;
}

.prizes-list li {
  --prize-list-border-color: var(--c-light-blue);
  --prize-list-background-color: rgba(var(--c-medium-blue-rgb), 0.5);
  display: flex;
  column-gap: 0.7rem;

  padding: 1rem 1.5rem;
  border: 1px solid var(--prize-list-border-color);
  background: var(--prize-list-background-color);

  color: var(--c-white);
  font-size: 1rem;
  line-height: 2rem;
  letter-spacing: 0.03rem;
  font-weight: bold;
}
.prizes-list li:nth-child(1) {
  --prize-list-border-color: var(--c-bright-yellow);
  --prize-list-background-color: rgba(var(--c-bright-yellow-rgb), 0.20);
}
.prizes-list li:nth-child(2) {
  --prize-list-border-color: #D3D3D3;
  --prize-list-background-color: rgba(135, 135, 135, 0.20);
}
.prizes-list li:nth-child(3) {
  --prize-list-border-color: #9B4913;
  --prize-list-background-color: rgba(131, 49, 4, 0.20);
}

.prizes-list__icon,
.prices-list__prize {
  flex: none;
}
.prizes-list__place {
  flex: 1 1 auto;
}

.prizes-list__prize {
  display: flex;
  align-items: center;
  column-gap: 0.75rem;
}
</style>