<script setup>
  import orderBy from 'lodash.orderby'
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useTournamentsStore } from '../../data/tournamentsStore'
  import { formatDateTime } from '../../utils/date'
  import { RouterLink } from 'vue-router'
  import SiteIcon from '../common/SiteIcon.vue'
  import TournamentStatusBadge from './TournamentStatusBadge.vue'

  const props = defineProps({
    type: {
      type: String,
      default: null
    },
    maxLength: {
      type: Number,
      default: null
    }
  })

  const store = useTournamentsStore()
  const { tournaments, fetchStatus } = storeToRefs(store)
  store.fetchTournaments()

  const ALL_TYPE = 'all'

  const tournamentsWithStatus = computed(() => {
    if (!fetchStatus.value.loaded || !tournaments.value) { return null }
    return orderBy(
      tournaments.value.map(tournament => ({
        ...tournament,
        type: tournament.status
      })),
      ['startDate'],
      ['desc']
    )
  })

  const filteredTournaments = computed(() => {
      if (!fetchStatus.value.loaded || !tournamentsWithStatus.value) { return null }
      if (!props.type || props.type === ALL_TYPE) { return tournamentsWithStatus.value }
      return tournamentsWithStatus.value.filter(tournament => tournament.type.startsWith(props.type))
  })

  const tournamentsToDisplay = computed(() => {
    if (!filteredTournaments.value) { return null }
    if (!props.maxLength) { return filteredTournaments.value }
    return filteredTournaments.value.slice(0, props.maxLength)
  })

  const emptyMessage = computed(() => {
    if (props.type && props.type !== ALL_TYPE) {
      return `There are no ${props.type} tournaments`
    }
    return 'There are no tournaments'
  })

  const escapeUrl = url => CSS.escape(url)
</script>

<template>
  <div
    v-if="fetchStatus.loading"
    class="tournaments__loading"
  >
    Loading...
  </div>
  <div
    v-if="fetchStatus.error"
    class="tournaments__error"
  >
    {{ fetchStatus.errorMessage }}
  </div>
  <div
    v-if="fetchStatus.loaded && !tournamentsToDisplay?.length"
    class="tournaments__empty"
  >
    {{ emptyMessage }}
  </div>
  <template
    v-else-if="fetchStatus.loaded && tournamentsToDisplay?.length"
  >
    <div
      v-if="type"
      class="tournaments_summary"
    >
      <b>
        {{ tournamentsToDisplay.length }}
        {{ type !== ALL_TYPE ? type : '' }}
      </b>
      {{ tournamentsToDisplay.length === 1 ? 'tournament' : 'tournaments' }}
    </div>
    <ol
      class="tournaments__list list-reset"
    >
      <li
        v-for="tournament in tournamentsToDisplay"
        :key="tournament.id"
        class="tournament"
      >
        <div
          class="tournament__image"
          :style="{
            '--image-url': `url(${escapeUrl(tournament.image)})`
          }"
        >
          <TournamentStatusBadge
            :status="tournament.type"
            class="tournament__type-badge"
          />
        </div>
        <div class="tournament__info">
          <RouterLink
            :to="{ name: 'tournament', params: { id: tournament.id } }"
            class="tournament__name extended-target word-break link-reset link-reset--hover-underline"
          >
            {{ tournament.name }}
          </RouterLink>
          <div class="tournament__date">
            <template v-if="tournament.type === 'completed'">
              Ended: <br><b>{{ formatDateTime(tournament.endDate) }}</b>
            </template>
            <template v-else-if="tournament.type.startsWith('active')">
              Live
            </template>
            <template v-else-if="tournament.type === 'upcoming' || tournament.type === 'registering'">
              Start: <br><b>{{ formatDateTime(tournament.startDate) }}</b>
            </template>
            <template v-else>
              Start: <br><b>{{ formatDateTime(tournament.startDate) }}</b>
              <br>End: <br><b>{{ formatDateTime(tournament.endDate) }}</b>
            </template>
          </div>
          <div class="tournament__num-teams">
            <SiteIcon
              name="ghost"
              :width="0.73684"
              :height="1"
            />
            <div>
              {{ tournament.numberOfTeams }}
              {{ tournament.numberOfTeams === 1 ? 'Team' : 'Teams' }}
            </div>
          </div>
        </div>
      </li>
    </ol>
  </template>
</template>

<style scoped>
  .tournaments__loading,
  .tournaments__error,
  .tournaments__empty {
    text-align: center;
    font-size: 1.125rem;
  }
  .tournaments_summary {
    margin-bottom: 2rem;
    font-size: 1.125rem;
    line-height: 2rem;
  }
  .tournaments_summary b {
    text-transform: capitalize;
  }

  .tournaments__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(17.5rem, 1fr));
    gap: 1.5rem;
  }
  .tournament {
    --tournament-border-width: 2px;
    --tournament-color-border: var(--c-light-blue);
    --tournament-color-background: var(--c-medium-blue);
    position: relative;
    border: var(--tournament-border-width) solid var(--tournament-color-border);
    background: var(--tournament-color-background);
  }
  .tournament::before {
    content: '🏆';
    z-index: 1;
    display: block;
    position: absolute;
    right: calc(-1 * var(--tournament-border-width));
    top: calc(-1 * var(--tournament-border-width));
    width: 2rem;
    height: 1.5rem;
    text-align: center;
    background-color: var(--tournament-color-border);
    font-size: 1rem;
    line-height: 1.5rem;
  }
  .tournament__image {
    position: relative;
    height: 11.5rem;
    background-color: var(--tournament-color-background);
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .tournament__type-badge {
    position: absolute;
    bottom: 0.5rem;
    right: 0.5rem;
  }
  .tournament__info {
    padding: 1rem;
  }
  .tournament__name {
    margin-top: 1rem;
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
  .tournament__date {
    margin-top: 0.5rem;
    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0.02625rem;
  }
  .tournament__num-teams {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    color: var(--c-light-blue);
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .tournament__num-teams > * {
    flex: none;
  }
</style>