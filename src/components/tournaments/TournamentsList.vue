<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useTournamentsStore } from '../../data/tournamentsStore'
  import { formatDateTime } from '../../utils/date'
  import { RouterLink } from 'vue-router'
  import SiteIcon from '../common/SiteIcon.vue'

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

  const tournamentsWithStatus = computed(() => {
    if (!fetchStatus.value.loaded || !tournaments.value) { return null }
      return tournaments.value.map(tournament => ({
        ...tournament,
        type: tournament.status
      }))
  })

  const filteredTournaments = computed(() => {
      if (!fetchStatus.value.loaded || !tournamentsWithStatus.value) { return null }
      if (!props.type) { return tournamentsWithStatus.value }
      return tournamentsWithStatus.value.filter(tournament => tournament.type === props.type)
  })

  const tournamentsToDisplay = computed(() => {
    if (!filteredTournaments.value) { return null }
    if (!props.maxLength) { return filteredTournaments.value }
    return filteredTournaments.value.slice(0, props.maxLength)
  })

  const emptyMessage = computed(() => {
    if (props.type) {
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
      {{ tournamentsToDisplay.length }}
      {{ type }}
    </div>
    <ol
      class="tournaments__list list-reset"
    >
      <li
        v-for="tournament in tournamentsToDisplay"
        :key="tournament.id"
        class="tournament"
        :class="{
          'tournament--type-active': tournament.type === 'active',
          'tournament--type-upcoming': tournament.type === 'upcoming',
          'tournament--type-registering': tournament.type === 'registering',
          'tournament--type-completed': tournament.type === 'completed'
        }"
      >
        <div
          class="tournament__image"
          :style="{
            '--image-url': `url(${escapeUrl(tournament.image)})`
          }"
        />
        <div class="tournament__info">
          <RouterLink
            :to="{ name: 'tournament', params: { id: tournament.id } }"
            class="tournament__name extended-target word-break link-reset link-reset--hover-underline"
          >
            {{ tournament.name }}
          </RouterLink>
          <div class="tournament__date">
            <template v-if="tournament.type === 'completed'">
              Ended: {{ formatDateTime(tournament.endDate) }}
            </template>
            <template v-else-if="tournament.type === 'active'">
              Live
            </template>
            <template v-else-if="tournament.type === 'upcoming' || tournament.type === 'registering'">
              Start: {{ formatDateTime(tournament.startDate) }}
            </template>
            <template v-else>
              Start: {{ formatDateTime(tournament.startDate) }}
              <br>End: {{ formatDateTime(tournament.endDate) }}
            </template>
          </div>
          <div class="tournament__num-teams">
            <SiteIcon
              name="ghost"
              :width="0.875"
              :height="1.1875"
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
    font-size: 1.5rem;
  }
  .tournaments_summary {
    margin-bottom: 2rem;
    font-size: 1.5rem;
    text-transform: capitalize;
  }
  .tournaments__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 2rem;
  }
  .tournament  {
    --tournament-color-border: var(--c-light-blue);
    --tournament-color-background: var(--c-medium-blue);
    --tournament-image-opacity: 1;
    --tournament-color-date-text: var(--c-medium-pink);
    position: relative;
    min-height: 22rem;
    border: 0.2rem solid var(--tournament-color-border);
    background: var(--tournament-color-background);
  }
  .tournament:hover {
    --tournament-color-border-opacity: 1;
    --tournament-color-background-opacity: 1;
  }
  .tournament:focus-within {
    --tournament-color-border-opacity: 1;
    --tournament-color-background-opacity: 1;
  }
  .tournament--type-active {
    --tournament-color-border-opacity: 0.5;
    --tournament-color-background-opacity: 0.5;
    --tournament-color-border: rgba(var(--c-light-yellow-rgb), var(--tournament-color-border-opacity));
    --tournament-color-background: rgba(var(--c-medium-yellow-rgb), var(--tournament-color-background-opacity));
    --tournament-color-date-text: var(--c-light-yellow);
  }
  .tournament--type-upcoming,
  .tournament--type-completed {
    --tournament-color-border-opacity: 0.5;
    --tournament-color-background-opacity: 0.5;
    --tournament-color-border: rgba(var(--c-light-blue-rgb), var(--tournament-color-border-opacity));
    --tournament-color-background: rgba(var(--c-medium-blue-rgb), var(--tournament-color-background-opacity));
    --tournament-image-opacity: 0.5;
    --tournament-color-date-text: var(--c-white);
  }
  .tournament__image {
    height: 13rem;
    opacity: var(--tournament-image-opacity);
    background-color: var(--tournament-color-background);
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }
  .tournament__info {
    padding: 1rem 1.5rem 1.5rem;
  }
  .tournament__name {
    margin-top: 1rem;
    font-size: 1.5rem;
    line-height: 2rem;
    letter-spacing: 0.045rem;
  }
  .tournament__date {
    margin-top: 0.25rem;
    color: var(--tournament-color-date-text);
  }
  .tournament__num-teams {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    column-gap: 0.75rem;
    color: var(--c-light-blue);
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
  .tournament__num-teams > * {
    flex: none;
  }
</style>