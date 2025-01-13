import { processGotchiModel } from './gotchiUtils'
import { useAccountStore } from './accountStore'
import { useSpecialsStore } from './specialsStore'
import { fetchedItems } from './useShop'
import DIFFICULTIES from './trainingTeamDifficulties.json'

const teamBackPositionPropertyNames = ['back1', 'back2', 'back3', 'back4', 'back5']
const teamBackPositionGotchiPropertyNames = teamBackPositionPropertyNames.map(name => name + 'Gotchi')
const teamFrontPositionPropertyNames = ['front1', 'front2', 'front3', 'front4', 'front5']
const teamFrontPositionGotchiPropertyNames = teamFrontPositionPropertyNames.map(name => name + 'Gotchi')
const teamSubstitutePositionPropertyNames = ['sub1', 'sub2']
const teamSubstitutePositionGotchiPropertyNames = teamSubstitutePositionPropertyNames.map(name => name + 'Gotchi')
const teamPositionPropertyNames = [...teamBackPositionPropertyNames, ...teamFrontPositionPropertyNames, ...teamSubstitutePositionPropertyNames]

// Convert server-side format ({ back1, back1Gotchi })
// to formation with embedded gotchis ({ formation: { front, back, substitutes } })
export const processTeamModel = function(team, options /* { useOnchainIds } */) {
  if (!team) { return null }
  // training teams have a team difficulty
  const difficulty = team.trainingPowerLevel ? team.trainingPowerLevel.toLowerCase() : null

  // optionally use the onchainId as the gotchi id (relevant when editing own teams)
  // this assumes that duplicates are not allowed, i.e. the onchain IDs are unique within the team
  if (options?.useOnchainIds) {
    for (const propertyName of teamPositionPropertyNames) {
      const oldId = team[propertyName]
      const onchainId = team[`${propertyName}Gotchi`]?.onchainId || null
      if (oldId && onchainId) {
        team[propertyName] = onchainId
        team[`${propertyName}Gotchi`].id = onchainId
        if (team.leader === oldId) {
          team.leader = onchainId
        }
      }
    }
  }

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
export const generateTournamentTeamToSubmit = function (team) {
  if (!team) { return null }
  const store = useAccountStore()
  const owner = store.address
  const gotchis = getEmbeddedGotchisFromFormation(team.formation)
  const gotchiTeam = gotchis.map(g => g.id)
  const gotchiSpecials = gotchis.map(g => g.specialId)
  const gotchiItems = gotchis.map(g => g.itemId || 0)
  const gotchiLeader = team.leader
  const gotchiFormation = [
    ...team.formation.back.map(gotchi => gotchi?.id || 0),
    ...team.formation.front.map(gotchi => gotchi?.id || 0)
  ]
  const name = team.name
  return {
    gotchiTeam,
    gotchiSpecials,
    gotchiItems,
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
    class: special.class,
    name: special.name,
    cooldown: special.cooldown,
    leaderPassive: special.leader
  }
}

const getItemForBattle = function (item) {
  // Only include the required properties from the game logic schema, because it will complain if there are unexpected properties
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    image: item.image,
    rarity: item.rarity,
    cost: item.cost,
    stat: item.stat,
    statValue: item.statValue
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
  "actionDelay",
  "itemId",
  "hauntId",
  "collateralType",
  "eyeShape",
  "eyeColor",
  "wearableBody",
  "wearableFace",
  "wearableEyes",
  "wearableHead",
  "wearableHandLeft",
  "wearableHandRight",
  "wearablePet"
]
// Convert formation with embedded gotchis ({ formation: { front, back, substitutes } })
// to essentially the same but stricter version for passing to game logic
export const generateTeamForBattle = async function (team) {
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

  const items = await fetchedItems()
  const itemsById = Object.fromEntries(items.map(item => [item.id, item]))

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
    // Look up an item (optional); only include it if we have the item details (don't trust the provided item object)
    if (gotchi.itemId) {
      const item = itemsById[gotchi.itemId]
      if (!item) {
        console.error("Could not find item", gotchi.itemId)
        delete result.itemId
      } else {
        result.item = getItemForBattle(item)
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
