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

  const teams = ref(null)
  const { status: fetchTeamsStatus, setLoading: setTeamsLoading } = useStatus()
  const fetchTeams = async function () {
    teams.value = null
    const [isStale, setLoaded, setError] = setTeamsLoading()
    try {
      const result = await profileService.fetchProfileTeams(address)
      if (isStale()) { return; }
      teams.value = result
      setLoaded()
    } catch (e) {
      console.error('Error fetching profile teams', e)
      setError(e.message)
    }
  }


  return {
    profile,
    fetchProfile,
    fetchProfileStatus,
    teams,
    fetchTeams,
    fetchTeamsStatus
  }
}
