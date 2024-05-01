import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import lendingsService from './lendingsService'

export default function useGotchiLendings (tournamentId) {
  const gotchis = ref(null)
  const { status: fetchGotchisStatus, setLoading } = useStatus()

  const fetchGotchis = async function () {
    gotchis.value = null
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await lendingsService.fetchAvailableGotchis(tournamentId)
      if (isStale()) { return; }
      gotchis.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching gotchi lendings', e)
      setError(e.message)
    }
  }

  return {
    gotchis,
    fetchGotchis,
    fetchGotchisStatus
  }
}
