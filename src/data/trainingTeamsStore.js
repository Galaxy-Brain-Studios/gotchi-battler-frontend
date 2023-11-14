import { ref } from 'vue'
import { defineStore } from 'pinia'
import useStatus from '../utils/useStatus'
import teamsService from './teamsService';

export const useTrainingTeamsStore = defineStore('trainingTeams', () => {
  const teams = ref([]);
  const { status: fetchStatus, setLoading } = useStatus()

  async function fetchTeams () {
    // only fetch teams once
    if (fetchStatus.value.loaded || fetchStatus.value.loading) { return; }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await teamsService.fetchTrainingTeams()
      if (isStale()) { return; }
      teams.value = result
      setLoaded()
    } catch (e) {
      setError(e.message)
    }
  }

  fetchTeams()

  return { teams, fetchStatus }
})
