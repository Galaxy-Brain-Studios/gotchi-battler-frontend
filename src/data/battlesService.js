import uniqueId from 'lodash.uniqueid'
import { api, urls, getResponseErrorMessage } from './api'
import { processTeamModel } from './teamUtils'
import { battle as runBattle } from 'gotchi-battler-game-logic'

const processBattleModel = function (jsonData) {
  const { team1, team2, ...restData } = jsonData
  const teams = [team1 || null, team2 || null]
  return {
    ...restData,
    teams: teams.map(team => processTeamModel(team)),
    createdDate: restData.createdAt ? new Date(restData.createdAt) : null
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
      throw new Error(getResponseErrorMessage(e) || 'Error fetching battle')
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
      throw new Error(getResponseErrorMessage(e) || 'Error fetching battle analysis')
    }
  },

  async fetchBattleLogs (url) {
    try {
      const logs = await api.get(urls.battleLogs(url))
      return logs
    } catch (e) {
      console.error('fetchBattleLogs error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching battle logs')
    }
  },

  runTrainingBattle (match) {
    const seed = '' + Math.random()
    const createdAt = new Date()
    const id = uniqueId('tbatt_')
    const result = runBattle(match.team1, match.team2, seed)
    // console.log('runBattle result', result, { match })

    // Similar to the format returned by the battle endpoint
    return {
      id,
      createdAt,
      status: 'completed',
      // battle endpoint returns 'logs' which is an URL, but here we store the full logs directly
      logsData: result,
      // battle endpoint returns winnerId, but in-browser team might not have an ID
      winner: result.result.winner // team index, 1 or 2
    }
  },

  runTrainingBattles (match, numBattles) {
    const teamWins = [0, 0]
    for (let i = 0; i < numBattles; i++) {
      const result = this.runTrainingBattle(match)
      teamWins[result.winner - 1]++
    }
    const team1WinRate = Math.floor(100 * teamWins[0] / numBattles)
    const team2WinRate = Math.floor(100 * teamWins[1] / numBattles)
    return {
      team1Wins: teamWins[0],
      team1WinRate,
      team2Wins: teamWins[1],
      team2WinRate
    }
  }

}
