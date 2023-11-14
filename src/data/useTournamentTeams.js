import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import tournamentsService from './tournamentsService'

export default function useTournamentTeams () {
  const teams = ref(null)
  const { setLoading } = useStatus()

  const fetchTeams = async function (tournamentId) {
    if (!tournamentId) {
      console.error('Provide a tournamentId to fetchTeams')
      return
    }
    teams.value = null
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await tournamentsService.fetchTournamentTeams({ tournamentId })
      if (isStale()) { return; }
      teams.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching teams for tournament', { tournamentId }, e)
      setError(e.message)
    }
  }

  return {
    teams,
    fetchTeams
  }
}
