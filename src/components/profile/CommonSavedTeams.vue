<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useProfile from '@/data/useProfile'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SavedTeamFormation from '../team/SavedTeamFormation.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    },
    onlyMyGotchisAllowed: {
      type: Boolean,
      default: false
    },
    unavailableGotchiIds: {
      type: Array,
      default: null
    },
    // Use to trigger refetch of teams
    savedTeamsLastChanged: {
      type: Number,
      default: null
    }
  })  

  const { isConnectedSignedInProfile, fetchTeams, teams, fetchTeamsStatus } = useProfile(props.address)

  const store = useAccountStore()
  const { myGotchis, myGotchisFetchStatus } = storeToRefs(store)

  watch(
    () => isConnectedSignedInProfile.value,
    () => {
      if (isConnectedSignedInProfile.value && !fetchTeamsStatus.value.loaded && !fetchTeamsStatus.value.loading) {
        fetchTeams()
      }
    },
    { immediate: true }
  )
  watch(
    () => props.savedTeamsLastChanged,
    () => {
      if (isConnectedSignedInProfile.value) {
        fetchTeams()
      }
    }
  )


  watch(
    () => [isConnectedSignedInProfile.value, props.onlyMyGotchisAllowed],
    () => {
      if (props.onlyMyGotchisAllowed && isConnectedSignedInProfile.value  && !myGotchisFetchStatus.loaded && !myGotchisFetchStatus.loading) {
        store.fetchMyGotchis()
      }
    },
    { immediate: true }
  )

  const fetchStatus = computed(() => {
    if (!props.onlyMyGotchisAllowed) {
      return fetchTeamsStatus.value
    }
    return {
      loading: myGotchisFetchStatus.value.loading || fetchTeamsStatus.value.loading,
      error: myGotchisFetchStatus.value.error || fetchTeamsStatus.value.error,
      errorMessage: myGotchisFetchStatus.value.errorMessage || fetchTeamsStatus.value.errorMessage,
      loaded: myGotchisFetchStatus.value.loaded && fetchTeamsStatus.value.loaded
    }
  })

  const availableTeams = computed(() => {
    if (!props.onlyMyGotchisAllowed) {
      return teams.value
    }
    // With onlyMyGotchisAllowed, pre-filter the saved teams to only include those with my gotchis,
    // and also replace the gotchi objects in the team with the latest versions from myGotchis (find by onchainId)
    // Validate the saved gotchi special against the latest version of the gotchi.
    // Also assume that in this mode, duplicates will not be allowed (they mess up the leader ID): exclude teams with duplicates here.
    if (!fetchTeamsStatus.value.loaded || !myGotchisFetchStatus.value.loaded || !teams.value.length || !myGotchis.value?.length) {
      return null
    }
    const myGotchisByOnchainId = Object.fromEntries(myGotchis.value.map(g => [`${g.onchainId}`, g]))
    const myGotchisOnchainIds = Object.keys(myGotchisByOnchainId)
    const newTeams = []
    for (const team of teams.value) {
      const teamGotchis = Object.values(team.formation).flat().filter(g => !!g)
      const teamGotchiOnchainIds = teamGotchis.map(g => g.onchainId)
      const teamGotchiOnchainIdsUniq = [...new Set(teamGotchiOnchainIds)]
      if (teamGotchiOnchainIds.length && // team has gotchis
        teamGotchiOnchainIds.length === teamGotchiOnchainIdsUniq.length && // team doesn't have duplicate gotchis
        teamGotchiOnchainIds.every(onchainId => myGotchisOnchainIds.includes(`${onchainId}`)) // team only contains myGotchis
      ) {
        const leaderGotchi = teamGotchis.find(g => `${g.id}` === `${team.leader}`)
        const leaderGotchiOnchainId = leaderGotchi ? leaderGotchi.onchainId : teamGotchis[0]?.onchainId
        const newTeam = {
          ...team,
          formation: Object.fromEntries(
            Object.entries(team.formation).map(([key, row]) => {
              return [
                key,
                row.map(teamGotchi => {
                  if (!teamGotchi) { return null }
                  const latestGotchi = myGotchisByOnchainId[`${teamGotchi.onchainId}`]
                  // ensure the selected special is still valid
                  const specialId = teamGotchi.specialId && latestGotchi.availableSpecials?.includes(teamGotchi.specialId) ? teamGotchi.specialId : null
                  return {
                    ...latestGotchi,
                    specialId
                  }
                })
              ]
            })
          ),
          leader: leaderGotchiOnchainId
        }
        newTeams.push(newTeam)
      }
    }
    return newTeams
  })


  const query = ref('')

  const filteredTeams = computed(() => {
    if (!availableTeams.value?.length) { return [] }
    let result = availableTeams.value
    if (query.value) {
      const queryLc = query.value.toLowerCase()
      result = result.filter(team => team.name?.toLowerCase().includes(queryLc))
    }

    return result
  })
  const teamsToDisplay = computed(() => {
    return filteredTeams.value
  })
</script>

<template>
  <SiteRequireSignIn>
    <template #signin-message>
      to view your saved teams
    </template>

    <div v-if="fetchStatus.loading">
      Loading...
    </div>
    <div v-if="fetchStatus.error">
      {{ fetchStatus.errorMessage }}
    </div>
    <template v-else-if="fetchStatus.loaded">
      <div class="common-saved-teams__header">
        <div class="common-saved-teams__count">
          {{ teamsToDisplay.length }}
          team{{ teamsToDisplay.length === 1 ? '' : 's' }}
        </div>
        <div class="common-saved-teams__search">
          <SiteTextField
            v-model="query"
            search
            subtle
            placeholder="Search team"
            class="common-saved-teams__search-field"
          />
        </div>
      </div>
      <div
        v-if="!teamsToDisplay.length"
        class="common-saved-teams__empty"
      >
        No teams found.
      </div>
      <ol
        v-else
        class="list-reset common-saved-teams__list create-team-source__items-available"
      >
        <li
          v-for="team in teamsToDisplay"
          :key="team.id"
          class="common-saved-teams__team"
        >
          <div class="common-saved-teams__team__details">
            <div class="common-saved-teams__team__name word-break">
              {{ team.name }}
            </div>
            <div class="common-saved-teams__team__brs">
              Total: {{ team.totalBrs }} BRS
            </div>
          </div>
          <div class="common-saved-teams__team__formation">
            <SavedTeamFormation
              :team="team"
              :unavailableGotchiIds="unavailableGotchiIds"
            />
          </div>
          <div
            v-if="$slots['actions']"
            class="common-saved-teams__team__manage"
          >
            <slot
              name="actions"
              :team="team"
              :fetchTeams="fetchTeams"
            ></slot>
          </div>
        </li>
      </ol>
    </template>
  </SiteRequireSignIn>
</template>

<style scoped>
  .common-saved-teams__header {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }
  .common-saved-teams__count {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }

  .common-saved-teams__team {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    background: rgba(var(--c-black-rgb), 0.5);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  /* put right-padding on the child because management div has a background colour */
  .common-saved-teams__team > div:last-child {
    padding-right: 1rem;
  }

  .common-saved-teams__team__details {
    flex: 1 1 auto;
    margin: 1rem 0;
  }
  .common-saved-teams__team__formation {
    flex: none;
  }

  .common-saved-teams__team__name {
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .common-saved-teams__team__brs {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }

  .common-saved-teams__team__manage {
    align-self: stretch;
    padding: 0.75rem 1rem;
    background: var(--c-black);
  }
</style>