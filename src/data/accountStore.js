import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { SiweMessage } from 'siwe';
import useStatus from '../utils/useStatus'
import { connectWallet, disconnectWallet, watchWallet, wagmiSignMessage } from './wagmi'
import { getAddress } from 'viem'
import gotchisService from './gotchisService'
import sessionService from './sessionService'

export const useAccountStore = defineStore('account', () => {
  const address = ref(null)
  const { status: connectStatus, setLoading: setConnecting, reset: resetConnected } = useStatus()

  const isConnected = computed(() => !!address.value)

  // Watch for events from user interaction directly with the wallet (outside the dapp)
  watchWallet(account => {
    // console.log("watchWallet trigger", account)
    if (!account.isConnected && address.value) {
      // user has disconnected, update our state
      // console.log('- disconnected')
      clearData()
    } else if (account.isConnected && address.value !== account.address?.toLowerCase()) {
      // user has just connected, or switched to a different wallet
      // console.log(' - different wallet')
      clearData()
      // eslint-disable-next-line no-unused-vars
      const [isStale, setConnected, setError] = setConnecting()
      address.value = account.address?.toLowerCase()
      setConnected()
    }
  })

  const fakeConnect = ref(false)

  async function connect () {
    const [isStale, setConnected, setError] = setConnecting()

    if (fakeConnect.value) {
      setTimeout(() => {
        address.value = fakeConnect.value.toLowerCase()
        setConnected()
      }, 500)
      return
    }

    try {
      await connectWallet()
      // the watchWallet handler will update the stored address
    } catch (e) {
      if (isStale()) { return }
      console.error('Error connecting wallet', e)
      setError('Error connecting wallet')
    }
  }

  // siwe login:
  // 1. fetch nonce from server
  // 2. construct message using nonce
  // 3. get user to sign message
  // 4. submit signature to server to set up session
  const signedSession = ref(null)

  const scheme = window.location.protocol.slice(0, -1);
  const domain = window.location.host;
  function createSiweMessage (address, nonce, displayMessage) {
    const message = new SiweMessage({
        scheme,
        domain,
        address,
        displayMessage,
        uri: origin,
        version: '1',
        chainId: '1',
        nonce,
    });
    return message.prepareMessage();
  }

  const { setLoading: setSigningIn, reset: resetSigningIn } = useStatus()
  async function signIntoSession () {
    if (!isConnected.value) {
      throw new Error('Wallet is not connected')
    }

    const [isStale, setLoaded] = setSigningIn()
    // Fetch session nonce
    const nonce = await sessionService.fetchSessionNonce()
    if (isStale()) { throw new Error('Login cancelled') }
    // Ask user to sign message
    const addressChecksummed = getAddress(address.value)
    const message = createSiweMessage(addressChecksummed, nonce, 'Sign in with Ethereum to the app.')
    const signature = await signMessage({ message })
    if (isStale()) { throw new Error('Login cancelled') }
    // Submit signed message to server to initialize session
    await sessionService.login({ message, signature })
    if (isStale()) { throw new Error('Login cancelled') }
    // Server session is set up, we're signed in
    signedSession.value = nonce
    setLoaded()
  }

  function clearData () {
    resetConnected()
    address.value = null
    myGotchis.value = []
    signedSession.value = null
    resetMyGotchisFetchStatus()
  }

  async function disconnect () {
    resetSigningIn() // if a sign-in was in progress, abort it
    await disconnectWallet()
    if (signedSession.value) {
      sessionService.logout() // clear server-side session: no need to wait for the request to complete
    }
    clearData()
  }

  const myGotchis = ref([]);
  const { status: myGotchisFetchStatus, setLoading: setMyGotchisLoading, reset: resetMyGotchisFetchStatus } = useStatus()

  async function fetchMyGotchis () {
    if (!address.value) { return }
    // only fetch gotchis once
    if (myGotchisFetchStatus.value.loaded || myGotchisFetchStatus.value.loading) { return; }
    const [isStale, setLoaded, setError] = setMyGotchisLoading()
    try {
      const result = await gotchisService.fetchGotchis({ address: address.value })
      if (isStale()) { return; }
      myGotchis.value = result
      setLoaded()
    } catch (e) {
      setError(e.message)
    }
  }

  async function signMessage ({ message }) {
    if (fakeConnect.value) {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve('mockSignature:' + message)
        }, 500)
      })
    }
    return wagmiSignMessage(...arguments)
  }

  return {
    fakeConnect,
    isConnected,
    address,
    connect,
    connectStatus,
    disconnect,
    myGotchis,
    fetchMyGotchis,
    myGotchisFetchStatus,
    signMessage,
    signedSession,
    signIntoSession
  }
})

export const getSignedSession = async function(forceRetry) {
  const accountStore = useAccountStore()
  if (!accountStore.signedSession || forceRetry) {
    try {
      await accountStore.signIntoSession()
    } catch (e) {
      console.error('signIntoSession error', e)
      throw new Error('Could not sign in: ' + e.message)
    }
  }
  return {
    address: accountStore.address,
    signedSession: accountStore.signedSession
  }
}
