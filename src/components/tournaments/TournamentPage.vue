<script setup>
  import { computed } from 'vue'
  import { formatDateTime } from '../../utils/date'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useTournamentStore } from '../../data/tournamentStore'
  import SiteBackLink from '../common/SiteBackLink.vue'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import TournamentBracketsList from './TournamentBracketsList.vue'
  import TournamentTeamsList from './TournamentTeamsList.vue'
  import TournamentParticipant from './TournamentParticipant.vue'
  import TournamentGotchis from './TournamentGotchis.vue'
  import TournamentBattles from './TournamentBattles.vue'
  import TournamentLending from './TournamentLending.vue'
  import TournamentPrizes from './TournamentPrizes.vue'

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

  const showLending = computed(() => {
    return ['upcoming', 'registering'].includes(tournamentStatus.value)
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
    <div class="tournament__header">
      <div class="nav-back">
        <SiteBackLink
          :to="backRoute"
          aria-label="Back to Tournaments"
        />
      </div>
      <template v-if="fetchStatus.loaded">
        <h1 class="word-break">{{ tournament.name }}</h1>
        <TournamentParticipant
          :tournamentId="tournament.id"
          :tournamentStatus="tournamentStatus"
          class="tournament__join"
          @createdTeam="onCreatedTeam"
        />
      </template>
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
    <div
      v-else-if="fetchStatus.loaded"
      class="tournament__layout"
    >
      <img
        v-if="tournament.image"
        class="tournament__image"
        :src="tournament.image"
      />
      <div
        class="tournament__tabs"
      >
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'brackets' } }"
          grouped="start"
        >
          Brackets
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'teams' } }"
          grouped="middle"
        >
          {{ tournament.numberOfTeams }} Teams
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'gotchis' } }"
          grouped="middle"
        >
          {{ tournament.numberOfTeams * 5 }} Gotchis
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'battles' } }"
          grouped="middle"
        >
          {{ tournament.numberOfBattles }} Battles
        </SiteButtonLink>
        <SiteButtonLink
          v-if="showLending"
          :to="{ name: 'tournament-tab', params: { id, tab: 'lending' } }"
          grouped="middle"
        >
          Gotchi Lending
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'prizes' } }"
          grouped="end"
        >
          Prizes
        </SiteButtonLink>
      </div>

      <div
        class="tournament__info-container"
      >
        <div class="tournament__meta">
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
        </div>
      </div>

      <div class="tournament__tab-content">
        <TournamentBracketsList
          v-if="tab === 'brackets'"
          :tournament="tournament"
        />

        <TournamentTeamsList
          v-else-if="tab === 'teams'"
          :tournament="tournament"
          :tournamentStatus="tournamentStatus"
          :teamId="teamId"
          :teamMode="teamMode"
          @deletedTeam="onDeletedTeam"
          @replacedTeam="onReplacedTeam"
          @editedTeam="onEditedTeam"
        />

        <TournamentPrizes
          v-else-if="tab === 'prizes'"
          :tournament="tournament"
        />

        <TournamentGotchis
          v-else-if="tab === 'gotchis'"
          :tournamentId="tournament.id"
        />

        <TournamentBattles
          v-else-if="tab === 'battles'"
          :tournamentId="tournament.id"
        />

        <TournamentLending
          v-else-if="tab === 'lending'"
          :tournamentStartDate="tournament.startDate"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
  .tournament__header {
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }
  .tournament__header .nav-back,
  .tournament__header .tournament__join {
    flex: none;
  }
  .tournament__header h1 {
    flex: 1 1 auto;
  }

  .tournament__layout {
    display: grid;
    grid-template-areas:
      "image"
      "info"
      "tabs"
      "content";
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto auto;
    column-gap: 2rem;
    row-gap: 2rem;
  }
  .tournament__image {
    grid-area: image;
  }
  .tournament__tabs {
    grid-area: tabs;
  }
  .tournament__info-container {
    grid-area: info;
  }
  .tournament__tab-content {
    grid-area: content;
  }

  @media (min-width: 800px) {
    .tournament__layout {
      grid-template-areas:
        "image tabs"
        "info tabs"
        "content content";
      grid-template-columns: minmax(0, 50%) minmax(0, 1fr);
      grid-template-rows: auto auto auto;
      row-gap: 1.5rem;
    }
  }

  @media (min-width: 1200px) {
    .tournament__layout {
      grid-template-areas:
        "image content"
        "tabs content"
        "info content";
      grid-template-columns: 18rem minmax(0, auto);
      grid-template-rows: auto auto minmax(auto, 1fr);
      row-gap: 0;
    }
    .tournament__meta {
      margin: 1.5rem;
    }
  }

  h1 {
    margin: 0;
    color: var(--c-white);
    font-weight: bold;
    font-size: 2rem;
    line-height: 2.5rem;
    letter-spacing: 0.06rem;
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
  .tournament__tab-content {
    border: 2px solid var(--c-black);
    padding: 2rem 1.5rem;
    background: var(--c-dark-blue);
  }
  .tournament__meta {
    flex: 1 1 auto;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0.02625rem;
    color: var(--c-white);
  }
  .tournament__meta-label {
    margin-right: 0.75rem;
    opacity: 0.5;
  }
</style>