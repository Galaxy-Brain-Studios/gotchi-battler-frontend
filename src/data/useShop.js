import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import shopService from './shopService'

const items = ref(null)
const { status: fetchItemsStatus, setLoading } = useStatus()

const fetchItems = async function () {
  items.value = null
  const [isStale, setLoaded, setError] = setLoading()
  try {
    const result = await shopService.fetchItems()
    if (isStale()) { return; }
    items.value = result
    setLoaded()
  } catch (e) {
    console.error('Error fetching shop items', e)
    setError(e.message)
  }
}

export default function useShop () {

  if (!fetchItemsStatus.value.loaded && !fetchItemsStatus.value.loading) {
    fetchItems()
  }

  return {
    items, 
    fetchItemsStatus
  }
}
