import config from './mockContractConfig'
import { GHST_MULTIPLIER_BIGINT } from './erc20Constants'

config.getTokenAllowance = {
  error: false,
  delayMs: 1000,
  allowance: 1n * GHST_MULTIPLIER_BIGINT
}
config.approveToken = {
  error: false,
  delayMs: 1000,
  setToZero: false
}

const getTokenAllowance = async function ({ tokenAddress, ownerAddress, allowedSpenderAddress }) {
  console.log('Mock getTokenAllowance', { tokenAddress, ownerAddress, allowedSpenderAddress })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (config.getTokenAllowance.error) {
        reject(new Error('Mock error calling getTokenAllowance'))
        return
      }
      resolve(config.getTokenAllowance.allowance)
    }, config.getTokenAllowance.delayMs)
  })
}

const approveToken = async function ({ tokenAddress, allowedSpenderAddress, amountBigint }) {
  console.log('Mock approveToken', { tokenAddress, allowedSpenderAddress, amountBigint })
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (config.approveToken.error) {
        reject(new Error('Mock error calling approveToken'))
        return
      }
      // save the approved allowance for future getTokenAllowance calls
      if (config.approveToken.setToZero) {
        config.getTokenAllowance.allowance = 0n
      } else {
        config.getTokenAllowance.allowance = amountBigint
      }
      resolve()
    }, config.approveToken.delayMs)
  })
}

export default {
  getTokenAllowance,
  approveToken
}
