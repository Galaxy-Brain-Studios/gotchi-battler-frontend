import { api, urls } from './api'
import { processGotchiModel } from './gotchiUtils'

export default {
  async fetchGotchis ({ address }) {
    try {
      const gotchis = await api.get(urls.gotchis({ address }))
      return gotchis.map(processGotchiModel)
    } catch (e) {
      console.error('fetchMyGotchis error', { ...e })
      throw new Error(e.json?.error || 'Error fetching gotchis')
    }
  },
}
