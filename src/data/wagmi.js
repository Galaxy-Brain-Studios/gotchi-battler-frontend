import { createConfig, reconnect, connect, disconnect, watchAccount, signMessage, readContract, writeContract, waitForTransactionReceipt } from '@wagmi/core'
import { http } from 'viem'
import { polygon } from '@wagmi/core/chains'
import { injected } from '@wagmi/connectors'

const chains = [polygon]
const connectors = [injected()]

const config = createConfig({
  chains,
  connectors,
  transports: {
    [polygon.id]: http()
  }
})

reconnect(config)

const connectWallet = async function () {
  const { accounts } = await connect(config, { connector: connectors[0] })
  return accounts[0]
}

const disconnectWallet = async function () {
  return await disconnect(config)
}
const watchWallet = function (onChange) {
  return watchAccount(config, { onChange })
}
const wagmiSignMessage = async function ({ message }) {
  return await signMessage(config, { message })
}

const getKnownErrorMessage = function (error) {
  let messages = `${error.shortMessage} ${error.message}`
  if (messages.includes('does not match the target chain') || messages.includes("does not match the connection's chain")) {
    return new Error('Please connect to Polygon')
  }
  if (messages.includes('User rejected the request')) {
    return new Error('Request rejected by user')
  }
  if (messages.includes('reverted with the following reason') && messages.includes('Contract Call')) {
    const detail = messages.match(/reverted with the following reason:\s*(.*)\s*Contract Call/)[1]
    if (detail) {
      return new Error(detail)
    }
  }
  console.error('Error submitting transaction', error)
  return new Error('Error submitting transaction', { cause: error })
}

const wagmiReadContract = async function (options) {
  return await readContract(config, options);
}

const submitTx = async function(options) {
  try {
    const hash = await writeContract(config, {
      ...options,
      chainId: polygon.id
    })
    console.log('tx submitted', hash)
    const receipt = await waitForTransactionReceipt(config, { hash })
    console.log('tx receipt', receipt) // { transactionHash, status: 'success', blockNumber, blockHash }
    if (receipt?.status !== 'success') {
      console.error(`tx failed`, receipt)
      throw new Error('Transaction failed')
    }
    return receipt
  } catch (e) {
    throw getKnownErrorMessage(e)
  }
}

export {
  config,
  connectWallet,
  disconnectWallet,
  watchWallet,
  wagmiSignMessage,
  wagmiReadContract,
  submitTx
}
