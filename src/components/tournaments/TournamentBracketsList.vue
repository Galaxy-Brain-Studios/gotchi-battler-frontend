<script setup>
  import debounce from 'lodash.debounce'
  import { ref, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteCheckbox from '../common/SiteCheckbox.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteTable from '../common/SiteTable.vue'
  import BracketStatusBadge from './BracketStatusBadge.vue'

  const props = defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })

  const store = useAccountStore()
  const { isConnected, address } = storeToRefs(store)

  const onlyShowMyBrackets = ref(false)
  const query = ref('')
  const debouncedQuery = ref('')
  function setQuery () {
    debouncedQuery.value = query.value
  }
  const debouncedSetQuery = debounce(setQuery, 200)

  const myTeamIds = computed(() => {
    if (!isConnected.value || !address.value) { return [] }
    if (!props.tournament.teams) { return [] }
    const addressLc = address.value.toLowerCase()
    return props.tournament.teams.filter(team => team.owner?.toLowerCase() === addressLc).map(team => team.id)
  })

  const annotatedBrackets = computed(() => {
    const result = props.tournament.brackets || []
    if (myTeamIds.value.length) {
      return result.map(bracket => ({
        ...bracket,
        containsMyTeams: bracket.teams?.some(teamId => myTeamIds.value.includes(teamId))
      }))
    }
    return result
  })

  const bracketsToDisplay = computed(() => {
    let result = annotatedBrackets.value
    if (isConnected.value && onlyShowMyBrackets.value) {
      result = result.filter(bracket => bracket.containsMyTeams)
    }
    if (debouncedQuery.value) {
      const queryLc = debouncedQuery.value.toLowerCase()
      const matchingTeamIds = props.tournament.teams.filter(team => team.name.toLowerCase().includes(queryLc)).map(team => team.id)
      result = result.filter(bracket => bracket.teams?.some(teamId => matchingTeamIds.includes(teamId)))
    }
    return result
  })
</script>

<template>
  <div
    v-if="!tournament?.brackets.length"
    class="brackets-list__empty"
  >
    No brackets in this tournament.
  </div>
  <template v-else>
    <div class="brackets-list__header">
      <div v-if="isConnected">
        <SiteCheckbox
          v-model="onlyShowMyBrackets"
        >
          Only brackets I'm part of
        </SiteCheckbox>
      </div>
      <div>
        <SiteTextField
          v-model="query"
          search
          placeholder="Search team"
          @input="debouncedSetQuery"
        />
      </div>
    </div>
    <div v-if="!bracketsToDisplay.length">
      No brackets found.
    </div>
    <SiteTable
      v-else
      variant="card"
    >
      <tbody>
        <tr
          v-for="bracket in bracketsToDisplay"
          :key="bracket.id"
          class="bracket"
          :class="{
            'bracket--is-finale': bracket.isFinale
          }"
        >
          <td>
            <div class="bracket__primary">
              <div
                v-if="bracket.isFinale"
                class="bracket__icon"
              >
                🏆
              </div>
              <div class="bracket__name word-break">
                <RouterLink
                  :to="{ name: 'tournament-bracket', params: { id: tournament.id, bracketId: bracket.id } }"
                  class="extended-target link-reset link-reset--hover-underline"
                >
                  {{ bracket.name }}
                </RouterLink>
              </div>
            </div>
          </td>
          <td class="site-table--no-grow">
            <div
              v-if="bracket.containsMyTeams"
              class="bracket__playing"
            >
              <SiteIcon
                name="star"
                :width="1.3"
                :height="1.3"
                class="bracket__playing-icon"
              />
              PLAYING
            </div>
          </td>
          <td class="site-table--no-grow">
            <div class="bracket__num-teams">
              {{ bracket.teams?.length || 0 }} TEAMS
            </div>
          </td>
          <td class="site-table--no-grow">
            <div class="bracket__status">
              <BracketStatusBadge
                :bracket="bracket"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </SiteTable>
  </template>
</template>

<style scoped>
  .brackets-list__empty {
    color: var(--c-white);
    font-size: 1.5rem;
  }
  .brackets-list__header {
    margin-bottom: 1.75rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .bracket {
    position: relative;
    text-transform: uppercase;
  }
  .bracket td {
    vertical-align: middle;
  }
  .bracket--is-finale {
    --site-table-card-border-color-rgb: var(--c-light-purple-rgb);
    --site-table-card-background-color-rgb: var(--c-medium-purple-rgb);
  }
  .bracket:hover {
    --site-table-card-border-color-opacity: 1;
    --site-table-card-background-color-opacity: 1;
  }
  .bracket:focus-within {
    --site-table-card-border-color-opacity: 1;
    --site-table-card-background-color-opacity: 1;
  }
  .bracket__primary {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .bracket__playing,
  .bracket__num-teams,
  .bracket__status {
    white-space: nowrap;
  }

  .bracket__icon {
    flex: none;
  }
  .bracket__icon {
    font-size: 2rem;
    line-height: 1.5rem;
  }
  .bracket__name {
    flex: 1 1 auto;
  }
  .bracket__name {
    font-size: 1rem;
    line-height: 1.125rem;
    letter-spacing: 0.03rem;
  }
  .bracket__playing {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    font-weight: bold;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
    color: var(--c-light-yellow);
  }
  .bracket__playing-icon {
    margin-top: -3px;
  }
  .bracket__num-teams {
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
    opacity: 0.6;
  }
  .bracket__status {
    display: flex;
    justify-content: flex-end;
  }
</style>