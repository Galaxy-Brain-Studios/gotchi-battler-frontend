import { ref } from 'vue'
import { defineStore } from 'pinia'
import useStatus from '../utils/useStatus'
import teamsService from './teamsService';

export const useTeamStore = function ({ teamId }) {
  return defineStore(`team__${teamId}`, () => {
    const team = ref(null);
    const { status: fetchStatus, setLoading } = useStatus()

    // immediately fetch the team
    async function fetchTeam(teamId) {
      if (fetchStatus.value.loaded || fetchStatus.value.loading) { return }
      const [isStale, setLoaded, setError] = setLoading()
      try {
        const result = await teamsService.fetchTeam(teamId)
        if (isStale()) { return; }
        team.value = result
        setLoaded()
      } catch (e) {
        setError(e.message)
      }
    }
    fetchTeam(teamId)

    return {
      team,
      fetchStatus
    }
  })
}