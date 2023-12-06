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

  const currencyIcons = {
    dai: 'token-dai'
  }
</script>

<template>
  <div>
    <div
      v-if="!tournament?.prizes?.length"
      class="prizes-table__empty"
    >
      No prizes are available for this tournament.
    </div>
    <table
      v-else
      class="prizes-table"
    >
      <tbody>
        <tr v-for="(prize, i) in tournament.prizes" :key="prize.place">
          <td class="prizes-table__icon">
            {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '' }}
          </td>
          <td class="prizes-table__place">
            {{ prize.label || defaultPlacementLabels[prize.place - 1] }}
          </td>
          <td class="prizes-table__prize">
            <SiteIcon
              v-if="currencyIcons[prize.currency]"
              :name="currencyIcons[prize.currency]"
              :alt="prize.currency"
              class="prizes-table__currency-icon"
            />
            {{ prize.prize }}
            <template v-if="!currencyIcons[prize.currency]">
              {{ prize.currency }}
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.prizes-table__empty {
  color: var(--c-white);
  font-size: 1.5rem;
}

.prizes-table {
  color: var(--c-white);
  font-size: 1.5rem;
  margin: 0 auto;
  margin-top: 5rem;
}

.prizes-table td {
  padding-bottom: 2rem;
  text-align: left;
}

.prizes-table__place {
  padding-left: 0.5rem;
  padding-right: 3rem;
}

.prizes-table__prize {
  display: flex;
  align-items: center;
  font-size: 1.75rem;
}

.prizes-table__currency-icon{
  margin-right: 0.5rem;
}
</style>