import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import tournamentPrizeSetsService from './tournamentPrizeSetsService'


const prizeSets = ref(null)
const { status: fetchPrizeSetsStatus, setLoading } = useStatus()

const fetchPrizeSets = async function () {
  prizeSets.value = null
  const [isStale, setLoaded, setError] = setLoading()
  try {
    const result = await tournamentPrizeSetsService.fetchPrizeSets()
    if (isStale()) { return; }
    prizeSets.value = result
    setLoaded()
  } catch (e) {
    console.error('Error fetching tournament prize sets', e)
    setError(e.message)
  }
}

export default function useTournamentPrizeSets () {

  if (!fetchPrizeSetsStatus.value.loaded && !fetchPrizeSetsStatus.value.loading) {
    fetchPrizeSets()
  }

  return {
    prizeSets,
    fetchPrizeSetsStatus
  }
}
