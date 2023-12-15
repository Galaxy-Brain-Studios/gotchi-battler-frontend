import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import tournamentsService from './tournamentsService'

export default function useTournamentGotchis () {
  const gotchis = ref(null)
  const { status: fetchGotchisStatus, setLoading } = useStatus()

  const fetchGotchis = async function (tournamentId) {
    if (!tournamentId) {
      console.error('Provide a tournamentId to fetchGotchis')
      return
    }
    gotchis.value = null
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await tournamentsService.fetchTournamentGotchis({ tournamentId })
      if (isStale()) { return; }
      gotchis.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching gotchis for tournament', { tournamentId }, e)
      setError(e.message)
    }
  }

  return {
    gotchis,
    fetchGotchis,
    fetchGotchisStatus
  }
}
