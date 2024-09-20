import { createServer, Response } from 'miragejs'
import { verifyMessage } from 'viem'

import { urls } from '../data/api.js'
import tournaments from './tournaments.json'
import teams from './teams.json'
import battles from './battles.json'
import battleLog from './battleLog.json'
import gotchisForAddress from './gotchisForAddress.js'
import FORMATION_PATTERNS from '../components/team/formationPatterns.json'
import DIFFICULTIES from '../data/trainingTeamDifficulties.json'

const tournamentsById = Object.fromEntries(tournaments.map(t => [t.id, t]))
const teamsById = Object.fromEntries(teams.map(t => [t.id, t]))
teamsById.DEFAULT = teams[0]
const battlesById = Object.fromEntries(battles.map(b => [b.id, b]))
battlesById.DEFAULT = battles[0]
let lastTrainingBattleId = 1000

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
const trainingGotchisById = Object.fromEntries(trainingGotchis.map(g => [g.onchainId, g]))

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
  trainingbattle: {
    error: false,
    slow: false
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
  }
};

const errorResponse = ({ statusCode=400, message='Error from the server', response=null }={}) => new Response(
  statusCode, {}, (response || { error: message })
)

const verifySignature = async function (request) {
  // verify the signature
  const address = request.params.address
  const { message, signature } = request.queryParams
  const postBody = JSON.parse(request.requestBody)
  const reconstructedMessage = JSON.stringify(postBody)
  console.log({ message, reconstructedMessage })
  let validSignature = false
  if (signature.startsWith('mockSignature')) {
    console.log('mirage server accepting mockSignature')
    validSignature = true
  } else {
    const skipValidation = !!request.requestHeaders['X-GB-DEV-SKIP-SIGNATURE']
    if (skipValidation) {
      console.log('mirage server skipping signature verification')
      validSignature = true
    } else {
      console.log('mirage server verifying signature')
      validSignature = await verifyMessage({
        address,
        message,
        signature
      })
    }
  }
  return validSignature
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

      this.post(fixUrl(urls.trainingBattle({ address: ':address', message: ':message', signature: ':signature' })), async (schema, request) => {
        if (mirageConfig.trainingbattle.error) {
          return errorResponse({ message: 'Long error from the server long text long text long text long text long text long text long text long text long text long text.' })
        }
        const validSignature = await verifySignature(request);
        if (!validSignature) {
          return errorResponse({ message: 'Signature verification failed' })
        }

        // generate a battle report
        // We don't have the full gotchi info from the POST, so modify an existing mock battle
        const postBody = JSON.parse(request.requestBody)
        const submittedTeam = postBody.team
        const submittedTrainingTeam = postBody.trainingTeam
        const battle = JSON.parse(JSON.stringify(battles.find(b => b.status === 'completed')))
        lastTrainingBattleId++
        battle.id = lastTrainingBattleId + 'trainingBattleIdLongString'
        battlesById[battle.id] = battle
        battle.createdAt = new Date()
        battle.logs += battle.id
        battle.team1WinRate = '40%'
        battle.team2WinRate = '60%'
        delete battle.status
        battle.team1.id = lastTrainingBattleId + 1
        if (submittedTeam) {
          battle.team1.name = submittedTeam.name
          const gotchiIds = submittedTeam.gotchiTeam
          const leaderId = submittedTeam.gotchiLeader
          battle.team1.leader = 10000 + leaderId
          for (const key of ['back1', 'back2', 'back3', 'back4', 'back5', 'front1', 'front2', 'front3', 'front4', 'front5']) {
            const gotchi = battle.team1[`${key}Gotchi`]
            if (gotchi) {
              const id = gotchiIds.pop()
              gotchi.onchainId = id
              // training gotchi database ID is different to the onchain id
              gotchi.id = 10000 + id
              battle.team1[key] = 10000 + id
            }
          }
        }
        if (submittedTrainingTeam) {
          battle.team2.id = battle.team1.id + 10000
          battle.team2.name = submittedTrainingTeam.name
          battle.team2.leader = submittedTrainingTeam.gotchiLeader
          battle.team2.trainingPowerLevel = (battle.team1.id % 2 === 0) ? 'Common' : 'Mythical' // real server would need to calculate this
          const getSpecialForGotchi = function (gotchiId) {
            const index = submittedTrainingTeam.gotchiTeam.indexOf(gotchiId)
            return submittedTrainingTeam.gotchiSpecials[index]
          }
          const formationIds = submittedTrainingTeam.gotchiFormation
          for (const key of ['back1', 'back2', 'back3', 'back4', 'back5', 'front1', 'front2', 'front3', 'front4', 'front5']) {
            const id = formationIds.shift()
            battle.team2[key] = id || null
            let gotchi = trainingGotchisById[id] || null
            if (gotchi) {
              gotchi = {
                ...gotchi,
                specialId: getSpecialForGotchi(id)
              }
              battle.team2[key] = gotchi.id // submitted onchainId, but return the gotchi.id in the battle model
            }
            battle.team2[`${key}Gotchi`] = gotchi
          }
        }
        battle.winnerId = (battle.team1.id % 2 === 0) ? battle.team1.id : battle.team2.id

        return battle
      }, {
        timing: mirageConfig.trainingbattle.slow ? 5000 : 1000
      })

      this.post(fixUrl(urls.createTournamentTeam({ tournamentId: ':tournamentId', address: ':address', message: ':message', signature: ':signature' })), async (schema, request) => {
        if (mirageConfig.createTournamentTeam.error) {
          return errorResponse({
            response: {
              errors: [{ message: "Gotchi is already registered" }],
              message: "Invalid team"
            }
          })
        }
        const validSignature = await verifySignature(request);
        if (!validSignature) {
          return errorResponse({ message: 'Signature verification failed' })
        }

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

      this.put(fixUrl(urls.editTournamentTeam({ tournamentId: ':tournamentId', teamId: ':teamId', address: ':address', message: ':message', signature: ':signature' })), async (schema, request) => {
        if (mirageConfig.editTournamentTeam.error) {
          return errorResponse({
            response: {
              errors: [{ message: "Gotchi special is not available" }],
              message: "Invalid team"
            }
          })
        }
        const validSignature = await verifySignature(request);
        if (!validSignature) {
          return errorResponse({ message: 'Signature verification failed' })
        }
        const teamId = request.params.teamId;
        return {
          id: teamId
        }
      }, {
        timing: mirageConfig.editTournamentTeam.slow ? 5000 : 1000
      })

      this.delete(fixUrl(urls.deleteTournamentTeam({ tournamentId: ':tournamentId', teamId: ':teamId', address: ':address', message: ':message', signature: ':signature' })), async (schema, request) => {
        if (mirageConfig.deleteTournamentTeam.error) {
          return errorResponse({ message: 'Long error from the server long text long text long text long text long text long text long text long text long text long text.' })
        }
        const validSignature = await verifySignature(request);
        if (!validSignature) {
          return errorResponse({ message: 'Signature verification failed' })
        }

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
            svgFront: `/dev/gotchi_g${(i + 1) % 10}_front.svg`,
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
              svgFront: `/dev/gotchi_g${(i + 1) % 10}_front.svg`,
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
        return {
          address,
          name: null,
          imageUrl: null
        };
        // return {
        //   address,
        //   name: 'Custom Name',
        //   imageUrl: '/dev/gotchi_g1.svg'
        // }
      }, {
        timing: mirageConfig.profile.slow ? 5000 : 100
      })

      this.passthrough(request => {
        // pass through contract calls
        if (request.requestBody?.includes('eth_call')) {
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
    svgBack: '/dev/gotchi_TRAINING.svg',
    svgFront: '/dev/gotchi_TRAINING.svg',
    svgLeft: '/dev/gotchi_TRAINING.svg',
    svgRight: '/dev/gotchi_TRAINING.svg',
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
    health: -228,
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
      const formationGotchis = {}
      const gotchiIds = []
      for (const rowKey of ['front', 'back']) {
        const patternRow = pattern[rowKey]
        for (let j = 0; j < patternRow.length; j++) {
          if (patternRow[j]) {
            const specialId = SPECIAL_IDS[gotchiIds.length]
            const gotchi = {
              ...DEFAULT_TRAINING_GOTCHI,
              speed: DEFAULT_TRAINING_GOTCHI.speed + teams.length, // Change a value, so we can test sorting
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
        name: `Demo ${DIFFICULTIES[d]} Team ${teams.length + 1}`,
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

