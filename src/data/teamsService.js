import { api, urls, getResponseErrorMessage } from './api'
import { processTeamModel } from './teamUtils'

export default {
  async fetchTeam (teamId) {
    try {
      const team = await api.get(urls.team(teamId))
      return processTeamModel(team)
    } catch (e) {
      console.error('fetchTeam error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching team')
    }
  },

  async fetchTrainingTeams () {
    try {
      const teams = await api.get(urls.trainingTeams())
      return teams.map(processTeamModel)
    } catch (e) {
      console.error('fetchTrainingTeams error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching training teams')
    }
  }
}
