import { api, urls, getResponseErrorMessage } from './api'
import { processGotchiModel } from './gotchiUtils'

export default {
  async fetchGotchis ({ address }) {
    try {
      const gotchis = await api.get(urls.gotchis({ address }))
      return gotchis.map(processGotchiModel)
    } catch (e) {
      console.error('fetchMyGotchis error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching gotchis')
    }
  },

  async fetchTrainingGotchis () {
    try {
      const gotchis = await api.get(urls.trainingGotchis())
      // Don't use provided id for training gotchis, fallback to onchainId
      for (let gotchi of gotchis) {
        if (gotchi.onchainId) {
          delete gotchi.id
        }
      }
      return gotchis.map(processGotchiModel)
    } catch (e) {
      console.error('fetchTrainingGotchis error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching training gotchis')
    }
  },

  async searchGotchis (query) {
    try {
      const gotchis = await api.url(urls.searchGotchis()).post({ query })
      return gotchis.map(processGotchiModel)
    } catch (e) {
      console.error('searchGotchis error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error searching for gotchis')
    }
  },
}
