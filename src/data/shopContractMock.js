import { useAccountStore } from './accountStore'
import config from './mockContractConfig'

config.buyItem = {
  error: false,
  delayMs: 1000,
  pendingBuys: []
}

const buyItem = async function ({ itemId, amount }) {
  console.log('Mock buyItem', { itemId, amount })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (config.buyItem.error) {
        reject(new Error('Mock error calling buyItem'))
        return
      }
      // Store information about this buy so the mock server can detect it
      const store = useAccountStore()
      config.buyItem.pendingBuys.push({ itemId, amount, address: store.address })
      // Simulate a block number in the future
      resolve({ blockNumber: Date.now() + 1000 * 5 })
    }, config.buyItem.delayMs)
  })
}

export default {
  buyItem
}
