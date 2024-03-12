import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useAccountStore } from './accountStore'
import useStatus from '../utils/useStatus'
import battlesService from './battlesService';

const accountStore = useAccountStore()

export const useTrainingBattlesStore = defineStore('trainingBattles', () => {
  const battlesByAddress = ref({});

  function addBattle (address, battleId) {
    if (!battlesByAddress.value[address]) {
      battlesByAddress.value[address] = []
    }
    battlesByAddress.value[address].push(battleId)
  }

  function getBattles (address) {
    const battleIds = battlesByAddress.value[address]
    if (!battleIds) { return [] }
    return battleIds.map(id => useBattleStore(id)().battle)
  }

  return {
    getBattles,
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

export const submitTrainingBattle = async function ({ team, trainingTeam, address, message, signature }) {
  const result = await battlesService.submitTrainingBattle({
    team,
    trainingTeam,
    address,
    message,
    signature
  })
  if (!result.id) {
    throw new Error('Expected battle id after submitting training battle')
  }
  if (result.teams) {
    // battle object returned: store it
    useBattleStore(result.id, result)()
    useTrainingBattlesStore().addBattle(address, result.id)
  }
  return result.id
}

export const signTrainingBattle = async function({ team, trainingTeam }) {
  const message = JSON.stringify({ team, trainingTeam })
  const signature = await accountStore.signMessage({
    message
  })
  return {
    address: accountStore.address,
    message,
    signature
  }
}