import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import useStatus from '../utils/useStatus'
import battlesService from './battlesService';
import { generateTeamForBattle, findHighestTrainingPowerLevel } from './teamUtils'

export const useTrainingBattlesStore = defineStore('trainingBattles', () => {
  const battleIds = ref([]);

  function addBattle (battleId) {
    battleIds.value.push(battleId)
  }

  const trainingBattles = computed(() => {
    if (!battleIds.value) { return [] }
    return battleIds.value.map(id => useBattleStore(id)().battle)
  })

  return {
    trainingBattles,
    addBattle
  }
})

export const useBattleStore = function (id, battleModel) {
  return defineStore(`battle__${id}`, () => {
    const battle = ref(null);
    const { status: fetchStatus, setLoading } = useStatus()

    async function fetchBattle(id) {
      if (fetchStatus.value.loaded || fetchStatus.value.loading) { return }
      const [isStale, setLoaded, setError] = setLoading()
      try {
        const result = await battlesService.fetchBattle(id)
        if (isStale()) { return; }
        battle.value = result
        setLoaded()
      } catch (e) {
        setError(e.message)
      }
    }

    if (battleModel) {
      // eslint-disable-next-line no-unused-vars
      const [isStale, setLoaded, setError] = setLoading()
      // data has been provided up-front
      battle.value = battleModel
      setLoaded()
    } else {
      // immediately fetch the battle
      fetchBattle(id)
    }

    return {
      battle,
      fetchStatus
    }
  })
}

export const useBattleAnalyserStore = function (id) {
  return defineStore(`battleAnalyser__${id}`, () => {
    const battle = ref(null);
    const { status: fetchStatus, setLoading } = useStatus()

    async function fetchBattle(id) {
      if (fetchStatus.value.loaded || fetchStatus.value.loading) { return }
      const [isStale, setLoaded, setError] = setLoading()
      try {
        const result = await battlesService.fetchBattleAnalyser(id)
        if (isStale()) { return; }
        battle.value = result
        setLoaded()
      } catch (e) {
        setError(e.message)
      }
    }

    // immediately fetch the battle
    fetchBattle(id)

    return {
      battle,
      fetchStatus
    }
  })
}

// Run a single training battle which can be displayed,
// and also another 200 battles to get a win rate
// Expect teams with formation of embedded gotchis.
export const runTrainingBattle = async function ({ team1, team2 }) {
  const team1ForBattle = await generateTeamForBattle(team1)
  const team2ForBattle = await generateTeamForBattle(team2)
  const result = battlesService.runTrainingBattle({
    team1: team1ForBattle,
    team2: team2ForBattle
  })
  if (!result.id) {
    throw new Error('Expected battle id after submitting training battle')
  }
  const batchResult = battlesService.runTrainingBattles({
    team1: team1ForBattle,
    team2: team2ForBattle
  }, 200)

  // battle object returned: store it, with teams in the originally provided format
  // Generate training team difficulty based on the gotchis present in the team
  const team2Extended = {
    ...team2,
    difficulty: findHighestTrainingPowerLevel(team2)
  }
  const battle = {
    ...result,
    ...batchResult,
    teams: [team1, team2Extended]
  }
  useBattleStore(result.id, battle)()
  console.log('Stored battle', battle)
  useTrainingBattlesStore().addBattle(result.id)

  return result.id
}
