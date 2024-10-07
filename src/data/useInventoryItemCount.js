import { ref, watch, nextTick } from 'vue'
import useStatus from '../utils/useStatus'
import profileService from './profileService'

export default function useInventoryItemCount () {
  const fetchedAddress = ref(null)
  const fetchedItemId = ref(null)
  const fetchedBlock = ref(null)
  const inventoryItemCount = ref(null)
  const { status: fetchInventoryItemCountStatus, setLoading: setCountLoading, reset: resetCountLoading } = useStatus()

  const fetchInventoryItemCount = async function ({ address, itemId }) {
    fetchedAddress.value = address
    fetchedItemId.value = itemId
    fetchedBlock.value = null
    inventoryItemCount.value = null
    await nextTick() // changing fetchedAddress/fetchedItemId will reset status objects
    const [isStale, setLoaded, setError] = setCountLoading()
    try {
      const result = await profileService.fetchProfileInventoryItemCount({ address, itemId })
      if (isStale()) { return; }
      inventoryItemCount.value = result.count
      fetchedBlock.value = result.blockNumber
      setLoaded()
    } catch (e) {
      console.error('Error fetching profile inventory item', e)
      setError(e.message)
    }
  }

  const { status: refreshInventoryItemCountStatus, setLoading: setRefreshing, reset: resetRefreshing } = useStatus()
  const refreshCountToBlock = async function (blockNumber) {
    if (!fetchedAddress.value || !fetchedItemId.value) { return }
    if (fetchedBlock.value >= blockNumber) { return }

    const address = fetchedAddress.value
    const itemId = fetchedItemId.value
    const [isStale, setLoaded, setError] = setRefreshing()
    const maxAttempts = 10
    let attempt = 0
    const delay = millis => new Promise(resolve => setTimeout(resolve, millis));
    while (fetchedBlock.value && (fetchedBlock.value < blockNumber) && attempt < maxAttempts) {
      try {
        attempt++
        const result = await profileService.fetchProfileInventoryItemCount({ address, itemId })
        if (isStale()) { return }
        inventoryItemCount.value = result.count
        fetchedBlock.value = result.blockNumber
        // pause between polls
        await delay(1000)
        if (isStale()) { return }
      } catch (e) {
        console.error(e)
        setError('Error refreshing item count')
        return
      }
    }
    if (attempt >= maxAttempts) {
      console.error('Too many attempts refreshing the item count, stopping.')
      setError('Item count may be slow to sync, try refreshing the page.')
    } else {
      console.log('refreshed count')
      setLoaded()
    }
  }

  watch(
    () => [fetchedAddress.value, fetchedItemId.value],
    () => {
      resetCountLoading()
      resetRefreshing()
    }
  )

  return {
    inventoryItemCount,
    fetchInventoryItemCount,
    fetchInventoryItemCountStatus,
    refreshCountToBlock,
    refreshInventoryItemCountStatus
  }
}
