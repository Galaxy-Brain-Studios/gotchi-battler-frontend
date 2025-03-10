<script setup>
  import orderBy from 'lodash.orderby'
  import { ref, computed, watch } from 'vue'
  import { useRouter, RouterLink } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useTournamentTeamsRejected from '../../data/useTournamentTeamsRejected'
  import SiteButton from '../common/SiteButton.vue'
  import SiteTable from '../common/SiteTable.vue'
  import TeamDialog from '../team/TeamDialog.vue'
  import UserIdentity from '../profile/UserIdentity.vue'

  const router = useRouter()

  const props = defineProps({
    tournamentId: {
      type: Number,
      required: true
    },
    teamId: {
      type: String,
      default: null
    }
  })

  // Fetch teams in tournament
  const { fetchTeams, fetchTeamsStatus, teams } = useTournamentTeamsRejected()
  watch(
    () => props.tournamentId,
    (newId) => {
      fetchTeams(newId)
    },
    { immediate: true }
  )

  const teamIdNum = computed(() => props.teamId - 0)

  const teamDialogIsOpen = ref(false)

  // When incoming teamId prop (from URL) changes,
  // show the dialog if there is a team specified,
  // and close it if not
  watch(
    () => props.teamId,
    (newTeamId, oldTeamId) => {
      if (!newTeamId) {
        teamDialogIsOpen.value = false
      } else if (newTeamId !== oldTeamId) {
        teamDialogIsOpen.value = true
      }
    },
    {
      immediate: true
    }
  )

  // When dialog closes, navigate so team is not in the URL
  watch(
    () => teamDialogIsOpen.value,
    (newIsOpen) => {
      if (!newIsOpen && props.teamId) {
        router.push({ name: 'tournament-tab', params: { tab: 'teams-rejected' } })
      }
    }
  )

  const store = useAccountStore()
  const { isConnected, address } = storeToRefs(store)

  const PAGE_SIZE = 100
  const numToShow = ref(PAGE_SIZE)

  const filteredAndSortedTeams = computed(() => {
    if (!(fetchTeamsStatus.value.loaded && teams.value?.length)) { return null }
    const sortedTeams = orderBy(teams.value, ['owner'], ['asc'])
    let bubbledTeams = sortedTeams;
    if (isConnected.value) {
      const myAddress = address.value
      const myTeams = sortedTeams.filter(team => team.owner === myAddress)
      const otherTeams = sortedTeams.filter(team => team.owner !== myAddress)
      bubbledTeams = [...myTeams, ...otherTeams]
    }
    return bubbledTeams
  })
  const teamsToDisplay = computed(() => {
    if (!filteredAndSortedTeams.value) { return null }
    return filteredAndSortedTeams.value.slice(0, numToShow.value)
  })

  function loadMoreTeams () {
    numToShow.value += PAGE_SIZE
  }
  const canLoadMoreTeams = computed(() => filteredAndSortedTeams.value?.length > numToShow.value)
</script>

<template>
  <div
    v-if="fetchTeamsStatus.loading"
    class="teams-list__loading"
  >
    Loading...
  </div>
  <div
    v-if="fetchTeamsStatus.error"
    class="teams-list__error"
  >
    {{ fetchTeamsStatus.errorMessage }}
  </div>
  <template v-else-if="fetchTeamsStatus.loaded">
    <div
      v-if="!teams?.length"
      class="teams-list__empty"
    >
      No rejected teams in this tournament.
    </div>
    <div v-else>
      <SiteTable class="teams-list__table">
        <thead>
          <tr>
            <th>
              <span>Name</span>
            </th>
            <th>
              <span>Owner</span>
            </th>
            <th>
              <span>Reason</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="team in teamsToDisplay"
            :key="team.id"
          >
            <td
              class="team__name word-break"
              style="position: relative;"
            >
              <RouterLink
                :to="{ name: 'tournament-tab', params: { tab: 'teams-rejected', teamId: team.id} }"
                class="link-reset link-reset--hover-underline extended-target"
              >
                {{ team.name }}
              </RouterLink>
            </td>
            <td class="team__owner">
              <UserIdentity
                :address="team.owner"
                :user="team.user"
              />
            </td>
            <td class="team__reason word-break">{{ team.reason }}</td>
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
      :tournamentId="tournamentId"
    />
  </template>
</template>

<style scoped>
  .teams-list__empty {
    color: var(--c-white);
    font-size: 1.5rem;
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

  .teams-list__table .team__owner {
    max-width: 450px;
  }
  .teams-list__table .team__reason {
    width: 50%;
  }
</style>