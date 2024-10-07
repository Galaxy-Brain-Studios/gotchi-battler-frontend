import { ref } from 'vue'
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

// TODO test with a test-shop-contract plus a dummy token (fake GHST)
// const SHOP_CONTRACT_ADDRESS = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'
// const SHOP_CONTRACT_ADDRESS = '0x385Eeac5cB85A38A9a07A70c73e0a3271CfB54A7' // 0 GHST
// const SHOP_CONTRACT_ADDRESS = '0x11111112542D85B3EF69AE05771c2dCCff4fAa26' // 4 GHST
const SHOP_CONTRACT_ADDRESS = '0x111111125421ca6dc452d289314280a0f8842a65' // 150 GHST  - recent
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

// returns bigint
const getGhstAllowance = async function (ownerAddress) {
  return getErc20Contract().getTokenAllowance({
    tokenAddress: GHST_TOKEN_ADDRESS,
    ownerAddress,
    allowedSpenderAddress: SHOP_CONTRACT_ADDRESS
  })
}

const approveGhst = async function (amountBigint) {
  return getErc20Contract().approveToken({
    tokenAddress: GHST_TOKEN_ADDRESS,
    allowedSpenderAddress: SHOP_CONTRACT_ADDRESS,
    amountBigint
  })
}

const buyItem = async function ({ itemId, amount }) {
  return getShopContract().buyItem({
    itemId,
    amount
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
