import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import shopService from './shopService'
import { getTokenAllowance, approveToken } from './wagmi'

// TODO test with a different token
const GHST_TOKEN_ADDRESS = '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7'
// TODO set this when we have a shop contract, and a test contract
// const SHOP_CONTRACT_ADDRESS = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'
// const SHOP_CONTRACT_ADDRESS = '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7' // 0 GHST
// const SHOP_CONTRACT_ADDRESS = '0x11111112542D85B3EF69AE05771c2dCCff4fAa26' // 4 GHST
const SHOP_CONTRACT_ADDRESS = '0x111111125421ca6dc452d289314280a0f8842a65' // 70.x GHST  - recent
// const SHOP_CONTRACT_ADDRESS = '0xD5543237C656f25EEA69f1E247b8Fa59ba353306' // unlimited GHST

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

const getGhstAllowance = async function (ownerAddress) {
  return getTokenAllowance({
    tokenAddress: GHST_TOKEN_ADDRESS,
    ownerAddress,
    allowedSpenderAddress: SHOP_CONTRACT_ADDRESS
  })
}

const approveGhst = async function (amountBigint) {
  return approveToken({
    tokenAddress: GHST_TOKEN_ADDRESS,
    allowedSpenderAddress: SHOP_CONTRACT_ADDRESS,
    amountBigint
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
    approveGhst
  }
}
