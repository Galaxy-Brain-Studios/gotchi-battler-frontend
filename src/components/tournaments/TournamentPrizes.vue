<script setup>

  defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })

  const placements = [
    '1st', '2nd', '3rd - 4th', '5th - 8th', '9th - 16th', '17th - 32nd', '33rd - 64th', '65th - 128th', '129th - 256th', '257th - 512th', '513th - 1024th', '1025th - 2048th'
  ]

  const currencyImgs = {
    dai: 'https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=029'
  }
</script>

<template>
  <div>
    <table class="prizes-table">
      <tbody>
        <tr v-for="(prize, i) in tournament.prizes" :key="prize.place">
          <td class="prizes-table__icon">
            {{ i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '' }}
          </td>
          <td class="prizes-table__place">
            {{ placements[prize.place + 1] }}
          </td>
          <td class="prizes-table__prize">
            <img v-if="currencyImgs[prize.currency]" :src="currencyImgs[prize.currency]" :alt="prize.currency" width="24">
            {{ prize.prize }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.prizes-table {
  color: var(--c-white);
  font-size: 1.5rem;
  margin: 0 auto;
  margin-top: 5rem;
}

.prizes-table th span {
  opacity: 0.8;
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

.prizes-table__prize img{
  margin-right: 0.5rem;
}
</style>