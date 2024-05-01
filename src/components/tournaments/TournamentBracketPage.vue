<script setup>
  import { ref, computed, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useTournamentStore } from '../../data/tournamentStore'
  import SiteBackLink from '../common/SiteBackLink.vue'
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

  const battleCodes = computed(() => {
    if (!fullBracketsFetchStatus.value.loaded) { return null }
    const codes = {}
    for (const bracket of fullBrackets.value) {
      for (const round of (bracket.rounds || [])) {
        for (const battle of (round.battles || [])) {
          codes[battle.id] = battle.code
        }
      }
    }
    return codes
  })
  const battleBracketIds = computed(() => {
    if (!fullBracketsFetchStatus.value.loaded) { return null }
    const bracketIds = {}
    for (const bracket of fullBrackets.value) {
      for (const round of (bracket.rounds || [])) {
        for (const battle of (round.battles || [])) {
          bracketIds[battle.id] = bracket.id
        }
      }
    }
    return bracketIds
  })

  const bracket = computed(() => {
    if (!fullBracketsFetchStatus.value.loaded) { return null }
    return fullBrackets.value.find(bracket => `${bracket.id}` === `${props.bracketId}`)
  })

  const nextBracket = computed(() => {
    const nextBracketId = bracket.value?.nextBracket
    if (!nextBracketId) { return null }
    return fullBrackets.value.find(bracket => `${bracket.id}` === `${nextBracketId}`)
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
    <div class="bracket__header">
      <div class="nav-back">
        <SiteBackLink
          :to="backRoute"
          class="word-break"
          :aria-label="`Back to ${tournamentFetchStatus.loaded ? tournament.name : 'Tournament'}`"
        />
      </div>
      <template v-if="tournamentFetchStatus.loaded">
        <h1 class="word-break">
          {{ tournament.name }}
          <span
            v-if="bracket"
            style="font-weight: normal;"
          >
            : {{ bracket.name }}
          </span>
        </h1>
      </template>
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
      <BracketDiagram
        v-if="bracket.rounds && tournament?.teams"
        :tournamentId="id"
        :bracketId="bracket.id"
        :rounds="bracket.rounds"
        :nextBracketId="nextBracket?.id"
        :nextBracketName="nextBracket?.name"
        :teams="tournament.teams"
        :battleCodes="battleCodes"
        :battleBracketIds="battleBracketIds"
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
  .bracket__header {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  h1 {
    margin: 0;
    color: var(--c-white);
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.5rem;
    letter-spacing: 0.06rem;
  }
</style>