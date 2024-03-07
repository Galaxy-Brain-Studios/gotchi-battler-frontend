import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import gotchisService from './gotchisService'

// Only fetch training gotchis once, and cache them
const { status: fetchGotchisStatus, setLoading } = useStatus()
const gotchis = ref(null)

const fetchGotchis = async function () {
  if (fetchGotchisStatus.value.loaded && gotchis.value) { return }

  const [isStale, setLoaded, setError] = setLoading()
  try {
    const result = await gotchisService.fetchTrainingGotchis()
    if (isStale()) { return; }
    gotchis.value = result
    setLoaded()
  } catch (e) {
    console.error('Error fetching training gotchis', e)
    setError(e.message)
  }
}

export default function useTrainingGotchis () {
  return {
    gotchis,
    fetchGotchis,
    fetchGotchisStatus
  }
}
