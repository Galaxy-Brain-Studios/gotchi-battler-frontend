import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import statsService from './statsService'

export default function useStats () {
  const stats = ref(null)
  const { status: fetchStatsStatus,setLoading } = useStatus()

  const fetchStats = async function () {
    stats.value = null
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await statsService.fetchStats()
      if (isStale()) { return; }
      stats.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching stats', e)
      setError(e.message)
    }
  }

  fetchStats()

  return {
    fetchStatsStatus,
    stats
  }
}
