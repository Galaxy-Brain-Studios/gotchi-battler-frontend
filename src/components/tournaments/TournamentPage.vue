<script setup>
  import { computed } from 'vue'
  import { formatDateTime } from '../../utils/date'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useTournamentStore } from '../../data/tournamentStore'
  import SiteBackLink from '../common/SiteBackLink.vue'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import SiteButtonGroup from '../common/SiteButtonGroup.vue'
  import TournamentBracketsList from './TournamentBracketsList.vue'
  import TournamentTeamsList from './TournamentTeamsList.vue'
  import TournamentParticipant from './TournamentParticipant.vue'

  const props = defineProps({
    id: {
      type: String,
      required: true
    },
    tab: {
      type: String,
      default: 'brackets'
    },
    teamId: {
      type: String,
      default: null
    },
    teamMode: {
      type: String,
      default: null
    }
  })

  const router = useRouter()

  const store = useTournamentStore(props.id)()
  const { tournament, fetchStatus } = storeToRefs(store)

  const tournamentStatus = computed(() => {
    if (!fetchStatus.value.loaded || !tournament.value){ return null }
    return tournament.value.status
  })

  const backRoute = computed(() => {
    if (!tournamentStatus.value){ return { name: 'tournaments' } }
    return {
      name: 'tournaments-type',
      params: { type: tournamentStatus.value }
    }
  })

  const onCreatedTeam = function () {
    store.refetchTournament()
    if (props.tab !== 'teams') {
      router.push({
        name: 'tournament-tab',
        params: {
          id: props.id,
          tab: 'teams',
          teamId: null
        }
      })
    }
  }

  const onDeletedTeam = function () {
    store.refetchTournament()
  }
  const onReplacedTeam = function () {
    store.refetchTournament()
  }
  const onEditedTeam = function () {
    store.refetchTournament()
  }
</script>

<template>
  <main>
    <div class="nav-back">
      <SiteBackLink :to="backRoute">
        Back to Tournaments
      </SiteBackLink>
    </div>

    <div
      v-if="fetchStatus.loading"
      class="tournament__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchStatus.error"
      class="tournament__error"
    >
      {{ fetchStatus.errorMessage }}
    </div>
    <template
      v-else-if="fetchStatus.loaded"
    >
      <div
        class="tournament__info-container"
      >
        <img
          v-if="tournament.image"
          class="tournament__image"
          :src="tournament.image"
        />
        <div class="tournament__meta">
          <h1 class="word-break">{{ tournament.name }}</h1>
          <div>
            <span class="tournament__meta-label">
              Start:
            </span>
            <span class="tournament__meta-value">
               {{ formatDateTime(tournament.startDate) }}
            </span>
          </div>
          <div>
            <span class="tournament__meta-label">
              End:
            </span>
            <span class="tournament__meta-value">
               {{ formatDateTime(tournament.endDate) }}
            </span>
          </div>
          <div>
            <span class="tournament__meta-label">
              Rules:
            </span>
            <span class="tournament__meta-value">
              {{ tournament.rules }}
            </span>
          </div>
          <TournamentParticipant
            :tournamentId="tournament.id"
            :tournamentStatus="tournamentStatus"
            class="tournament__join"
            @createdTeam="onCreatedTeam"
          />
        </div>
      </div>
      <SiteButtonGroup
        class="tournament__tabs"
        :numButtons="2"
      >
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'brackets' } }"
          grouped="start"
        >
          Brackets
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'teams' } }"
          grouped="end"
        >
          {{ tournament.numberOfTeams }} Entrants
        </SiteButtonLink>
      </SiteButtonGroup>

      <TournamentBracketsList
        v-if="tab === 'brackets'"
        :tournament="tournament"
      >
      </TournamentBracketsList>

      <TournamentTeamsList
        v-else-if="tab === 'teams'"
        :tournament="tournament"
        :tournamentStatus="tournamentStatus"
        :teamId="teamId"
        :teamMode="teamMode"
        @deletedTeam="onDeletedTeam"
        @replacedTeam="onReplacedTeam"
        @editedTeam="onEditedTeam"
      >
      </TournamentTeamsList>
    </template>
  </main>
</template>

<style scoped>
  .nav-back {
    margin-bottom: 1.5em;
  }

  h1 {
    margin: 0;
    color: var(--c-bright-yellow);
    font-weight: bold;
    font-size: 2.5rem;
    line-height: 3rem;
    letter-spacing: 0.25rem;
  }

  .tournament__info-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2.5rem;
    align-items: flex-start;
  }
  .tournament__image {
    flex: none;
    max-width: min(400px, 100%);
  }
  .tournament__meta {
    flex: 1 1 auto;
    font-size: 1.5rem;
    line-height: 2rem;
    letter-spacing: 0.045rem;
    color: var(--c-white);
  }
  .tournament__meta-label {
    margin-right: 0.75rem;
    opacity: 0.5;
  }
  .tournament__join {
    margin-top: 1.5rem;
  }
  .tournament__tabs {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
</style>