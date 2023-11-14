import { ref } from 'vue'
import orderBy from 'lodash.orderby'
import { defineStore } from 'pinia'
import useStatus from '../utils/useStatus'
import tournamentsService from './tournamentsService';

export const useTournamentsStore = defineStore('tournaments', () => {
  const tournaments = ref([]);
  const { status: fetchStatus, setLoading } = useStatus()

  async function fetchTournaments () {
    // only fetch tournaments once
    if (fetchStatus.value.loaded || fetchStatus.value.loading) { return; }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await tournamentsService.fetchTournaments()
      if (isStale()) { return; }
      tournaments.value = orderBy(result, ['startDate'], ['desc'])
      setLoaded()
    } catch (e) {
      setError(e.message)
    }
  }

  return { tournaments, fetchTournaments, fetchStatus }
})
