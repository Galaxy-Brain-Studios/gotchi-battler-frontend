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
</style>