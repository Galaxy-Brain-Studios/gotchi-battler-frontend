import { processGotchiModel } from './gotchiUtils'
import { useAccountStore } from './accountStore'

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
