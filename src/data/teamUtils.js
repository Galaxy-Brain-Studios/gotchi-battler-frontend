import { processGotchiModel } from './gotchiUtils'
import { useAccountStore } from './accountStore'

const teamBackPositionPropertyNames = ['back1', 'back2', 'back3', 'back4', 'back5']
const teamFrontPositionPropertyNames = ['front1', 'front2', 'front3', 'front4', 'front5']
const teamPositionPropertyNames = [...teamBackPositionPropertyNames, ...teamFrontPositionPropertyNames]
const teamGotchiPropertyNames = teamPositionPropertyNames.map(name => name + 'Gotchi')

export const processTeamModel = function(team) {
  if (!team) { return null }
  // training teams have a team difficulty
  const difficulty = team.trainingPowerLevel ? team.trainingPowerLevel.toLowerCase() : null

  const gotchis = []
  for (const propertyName of teamGotchiPropertyNames) {
    if (team[propertyName]) {
      const gotchi = processGotchiModel(team[propertyName])
      gotchis.push(gotchi)
    }
  }
  const back = teamBackPositionPropertyNames.map(propertyName => team[propertyName] || null)
  const front = teamFrontPositionPropertyNames.map(propertyName => team[propertyName] || null)

  return {
    id: team.id,
    name: team.name,
    owner: team.owner?.toLowerCase(),
    difficulty,
    formation: { back, front },
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
