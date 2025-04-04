<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useRouter } from 'vue-router'
  import { useTournamentStore } from '../../data/tournamentStore'
  import SiteBackLink from '../common/SiteBackLink.vue'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import SiteButtonGroup from '../common/SiteButtonGroup.vue'
  import TournamentOverview from './TournamentOverview.vue'
  import TournamentBracketsList from './TournamentBracketsList.vue'
  import TournamentTeamsList from './TournamentTeamsList.vue'
  import TournamentTeamsRejectedList from './TournamentTeamsRejectedList.vue'
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
      default: 'overview'
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
  const tournamentStatusBase = computed(() => {
    if (!tournamentStatus.value) { return null }
    return tournamentStatus.value.split('_')[0]
  })
  const tournamentPrizeCurrency = computed(() => {
    if (!fetchStatus.value.loaded || !tournament.value){ return null }
    return tournament.value.prizes?.[0]?.currency || null
  })

  const backRoute = computed(() => {
    if (!tournamentStatus.value){ return { name: 'tournaments' } }
    return {
      name: 'tournaments-type',
      params: { type: tournamentStatusBase.value }
    }
  })

  const showLending = computed(() => {
    return ['registering'].includes(tournamentStatus.value)
  })

  // Rejected teams are only available after a tournament has started.
  // (edge case: if teams-rejected is in the URL, then show the subtabs to make it clear what's being displayed)
  const showTeamSubtabs = computed(() => {
    return !['upcoming', 'registering'].includes(tournamentStatus.value) || props.tab === 'teams-rejected'
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

  const onDeletedTeam = function (teamId) {
    store.refetchTournament()
    // Ensure we are no longer showing this team
    if (props.teamId && `${teamId}` === `${props.teamId}`) {
      router.push({ name: 'tournament-tab', params: { tab: 'teams' } })
    }
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
        <h1 class="word-break">
          {{ tournament.name }}
          <span
            v-if="tournamentStatusBase === 'active'"
            class="tournament__status-badge"
          >
            {{ tournamentStatus.split('_')[1] }}
          </span>
        </h1>
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
          :to="{ name: 'tournament-tab', params: { id, tab: 'overview' } }"
          grouped="vertical-start"
        >
          Overview
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'brackets' } }"
          grouped="vertical-middle"
        >
          Brackets
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'teams' } }"
          grouped="vertical-middle"
        >
          {{ tournament.numberOfTeams }} Teams
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'gotchis' } }"
          grouped="vertical-middle"
        >
          {{ tournament.numberOfGotchis }} Gotchis
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'battles' } }"
          grouped="vertical-middle"
        >
          {{ tournament.numberOfBattles }} Battles
        </SiteButtonLink>
        <SiteButtonLink
          v-if="showLending"
          :to="{ name: 'tournament-tab', params: { id, tab: 'lending' } }"
          grouped="vertical-middle"
        >
          Gotchi Lending
        </SiteButtonLink>
        <SiteButtonLink
          :to="{ name: 'tournament-tab', params: { id, tab: 'prizes' } }"
          grouped="vertical-end"
        >
          Prizes
        </SiteButtonLink>
      </div>

      <div class="tournament__tab-content">
        <TournamentOverview
          v-if="tab === 'overview'"
          :tournament="tournament"
        />

        <TournamentBracketsList
          v-if="tab === 'brackets'"
          :tournament="tournament"
        />

        <template v-if="['teams', 'teams-rejected'].includes(tab)">
          <template v-if="showTeamSubtabs">
            <SiteButtonGroup
              :numButtons="2"
              class="tournament__subtabs"
            >
              <SiteButtonLink
                grouped="start"
                :to="{ name: 'tournament-tab', params: { id, tab: 'teams' } }"
              >
                Active Teams
              </SiteButtonLink>
              <SiteButtonLink
                grouped="end"
                :to="{ name: 'tournament-tab', params: { id, tab: 'teams-rejected' } }"
              >
                Rejected Teams
              </SiteButtonLink>
            </SiteButtonGroup>
          </template>

          <TournamentTeamsList
            v-if="tab === 'teams'"
            :tournamentId="tournament.id"
            :tournamentStatus="tournamentStatus"
            :tournamentPrizeCurrency="tournamentPrizeCurrency"
            :teamId="teamId"
            :teamMode="teamMode"
            @deletedTeam="onDeletedTeam"
            @editedTeam="onEditedTeam"
          />

          <TournamentTeamsRejectedList
            v-else-if="tab === 'teams-rejected'"
            :tournamentId="tournament.id"
            :teamId="teamId"
          />
        </template>

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
          :tournamentId="tournament.id"
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
      "tabs"
      "content";
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto auto auto;
    column-gap: 2rem;
    row-gap: 2rem;
  }
  .tournament__image {
    grid-area: image;
  }
  .tournament__tabs {
    grid-area: tabs;
  }
  .tournament__tab-content {
    grid-area: content;
  }

  @media (min-width: 800px) {
    .tournament__layout {
      grid-template-areas:
        "image tabs"
        "content content";
      grid-template-columns: minmax(0, 50%) minmax(0, 1fr);
      grid-template-rows: auto auto;
      row-gap: 1.5rem;
    }
  }

  @media (min-width: 1200px) {
    .tournament__layout {
      grid-template-areas:
        "image content"
        "tabs content";
      grid-template-columns: 18rem minmax(0, auto);
      grid-template-rows: auto minmax(auto, 1fr);
      row-gap: 0;
    }
    .tournament__image {
      padding: 0 0.5rem; /* to align with vertical menu */
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

  .tournament__status-badge {
    float: right;
    margin-left: 1rem;
    padding: 0.12rem 0.5rem;
    background-color: #79CA1A;
    color: var(--c-white);
    text-transform: uppercase;
    font-weight: normal;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0.02625rem;
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
  .tournament__subtabs {
    margin-bottom: 1.5rem;
  }
</style>