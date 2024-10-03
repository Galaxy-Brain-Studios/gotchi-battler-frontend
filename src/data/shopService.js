import { api, urls } from './api'

export default {
  async fetchItems () {
    try {
      const items = await api.get(urls.shopItems())
      return items
    } catch (e) {
      console.error('fetchItems error', e)
      throw new Error(e.json?.error || 'Error fetching shop items')
    }
  }
}
