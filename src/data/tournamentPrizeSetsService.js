import { api, urls, getResponseErrorMessage } from './api'

export default {
  async fetchPrizeSets () {
    try {
      const sets = await api.get(urls.tournamentPrizeSets())
      return sets
    } catch (e) {
      console.error('fetchPrizeSets error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournament prize sets')
    }
  }
}
