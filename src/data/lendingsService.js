import { api, urls } from './api'
import { processGotchiModel } from './gotchiUtils'

const processLendingModel = function (jsonData) {
  return {
    ...jsonData,
    // ensure properties that need to be are numbers
    lendingGhstPrice: jsonData.lendingGhstPrice - 0,
    lendingPeriod: jsonData.lendingPeriod - 0
  }
}
export default {
  async fetchAvailableGotchis () {
    try {
      const gotchis = await api.get(urls.availableLendings())
      return gotchis.map(processGotchiModel).map(processLendingModel)
    } catch (e) {
      console.error('fetchAvailableGotchis error', { ...e })
      throw new Error(e.json?.error || 'Error fetching available gotchi lendings')
    }
  },
}
