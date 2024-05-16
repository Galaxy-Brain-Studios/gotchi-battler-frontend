import { api, urls } from './api'
import { processGotchiModel } from './gotchiUtils'

const processLendingModel = function (jsonData) {
  // combine lending and gotchi data into one flat object for easier handling in the UI
  const gotchi = processGotchiModel(jsonData.gotchi)
  return {
    id: gotchi.onchainId,
    lendingId: jsonData.id,
    lendingGhstPrice: jsonData.upfrontCost - 0,
    lendingPeriod: jsonData.rentDuration - 0,
    lendingEndsEarly: !!jsonData.warning,
    createdDate: jsonData.timeCreated ? new Date(jsonData.timeCreated) : null,
    ...gotchi
  }
}
export default {
  async fetchAvailableGotchis (tournamentId) {
    try {
      const lendings = await api.get(urls.availableLendings(tournamentId))
      return lendings.map(processLendingModel)
    } catch (e) {
      console.error('fetchAvailableGotchis error', { ...e })
      throw new Error(e.json?.error || 'Error fetching available gotchi lendings')
    }
  },
}
