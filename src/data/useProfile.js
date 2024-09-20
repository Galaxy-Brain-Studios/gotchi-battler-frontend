import { ref } from 'vue'
import useStatus from '../utils/useStatus'
import profileService from './profileService'

export default function useProfile (address) {
  const profile = ref(null)
  const { status: fetchProfileStatus, setLoading } = useStatus()

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

  return {
    profile,
    fetchProfile,
    fetchProfileStatus
  }
}
