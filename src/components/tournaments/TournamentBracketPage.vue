<script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { formatDateTime } from '../../utils/date'
  import { useTournamentStore } from '../../data/tournamentStore'
  import SiteBackLink from '../common/SiteBackLink.vue'
  import BracketStatusBadge from './BracketStatusBadge.vue'
  import BracketDiagram from './BracketDiagram.vue'
  import BattleDialog from '../battle/BattleDialog.vue'

  const router = useRouter()

  const props = defineProps({
    id: {
      type: String,
      required: true
    },
    bracketId: {
      type: String,
      required: true
    },
    battleId: {
      type: String,
      default: null
    }
  })

  const battleDialogIsOpen = ref(false)

  // When incoming bracketId prop (from URL) changes,
  // show the dialog if there is a team specified,
  // and close it if not
  watch(
    () => props.battleId,
    (newBattleId, oldBattleId) => {
      if (!newBattleId && battleDialogIsOpen.value) {
        battleDialogIsOpen.value = false
      } else if (newBattleId !== oldBattleId) {
        battleDialogIsOpen.value = true
      }
    },
    {
      immediate: true
    }
  )

  // When dialog closes, navigate so battle is not in the URL
  watch(
    () => battleDialogIsOpen.value,
    (newIsOpen) => {
      if (!newIsOpen && props.battleId) {
        router.push({ name: 'tournament-bracket', params: { id: props.id, bracketId: props.bracketId } })
      }
    }
  )

  const tournamentStore = useTournamentStore(props.id)()
  tournamentStore.fetchFullBrackets()
  const {
    tournament,
    fetchStatus: tournamentFetchStatus,
    fullBrackets,
    fullBracketsFetchStatus
  } = storeToRefs(tournamentStore)

  const backRoute = computed(() => ({
    name: 'tournament-tab',
    params: {
      id: props.id,
      tab: 'brackets'
    }
  }))

  const bracket = computed(() => {
    if (!fullBracketsFetchStatus.value.loaded) { return null }
    return fullBrackets.value.find(bracket => `${bracket.id}` === `${props.bracketId}`)
  })

  const battleStartDate = computed(() => {
    if (!props.battleId || !bracket.value) { return null }
    // battle has same start date as its round: find the round
    const round = bracket.value.rounds?.find(round => round.battles?.find(battle => battle.id === props.battleId))
    return round?.startDate
  })
</script>

<template>
  <main>
    <div class="nav-back">
      <SiteBackLink
        :to="backRoute"
        class="word-break"
      >
        Back to
        {{ tournamentFetchStatus.loaded ? tournament.name : 'Tournament' }}
      </SiteBackLink>
    </div>
    <div
      v-if="fullBracketsFetchStatus.loading"
      class="bracket__loading"
    >
      Loading...
    </div>
    <div
      v-if="fullBracketsFetchStatus.error"
      class="bracket__error"
    >
      {{ fullBracketsFetchStatus.errorMessage }}
    </div>
    <div
      v-if="fullBracketsFetchStatus.loaded && !bracket"
      class="bracket__error"
    >
      Bracket not found.
    </div>
    <template
      v-else-if="bracket"
    >
      <div
        class="bracket__info-container"
      >
        <BracketStatusBadge
          :bracket="bracket"
          class="bracket__status-badge"
        />
        <h1 class="word-break">{{ bracket.name }}</h1>
        <div class="bracket__meta">
          <div>
            <span class="bracket__meta-label">
              Start:
            </span>
            <span class="bracket__meta-value">
               {{ formatDateTime(bracket.startDate) }}
            </span>
          </div>
          <div>
            <span class="bracket__meta-label">
              Entrants:
            </span>
            <span class="bracket__meta-value">
              {{ bracket.numberOfTeams }} {{ bracket.numberOfTeams === 1 ? 'Entrant' : 'Entrants' }}
            </span>
          </div>
          <div>
            <span class="bracket__meta-label">
              Rules:
            </span>
            <span class="bracket__meta-value">
               {{ bracket.rules }}
            </span>
          </div>
          <div>
            <span class="bracket__meta-label">
              Status:
            </span>
            <span class="bracket__meta-value">
               {{ bracket.statusLabel }}
            </span>
          </div>
        </div>
      </div>
      <BracketDiagram
        v-if="bracket.rounds && tournament?.teams"
        :tournamentId="id"
        :bracketId="bracket.id"
        :rounds="bracket.rounds"
        :teams="tournament.teams"
      />
      <BattleDialog
        v-if="battleId"
        v-model:isOpen="battleDialogIsOpen"
        :id="battleId"
        :startDate="battleStartDate"
      />
    </template>
  </main>
</template>

<style scoped>
  .nav-back {
    margin-bottom: 1.5rem;
  }

  h1 {
    margin: 0 0 1rem 0;
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.5rem;
    letter-spacing: 0.06rem;
    text-transform: uppercase;
  }

  .bracket__info-container {
    position: relative;
    margin-bottom: 2em;
    border: 3px solid var(--c-light-blue);
    padding: 2rem;
    background: var(--c-medium-blue);
  }

  .bracket__status-badge {
    position: absolute;
    top: 0;
    right: 0;
  }

  .bracket__meta {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 1rem;
    row-gap: 0.5rem;
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
  .bracket__meta-label {
    margin-right: 0.75rem;
    opacity: 0.5;
  }

  .bracket__tabs {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
</style>