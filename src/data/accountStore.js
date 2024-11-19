import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { SiweMessage } from 'siwe';
import { DEV_MODE } from '../appEnv'
import useStatus from '../utils/useStatus'
import { connectWallet, disconnectWallet, watchWallet, wagmiSignMessage } from './wagmi'
import { getAddress } from 'viem'
import gotchisService from './gotchisService'
import sessionService from './sessionService'

const ENABLE_SESSION_LOGS = !!DEV_MODE
const logSessionEvent = ENABLE_SESSION_LOGS ? console.log : () => {}

export const useAccountStore = defineStore('account', () => {
  const address = ref(null)
  const { status: connectStatus, setLoading: setConnecting, reset: resetConnected } = useStatus()

  const isConnected = computed(() => !!address.value)

  // Watch for events from user interaction directly with the wallet (outside the dapp)
  watchWallet(account => {
    logSessionEvent("watchWallet trigger", { address: account.address, isConnected: account.isConnected, account })
    if (!account.isConnected && address.value) {
      // user has disconnected, update our state
      logSessionEvent('- disconnected - logout server session')
      logoutServerSession()
      logSessionEvent('- disconnected - clear data')
      clearData()
    } else if (account.isConnected && address.value !== account.address?.toLowerCase()) {
      // user has just connected, or switched to a different wallet
      logSessionEvent(' - connected, or switched to different wallet - clear data')
      clearData()
      logSessionEvent(' - connected, or switched to different wallet - set connected address to', account.address?.toLowerCase())
      // eslint-disable-next-line no-unused-vars
      const [isStale, setConnected, setError] = setConnecting()
      address.value = account.address?.toLowerCase()
      setConnected()
      logSessionEvent(' - connected, or switched to different wallet - resume or logout server session')
      resumeOrLogoutServerSession()
    }
  })

  const fakeConnect = ref(false)

  async function connect () {
    logSessionEvent('session: connect')
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
      logSessionEvent('session: connect - success')
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

  const { status: signingInStatus, setLoading: setSigningIn, reset: resetSigningIn } = useStatus()
  async function signIntoSession () {
    logSessionEvent('session: sign in')
    if (!isConnected.value) {
      throw new Error('Wallet is not connected')
    }

    const [isStale, setLoaded, setError] = setSigningIn()
    try {
      // Fetch session nonce
      const nonce = await sessionService.fetchSessionNonce()
      logSessionEvent('session: sign in - fetched nonce')
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
      signedSession.value = address.value
      logSessionEvent('session: sign in - success', signedSession.value)
      setLoaded()
    } catch (e) {
      setError(e.message)
      throw e
    }
  }

  function clearData () {
    logSessionEvent('session: clearData - clear connection and local data')
    resetConnected()
    resetSigningIn()
    address.value = null
    myGotchis.value = []
    signedSession.value = null
    resetMyGotchisFetchStatus()
  }

  function logoutServerSession () {
    // clear server-side session: no need to wait for the request to complete
    logSessionEvent('session: logoutServerSession')
    sessionService.logout()
  }

  async function resumeOrLogoutServerSession () {
    logSessionEvent('session: resumeOrLogoutServerSession', address.value)
    // test existence of current session by trying to fetch profile
    const user = await sessionService.fetchSessionUser()
    logSessionEvent('Fetched', { user })
    // If there is no server session, nothing more to do.
    if (!user?.address) {
      logSessionEvent('session: resumeOrLogoutServerSession - no existing session')
      return
    }
    if (address.value) {
      if (user?.address === address.value) {
        // If the connected address matches the current server session, keep/resume it
        logSessionEvent('session: resumeOrLogoutServerSession - resume existing session for address', address.value)
        // eslint-disable-next-line no-unused-vars
        const [isStale, setLoaded, setError] = setSigningIn()
        signedSession.value = address.value
        setLoaded()
      } else {
        // If there is a mismatching server session, logout.
        logSessionEvent('session: resumeOrLogoutServerSession - existing session but for different address, so log out', { connected: address.value, session: user?.address })
        logoutServerSession()
      }
    }
  }

  async function disconnect () {
    logSessionEvent('session: disconnect')
    resetSigningIn() // if a sign-in was in progress, abort it
    logSessionEvent('session: disconnect - disconnect wallet')
    await disconnectWallet()
    // watchWallet should handle server logout and clearData
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
    signedSession,
    signIntoSession,
    signingInStatus
  }
})

const getSignedSession = async function(forceRetry) {
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

export const requireLoginSession = function (doRequest) {
  return async (...args) => {
    try {
      await getSignedSession()
    } catch (e) {
      console.error('Error signing in', e)
      throw new Error(e.message || 'Error signing in')
    }
    try {
      return await doRequest(...args)
    } catch (e) {
      if (e.message === 'Unauthorized') {
        // Retry login once
        try {
          await getSignedSession(true)
        } catch (e) {
          console.error('Error signing in (retry)', e)
          throw new Error(e.message || 'Error signing in')
        }
        // Retry the request, allow it to throw errors
        return await doRequest(...args)
      } else {
        throw e
      }
    }
  }
}