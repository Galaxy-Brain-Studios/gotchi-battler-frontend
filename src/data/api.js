import wretch from 'wretch'
import { API_URL } from '../appEnv'

let baseApi = wretch()

const api = baseApi.errorType("json").resolve(r => r.json())
const apiText = baseApi.errorType("json").resolve(r => r.text())

const apiWithCredentials = api.options({ credentials: "include", mode: "cors" })
const apiTextWithCredentials = apiText.options({ credentials: "include", mode: "cors" })

let BASE_URL = API_URL

function setBaseUrl (url) {
  BASE_URL = url
}

const urls = {
  stats: () => `${BASE_URL}/api/v1/stats/`,
  tournaments: () =>  `${BASE_URL}/api/v1/tournaments/`,
  tournament: (id) =>  `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(id)}`,
  tournamentBrackets: (id) =>  `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(id)}/brackets`,
  tournamentPrizeSets: () =>  `${BASE_URL}/api/v1/tournament-prize-sets/`,
  trainingTeams: () =>  `${BASE_URL}/api/v1/training/teams/`,
  team: (id) => `${BASE_URL}/api/v1/teams/${encodeURIComponent(id)}`,
  createTournamentTeam: (tournamentId) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams`,
  deleteTournamentTeam: ({ tournamentId, teamId }) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}`,
  editTournamentTeam: ({ tournamentId, teamId }) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}`,
  getTournamentTeamToEdit: ({ tournamentId, teamId }) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}`,
  tournamentTeams: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/teams`,
  tournamentTeamsReport: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/teams-report`,
  tournamentGotchis: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/gotchis`,
  battle: (id) => `${BASE_URL}/api/v1/battles/${encodeURIComponent(id)}`,
  battleAnalyser: (id) => `${BASE_URL}/api/v1/battles/${encodeURIComponent(id)}/analyse`,
  battleLogs: (url) => url,
  trainingGotchis: () =>  `${BASE_URL}/api/v1/training/gotchis`,
  gotchis: ({ address }) =>  `${BASE_URL}/api/v1/gotchis/${encodeURIComponent(address)}`,
  searchGotchis: () =>  `${BASE_URL}/api/v1/gotchis`,
  availableLendings: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/lendings`,
  profile: (address) => `${BASE_URL}/api/v1/profiles/${encodeURIComponent(address)}`,
  profileTeams: () => `${BASE_URL}/api/v1/me/teams`,
  profileInventory: () => `${BASE_URL}/api/v1/me/items`,
  itemPurchase: (txId) => `${BASE_URL}/api/v1/me/item-purchases/${encodeURIComponent(txId)}`,
  profileTournaments: () => `${BASE_URL}/api/v1/me/tournaments`,
  createTournament: () => `${BASE_URL}/api/v1/me/tournaments`,
  updateProfile: () => `${BASE_URL}/api/v1/me`,
  createProfileTeam: () => `${BASE_URL}/api/v1/me/teams`,
  updateProfileTeam: (teamId) => `${BASE_URL}/api/v1/me/teams/${encodeURIComponent(teamId)}`,
  deleteProfileTeam: (teamId) => `${BASE_URL}/api/v1/me/teams/${encodeURIComponent(teamId)}`,
  generateImageUploadUrl: () => `${BASE_URL}/api/v1/me/avatar-upload-url`,
  updateProfileImage: () => `${BASE_URL}/api/v1/me/avatar`,
  sessionNonce: () => `${BASE_URL}/api/v1/auth/nonce`,
  sessionLogin: () => `${BASE_URL}/api/v1/auth/login`,
  sessionLogout: () => `${BASE_URL}/api/v1/auth/logout`,
  sessionUser: () => `${BASE_URL}/api/v1/me/check`,
  shopItems: () => `${BASE_URL}/api/v1/items`
}

function getResponseErrorMessage (e) {
  // console.log({ ... e})
  // Special case for Unauthorized responses, which can have various error message causes
  // but we want to be able to detect them easily so always use the 'Unauthorized' string
  if (e.status === 401) {
    return 'Unauthorized'
  }
  return e.json?.error || e.json?.message || null
}

export { api, apiText, apiWithCredentials, apiTextWithCredentials, urls, setBaseUrl, getResponseErrorMessage }