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

  async fetchSessionUser () {
    try {
      const result = await apiWithCredentials.get(urls.sessionUser())
      return {
        address: result?.address?.toLowerCase()
      }
    } catch (e) {
      const message = getResponseErrorMessage(e)
      if (message === 'Unauthorized') {
        // That's ok, we use this endpoint to find out if a session exists or not
        return null
      }
      console.error('fetchSessionUser error', {e}, message)
      throw new Error(message || 'Error fetching logged in user')
    }
  },
}
