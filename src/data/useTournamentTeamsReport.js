import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import tournamentsService from './tournamentsService'

export default function useTournamentTeamsReport () {
  const teams = ref(null)
  const { status: fetchTeamsStatus, setLoading } = useStatus()

  const fetchTeams = async function (tournamentId) {
    teams.value = null
    if (!tournamentId) {
      console.error('Provide a tournamentId to fetchTeams')
      return
    }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await tournamentsService.fetchTournamentTeamsReport({ tournamentId })
      if (isStale()) { return; }
      teams.value = (result || []).map(team => ({
        ...team,
        owner: team.owner?.toLowerCase() || ''
      }))
      setLoaded()
    } catch (e) {
      console.error('Error fetching teams report for tournament', { tournamentId }, e)
      setError(e.message)
    }
  }

  return {
    teams,
    fetchTeams,
    fetchTeamsStatus
  }
}
