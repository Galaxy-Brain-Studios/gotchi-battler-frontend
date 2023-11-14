import { api, urls } from './api'
import { processTeamModel } from './teamUtils'

export default {
  async fetchTeam (teamId) {
    try {
      const team = await api.get(urls.team(teamId))
      return processTeamModel(team)
    } catch (e) {
      console.error('fetchTeam error', { ...e })
      throw new Error(e.json?.error || 'Error fetching team')
    }
  },

  async fetchTrainingTeams () {
    try {
      const teams = await api.get(urls.trainingTeams())
      return teams.map(team => processTeamModel(team))
    } catch (e) {
      console.error('fetchTrainingTeams error', { ...e })
      throw new Error(e.json?.error || 'Error fetching training teams')
    }
  }
}
