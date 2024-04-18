<script setup>
  import { storeToRefs } from 'pinia'
  import { useBattleAnalyserStore } from '../../data/battleStore'
  import SiteError from '@/components/common/SiteError.vue'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import BattleField from '../battle/BattleField.vue'

  const props = defineProps({
    id: {
      type: String,
      required: true
    },
  })

  const store = useBattleAnalyserStore(props.id)()
  const { battle, fetchStatus } = storeToRefs(store)  
</script>

<template>
  <div class="analyser-battle">
    <div
      v-if="fetchStatus.loading"
      class="analyser-battle__loading"
    >
      Loading...
    </div>
    <SiteError
      v-else-if="fetchStatus.error"
      class="analyser-battle__error"
    >
      {{ fetchStatus.errorMessage }}
    </SiteError>
    <div v-else-if="fetchStatus.loaded">
      <BattleField
        :battle="battle"
        class="analyser-battle__field"
        showResult
      />
      <dl
        v-if="battle?.team1WinRate"
        class="list-reset analyser-battle__analysis"
      >
        <div>
          <dt>
            Number of Turns
          </dt>
          <dd>
            {{ battle.numberOfTurns }}
          </dd>
        </div>
        <div>
          <dt class="analyser-battle__win-rate-title">
            <div class="win-rate-text">Team 1 Win rate</div>
            <SitePopupHoverMenu class="analyser-battle__win-rate-popup">
              <SiteButtonIcon
                iconName="info"
                label="about"
              />
              <template #popper>
                This win rate shows what percentage your team wins over 200 battles.
              </template>
            </SitePopupHoverMenu>
          </dt>
          <dd>
            {{ battle.team1WinRate }}%
          </dd>
        </div>
        <div>
          <dt class="analyser-battle__win-rate-title">
            <div class="analyser-battle__win-rate-text">Team 2 Win rate</div>
            <SitePopupHoverMenu class="analyser-battle__win-rate-popup">
              <SiteButtonIcon
                iconName="info"
                label="about"
              />
              <template #popper>
                This win rate shows what percentage your team wins over 200 battles.
              </template>
            </SitePopupHoverMenu>
          </dt>
          <dd>
            {{ battle.team2WinRate }}%
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<style scoped>
  .analyser-battle {
    display: grid;
    padding-top: 2rem;
  }
  .analyser-battle__loading,
  .analyser-battle__error {
    justify-self: center;
  }
  .analyser-battle__analysis {
    margin: 1rem 13.5rem;
    display: flex;
    flex-wrap: wrap;
    column-gap: 1rem;
    justify-content: space-around;
  }
  .analyser-battle__analysis > div {
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
  }
  .analyser-battle__analysis dt {
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .analyser-battle__analysis dd {
    font-size: 2.5rem;
    line-height: 1.5rem;
    letter-spacing: 0.075rem;
    font-weight: bold;
  }
  .analyser-battle__win-rate-title {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
  }
  .analyser-battle__win-rate-text {
    flex: 1 1 auto;
  }
  .analyser-battle__win-rate-popup {
    flex: none;
    display: grid;
  }
</style>
