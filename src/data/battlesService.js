import uniqueId from 'lodash.uniqueid'
import { api, urls } from './api'
import { processTeamModel } from './teamUtils'
import game from 'gotchi-battler-game-logic'

const prepareTeamForGameLogic = function (team) {
  const newTeam = JSON.parse(JSON.stringify(team))
  return newTeam
}

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

  runTrainingBattle (match) {
    const seed = '' + Math.random()
    const createdAt = new Date()
    const id = uniqueId('tbatt_')
    const result = game(prepareTeamForGameLogic(match.team1), prepareTeamForGameLogic(match.team2), seed)
    // console.log('runBattle result', result, { match })

    // Match the format returned by the battle endpoint
    return {
      id,
      createdAt,
      status: 'completed',
      logs: 'TODO', // also want to make optional for batch mode if any processing is required to generate logs
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
