import { ref, watch } from 'vue'
import { DEV_MODE } from '../appEnv'
import useStatus from '../utils/useStatus'
import shopService from './shopService'
import erc20Contract from './erc20Contract'
import erc20ContractMock from './erc20ContractMock'
import shopContract from './shopContract'
import shopContractMock from './shopContractMock'
import { GHST_TOKEN_ADDRESS } from './erc20Constants'

const getErc20Contract = function () {
  if (DEV_MODE) {
    return window.mockContractConfig?.enable ? erc20ContractMock : erc20Contract
  } else {
    return erc20Contract
  }
}
const getShopContract = function () {
  if (DEV_MODE) {
    return window.mockContractConfig?.enable ? shopContractMock : shopContract
  } else {
    return shopContract
  }
}

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

// A helper which can be used like "await fetchedItems()"
const fetchedItems = async function () {
  const status = fetchItemsStatus.value
  if (status.loaded) { return items.value }
  if (status.error) { throw new Error(status.errorMessage)}
  if (!status.loading) {
    fetchItems()
  }
  if (status.loading) {
    return new Promise((resolve, reject) => {
      const unwatch = watch(
        () => ({
          loaded: fetchItemsStatus.value.loaded,
          error: fetchItemsStatus.value.error
        }),
        () => {
          if (fetchItemsStatus.value.loaded) {
            unwatch()
            resolve(items.value)
          }
          if (fetchItemsStatus.value.error) {
            unwatch()
            reject(fetchItemsStatus.value.errorMessage)
          }
        }
      )
    })
  }
  throw new Error('unexpected state in fetchedItems')
}

// returns bigint
const getGhstAllowance = async function (ownerAddress) {
  return getErc20Contract().getTokenAllowance({
    tokenAddress: GHST_TOKEN_ADDRESS,
    ownerAddress,
    allowedSpenderAddress: shopContract.getAddress()
  })
}

const approveGhst = async function (amountBigint) {
  return getErc20Contract().approveToken({
    tokenAddress: GHST_TOKEN_ADDRESS,
    allowedSpenderAddress: shopContract.getAddress(),
    amountBigint
  })
}

const buyItem = async function ({ itemId, quantity }) {
  return getShopContract().buyItem({
    itemId,
    quantity
  })
}

export default function useShop () {

  if (!fetchItemsStatus.value.loaded && !fetchItemsStatus.value.loading) {
    fetchItems()
  }

  return {
    items, 
    fetchItemsStatus,
    getGhstAllowance,
    approveGhst,
    buyItem
  }
}

// for usage 'await fetchedItems()'
export { fetchedItems }
