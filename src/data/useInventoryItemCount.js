import { ref, computed } from 'vue'
import useStatus from '../utils/useStatus'
import profileService from './profileService'

const MAX_ATTEMPTS = 10
const delay = millis => new Promise(resolve => setTimeout(resolve, millis));

/* Assume that the signed-in user and the itemId will remain the same */
export default function useInventoryItemCount ({ itemId, blockNumber }) {
  const requiredBlockNumber = ref(blockNumber)
  const fetchedBlockNumber = ref(null)
  const inventoryItemCount = ref(null)
  const { status: fetchInventoryItemCountStatus, setLoading: setCountLoading, reset: resetCountLoading } = useStatus()

  const fetchedBlockNumberIsOk = computed(() => {
    // we must have a fetched block number
    if (!(fetchedBlockNumber.value > 0)) { return false }
    // if there isn't a valid required block number, we're good
    if (!requiredBlockNumber.value || requiredBlockNumber.value < 0) { return true }
    // the fetched block number must be at or after the required block number
    return fetchedBlockNumber.value >= requiredBlockNumber.value
  })

  const fetchInventoryItemCount = async function () {
    if (fetchedBlockNumberIsOk.value) { return }

    const [isStale, setLoaded, setError] = setCountLoading()
    let attempt = 0
    while (!fetchedBlockNumberIsOk.value && attempt < MAX_ATTEMPTS) {
      try {
        if (attempt > 0) {
          // pause between polls
          await delay(1000)
          if (isStale()) { return }
        }
        attempt++
        const result = await profileService.fetchProfileInventoryItemCount(itemId)
        if (isStale()) { return }
        inventoryItemCount.value = result.count
        fetchedBlockNumber.value = result.blockNumber
      } catch (e) {
        if (isStale()) { return }
        console.error(e)
        setError('Error getting item count')
        return
      }
    }
    if (attempt >= MAX_ATTEMPTS) {
      console.error('Too many attempts getting the item count, stopping.')
      setError('Item count may be slow to sync, try refreshing the page.')
    } else {
      setLoaded()
    }
  }

  fetchInventoryItemCount()


  const setBlockNumber = function (blockNumber) {
    requiredBlockNumber.value = blockNumber
    fetchInventoryItemCount()
  }

  return {
    inventoryItemCount,
    fetchInventoryItemCountStatus,
    setBlockNumber,
    resetCountLoading
  }
}
