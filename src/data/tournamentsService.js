import { api, apiWithCredentials, apiTextWithCredentials, urls, getResponseErrorMessage } from './api'
import { requireLoginSession } from './accountStore'
import orderBy from 'lodash.orderby'

const TOURNAMENT_API_STATE_TO_STATUS = {
  UPCOMING: "upcoming",
  REGISTERING: "registering",
  PREPARATION: "active_preparation",
  BATTLE: "active_battle",
  FINISHED: "completed"
}

const getTournamentStatus = function (tournamentFromApi) {
  if (!tournamentFromApi?.state) {
    console.error('Tournament is missing state', tournamentFromApi);
    return ''
  }
  const status = TOURNAMENT_API_STATE_TO_STATUS[tournamentFromApi.state]
  if (!status) {
    console.error('Unexpected tournament state', tournamentFromApi);
    return ''
  }
  return status
}

const processTournament = function (tournament) {
  return {
    ...tournament,
    endDate: tournament.endDate ? new Date(tournament.endDate) : null,
    startDate: tournament.startDate ? new Date(tournament.startDate) : null,
    status: getTournamentStatus(tournament)
  }
}

const processBracketRounds = function(rounds) {
  let newRounds = (rounds || []).map(round => ({
    ...round,
    startDate: round.startDate ? new Date(round.startDate) : null,
    status: round.status === 'finished' ? 'completed' : round.status, // rename server-provided 'finished' to 'completed'
    battles: (round.battles || []).map(battle => ({
      ...battle,
      fromBattles: [battle.parentBattleId1, battle.parentBattleId2],
      fromExternalBattles: [battle.losersBattleId1, battle.losersBattleId2]
    }))
  }))
  // Rounds must be in order
  newRounds = orderBy(
    newRounds,
    ['roundStage'],
    ['asc']
  )
  return newRounds
}
const processBrackets = function (brackets) {
  const newBrackets = []
  let finalBracketStage = -1
  let finalBracket = null
  for (const bracket of brackets) {
    const newBracket = {
      ...bracket,
      startDate: bracket.startDate ? new Date(bracket.startDate) : null,
      status: bracket.status === 'finished' ? 'completed' : bracket.status, // rename server-provided 'finished' to 'completed'
      rounds: processBracketRounds(bracket.rounds),
      isFinale: false
    }
    newBrackets.push(newBracket)
    if (bracket.stage > finalBracketStage) {
      finalBracketStage = bracket.stage
      finalBracket = newBracket
    }
  }
  if (finalBracket) {
    finalBracket.isFinale = true
  }
  return newBrackets
}

export default {
  async fetchTournaments () {
    try {
      const tournaments = await api.get(urls.tournaments())
      return tournaments.map(tournament => processTournament(tournament))
    } catch (e) {
      console.error('fetchTournaments error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournaments')
    }
  },

  async fetchTournament (id) {
    try {
      const tournament = await api.get(urls.tournament(id))
      return {
        ...processTournament(tournament),
        brackets: processBrackets(tournament.brackets || [])
      }
    } catch (e) {
      console.error('fetchTournament error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournament')
    }
  },

  async fetchTournamentBrackets (id) {
    try {
      const brackets = await api.get(urls.tournamentBrackets(id))
      return processBrackets(brackets || [])
    } catch (e) {
      console.error('fetchTournamentBrackets error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournament brackets')
    }
  },

  createTeam: requireLoginSession(async function ({ tournamentId, team }) {
    try {
      const result = await apiWithCredentials.url(urls.createTournamentTeam(tournamentId)).post(team)
      return result;
    } catch (e) {
      console.error('createTeam error', { ...e })
      throw new Error(e.json?.errors?.[0]?.message || getResponseErrorMessage(e) || e.message || 'Error submitting team')
    }
  }),

  deleteTeam: requireLoginSession(async function ({ tournamentId, teamId }) {
    try {
      const result = await apiTextWithCredentials.url(urls.deleteTournamentTeam({ tournamentId, teamId })).delete()
      return result;
    } catch (e) {
      console.error('deleteTeam error', e)
      throw new Error(getResponseErrorMessage(e) || e.message || 'Error deleting team')
    }
  }),

  // TODO not yet supported by server
  // async replaceTeam ({ tournamentId, teamId, team }) {
  //   return null;
  // },

  editTeam: requireLoginSession(async function ({ tournamentId, teamId, team }) {
    try {
      const result = await apiWithCredentials.url(urls.editTournamentTeam({ tournamentId, teamId })).put(team)
      return result;
    } catch (e) {
      console.error('editTeam error', e)
      throw new Error(e.json?.errors?.[0]?.message || getResponseErrorMessage(e) || e.message || 'Error updating team')
    }
  }),

  async fetchTournamentTeams ({ tournamentId }) {
    try {
      const teams = await api.get(urls.tournamentTeams(tournamentId))
      return (teams || []).map(team => ({
        id: team.id,
        name: team.name,
        gotchiIds: team.gotchiIds
      }))
    } catch (e) {
      console.error('fetchTournamentTeams error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournament teams')
    }
  },

  async fetchTournamentTeamsReport ({ tournamentId }) {
    try {
      const teams = await api.get(urls.tournamentTeamsReport(tournamentId))
      return teams || []
    } catch (e) {
      console.error('fetchTournamentTeamsReport error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournament teams report')
    }
  },

  async fetchTournamentGotchis ({ tournamentId }) {
    try {
      const gotchis = await api.get(urls.tournamentGotchis(tournamentId))
      return (gotchis || []).map(gotchi => ({
        id: gotchi.id,
        onchainId: gotchi.onchainId,
        name: gotchi.name,
        svgFront: gotchi.svgFront,
        brs: gotchi.brs,
        teamId: gotchi.teamId,
        teamName: gotchi.teamName,
        teamOwner: gotchi.teamOwner,
        teamUser: gotchi.teamUser
      }))
    } catch (e) {
      console.error('fetchTournamentGotchis error', { ...e })
      throw new Error(getResponseErrorMessage(e) || 'Error fetching tournament gotchis')
    }
  }
}
