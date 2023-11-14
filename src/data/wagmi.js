import { configureChains, createConfig, connect, disconnect, watchAccount, signMessage } from '@wagmi/core'
import { polygon } from '@wagmi/core/chains'
import { publicProvider } from '@wagmi/core/providers/public'
import { InjectedConnector } from '@wagmi/core/connectors/injected'

const chains = [polygon]
const providers = [
  // TODO recommended to provide alchemyProvider or infuraProvider as well as public https://wagmi.sh/core/providers/configuring-chains
  publicProvider()
]
const { publicClient, webSocketPublicClient } = configureChains(
  chains,
  providers,
)

// To make autoConnect work, need to provide connectors in createConfig https://github.com/wagmi-dev/wagmi/issues/2511#issuecomment-1594611243
const connectors = [new InjectedConnector()] // TODO test other wallets

createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors
})

const connectWallet = async function () {
  const { account } = await connect({
    connector: connectors[0]
  })
  return account
}

const disconnectWallet = disconnect
const watchWallet = watchAccount

export {
  connectWallet,
  disconnectWallet,
  watchWallet,
  signMessage,
}