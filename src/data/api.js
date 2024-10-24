import wretch from 'wretch'
import { DEV_MODE, API_URL } from '../appEnv'

let baseApi = wretch()
if (DEV_MODE) {
  baseApi = baseApi.middlewares([
    // Dev option: skipDevServerSignatureCheck
    next => (url, opts) => {
      let newOpts = opts
      if (window.skipDevServerSignatureCheck) {
        // add header to all requests
        let headers = newOpts.headers || {}
        headers['X-GB-DEV-SKIP-SIGNATURE'] = true
        newOpts = {
          ...newOpts,
          headers
        }
      }
      return next(url, newOpts)
    }
  ])
}

const api = baseApi.errorType("json").resolve(r => r.json())
const apiText = baseApi.errorType("json").resolve(r => r.text())

let BASE_URL = API_URL

function setBaseUrl (url) {
  BASE_URL = url
}

const urls = {
  stats: () => `${BASE_URL}/api/v1/stats/`,
  tournaments: () =>  `${BASE_URL}/api/v1/tournaments/`,
  tournament: (id) =>  `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(id)}`,
  tournamentBrackets: (id) =>  `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(id)}/brackets`,
  trainingTeams: () =>  `${BASE_URL}/api/v1/training/teams/`,
  team: (id) => `${BASE_URL}/api/v1/teams/${encodeURIComponent(id)}`,
  createTournamentTeam: ({ tournamentId, address, message='', signature='' }) =>
    `${BASE_URL}/api/v1/me/${encodeURIComponent(address)}/tournaments/${encodeURIComponent(tournamentId)}/teams?message=${encodeURIComponent(message)}&signature=${encodeURIComponent(signature)}`,
  deleteTournamentTeam: ({ tournamentId, teamId, address, message='', signature='' }) =>
    `${BASE_URL}/api/v1/me/${encodeURIComponent(address)}/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}?message=${encodeURIComponent(message)}&signature=${encodeURIComponent(signature)}`,
  editTournamentTeam: ({ tournamentId, teamId, address, message='', signature='' }) =>
    `${BASE_URL}/api/v1/me/${encodeURIComponent(address)}/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}?message=${encodeURIComponent(message)}&signature=${encodeURIComponent(signature)}`,
  tournamentTeams: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/teams`,
  tournamentTeamsReport: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/teams-report`,
  tournamentGotchis: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/gotchis`,
  battle: (id) => `${BASE_URL}/api/v1/battles/${encodeURIComponent(id)}`,
  battleAnalyser: (id) => `${BASE_URL}/api/v1/battles/${encodeURIComponent(id)}/analyse`,
  battleLogs: (url) => url,
  trainingBattle: ({ address, message='', signature='' }) =>
    `${BASE_URL}/api/v1/me/${encodeURIComponent(address)}/training?message=${encodeURIComponent(message)}&signature=${encodeURIComponent(signature)}`,
  trainingGotchis: () =>  `${BASE_URL}/api/v1/training/gotchis`,
  gotchis: ({ address }) =>  `${BASE_URL}/api/v1/me/${encodeURIComponent(address)}/gotchis`,
  availableLendings: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/lendings`
}

export { api, apiText, urls, setBaseUrl }