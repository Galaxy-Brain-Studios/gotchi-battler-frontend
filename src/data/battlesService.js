import { api, apiWithCredentials, urls } from './api'
import { processTeamModel } from './teamUtils'
import { requireLoginSession } from './accountStore'

const processBattleModel = function (jsonData) {
  const teams = [jsonData.team1 || null, jsonData.team2 || null]
  return {
    ...jsonData,
    teams: teams.map(team => processTeamModel(team)),
    createdDate: jsonData.createdAt ? new Date(jsonData.createdAt) : null
  }
}

export default {
  async fetchBattle (id) {
    try {
      const battle = await api.get(urls.battle(id))
      if (battle) {
        // calculate battle status based on the presence of the winnerId
        const winnerId = battle.winnerId
        battle.status = (winnerId !== null && typeof winnerId !== 'undefined') ? 'completed' : 'upcoming'
      }
      return processBattleModel(battle)
    } catch (e) {
      console.error('fetchBattle error', { ...e })
      throw new Error(e.json?.error || 'Error fetching battle')
    }
  },

  async fetchBattleAnalyser (id) {
    try {
      const battle = await api.get(urls.battleAnalyser(id))
      if (battle) {
        // calculate battle status based on the presence of the winnerId
        const winnerId = battle.winnerId
        battle.status = (winnerId !== null && typeof winnerId !== 'undefined') ? 'completed' : 'upcoming'
      }
      return processBattleModel(battle)
    } catch (e) {
      console.error('fetchBattleAnalyser error', { ...e })
      throw new Error(e.json?.error || 'Error fetching battle analysis')
    }
  },

  async fetchBattleLogs (url) {
    try {
      const logs = await api.get(urls.battleLogs(url))
      return logs
    } catch (e) {
      console.error('fetchBattleLogs error', { ...e })
      throw new Error(e.json?.error || 'Error fetching battle logs')
    }
  },

  submitTrainingBattle: requireLoginSession( async function ({ team, trainingTeam }) {
    try {
      const result = await apiWithCredentials.url(urls.trainingBattle()).post({
        team,
        trainingTeam
      })
      // result might just contain id
      if (!result.team1) {
        return result
      }
      // if there's a full battle model, process it
      const battle = processBattleModel(result)
      // training battles run immediately
      if (!battle.status) {
        battle.status = 'completed'
      }
      return battle
    } catch (e) {
      console.error('submitTrainingBattle error', { ...e })
      throw new Error(e.json?.error || e.json?.message || 'Error submitting Training battle')
    }
  })

}
