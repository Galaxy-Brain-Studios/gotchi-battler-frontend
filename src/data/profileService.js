import { api, urls } from './api'

export default {
  async fetchProfile (address) {
    try {
      const profile = await api.get(urls.profile(address))
      return profile
    } catch (e) {
      console.error('fetchProfile error', { ...e })
      throw new Error(e.json?.error || 'Error fetching profile')
    }
  },
}
