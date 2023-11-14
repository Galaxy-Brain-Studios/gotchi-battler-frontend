import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import useStatus from '../utils/useStatus'
import { connectWallet, disconnectWallet, watchWallet, signMessage as wagmiSignMessage } from './wagmi'
import gotchisService from './gotchisService'

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

  function clearData () {
    resetConnected()
    address.value = null
    myGotchis.value = []
    resetMyGotchisFetchStatus()
  }

  async function disconnect () {
    await disconnectWallet()
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
    signMessage
  }
})
