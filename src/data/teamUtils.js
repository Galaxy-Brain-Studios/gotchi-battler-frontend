import { processGotchiModel } from './gotchiUtils'
import { useAccountStore } from './accountStore'
import { useSpecialsStore } from './specialsStore'
import DIFFICULTIES from './trainingTeamDifficulties.json'

const teamBackPositionPropertyNames = ['back1', 'back2', 'back3', 'back4', 'back5']
const teamBackPositionGotchiPropertyNames = teamBackPositionPropertyNames.map(name => name + 'Gotchi')
const teamFrontPositionPropertyNames = ['front1', 'front2', 'front3', 'front4', 'front5']
const teamFrontPositionGotchiPropertyNames = teamFrontPositionPropertyNames.map(name => name + 'Gotchi')
const teamSubstitutePositionPropertyNames = ['sub1', 'sub2']
const teamSubstitutePositionGotchiPropertyNames = teamSubstitutePositionPropertyNames.map(name => name + 'Gotchi')
// const teamPositionPropertyNames = [...teamBackPositionPropertyNames, ...teamFrontPositionPropertyNames, ...teamSubstitutePositionPropertyNames]
// const teamGotchiPropertyNames = teamPositionPropertyNames.map(name => name + 'Gotchi')
// const teamLeaderPositionPropertyName = 'leader'

// Convert server-side format ({ back1, back1Gotchi })
// to formation with embedded gotchis ({ formation: { front, back, substitutes } })
export const processTeamModel = function(team) {
  if (!team) { return null }
  // training teams have a team difficulty
  const difficulty = team.trainingPowerLevel ? team.trainingPowerLevel.toLowerCase() : null

  // use the onchainId as the gotchi id (relevant for training teams and when editing own teams)
  // TODO is this still necessary/correct?
  /*
  const gotchiIdToOnchainId = {}
  for (const propertyName of teamGotchiPropertyNames) {
    const gotchi = team[propertyName]
    if (gotchi) {
      gotchiIdToOnchainId[gotchi.id] = gotchi.onchainId
      gotchi.id = gotchi.onchainId
    }
  }
  for (const propertyName of [...teamPositionPropertyNames, teamLeaderPositionPropertyName]) {
    const id = team[propertyName]
    if (id && gotchiIdToOnchainId[id]) {
      team[propertyName] = gotchiIdToOnchainId[id]
    }
  }
  */

  const back = teamBackPositionGotchiPropertyNames.map(propertyName => processGotchiModel(team[propertyName]))
  const front = teamFrontPositionGotchiPropertyNames.map(propertyName => processGotchiModel(team[propertyName]))
  const substitutes = teamSubstitutePositionGotchiPropertyNames.map(propertyName => processGotchiModel(team[propertyName]))
  const formation = { back, front, substitutes }

  return {
    id: team.id,
    name: team.name,
    owner: team.owner?.toLowerCase(),
    difficulty,
    formation,
    leader: team.leader,
    totalBrs: getTotalBrsFromFormation(formation)
  }
}

// Extract a list of gotchi objects from a formation containing embedded gotchis
export const getEmbeddedGotchisFromFormation = function (formation) {
  return [
    formation.front,
    formation.back,
    (formation.substitutes || [])
  ].flat().filter(g => !!g)
}

// Convert formation with embedded gotchis ({ formation: { front, back, substitutes } })
// to server-side contract-style format (gotchiFormation: [b,b,b,b,b,f,f,f,f,f] ids)
// TODO server likely to expect new format
export const generateTournamentTeamToSubmit = function (team) {
  if (!team) { return null }
  const store = useAccountStore()
  const owner = store.address
  const gotchis = getEmbeddedGotchisFromFormation(team.formation)
  const gotchiTeam = gotchis.map(g => g.id)
  const gotchiSpecials = gotchis.map(g => g.specialId)
  const gotchiLeader = team.leader
  const gotchiFormation = [
    ...team.formation.back.map(gotchi => gotchi?.id || 0),
    ...team.formation.front.map(gotchi => gotchi?.id || 0)
  ]
  const name = team.name
  return {
    gotchiTeam,
    gotchiSpecials,
    gotchiFormation,
    gotchiLeader,
    name,
    owner
  }
}

// init this later, when pinia is init'ed
let specialsStore = null

const getSpecialForBattle = function (specialId) {
  if (!specialsStore) {
    specialsStore = useSpecialsStore()
  }
  const special = specialsStore.specialsById[specialId]
  if (!special) { return null }
  // Only include the required properties from the game logic schema, because it will complain if there are unexpected properties
  return {
    id: special.id,
    name: special.name,
    cooldown: special.cooldown,
    leaderPassive: special.leader
  }
}


const GOTCHI_PROPS_REQUIRED = [
  "id",
  "name",
  "speed",
  "health",
  "crit",
  "armor",
  "evade",
  "resist",
  "magic",
  "physical",
  "accuracy",
  "svgFront",
  "svgBack",
  "svgLeft",
  "svgRight",
  "specialId",
  "special"
]
const GOTCHI_PROPS_OPTIONAL = [
  "snapshotBlock",
  "onchainId",
  "brs",
  "nrg",
  "agg",
  "spk",
  "brn",
  "eyc",
  "eys",
  "kinship",
  "xp",
  "attack",
  "actionDelay"
]
// Convert formation with embedded gotchis ({ formation: { front, back, substitutes } })
// to essentially the same but stricter version for passing to game logic
export const generateTeamForBattle = function (team) {
  if (!team) { return null }
  // console.log('generateTeamForBattle', team)
  // expect incoming team to have
  // {
  //   formation: { back: [embedded gotchi objects], front, substitutes } }
  //   leader: id,
  //   name: 'string'
  // }

  // Transform to battle format:
  // {
  //   formation: { back: [embedded gotchi objects], front }
  //   leader: id,
  //   name: 'string'
  // }

  const getGotchiForBattle = function (gotchi) {
    if (!gotchi) { return null }
    const result = {}
    // Only include properties from the game logic schema, because it will complain if there are unexpected properties
    for (const prop of GOTCHI_PROPS_REQUIRED) {
      result[prop] = gotchi[prop]
    }
    result.special = getSpecialForBattle(gotchi.specialId)
    // Don't include properties with undefined values, as that will also complain
    for (const prop of GOTCHI_PROPS_OPTIONAL) {
      if (typeof gotchi[prop] !== 'undefined') {
        result[prop] = gotchi[prop]
      }
    }
    return result
  }
  const teamForBattle = {
    formation: {
      back: team.formation.back.map(getGotchiForBattle),
      front: team.formation.front.map(getGotchiForBattle)
    },
    leader: team.leader,
    name: team.name,
    owner: team.owner || '0x0000000000000000000000000000000000000000'
  }
  // console.log('generated team', teamForBattle)
  return teamForBattle
}


/**
 * // TODO replace this with a different measure that doesn't rely on training gotchis, e.g. total BRS of team
 * Copied from gotchi-battler-backend
 *
 * Finds the highest training power level in a team of gotchis.
 * Assumes gotchi names start with their rarity.
 *
 * @param {Array} gotchis - An array of gotchis in the team.
 * @returns {string|null} - The highest training power level found in the team, or null if there are no training gotchis.
 */
const DIFFICULTIES_HIGHEST_FIRST = [].concat(DIFFICULTIES).reverse()
export const findHighestTrainingPowerLevel = (team) => {
  // Check if there are any training gotchis in the team (onchainId > 1000000)
  const gotchis = getEmbeddedGotchisFromFormation(team.formation)
  const trainingGotchis = gotchis.filter(x => x.onchainId > 1000000)
  // If there are training gotchis, set the trainingPowerLevel to the highest training gotchi
  let highestLevel = null
  if (trainingGotchis.length > 0) {
    // Extract power level from name e.g "Godlike ++++ Troll" -> "godlike"
    const powerLevels = trainingGotchis.map(x => x.name.split(' ')[0].toLowerCase())

    // Find the highest power level in the team
    highestLevel = DIFFICULTIES_HIGHEST_FIRST.find(x => powerLevels.includes(x)) || null
  }

  return highestLevel
}

export const getTotalBrsFromFormation = function(formation) {
  const gotchis = getEmbeddedGotchisFromFormation(formation)
  let total = 0
  for (const gotchi of gotchis) {
    if (gotchi.brs) {
      total += gotchi.brs
    }
  }
  return total
}
