import { createServer, Response } from 'miragejs'

import { urls } from '../data/api.js'
import profiles from './profiles.json'
import profileTeamsForAddress from './profileTeamsForAddress.json'
import profileInventoryForAddress from './profileInventoryForAddress.json'
import tournaments from './tournaments.json'
import teams from './teams.json'
import battles from './battles.json'
import battleLog from './battleLog.json'
import gotchisForAddress from './gotchisForAddress.js'
import FORMATION_PATTERNS from '../components/team/formationPatterns.json'
import DIFFICULTIES from '../data/trainingTeamDifficulties.json'
import SHOP_ITEMS from './shopItems'

// generate full URIs for gotchi SVGs
const LOCAL_URL_PREFIX = window.location.origin
const prefixSvgUrls = function (gotchi) {
  if (!gotchi) { return }
  if (gotchi.svgFront) {
    gotchi.svgFront = LOCAL_URL_PREFIX + gotchi.svgFront
  }
  if (gotchi.svgBack) {
    gotchi.svgBack = LOCAL_URL_PREFIX + gotchi.svgBack
  }
  if (gotchi.svgLeft) {
    gotchi.svgLeft = LOCAL_URL_PREFIX + gotchi.svgLeft
  }
  if (gotchi.svgRight) {
    gotchi.svgRight = LOCAL_URL_PREFIX + gotchi.svgRight
  }
}
for (const gotchis of Object.values(gotchisForAddress)) {
  for (const gotchi of gotchis) {
    prefixSvgUrls(gotchi)
  }
}
for (const team of teams) {
  for (const value of Object.values(team)) {
    prefixSvgUrls(value)
  }
}

const profilesByAddress = Object.fromEntries(profiles.map(p => [p.address.toLowerCase(), p]))
const initProfileForAddress = function (address) {
  const addressLc = address.toLowerCase()
  if (!profilesByAddress[addressLc]) {
    profilesByAddress[addressLc] = {
      ...profilesByAddress['DEFAULT'.toLowerCase()],
      address
    }
  }
}

const profileTeamsByAddress = Object.fromEntries(Object.entries( profileTeamsForAddress).map( ([address, teams]) => [address.toLowerCase(), teams] ) )
const profileInventoryByAddress = Object.fromEntries(Object.entries( profileInventoryForAddress).map( ([address, inventory]) => [address.toLowerCase(), inventory] ) )
const INVENTORY_ITEMS_BY_ID = Object.fromEntries(SHOP_ITEMS.map(item => [`${item.id}`, item]))

const getTeamTotalBrs = function(team) {
  // The totalBrs might be calculated differently in the real server, this is just to get an approx mock value.
  const gotchis = [
    team.back1Gotchi, team.back2Gotchi, team.back3Gotchi, team.back4Gotchi, team.back5Gotchi,
    team.front1Gotchi, team.front2Gotchi, team.front3Gotchi, team.front4Gotchi, team.front5Gotchi
  ].filter(g => g)
  let total = 0
  for (const gotchi of gotchis) {
    if (gotchi.brs) {
      total += gotchi.brs
    }
  }
  return total
}

const tournamentsById = Object.fromEntries(tournaments.map(t => [t.id, t]))
const teamsById = Object.fromEntries(teams.map(t => [t.id, t]))
teamsById.DEFAULT = teams[0]
const battlesById = Object.fromEntries(battles.map(b => [b.id, b]))
battlesById.DEFAULT = battles[0]

{
  // set dates on first tournament and its brackets so we have a full range of statuses
  const t1 = tournaments[0]
  const nowMs = Date.now()
  const dayMs = 24 * 60 * 60 * 1000
  t1.startDate = new Date( nowMs - (60 * dayMs))
  t1.endDate = new Date( nowMs + (60 * dayMs))
  for (const bracket of t1.brackets) {
    if (bracket.status === 'completed') {
      bracket.startDate = new Date ( nowMs - (40 * dayMs) )
    } else if (bracket.status === 'started') {
      bracket.startDate = new Date ( nowMs - (4 * dayMs ))
    } else if (bracket.status === 'upcoming') {
      bracket.startDate = new Date ( nowMs + (40 * dayMs ))
    }
  }

  // set dates on 'registering' tournaments so we can test the lending warning
  for (const tournament of tournaments) {
    if (tournament.state === 'REGISTERING') {
      tournament.startDate = new Date ( nowMs + (5 * dayMs ))
      tournament.endDate = new Date ( nowMs + (10 * dayMs ))
    }
  }
}


const gotchis = teams.map(
  team => [
    team.back1Gotchi, team.back2Gotchi, team.back3Gotchi, team.back4Gotchi, team.back5Gotchi,
    team.front1Gotchi, team.front2Gotchi, team.front3Gotchi, team.front4Gotchi, team.front5Gotchi
  ]
).flat().filter(g => !!g).map(gotchi => {
  // remove 'specialId' from the response because that's only configured per-gotchi within a team
  // eslint-disable-next-line no-unused-vars
  const { specialId, ...gotchiWithoutSpecial } = gotchi
  return gotchiWithoutSpecial
})

const trainingTeams = generateTrainingTeams()
const trainingGotchis = trainingTeams.map(
  team => [
    team.back1Gotchi, team.back2Gotchi, team.back3Gotchi, team.back4Gotchi, team.back5Gotchi,
    team.front1Gotchi, team.front2Gotchi, team.front3Gotchi, team.front4Gotchi, team.front5Gotchi
  ].filter(g => g)
).flat().map(gotchi => {
  // remove specialId as that only exists within a team
  const newGotchi = { ...gotchi }
  delete newGotchi.specialId
  return newGotchi
})

const mirageConfig = window.mirageConfig = {
  stats: {
    error: false,
    slow: false,
    small: false
  },
  tournaments: {
    error: false,
    empty: false
  },
  tournament: {
    error: false
  },
  tournamentBrackets: {
    error: false
  },
  team: {
    error: false
  },
  battle: {
    error: false
  },
  battleAnalyser: {
    error: false,
    slow: false
  },
  battleLogs: {
    error: false
  },
  gotchis: {
    error: false,
    empty: false,
    long: false
  },
  trainingteams: {
    error: false,
    slow: false,
    empty: false
  },
  traininggotchis: {
    error: false,
    slow: false,
    empty: false
  },
  createTournamentTeam: {
    error: false,
    slow: false
  },
  editTournamentTeam: {
    error: false,
    slow: false
  },
  deleteTournamentTeam: {
    error: false,
    slow: false
  },
  tournamentTeamsReport: {
    error: false,
    slow: false
  },
  tournamentTeams: {
    error: false,
    slow: false
  },
  tournamentGotchis: {
    error: false,
    slow: false,
    empty: false,
    long: false
  },
  availableLendings: {
    error: false,
    slow: false,
    empty: false
  },
  profile: {
    error: false,
    slow: false
  },
  profileTeams: {
    error: false,
    slow: false
  },
  profileInventory: {
    error: false,
    slow: false
  },
  profileInventoryItemCount: {
    error: false,
    slow: false
  },
  updateProfile: {
    error: false,
    slow: false
  },
  updateProfileImage: {
    error: false,
    slow: false
  },
  deleteProfileTeam: {
    error: false,
    slow: false
  },
  generateImageUploadUrl: {
    error: false,
    slow: false
  },
  mockCloudUploadUrl: {
    error: false,
    slow: false
  },
  sessionNonce: {
    error: false,
    slow: false
  },
  sessionLogin: {
    error: false,
    slow: false
  },
  sessionLogout: {
    error: false,
    slow: false
  },
  shopItems: {
    error: false,
    slow: false
  }
};

const errorResponse = ({ statusCode=400, message='Error from the server', response=null }={}) => new Response(
  statusCode, {}, (response || { error: message })
)
const unauthorizedErrorResponse = function () {
  return errorResponse({ statusCode: 401, message: "Unauthorized", error: "Unauthorized" })
}

const requestIncludesCredentials = function (request) {
  return request.withCredentials;
}
// Real server-side session may or may not use cookies to track the user,
// but we're using them here to make available that state which will be passed
// along as request credentials (because the user address may not
// be present explicitly in request path/params/body).
const cookieDomain = window.location.hostname
const setSessionAddressCookie = function (address) {
  const now = new Date()
  const cookieExpiration = new Date(now.getTime() + 24 * 3600 * 1000)
  document.cookie = `sessionAddress=${address}; domain=${cookieDomain}; path=/; expires=${cookieExpiration.toUTCString()};`
}
const clearSessionAddressCookie = function () {
  document.cookie = `sessionAddress=; domain=${cookieDomain}; path=/; expires=${new Date(0).toUTCString()};`
}
const getSessionAddressFromCookie = function () {
  return document.cookie.match(/sessionAddress=(\w+)/)?.[1]
}
const checkCredentials = function (request) {
  const address = getSessionAddressFromCookie()
  if (!requestIncludesCredentials(request) || !address) {
    return false
  }
  console.log('Mirage server sees request with session credentials', address)
  return address
}

export function makeServer({ environment = 'development' } = {}) {
  let server = createServer({
    environment,

    routes() {
      const fixUrl = function (text) {
        // api.urls escapes params when generating url,
        // but here we want unescaped : so mirage can recognise placeholders like :id
        text = text.replaceAll('%3A', ':')
        // also remove any query in the url
        const queryIndex = text.indexOf('?')
        if (queryIndex !== -1) {
          text = text.substring(0, queryIndex)
        }
        return text
      }

      this.get(urls.stats(), () => {
        if (mirageConfig.stats.error) {
          return errorResponse()
        }
        if (mirageConfig.stats.small) {
          return {
            numBattles: 123,
            numTournaments: 1,
            usdPrizes: 1234
          }
        }
        return {
          numBattles: 135001,
          numTournaments: 7,
          usdPrizes: 123456
        }
      }, {
        timing: mirageConfig.stats.slow ? 5000 : 0
      })

      this.get(urls.tournaments(), () => {
        if (mirageConfig.tournaments.empty) {
          return []
        }
        if (mirageConfig.tournaments.error) {
          return errorResponse()
        }
        return tournaments.map(t => ({
          id: t.id,
          name: t.name,
          startDate: t.startDate,
          endDate: t.endDate,
          state: t.state,
          numberOfTeams: t.numberOfTeams,
          image: t.image
        }))
      })

      this.get(fixUrl(urls.tournament(':id')), (schema, request) => {
        if (mirageConfig.tournament.error) {
          return errorResponse()
        }
        const tournament = tournamentsById[request.params.id]
        if (!tournament) {
          return errorResponse({ statusCode: 404, message: 'Tournament not found' })
        }
        return {
          ...tournament,
          // only return essential team info in tournament endpoint
          teams: tournament.teams?.map(({ id, name, owner }) => ({ id, name, owner }))
        }
      })

      this.get(fixUrl(urls.tournamentTeamsReport(':id')), (schema, request) => {
        if (mirageConfig.tournamentTeamsReport.error) {
          return errorResponse()
        }
        const tournament = tournamentsById[request.params.id]
        if (!tournament) {
          return errorResponse({ statusCode: 404, message: 'Tournament not found' })
        }
        return tournament.teams || []
      })

      this.get(fixUrl(urls.tournamentBrackets(':id')), (schema, request) => {
        if (mirageConfig.tournamentBrackets.error) {
          return errorResponse()
        }
        const tournament = tournamentsById[request.params.id]
        if (!tournament) {
          return errorResponse({ statusCode: 404, message: 'Tournament not found' })
        }
        return generateFullBrackets(tournament)
      })

      this.get(urls.trainingTeams(), () => {
        if (mirageConfig.trainingteams.empty) {
          return []
        }
        if (mirageConfig.trainingteams.error) {
          return errorResponse()
        }
        return trainingTeams
      }, {
        timing: mirageConfig.trainingteams.slow ? 5000 : 1000
      })

      this.get(urls.trainingGotchis(), () => {
        if (mirageConfig.traininggotchis.empty) {
          return []
        }
        if (mirageConfig.traininggotchis.error) {
          return errorResponse()
        }
        return trainingGotchis
      }, {
        timing: mirageConfig.traininggotchis.slow ? 5000 : 1000
      })

      this.get(fixUrl(urls.team(':teamId')), (schema, request) => {
        if (mirageConfig.team.error) {
          return errorResponse()
        }
        const teamId = request.params.teamId
        const team = teamsById[teamId]?.leader ? teamsById[teamId] : {
          ...teamsById.DEFAULT,
          name: `Mock Team ${teamId}`,
          ...teamsById[teamId],
          id: teamId
        }
        return team
      })

      this.get(fixUrl(urls.battle(':id')), (schema, request) => {
        if (mirageConfig.battle.error) {
          return errorResponse()
        }
        let result = battlesById[request.params.id] || {
          ...battlesById.DEFAULT,
          id: request.params.id
        }
        // omit battle 'status' from response
        result = {
          ...result
        }
        delete result.status
        return result
      })

      this.get(fixUrl(urls.battleAnalyser(':id')), (schema, request) => {
        if (mirageConfig.battleAnalyser.error) {
          return errorResponse()
        }
        if (!request.params.id.match(/\d/)) {
          return errorResponse({ statusCode: 404, message: 'Battle not found' })
        }
        let result = battlesById[request.params.id] || {
          ...battlesById.DEFAULT,
          id: request.params.id
        }
        // omit battle 'status' from response
        // add analysis content if the battle is completed
        const analysis = result.winnerId ? {
          team1WinRate: 35,
          team2WinRate: 65
        } : null;
        result = {
          ...result,
          ...analysis
        }
        delete result.status
        return result
      }, {
        timing: mirageConfig.battleAnalyser.slow ? 5000 : 1000
      })

      this.get(fixUrl(urls.battleLogs('/battleLogsUrl')), () => {
        if (mirageConfig.battleLogs.error) {
          return errorResponse()
        }
        return battleLog
      })


      this.get(fixUrl(urls.gotchis({ address: ':address' })), (schema, request) => {
        if (mirageConfig.gotchis.error) {
          return errorResponse()
        }
        if (mirageConfig.gotchis.empty) {
          return []
        }
        if (mirageConfig.gotchis.long) {
          return [
            ...gotchis,
            ...gotchis.map(g => ({
              ...g,
              id: `${g.id}_2`
            })),
            ...gotchis.map(g => ({
              ...g,
              id: `${g.id}_3`
            })),
            ...gotchis.map(g => ({
              ...g,
              id: `${g.id}_4`
            }))
          ]
        }
        const address = request.params.address?.toLowerCase()
        if (gotchisForAddress[address]) {
          return gotchisForAddress[address]
        }
        return gotchis
      })

      this.post(fixUrl(urls.createTournamentTeam(':tournamentId')), async (schema, request) => {
        if (mirageConfig.createTournamentTeam.error) {
          return errorResponse({
            response: {
              errors: [{ message: "Gotchi is already registered" }],
              message: "Invalid team"
            }
          })
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const submittedTeam = JSON.parse(request.requestBody)
        const teamId = Date.now();
        const newTeam = {
          id: teamId,
          ...submittedTeam
        }
        // add team to the list of tournament teams so we can see the list is refetched
        const tournament = tournamentsById[request.params.tournamentId];
        if (tournament) {
          tournament.teams.push({
            id: teamId,
            name: newTeam.name,
            owner: newTeam.owner,
            ranking: 100,
            battlesWon: 0
          })
        }
        return newTeam
      }, {
        timing: mirageConfig.createTournamentTeam.slow ? 5000 : 1000
      })

      this.put(fixUrl(urls.editTournamentTeam({ tournamentId: ':tournamentId', teamId: ':teamId' })), async (schema, request) => {
        if (mirageConfig.editTournamentTeam.error) {
          return errorResponse({
            response: {
              errors: [{ message: "Gotchi special is not available" }],
              message: "Invalid team"
            }
          })
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const teamId = request.params.teamId;
        return {
          id: teamId
        }
      }, {
        timing: mirageConfig.editTournamentTeam.slow ? 5000 : 1000
      })

      this.delete(fixUrl(urls.deleteTournamentTeam({ tournamentId: ':tournamentId', teamId: ':teamId' })), async (schema, request) => {
        if (mirageConfig.deleteTournamentTeam.error) {
          return errorResponse({ message: 'Long error from the server long text long text long text long text long text long text long text long text long text long text.' })
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        // remove team from the list of tournament teams so we can see the list is refetched
        const tournament = tournamentsById[request.params.tournamentId];
        const teamId = request.params.teamId;
        if (tournament) {
          tournament.teams = tournament.teams?.filter(team => `${team.id}` !== teamId)
        }
        return 'ok'
      }, {
        timing: mirageConfig.deleteTournamentTeam.slow ? 5000 : 1000
      })

      this.get(fixUrl(urls.tournamentTeams(':tournamentId')), () => {
        if (mirageConfig.tournamentTeams.error) {
          return errorResponse()
        }
        return [
          {
            id: 0,
            name: "Mock Team A",
            gotchiIds: [162, 181, 183, 185, 186]
          },
          {
            id: 21,
            name: "Mock Team 21",
            gotchiIds: [201, 189, 235, 188, 199]
          }
        ]
      }, {
        timing: mirageConfig.tournamentTeams.slow ? 5000 : 100
      })

      this.get(fixUrl(urls.tournamentGotchis(':tournamentId')), () => {
        if (mirageConfig.tournamentGotchis.error) {
          return errorResponse()
        }
        const gotchis = []
        const NUM_GOTCHIS = mirageConfig.tournamentGotchis.empty ? 0 : mirageConfig.tournamentGotchis.long ? 200 : 30
        const owners = ['0x0000000000000000000000000000000000000001', '0xBfe09443556773958bae1699b786d8E9680B5571', '0x0000000000000000000000000000000000000003', '0x0000000000000000000000000000000000000004', '0x0000000000000000000000000000000000000005']
        for (let i = 0; i < NUM_GOTCHIS; i++) {
          const teamId = (i + 1) % 10 || (i + 1)
          gotchis.push({
            id: 1000 + i,
            onchainId: i,
            name: ((i + 1) % 7) ? `Gotchi ${String.fromCharCode(65 + i % 26)}${i > 26 ? i : ''}` : '',
            svgFront: LOCAL_URL_PREFIX + `/dev/gotchi_g${(i + 1) % 10}_front.svg`,
            brs: 100 + i%10,
            teamId,
            teamName: `Team ${String.fromCharCode(64 + teamId % 26)}${teamId > 26 ? teamId : ''}`,
            teamOwner: owners[i % owners.length]
          })
        }
        return gotchis
      }, {
        timing: mirageConfig.tournamentGotchis.slow ? 5000 : 100
      })

      this.get(fixUrl(urls.availableLendings(':tournamentId')), () => {
        if (mirageConfig.availableLendings.error) {
          return errorResponse()
        }
        const lendings = []
        const NUM_GOTCHIS = mirageConfig.availableLendings.empty ? 0 : 30
        const AVAILABLE_SPECIALS = [1, 2, 3, 4, 5, 6, 7, 8].map(id => ({ id }))
        const AVAILABLE_RARITIES = ['common', 'uncommon', 'rare', 'legendary', 'mythical', 'godlike', null]
        const startDateMs = new Date().getTime()

        for (let i = 0; i < NUM_GOTCHIS; i++) {
          lendings.push({
            id: 1780810 + i,
            timeCreated: new Date(startDateMs + (1000 * 60 * 60) * i),
            upfrontCost: `${0 + i}`,
            rentDuration: 60 * 60 * 12 * i,
            warning: !(i%3),
            gotchi: {
              onchainId: i,
              name: ((i + 1) % 7) ? `Gotchi ${String.fromCharCode(65 + i % 26)}${i > 26 ? i : ''}` : (i%3) ? '' : 'TestLongWordLongWordLongWordLongWordLongWordLongWordLongWordLongWordLongWordLongWordLongWordLongWordLongWord',
              brs: 100 + i%10,
              // nrg: 81,
              // agg: 84,
              // spk: 14,
              // brn: 100,
              // eyc: 82,
              // eys:  98
              // kinship: 525
              // xp: 1570
              svgFront: LOCAL_URL_PREFIX + `/dev/gotchi_g${(i + 1) % 10}_front.svg`,
              speed: 50 - i%10,
              health: 80 + i%10,
              crit: 80 + i%10,
              armor: 80 + i%10,
              evade: 70 + i%10,
              resist: 80 - i%10,
              magic: 80 - i%10,
              physical: 80 + i%10,
              accuracy: 100 - i%10,
              // attack: "magic",
              // actionDelay: 0.84
              availableSpecials: AVAILABLE_SPECIALS.slice(0, AVAILABLE_SPECIALS.length - i % AVAILABLE_SPECIALS.length),
              rarityType: AVAILABLE_RARITIES[i % AVAILABLE_RARITIES.length]
            }
          })
        }
        return lendings
      }, {
        timing: mirageConfig.availableLendings.slow ? 5000 : 100
      })

      this.get(fixUrl(urls.profile(':address')), (schema, request) => {
        if (mirageConfig.profile.error) {
          return errorResponse()
        }
        const address = request.params.address
        return profilesByAddress[address.toLowerCase()] || {
          ...profilesByAddress['DEFAULT'.toLowerCase()],
          address
        };
      }, {
        timing: mirageConfig.profile.slow ? 5000 : 100
      })

      this.get(fixUrl(urls.profileTeams()), (schema, request) => {
        if (mirageConfig.profileTeams.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const teams = (profileTeamsByAddress[address.toLowerCase()] || []).map(team => ({
          id: team.id,
          name: team.name,
          totalBrs: getTeamTotalBrs(team),
          leader: team.leader,
          ...Object.fromEntries(
            ['back1Gotchi', 'back2Gotchi', 'back3Gotchi', 'back4Gotchi', 'back5Gotchi',
            'front1Gotchi', 'front2Gotchi', 'front3Gotchi', 'front4Gotchi', 'front5Gotchi'].map(
              key =>
              [
                key,
                (
                  team[key] ?
                  {
                    id: team[key].id,
                    svgFront: team[key].svgFront,
                    specialId: team[key].specialId
                  }
                  : null
                )
              ]
            )
          )
        }));
        return teams
      }, {
        timing: mirageConfig.profileTeams.slow ? 3000 : 100
      })

      this.get(fixUrl(urls.profileInventory()), (schema, request) => {
        if (mirageConfig.profileInventory.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const inventoryCounts = (profileInventoryByAddress[address.toLowerCase()] || {});
        return Object.entries(inventoryCounts).map(([itemId, count]) => ({
          ...INVENTORY_ITEMS_BY_ID[itemId],
          count
        }))
      }, {
        timing: mirageConfig.profileInventory.slow ? 3000 : 100
      })

      const processPendingStoreBuys = function () {
        // the shopContractMock stores the simulated contract buys in its config object
        // the real server would process these blockchain events and update its database
        const pendingBuys = window.mockContractConfig?.buyItem?.pendingBuys
        if (pendingBuys) {
          for (let { address, itemId, amount } of pendingBuys) {
            const addressLc = address.toLowerCase()
            itemId = `${itemId}`
            if (!profileInventoryByAddress[addressLc]) {
              profileInventoryByAddress[address.toLowerCase()] = {}
            }
            const inventory = profileInventoryByAddress[addressLc]
            if (!inventory[itemId]) {
              inventory[itemId] = 0
            }
            inventory[itemId] += amount
          }
          window.mockContractConfig.buyItem.pendingBuys = []
        }
      }

      this.get(fixUrl(urls.profileInventoryItemCount(':itemId')), (schema, request) => {
        if (mirageConfig.profileInventoryItemCount.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        processPendingStoreBuys()

        const { itemId } = request.params

        const inventory = (profileInventoryByAddress[address.toLowerCase()] || {});
        let count = 0
        if (inventory && inventory[`${itemId}`]) {
          count = inventory[`${itemId}`]
        }
        const blockNumber = Date.now() // simulate last-synced blockNumber
        return { count, blockNumber };
      }, {
        timing: mirageConfig.profileInventoryItemCount.slow ? 3000 : 100
      })

      this.post(fixUrl(urls.updateProfile()), async (schema, request) => {
        if (mirageConfig.updateProfile.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const { name } = JSON.parse(request.requestBody)
        // save it to the profile (create one if necessary)
        const addressLc = address.toLowerCase()
        initProfileForAddress(addressLc)
        const profile = profilesByAddress[addressLc]
        profile.name = name
        return profile
      }, {
        timing: mirageConfig.updateProfile.slow ? 3000 : 1000
      })

      this.post(fixUrl(urls.updateProfileImage()), async (schema, request) => {
        if (mirageConfig.updateProfileImage.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const { filename } = JSON.parse(request.requestBody)
        // save it to the profile (create one if necessary)
        const addressLc = address.toLowerCase()
        initProfileForAddress(addressLc)
        const profile = profilesByAddress[addressLc]
        if (filename) {
          // this is an update request after uploading a new image
          profile.avatar = LOCAL_URL_PREFIX + '/dev/gotchi_g1_front.svg'
        } else {
          // this is a delete request
          profile.avatar = null
        }
        console.log('Mirage server finishing profile image update for ', filename, addressLc)
        return profile
      }, {
        timing: mirageConfig.updateProfileImage.slow ? 3000 : 1000
      })

      this.delete(fixUrl(urls.deleteProfileTeam({ teamId: ':teamId' })), async (schema, request) => {
        if (mirageConfig.deleteProfileTeam.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const { teamId } = request.params
        // delete team from profile
        const addressLc = address.toLowerCase()
        if (profileTeamsByAddress[addressLc]) {
          profileTeamsByAddress[addressLc] = profileTeamsByAddress[addressLc].filter(team => `${team.id}` !== teamId)
        }
        return ""
      }, {
        timing: mirageConfig.deleteProfileTeam.slow ? 3000 : 1000
      })

      const mockCloudUploadUrl = ({ address, code, fileName }) => `/mockCloud/${encodeURIComponent(address)}/${code}/uploadImage/${fileName}`
      const MOCK_IMAGE_MIME_TYPE = 'image/fromserver'

      this.post(fixUrl(urls.generateImageUploadUrl()), async (schema, request) => {
        if (mirageConfig.generateImageUploadUrl.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) { return unauthorizedErrorResponse() }

        const { filename } = JSON.parse(request.requestBody)
        const newFilename = `${address}_${Date.now()}_${filename}`
        return {
          url: mockCloudUploadUrl({ address, code: Date.now(), filename }),
          mimeType: MOCK_IMAGE_MIME_TYPE,
          filename: newFilename
        }
      }, {
        timing: mirageConfig.generateImageUploadUrl.slow ? 3000 : 1000
      })

      this.put(fixUrl(mockCloudUploadUrl({ address: ':address', code: ':code', fileName: ':fileName' })), async (schema, request) => {
        if (mirageConfig.mockCloudUploadUrl.error) {
          return errorResponse()
        }
        if (request.requestHeaders['Content-Type'] !== MOCK_IMAGE_MIME_TYPE) {
          return errorResponse({ message: 'Wrong Content-Type sent' })
        }
        return true
      }, {
        timing: mirageConfig.mockCloudUploadUrl.slow ? 3000 : 1000
      })

      this.get(fixUrl(urls.sessionNonce()), async () => {
        if (mirageConfig.sessionNonce.error) {
          return errorResponse()
        }
        return {
          nonce: 'test' + Date.now() // must be alphanumeric string
        }
      }, {
        timing: mirageConfig.sessionNonce.slow ? 3000 : 1000
      })

      this.post(fixUrl(urls.sessionLogin()), async (schema, request) => {
        if (mirageConfig.sessionLogin.error) {
          return errorResponse()
        }
        const { message } = JSON.parse(request.requestBody)
        const address = message.match(/Ethereum account:\s*(\w+)/)?.[1]
        console.log(`Mirage server simulating sign in with cookie for:`, address)
        setSessionAddressCookie(address)
        return 'OK'
      }, {
        timing: mirageConfig.sessionLogin.slow ? 3000 : 1000
      })

      this.post(fixUrl(urls.sessionLogout()), async (schema, request) => {
        if (mirageConfig.sessionLogout.error) {
          return errorResponse()
        }
        const address = checkCredentials(request)
        if (!address) {
          console.log('Mirage server simulating sign out, but no session present')
        } else {
          console.log(`Mirage server simulating sign out with cookie:`, address)
        }
        clearSessionAddressCookie()
        return
      }, {
        timing: mirageConfig.sessionLogout.slow ? 3000 : 1000
      })


      this.get(fixUrl(urls.shopItems()), async () => {
        if (mirageConfig.shopItems.error) {
          return errorResponse()
        }
        return SHOP_ITEMS
      }, {
        timing: mirageConfig.shopItems.slow ? 3000 : 1000
      })

      this.passthrough(request => {
        // pass through contract calls
        if (request.requestBody?.includes?.('eth_call')) {
          return true
        }
        // pass through unity files
        if (request.url.match(/Build.*\./)) {
          return true
        }
      })

      // From https://github.com/miragejs/miragejs/issues/339#issuecomment-626619513
      // ------------------------------
      // Needed because Chrome recognizes that the Mirage Response is not a real response
      // with setting instantiateStreaming to null we fallback to legacy WebAssembly instantiation
      // this works with the Mirage Response, therefore the app can start
      // for more details see: https://github.com/miragejs/miragejs/issues/339
      Object.defineProperty(window.WebAssembly, 'instantiateStreaming', {value: null});
      const oldPassthroughRequests = this.pretender.passthroughRequest.bind(this.pretender);
      this.pretender.passthroughRequest = (verb, path, request) => {
        // Needed because responseType is not set correctly in Mirages passthrough
        // for more details see: https://github.com/miragejs/miragejs/issues/1915
        if (
          verb === 'GET' &&
          ( path.match(/Build.*\.wasm$/) || path.match(/Build.*\.data/) ) // also needed for the Build.data
        ) {
          request.responseType = 'arraybuffer';
        }
        return oldPassthroughRequests(verb, path, request);
      };
      // ------------------------------
    },
  })

  return server
}


function generateFullBrackets ({ brackets=[], teams=[] }) {
  // This tournament logic is not intended to be correct,
  // just to generate the correct data structure with enough variations
  // for testing the frontend
  const allBattleIds = []
  const gapBetweenRoundsMs = 3 * 24 * 60 * 60 * 1000
  const fullBrackets = brackets.map(bracket => {
    const startDate = bracket.startDate
    const numberOfTeams = bracket.numberOfTeams
    const rounds = []
    const nowMs = Date.now()
    const startDateMs = new Date(startDate).getTime()
    let winners = teams.slice(0, numberOfTeams).map(team => ({ team: team.id, fromBattle: null }))
    let alternates = []
    let roundNumber = 1
    let lastRoundStatus = ''
    while (winners.length || alternates.length) {
      const roundId = `r${roundNumber}`
      const roundDateMs = startDateMs + gapBetweenRoundsMs * roundNumber
      const isFinished = nowMs > roundDateMs
      let status = ''
      if (isFinished) {
        status = 'completed'
      } else if (lastRoundStatus === 'completed') {
        status = 'started'
      } else {
        status = 'upcoming'
      }
      lastRoundStatus = status

      // generate round of winners
      const battles = []
      const newWinners = []
      if (winners.length) {
        for (let t = 0; t < winners.length; t += 2) {
          const battleTeams = [winners[t].team, winners[t + 1]?.team || null]
          const winnerId = isFinished ? battleTeams[0] : null
          const battleId =`${bracket.id}${roundId}b${t}`
          allBattleIds.push(battleId)
          const battle = {
            id: battleId,
            code: battleId.substring(2),
            parentBattleId1: winners[t].fromBattle,
            parentBattleId2: winners[t + 1]?.fromBattle,
            team1Id: battleTeams[0],
            team2Id: battleTeams[1],
            winnerId
          }
          battles.push(battle)
          newWinners.push({
            team: winnerId,
            fromBattle: battleId
          })
        }
        rounds.push({
          id: roundId,
          startDate: new Date(roundDateMs),
          roundStage: roundNumber - 1,
          name: `Round ${roundNumber}`,
          status,
          battles
        })
      }

      winners = newWinners.length > 1 ? newWinners : []

      roundNumber++
    }
    return {
      ...bracket,
      rounds
    }
  })
  // simulate data for 'previous battle in another bracket':
  // find a 'final' bracket (without a nextBracket), and
  // then annotate all its first-round battles with real battle ids from any OTHER bracket
  // (do not reference battles in same bracket, that will result in an infinite loop!)
  const lastBracket = fullBrackets.find(bracket => !bracket.nextBracket)
  if (lastBracket?.rounds?.[0]?.battles) {
    const battlesInThisBracket = []
    for (const round of lastBracket.rounds) {
      for (const battle of round.battles) {
        battlesInThisBracket.push(battle.id)
      }
    }
    const battlesFromOtherBrackets = allBattleIds.filter(id => !battlesInThisBracket.includes(id))
    if (battlesFromOtherBrackets.length) {
      for (const battle of lastBracket.rounds[0].battles) {
        battle.parentBattleId1 = battlesFromOtherBrackets[Math.floor(Math.random() * battlesFromOtherBrackets.length)]
        battle.parentBattleId2 = battlesFromOtherBrackets[Math.floor(Math.random() * battlesFromOtherBrackets.length)]
      }
      // test having 1 missing parent battle
      const secondBattle = lastBracket.rounds[0].battles[1]
      if (secondBattle) {
        secondBattle.parentBattleId2 = null
      }
      // test having 2 missing parent battles
      const thirdBattle = lastBracket.rounds[0].battles[2]
      if (thirdBattle) {
        thirdBattle.parentBattleId1 = null
        thirdBattle.parentBattleId2 = null
      }
      // to test having a previous battle but no result yet, delete the teams from the last battle
      const lastBattle = lastBracket.rounds[0].battles[lastBracket.rounds[0].battles.length - 1]
      if (lastBattle) {
        lastBattle.team1Id = null
        lastBattle.team2Id = null
      }
    }

    // simulate having a later battle with one incoming team from a different bracket
    // - add it onto the end of the hierarchy
    if (lastBracket?.rounds?.[lastBracket.rounds.length - 1].battles?.length === 1) {
      const lastRound = lastBracket.rounds[lastBracket.rounds.length - 1]
      const lastBattle = lastRound.battles[0]
      const incomingFromBattleId = battlesFromOtherBrackets[Math.floor(Math.random() * battlesFromOtherBrackets.length)]
      const newLastBattle = {
        id: 'testIncoming',
        code: 'tInc',
        parentBattleId1: lastBattle.id,
        parentBattleId2: incomingFromBattleId,
        losersBattleId1: null,
        losersBattleId2: incomingFromBattleId,
        team1Id: null,
        team2Id: teams[0].id, // just use any valid team ID for testing
        winnerId: null
      }
      const newLastRound = {
        id: 'rTestIncoming',
        name: 'Round w Incoming',
        roundStage: lastRound.roundStage + 1,
        startDate: new Date(lastRound.startDate.getTime() + gapBetweenRoundsMs),
        status: lastRound.status,
        battles: [newLastBattle]
      }
      lastBracket.rounds.push(newLastRound)
    }
  }

  return fullBrackets
}


function generateTrainingTeams () {
  const SPECIAL_IDS = [1, 2, 3, 4, 5]
  const NUM_TEAMS = 10
  const ONCHAIN_ID_OFFSET = 1000000
  let lastTrainingGotchiId = 1
  const DEFAULT_TRAINING_GOTCHI = {
    id: 0,
    onchainId: 0,
    name: 'Training Gotchi',
    svgBack: LOCAL_URL_PREFIX + '/dev/gotchi_TRAINING.svg',
    svgFront: LOCAL_URL_PREFIX + '/dev/gotchi_TRAINING.svg',
    svgLeft: LOCAL_URL_PREFIX + '/dev/gotchi_TRAINING.svg',
    svgRight: LOCAL_URL_PREFIX + '/dev/gotchi_TRAINING.svg',
    brs: 569,
    kinship: 829,
    level: 6,
    xp: 820,
    nrg: 21,
    agg: 79,
    spk: 88,
    brn: 76,
    eys: 3,
    eyc: 11,
    specialId: 'TODO',
    speed: 146,
    health: 228,
    accuracy: 71,
    evade: 23,
    physical: 150,
    magic: 380,
    armor: 1,
    resist: 0,
    crit: 5
  }

  const teams = []
  for (let i = 0; i < NUM_TEAMS; i++) {
    const pattern = FORMATION_PATTERNS[i % FORMATION_PATTERNS.length]
    const leaderIndex = i % 5
    for (let d = 0; d < DIFFICULTIES.length; d++) {
      const difficulty = DIFFICULTIES[d]
      const difficultyTitle = difficulty[0].toUpperCase() + difficulty.substring(1)
      const formationGotchis = {}
      const gotchiIds = []
      for (const rowKey of ['front', 'back']) {
        const patternRow = pattern[rowKey]
        for (let j = 0; j < patternRow.length; j++) {
          if (patternRow[j]) {
            const specialId = SPECIAL_IDS[gotchiIds.length]
            const gotchi = {
              ...DEFAULT_TRAINING_GOTCHI,
              name: `${difficultyTitle} Training Gotchi`,
              speed: DEFAULT_TRAINING_GOTCHI.speed + teams.length, // Change a value, so we can test sorting
              magic: 1 + Math.round(DEFAULT_TRAINING_GOTCHI.magic * d/DIFFICULTIES.length), // Change values, so we can test battles with training difficulties
              physical: 1 + Math.round(DEFAULT_TRAINING_GOTCHI.physical * d/DIFFICULTIES.length), // Change values, so we can test battles with training difficulties
              id: lastTrainingGotchiId,
              onchainId: lastTrainingGotchiId + ONCHAIN_ID_OFFSET,
              specialId,
              availableSpecials: [{ id: specialId }]
            }
            gotchiIds.push(gotchi.id)
            const gotchiNumber = j + 1
            formationGotchis[`${rowKey}${gotchiNumber}`] = gotchi.id
            formationGotchis[`${rowKey}${gotchiNumber}Gotchi`] = gotchi
            lastTrainingGotchiId++
          }
        }
      }
      const team = {
        id: teams.length + 1,
        name: `Demo ${difficultyTitle} Team ${teams.length + 1}`,
        owner: '0x0000000000000000000000000000000000000000',
        trainingPowerLevel: difficulty,
        ...formationGotchis,
        leader: gotchiIds[leaderIndex]
      }
      teams.push(team)
    }
  }
  return teams
}

