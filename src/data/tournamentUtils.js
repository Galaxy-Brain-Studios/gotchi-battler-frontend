const TOURNAMENT_API_STATE_TO_STATUS = {
  UPCOMING: "upcoming",
  REGISTERING: "registering",
  PREPARATION: "active_preparation",
  BATTLE: "active_battle",
  FINISHED: "completed"
}

const getTournamentStatus = function (tournamentFromApi) {
  if (!tournamentFromApi?.state) {
    console.error('Tournament is missing state', tournamentFromApi);
    return ''
  }
  const status = TOURNAMENT_API_STATE_TO_STATUS[tournamentFromApi.state]
  if (!status) {
    console.error('Unexpected tournament state', tournamentFromApi);
    return ''
  }
  return status
}

export const processTournamentModel = function (jsonData) {
  if (!jsonData) { return null }
  return {
    ...jsonData,
    endDate: jsonData.endDate ? new Date(jsonData.endDate) : null,
    startDate: jsonData.startDate ? new Date(jsonData.startDate) : null,
    status: getTournamentStatus(jsonData)
  }
}
