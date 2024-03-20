import { api, urls } from './api'

export default {
  async fetchStats () {
    try {
      const stats = await api.get(urls.stats())
      return stats
    } catch (e) {
      console.error('fetchStats error', { ...e })
      throw new Error(e.json?.error || e.json?.message || 'Error fetching stats')
    }
  },
}
