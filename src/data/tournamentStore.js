import { ref } from 'vue'
import orderBy from 'lodash.orderby'
import { defineStore } from 'pinia'
import { formatDate } from '../utils/date'
import useStatus from '../utils/useStatus'
import tournamentsService from './tournamentsService';

const BRACKET_STATUS = {
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  STARTED: 'started'
}

function getBracketStatusLabel (bracket) {
  if (!bracket.status) { return "" }
    if (bracket.status === BRACKET_STATUS.UPCOMING) {
      return 'Upcoming';
    } else if (bracket.status === BRACKET_STATUS.COMPLETED) {
      return 'Complete';
    } else if (bracket.status === BRACKET_STATUS.STARTED) {
      return 'In-progress';
    }
    return 'Unknown'
}

function getBracketStatusBadge (bracket) {
  if (!bracket.status) { return "" }
    if (bracket.status === BRACKET_STATUS.UPCOMING) {
      return 'Start ' + formatDate(bracket.startDate)
    } else if (bracket.status === BRACKET_STATUS.COMPLETED) {
      return 'Complete';
    } else if (bracket.status === BRACKET_STATUS.STARTED) {
      return 'In-progress';
    }
    return 'Unknown'
}

export const useTournamentStore = function (id) {
  return defineStore(`tournament__${id}`, () => {
    const tournament = ref(null);
    const { status: fetchStatus, setLoading, reset: resetFetch } = useStatus()

    // immediately fetch the tournament
    async function fetchTournament() {
      if (fetchStatus.value.loaded || fetchStatus.value.loading) { return }
      const [isStale, setLoaded, setError] = setLoading()
      try {
        const result = await tournamentsService.fetchTournament(id)
        if (isStale()) { return; }
        const processedResult = {
          ...result,
          brackets: orderBy(result.brackets || [], ['startDate'], ['desc']).map(bracket => ({
            ...bracket,
            statusLabel: getBracketStatusLabel(bracket),
            statusBadge: getBracketStatusBadge(bracket)
          })),
          teams: (result.teams || []).map(team => ({
            ...team,
            owner: team.owner?.toLowerCase() || ''
          }))
        }
        tournament.value = processedResult
        setLoaded()
      } catch (e) {
        setError(e.message)
      }
    }
    fetchTournament()

    const fullBrackets = ref(null)
    const { status: fullBracketsFetchStatus, setLoading: setFullBracketsLoading } = useStatus()
    async function fetchFullBrackets() {
      if (fullBracketsFetchStatus.value.loaded || fullBracketsFetchStatus.value.loading) { return }
      const [isStale, setLoaded, setError] = setFullBracketsLoading()
      try {
        const result = await tournamentsService.fetchTournamentBrackets(id)
        if (isStale()) { return; }
        fullBrackets.value = result.map(bracket => ({
          ...bracket,
          statusLabel: getBracketStatusLabel(bracket),
          statusBadge: getBracketStatusBadge(bracket)
        }))
        setLoaded()
      } catch (e) {
        setError(e.message)
      }
    }

    function refetchTournament () {
      resetFetch()
      fetchTournament()
    }

    return {
      tournament,
      fetchStatus,
      refetchTournament,
      fullBrackets,
      fullBracketsFetchStatus,
      fetchFullBrackets
    }
  })
}