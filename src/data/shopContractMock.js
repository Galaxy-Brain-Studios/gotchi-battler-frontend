import { useAccountStore } from './accountStore'
import config from './mockContractConfig'

config.buyItem = {
  error: false,
  delayMs: 1000,
  pendingBuys: []
}

const buyItem = async function ({ itemId, quantity }) {
  console.log('Mock buyItem', { itemId, quantity })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (config.buyItem.error) {
        reject(new Error('Mock error calling buyItem'))
        return
      }
      // Store information about this buy so the mock server can detect it
      const store = useAccountStore()
      // simulate a tx in the future
      const txId = Math.random() + ''
      const confirmDate = Date.now() + 1000 * 5
      config.buyItem.pendingBuys.push({ itemId, quantity, address: store.address, txId, confirmDate })
      resolve({ txId })
    }, config.buyItem.delayMs)
  })
}

export default {
  buyItem
}
