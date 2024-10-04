import { createConfig, reconnect, connect, disconnect, watchAccount, signMessage, readContract, writeContract, waitForTransactionReceipt, getChainId } from '@wagmi/core'
import { http } from 'viem'
import { polygon } from '@wagmi/core/chains'
import { injected } from '@wagmi/connectors'
import erc20abi from './erc20abi'

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

const getTokenAllowance = async function ({ tokenAddress, ownerAddress, allowedSpenderAddress }) {
  const result = await readContract(config, {
    address: tokenAddress,
    abi: erc20abi,
    functionName: "allowance",
    args: [ownerAddress, allowedSpenderAddress],
  });
  // console.log('getTokenAllowance', result, typeof result)
  return result
}

const approveToken = async function ({ tokenAddress, allowedSpenderAddress, amountBigint }) {
  const hash = await writeContract(config, {
    address: tokenAddress,
    abi: erc20abi,
    functionName: "approve",
    args: [allowedSpenderAddress, amountBigint],
    chainId: polygon.id
  });
  console.log('approveToken tx submitted', hash)
  const txReceipt = await waitForTransactionReceipt(config, {
    hash
  })
  console.log('approveToken tx receipt', txReceipt) // { blockNumber, blockHash, transactionHash, status: 'success' }
  if (txReceipt?.status !== 'success') {
    throw new Error('Approve transaction failed')
  }
  return txReceipt
}

export {
  config,
  connectWallet,
  disconnectWallet,
  watchWallet,
  wagmiSignMessage,
  getTokenAllowance,
  approveToken
}