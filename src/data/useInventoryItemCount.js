import { ref, computed } from 'vue'
import useStatus from '../utils/useStatus'
import profileService from './profileService'

const MAX_ATTEMPTS = 10
const delay = millis => new Promise(resolve => setTimeout(resolve, millis));

/* Assume that the signed-in user and the itemId will remain the same */
/* If a purchaseTxId is provided, we first wait until the item purchase with that txId is found, then get the count */
export default function useInventoryItemCount ({ itemId, purchaseTxId }) {
  const requiredTxId = ref(purchaseTxId)
  const fetchedTxId = ref(null)
  const inventoryItemCount = ref(null)
  const { status: fetchInventoryItemCountStatus, setLoading: setCountLoading, reset: resetCountLoading } = useStatus()

  const fetchedPurchaseIsOk = computed(() => {
    // if there isn't a required purchase txId, we're good
    if (!requiredTxId.value) { return true }
    // we must have fetched the required purchase
    return fetchedTxId.value === requiredTxId.value
  })

  const fetchInventoryItemCount = async function () {
    if (fetchedPurchaseIsOk.value && fetchInventoryItemCountStatus.loaded) {
      // already got a valid count, no need to refetch
      return
    }

    const [isStale, setLoaded, setError] = setCountLoading()

    // First fetch the required purchase
    if (!fetchedPurchaseIsOk.value) {
      const txIdToFind = requiredTxId.value
      let attempt = 0
      while (!fetchedPurchaseIsOk.value && attempt < MAX_ATTEMPTS) {
        try {
          if (attempt > 0) {
            // pause between polls
            await delay(1000)
            if (isStale()) { return }
          }
          attempt++
          const result = await profileService.fetchItemPurchase(txIdToFind)
          if (isStale()) { return }
          if (result) { // if a result was returned, success
            fetchedTxId.value = txIdToFind
          }
        } catch (e) {
          if (isStale()) { return }
          console.error(e)
          setError('Error waiting for purchase update, try refreshing the page.')
          return
        }
      }
      if (attempt >= MAX_ATTEMPTS) {
        console.error('Too many attempts waiting for the purchase record, stopping.', txIdToFind)
        setError('Purchases may be slow to sync, try refreshing the page.')
        return
      }
    }

    // Ready to fetch the item count
    try {
      const result = await profileService.fetchProfileInventoryItemCount(itemId)
      if (isStale()) { return }
      inventoryItemCount.value = result.quantity
    } catch (e) {
      if (isStale()) { return }
      console.error(e)
      setError('Error fetching item count')
      return
    }

    setLoaded()
  }

  fetchInventoryItemCount()


  const setPurchaseTxId = function (purchaseTxId) {
    requiredTxId.value = purchaseTxId
    if (fetchedTxId.value !== purchaseTxId) {
      fetchedTxId.value = null
    }
    fetchInventoryItemCount()
  }

  return {
    inventoryItemCount,
    fetchInventoryItemCountStatus,
    setPurchaseTxId,
    resetCountLoading
  }
}
