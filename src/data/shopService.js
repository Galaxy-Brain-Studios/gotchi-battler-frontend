import { api, urls, getResponseErrorMessage } from './api'

export default {
  async fetchItems () {
    try {
      const items = await api.get(urls.shopItems())
      return items
    } catch (e) {
      console.error('fetchItems error', e)
      throw new Error(getResponseErrorMessage(e) || 'Error fetching shop items')
    }
  }
}
