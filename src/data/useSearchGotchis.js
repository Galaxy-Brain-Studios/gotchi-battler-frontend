import debounce from 'lodash.debounce'
import { ref, watch } from 'vue'
import useStatus from '../utils/useStatus'
import gotchisService from './gotchisService'

export default function useSearchGotchis () {
  const query = ref('')
  const debouncedQuery = ref('')
  function setQuery () {
    debouncedQuery.value = query.value
  }
  const debouncedSetQuery = debounce(setQuery, 400)
  watch(
    () => query.value,
    debouncedSetQuery
  )

  const gotchis = ref(null)
  const { status: fetchGotchisStatus, setLoading, reset } = useStatus()

  const fetchGotchis = async function () {
    gotchis.value = null
    if (!query.value) {
      reset()
      return
    }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await gotchisService.searchGotchis(query.value)
      if (isStale()) { return; }
      gotchis.value = result
      setLoaded()
    } catch (e) {
      console.error('Error searching for gotchis', { query: query.value }, e)
      setError(e.message)
    }
  }

  watch(
    () => debouncedQuery.value,
    fetchGotchis
  )

  return {
    query,
    gotchis,
    fetchGotchisStatus
  }
}
