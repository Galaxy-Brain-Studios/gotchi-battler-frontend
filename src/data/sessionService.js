import { apiWithCredentials, apiTextWithCredentials, urls, getResponseErrorMessage } from './api'

export default {
  async fetchSessionNonce () {
    try {
      const result = await apiWithCredentials.get(urls.sessionNonce())
      return result?.nonce
    } catch (e) {
      console.error('fetchNonce error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching session nonce')
    }
  },

  async login ({ message, signature }) {
    try {
      await apiTextWithCredentials.url(urls.sessionLogin()).post({ message, signature })
      return true
    } catch (e) {
      console.error('login error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error logging in')
    }
  },

  async logout () {
    try {
      await apiWithCredentials.url(urls.sessionLogout()).post()
      return true
    } catch (e) {
      console.error('logout error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error logging out')
    }
  },
}
