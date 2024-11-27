<script setup>
  import { computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useProfile from '@/data/useProfile'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import CommonSavedTeamsList from './CommonSavedTeamsList.vue'

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
    },
    showTeamCount: {
      type: Boolean,
      default: false
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
                    specialId,
                    // copy any item across to the gotchi from the saved team (item not validated here)
                    itemId: teamGotchi.itemId || null,
                    item: teamGotchi.item || null
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
    <CommonSavedTeamsList
      v-else-if="fetchStatus.loaded"
      :teams="availableTeams"
      :unavailableGotchiIds="unavailableGotchiIds"
      :showTeamCount="showTeamCount"
    >
      <template #actions="slotProps">
        <slot
          name="actions"
          v-bind="slotProps"
        />
      </template>
    </CommonSavedTeamsList>
  </SiteRequireSignIn>
</template>

<style scoped>
</style>
