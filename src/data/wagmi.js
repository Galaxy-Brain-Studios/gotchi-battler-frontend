import { createConfig, reconnect, connect, disconnect, watchAccount, signMessage } from '@wagmi/core'
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

export {
  config,
  connectWallet,
  disconnectWallet,
  watchWallet,
  wagmiSignMessage,
}