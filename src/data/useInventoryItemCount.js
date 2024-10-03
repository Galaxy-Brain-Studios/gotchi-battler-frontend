import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import profileService from './profileService'

export default function useInventoryItemCount () {
  const inventoryItemCount = ref(null)
  const { status: fetchInventoryItemCountStatus, setLoading: setCountLoading } = useStatus()
  const fetchInventoryItemCount = async function ({ address, itemId }) {
    inventoryItemCount.value = null
    const [isStale, setLoaded, setError] = setCountLoading()
    try {
      const result = await profileService.fetchProfileInventoryItemCount({ address, itemId })
      if (isStale()) { return; }
      inventoryItemCount.value = result.count
      setLoaded()
    } catch (e) {
      console.error('Error fetching profile inventory item', e)
      setError(e.message)
    }
  }

  return {
    inventoryItemCount,
    fetchInventoryItemCount,
    fetchInventoryItemCountStatus
  }
}
