import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAccountStore } from './accountStore'
import useStatus from '../utils/useStatus'
import profileService from './profileService'

export default function useProfile (address) {
  const accountStore = useAccountStore()
  const { isConnected, address: connectedAddress, signedSession } = storeToRefs(accountStore)

  const isConnectedProfile = computed(() => address && isConnected.value && connectedAddress.value && connectedAddress.value.toLowerCase() === address.toLowerCase())
  const isConnectedSignedInProfile = computed(() => isConnectedProfile.value && signedSession.value)

  const profile = ref(null)
  const { status: fetchProfileStatus, setLoading } = useStatus()

  const setProfile = function (newProfile) {
    profile.value = newProfile
  }

  const fetchProfile = async function () {
    profile.value = null
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await profileService.fetchProfile(address)
      if (isStale()) { return; }
      profile.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching profile', e)
      setError(e.message)
    }
  }

  const teams = ref(null)
  const { status: fetchTeamsStatus, setLoading: setTeamsLoading } = useStatus()
  const fetchTeams = async function () {
    teams.value = null
    const [isStale, setLoaded, setError] = setTeamsLoading()
    try {
      const result = await profileService.fetchProfileTeams()
      if (isStale()) { return; }
      teams.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching profile teams', e)
      setError(e.message)
    }
  }

  const inventory = ref(null)
  const { status: fetchInventoryStatus, setLoading: setInventoryLoading } = useStatus()
  const fetchInventory = async function () {
    inventory.value = null
    const [isStale, setLoaded, setError] = setInventoryLoading()
    try {
      const result = await profileService.fetchProfileInventory()
      if (isStale()) { return; }
      inventory.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching profile inventory', e)
      setError(e.message)
    }
  }

  return {
    isConnectedProfile,
    isConnectedSignedInProfile,
    profile,
    fetchProfile,
    fetchProfileStatus,
    setProfile,
    teams,
    fetchTeams,
    fetchTeamsStatus,
    inventory,
    fetchInventory,
    fetchInventoryStatus
  }
}
