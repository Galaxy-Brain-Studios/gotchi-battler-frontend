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
  trainingTeams: () =>  `${BASE_URL}/api/v1/training/teams/`,
  team: (id) => `${BASE_URL}/api/v1/teams/${encodeURIComponent(id)}`,
  createTournamentTeam: (tournamentId) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams`,
  deleteTournamentTeam: ({ tournamentId, teamId }) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}`,
  editTournamentTeam: ({ tournamentId, teamId }) =>
    `${BASE_URL}/api/v1/me/tournaments/${encodeURIComponent(tournamentId)}/teams/${encodeURIComponent(teamId)}`,
  tournamentTeams: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/teams`,
  tournamentTeamsReport: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/teams-report`,
  tournamentGotchis: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/gotchis`,
  battle: (id) => `${BASE_URL}/api/v1/battles/${encodeURIComponent(id)}`,
  battleAnalyser: (id) => `${BASE_URL}/api/v1/battles/${encodeURIComponent(id)}/analyse`,
  battleLogs: (url) => url,
  trainingBattle: () => `${BASE_URL}/api/v1/me/training`,
  trainingGotchis: () =>  `${BASE_URL}/api/v1/training/gotchis`,
  gotchis: ({ address }) =>  `${BASE_URL}/api/v1/gotchis/${encodeURIComponent(address)}`,
  availableLendings: (tournamentId) => `${BASE_URL}/api/v1/tournaments/${encodeURIComponent(tournamentId)}/lendings`,
  profile: (address) => `${BASE_URL}/api/v1/profile/${encodeURIComponent(address)}`,
  profileTeams: () => `${BASE_URL}/api/v1/me/teams`,
  profileInventory: () => `${BASE_URL}/api/v1/me/inventory`,
  profileInventoryItemCount: (itemId) => `${BASE_URL}/api/v1/me/inventory/item/${encodeURIComponent(itemId)}/count`,
  updateProfile: () => `${BASE_URL}/api/v1/me`,
  deleteProfileTeam: ({ teamId }) => `${BASE_URL}/api/v1/me/team/${encodeURIComponent(teamId)}/delete`,
  generateImageUploadUrl: () => `${BASE_URL}/api/v1/me/avatar-upload-url`,
  updateProfileImage: () => `${BASE_URL}/api/v1/me/avatar`,
  sessionNonce: () => `${BASE_URL}/api/v1/auth/nonce`,
  sessionLogin: () => `${BASE_URL}/api/v1/auth/login`,
  sessionLogout: () => `${BASE_URL}/api/v1/auth/logout`,
  shopItems: () => `${BASE_URL}/api/v1/shop/items`
}

export { api, apiText, apiWithCredentials, apiTextWithCredentials, urls, setBaseUrl }