import { DEV_MODE, SHOP_CONTRACT_ADDRESS } from '../appEnv'
import { submitTx } from './wagmi'
import shopContractAbi from './shopContractAbi.json'

const POLYGON_TEST_CONTRACT_ADDRESS = '0x4bA7DF6154f0Da58f0f3dAc0aE5Add1d59F2deF5' // Polygon Test contract
const POLYGON_PROD_CONTRACT_ADDRESS = '0x90196f04f86c879fbB5C8b44CE8D3943E73eCc58' // TODO Polygon Prod contract

// The shop contract address can be set by an env variable (top priority)
// otherwise it is set based on DEV_MODE, and in dev mode can also be changed at runtime through the DevPage.
let address = SHOP_CONTRACT_ADDRESS || (DEV_MODE ? POLYGON_TEST_CONTRACT_ADDRESS : POLYGON_PROD_CONTRACT_ADDRESS)
const getAddress = function () { return address }
const setAddressInDevMode = function (newAddress) {
  if (DEV_MODE) {
    address = newAddress
  }
}

const buyItem = async function ({ itemId, quantity }) {
  console.log('contract buyItem', { itemId, quantity, address })
  const receipt = await submitTx({
    address,
    abi: shopContractAbi,
    functionName: "buyItems",
    args: [BigInt(itemId), BigInt(quantity)]
  })
  console.log('contract buyItem submitted', receipt)
  return {
    txId: receipt.transactionHash
  }
}

export default {
  getAddress,
  POLYGON_TEST_CONTRACT_ADDRESS,
  POLYGON_PROD_CONTRACT_ADDRESS,
  setAddressInDevMode,
  buyItem
}
