<script setup>
  import orderBy from 'lodash.orderby'
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useTrainingTeamsStore } from '@/data/trainingTeamsStore'
  import CommonSavedTeamsList from '../profile/CommonSavedTeamsList.vue'
  import DIFFICULTIES from '@/data/trainingTeamDifficulties.json'

  // Fetch training teams
  const store = useTrainingTeamsStore()
  const { teams, fetchStatus } = storeToRefs(store)

  // sort them by difficulty
  const orderedTeams = computed(() => {
    if (!teams.value) { return [] }
    return orderBy(teams.value, [team => DIFFICULTIES.indexOf(team.difficulty)], ['asc'])
  })
</script>

<template>
  <div v-if="fetchStatus.loading">
    Loading...
  </div>
  <div v-if="fetchStatus.error">
    {{ fetchStatus.errorMessage }}
  </div>
  <CommonSavedTeamsList
    v-else-if="fetchStatus.loaded"
    :teams="orderedTeams"
  >
    <template #actions="slotProps">
      <slot
        name="actions"
        v-bind="slotProps"
      />
    </template>
  </CommonSavedTeamsList>
</template>
