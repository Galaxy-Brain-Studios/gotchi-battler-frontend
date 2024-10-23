import { processGotchiModel } from './gotchiUtils'
import { useAccountStore } from './accountStore'
import { useSpecialsStore } from './specialsStore'
import DIFFICULTIES from './trainingTeamDifficulties.json'

const teamBackPositionPropertyNames = ['back1', 'back2', 'back3', 'back4', 'back5']
const teamFrontPositionPropertyNames = ['front1', 'front2', 'front3', 'front4', 'front5']
const teamSubstitutePositionPropertyNames = ['sub1', 'sub2']
const teamPositionPropertyNames = [...teamBackPositionPropertyNames, ...teamFrontPositionPropertyNames, ...teamSubstitutePositionPropertyNames]
const teamGotchiPropertyNames = teamPositionPropertyNames.map(name => name + 'Gotchi')
const teamLeaderPositionPropertyName = 'leader'

export const processTeamModel = function(team) {
  if (!team) { return null }
  // training teams have a team difficulty
  const difficulty = team.trainingPowerLevel ? team.trainingPowerLevel.toLowerCase() : null
  // use the onchainId as the gotchi id (relevant for training teams and when editing own teams)
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

  const gotchis = []
  for (const propertyName of teamGotchiPropertyNames) {
    if (team[propertyName]) {
      const gotchi = processGotchiModel(team[propertyName])
      gotchis.push(gotchi)
    }
  }
  const back = teamBackPositionPropertyNames.map(propertyName => team[propertyName] || null)
  const front = teamFrontPositionPropertyNames.map(propertyName => team[propertyName] || null)
  const substitutes = teamSubstitutePositionPropertyNames.map(propertyName => team[propertyName] || null)

  return {
    id: team.id,
    name: team.name,
    owner: team.owner?.toLowerCase(),
    difficulty,
    formation: { back, front, substitutes },
    leader: team.leader,
    gotchis
  }
}

export const generateTeamToSubmit = function (team) {
  if (!team) { return null }
  const store = useAccountStore()
  const owner = store.address
  const gotchiTeam = team.gotchis.map(g => g.id)
  const gotchiSpecials = team.gotchis.map(g => g.specialId)
  const gotchiLeader = team.leader
  const gotchiFormation = [
    ...team.formation.back.map(gotchiId => gotchiId || 0),
    ...team.formation.front.map(gotchiId => gotchiId || 0)
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


const specialsStore = useSpecialsStore()

const getSpecialForBattle = function (specialId) {
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

export const generateTeamForBattle = function (team) {
  if (!team) { return null }
  // console.log('generateTeamForBattle', team)
  // expect incoming team to have
  // {
  //   formation: { back: [ids], front: [ids], substitutes [ids] } }
  //   gotchis: [gotchi objects]
  //   leader: id,
  //   name: 'string'
  // }

  // Transform to battle format:
  // {
  //   formation: { back: [gotchi objects], front: [gotchi objects] }
  //   leader: id,
  //   name: 'string'
  // }

  const gotchisById = Object.fromEntries(team.gotchis.map(gotchi => [gotchi.id, {
    // Only include the required properties from the game logic schema, because it will complain if there are unexpected properties
    id: gotchi.id,
    name: gotchi.name,
    speed: gotchi.speed,
    health: gotchi.health,
    crit: gotchi.crit,
    armor: gotchi.armor,
    evade: gotchi.evade,
    resist: gotchi.resist,
    magic: gotchi.magic,
    physical: gotchi.physical,
    accuracy: gotchi.accuracy,
    svgFront: gotchi.svgFront,
    svgBack: gotchi.svgBack,
    svgLeft: gotchi.svgLeft,
    svgRight: gotchi.svgRight,
    specialId: gotchi.specialId,
    special: getSpecialForBattle(gotchi.specialId)
  }]))
  const formation = {
    back: team.formation.back.map(gotchiId => gotchisById[gotchiId] || null),
    front: team.formation.front.map(gotchiId => gotchisById[gotchiId] || null)
  }
  const teamForBattle = {
    formation,
    leader: team.leader,
    name: team.name,
    owner: team.owner
  }
  // console.log('generated team', teamForBattle)
  return teamForBattle
}


/**
 * Copied from gotchi-battler-backend
 *
 * Finds the highest training power level in a team of gotchis.
 * Assumes gotchi names start with their rarity.
 *
 * @param {Array} gotchis - An array of gotchis in the team.
 * @returns {string|null} - The highest training power level found in the team, or null if there are no training gotchis.
 */
const DIFFICULTIES_HIGHEST_FIRST = [].concat(DIFFICULTIES).reverse()
export const findHighestTrainingPowerLevel = (gotchis) => {
  // Check if there are any training gotchies in the team (onchainId > 1000000)
  const trainingGotchis = gotchis.filter(x => x.onchainId > 1000000)
  // If there are training gotchies, set the trainingPowerLevel to the highest training gotchi
  let highestLevel = null
  if (trainingGotchis.length > 0) {
    // Extract power level from name e.g "Godlike ++++ Troll" -> "godlike"
    const powerLevels = trainingGotchis.map(x => x.name.split(' ')[0].toLowerCase())

    // Find the highest power level in the team
    highestLevel = DIFFICULTIES_HIGHEST_FIRST.find(x => powerLevels.includes(x)) || null
  }

  return highestLevel
}
