<script setup>
  import debounce from 'lodash.debounce'
  import orderBy from 'lodash.orderby'
  import { ref, computed, watch } from 'vue'
  import { useRouter, RouterLink } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonBox from '../common/SiteButtonBox.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteEthAddress from '../common/SiteEthAddress.vue'
  import SiteCheckbox from '../common/SiteCheckbox.vue'
  import SiteTable from '../common/SiteTable.vue'
  import TeamDialog from '../team/TeamDialog.vue'
  import EditTeamDialog from '../team/EditTeamDialog.vue'

  const router = useRouter()

  const TEAM_MODES = {
    VIEW: null,
    REPLACE: 'replace', // before inscription phase, will delete and create new team
    EDIT: 'edit' // during inscription phase, more limited editing allowed
  }
  const props = defineProps({
    tournament: {
      type: Object,
      required: true
    },
    tournamentStatus: {
      type: String,
      default: null
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
  defineEmits(['deletedTeam', 'replacedTeam', 'editedTeam'])

  const teamIdNum = computed(() => props.teamId - 0)

  const teamDialogIsOpen = ref(false)
  const editTeamDialogIsOpen = ref(false)

  // When incoming teamId prop (from URL) changes,
  // show the dialog if there is a team specified,
  // and close it if not
  watch(
    () => props.teamId,
    (newTeamId, oldTeamId) => {
      if (!newTeamId) {
        teamDialogIsOpen.value = false
        editTeamDialogIsOpen.value = false
      } else if (newTeamId !== oldTeamId) {
        if ([TEAM_MODES.REPLACE, TEAM_MODES.EDIT].includes(props.teamMode)) {
          editTeamDialogIsOpen.value = true
        } else {
          teamDialogIsOpen.value = true
        }
      }
    },
    {
      immediate: true
    }
  )

  // When dialog closes, navigate so team is not in the URL
  watch(
    () => teamDialogIsOpen.value || editTeamDialogIsOpen.value,
    (newIsOpen) => {
      if (!newIsOpen && props.teamId) {
        router.push({ name: 'tournament-tab', params: { tab: 'teams' } })
      }
    }
  )

  const store = useAccountStore()
  const { isConnected, address } = storeToRefs(store)

  const numToShow = ref(10)
  const onlyShowMyTeams = ref(false)
  const sorting = ref({ property: 'ranking', direction: 'asc' })
  const query = ref('')
  const debouncedQuery = ref('')
  function setQuery () {
    debouncedQuery.value = query.value
  }
  const debouncedSetQuery = debounce(setQuery, 200)

  const matchesQuery = team => {
    const q = debouncedQuery.value.toLowerCase();
    if (team.name && team.name.toLowerCase().indexOf(q) !== -1) { return true }
    if (team.owner && team.owner.startsWith(q)) { return true }
    return false;
  }
  const filteredAndSortedTeams = computed(() => {
    if (!props.tournament?.teams?.length) { return null }
    const teams = props.tournament.teams
    const filteredTeams = debouncedQuery.value ? teams.filter(matchesQuery) : teams
    const sortedTeams = orderBy(filteredTeams, [sorting.value.property], [sorting.value.direction])
    let bubbledTeams = sortedTeams;
    if (isConnected.value) {
      const myAddress = address.value
      const myTeams = sortedTeams.filter(team => team.owner === myAddress)
      if (onlyShowMyTeams.value) {
        bubbledTeams = myTeams
      } else {
        const otherTeams = sortedTeams.filter(team => team.owner !== myAddress)
        bubbledTeams = [...myTeams, ...otherTeams]
      }
    }
    return bubbledTeams
  })
  const teamsToDisplay = computed(() => {
    if (!filteredAndSortedTeams.value) { return null }
    return filteredAndSortedTeams.value.slice(0, numToShow.value)
  })

  function loadMoreTeams () {
    numToShow.value += 10
  }
  const canLoadMoreTeams = computed(() => filteredAndSortedTeams.value?.length > numToShow.value)

  function sort(property, direction) {
    sorting.value.property = property;
    sorting.value.direction = direction;
  }

  const canManageTeam = computed(() => {
    if (!props.teamId || !address.value || !props.tournament.teams) { return false }
    const team = props.tournament.teams.find(team => team.id === props.teamId - 0)
    return team?.owner === address.value
  })

  const canDeleteTeam = computed(() => canManageTeam.value && props.tournamentStatus === 'registering' )
  //const canReplaceTeam = computed(() => canDeleteTeam.value)
  const canReplaceTeam = computed(() => false) // Disabled as server doesn't yet support this, but might in future
  const canEditTeam = computed(() => canManageTeam.value && props.tournamentStatus === 'active' )

  function requestReplaceTeam () {
    router.push({ name: 'tournament-tab', params: { tab: 'teams', teamId: props.teamId, teamMode: 'replace' } })
  }
  function requestEditTeam () {
    router.push({ name: 'tournament-tab', params: { tab: 'teams', teamId: props.teamId, teamMode: 'edit' } })
  }

  // When incoming teamMode prop (from URL) changes,
  // show the relevant dialog if there is a team specified,
  // and close all dialogs if not
  watch(
    () => props.teamMode,
    (newTeamMode) => {
      if (!props.teamId) {
        teamDialogIsOpen.value = false
        editTeamDialogIsOpen.value = false
        return
      }
      if (!newTeamMode) {
        // default to showing the team-view dialog
        teamDialogIsOpen.value = true
        editTeamDialogIsOpen.value = false
      } else {
        // non-default mode shows Edit dialog, but check this is allowed
        if (!canReplaceTeam.value && !canEditTeam.value) {
          router.push({ name: 'tournament-tab', params: { tab: 'teams' } })
        } else {
          teamDialogIsOpen.value = false
          editTeamDialogIsOpen.value = true
        }
      }
    },
    {
      immediate: true
    }
  )
</script>

<template>
  <div
    v-if="!tournament?.teams?.length"
    class="teams-list__empty"
  >
    No teams in this tournament.
  </div>
  <div v-else>
    <div class="teams-list__header">
      <div class="teams-list__num-teams">
        {{ tournament.teams.length }}
        {{ tournament.teams.length === 1 ? 'Entrant' : 'Entrants' }}
      </div>
      <SiteCheckbox
        v-if="isConnected"
        v-model="onlyShowMyTeams"
      >
        My teams only
      </SiteCheckbox>
      <div class="teams-list__search-teams">
        <SiteTextField
          v-model="query"
          search
          placeholder="Search team or address"
          class="teams-list__search-field"
          @input="debouncedSetQuery"
        />
      </div>
    </div>
    <SiteTable class="teams-list__table">
      <thead>
        <tr>
          <th class="team__ranking site-table--no-grow">
            <SiteButtonIcon
              label="Sort Ascending"
              iconName="chevron-up"
              :active="sorting.property === 'ranking' && sorting.direction === 'asc'"
              @click="sort('ranking', 'asc')"
            />
            <SiteButtonIcon
              label="Sort Descending"
              iconName="chevron-down"
              :active="sorting.property === 'ranking' && sorting.direction === 'desc'"
              @click="sort('ranking', 'desc')"
            />
          </th>
          <th>
            <span>Name</span>
          </th>
          <th>
            <span>Owner</span>
          </th>
          <th>
            <span>Total BRS</span>
            <SiteButtonIcon
              label="Sort Ascending"
              iconName="chevron-up"
              :active="sorting.property === 'totalBrs' && sorting.direction === 'asc'"
              @click="sort('totalBrs', 'asc')"
            />
            <SiteButtonIcon
              label="Sort Descending"
              iconName="chevron-down"
              :active="sorting.property === 'totalBrs' && sorting.direction === 'desc'"
              @click="sort('totalBrs', 'desc')"
            />
          </th>
          <th class="site-table--no-grow">
            <span>Wins</span>
            <SiteButtonIcon
              label="Sort Ascending"
              iconName="chevron-up"
              :active="sorting.property === 'battlesWon' && sorting.direction === 'asc'"
              @click="sort('battlesWon', 'asc')"
            />
            <SiteButtonIcon
              label="Sort Descending"
              iconName="chevron-down"
              :active="sorting.property === 'battlesWon' && sorting.direction === 'desc'"
              @click="sort('battlesWon', 'desc')"
            />
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="team in teamsToDisplay"
          :key="team.id"
        >
          <td class="team__ranking">
            <SiteButtonBox
              :active="isConnected && address === team.owner"
              class="team__ranking-badge"
            >
              {{ team.ranking }}
            </SiteButtonBox>
          </td>
          <td
            class="team__name word-break"
            style="position: relative;"
          >
            <RouterLink
              :to="{ name: 'tournament-tab', params: { tab: 'teams', teamId: team.id} }"
              class="link-reset link-reset--hover-underline extended-target"
            >
              {{ team.name }}
            </RouterLink>
          </td>
          <td class="team__owner">
            <SiteEthAddress
              :address="team.owner"
            />
          </td>
          <td class="team__brs">{{ team.totalBrs }}</td>
          <td class="team__wins">{{ team.battlesWon }}</td>
        </tr>
      </tbody>
    </SiteTable>
    <div class="teams-list__footer">
      <SiteButton
        v-if="canLoadMoreTeams"
        @click="loadMoreTeams"
      >
        Load More Teams
      </SiteButton>
    </div>
  </div>
  <TeamDialog
    v-if="teamId"
    v-model:isOpen="teamDialogIsOpen"
    :id="teamIdNum"
    :tournamentId="tournament.id"
    :canDelete="canDeleteTeam"
    :canReplace="canReplaceTeam"
    :canEdit="canEditTeam"
    @deletedTeam="$emit('deletedTeam')"
    @requestReplaceTeam="requestReplaceTeam"
    @requestEditTeam="requestEditTeam"
  />
  <EditTeamDialog
    v-if="teamId && (canReplaceTeam || canEditTeam) && editTeamDialogIsOpen"
    v-model:isOpen="editTeamDialogIsOpen"
    :id="teamIdNum"
    :tournamentId="tournament.id"
    :mode="teamMode"
    @replacedTeam="$emit('replacedTeam')"
    @editedTeam="$emit('editedTeam')"
  />
</template>

<style scoped>
  .teams-list__empty {
    color: var(--c-white);
    font-size: 1.5rem;
  }
  .teams-list__header {
    margin-bottom: 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .teams-list__header > * {
    flex: 0 1 auto;
  }
  .teams-list__num-teams {
    font-size: 1.5rem;
    line-height: 2rem;
  }

  .teams-list__table {
    width: 100%;
    margin-bottom: 2rem;
    border: none;
  }

  .teams-list__footer {
    display: grid;
    place-items: center;
  }
  .teams-list__table .team__ranking {
    text-align: right;
  }
  .teams-list__table td.team__ranking {
    padding: 0 1.5rem 2rem 0;
  }
  .team__ranking-badge {
    position: relative;
    top: 0.375em;
  }

  .teams-list__table .team__owner {
    font-size: 1rem;
    letter-spacing: 0.03rem;
    opacity: 0.5;
  }
</style>