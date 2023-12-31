<script setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import { formatDateTime } from '../../utils/date'
  import { useAccountStore } from '../../data/accountStore'
  import { useBattleStore, submitTrainingBattle, signTrainingBattle, useTrainingBattlesStore } from '../../data/battleStore'
  import SiteHeading from '../common/SiteHeading.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteError from '../common/SiteError.vue'
  import SiteConnectWallet from '../site/SiteConnectWallet.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
  import BattleField from '../battle/BattleField.vue'
  import BattleVs from '../battle/BattleVs.vue'
  import CreateTeamDialog from '../team/CreateTeamDialog.vue'
  import TrainingTeamsDialog from './TrainingTeamsDialog.vue'
  import useStatus from '../../utils/useStatus'
  import { generateTeamToSubmit } from '../../data/teamUtils'

  const store = useAccountStore()
  const { isConnected, address } = storeToRefs(store)

  const team1 = ref(null)
  const team2 = ref(null)

  const battle = computed(() => ({
    teams: [team1.value, team2.value]
  }))

  const createTeamDialogIsOpen = ref(false)
  const trainingTeamsDialogIsOpen = ref(false)

  // Match (Battle)
  const completedBattleId = ref(null)
  const { status: submitStatus, setLoading, reset: resetSubmit } = useStatus()

  const completedBattle = computed(() => {
    if (!completedBattleId.value) { return null }
    const battleStore = useBattleStore(completedBattleId.value)()
    return battleStore.battle
  })

  const showCompletedBattleWinner = ref(false)

  watch(
    () => address.value,
    () => {
      team1.value = null
      completedBattleId.value = null
      showCompletedBattleWinner.value = false
    }
  )

  const isEditingLocked = computed(() => {
    return submitStatus.value.loading || submitStatus.value.loaded
  })

  const canStartMatch = computed(() => {
    if (!address.value) { return false }
    if (!team1.value || !team2.value) { return false }
    if (isEditingLocked.value) { return false }
    if (completedBattleId.value) { return false }
    return true
  })

  const teamToSubmit = computed(() => {
    if (!team1.value) { return null }
    return {
      ...generateTeamToSubmit(team1.value),
      owner: address.value,
    }
  })

  const battleToSubmit = computed(() =>({
    team: teamToSubmit.value,
    trainingTeamId: team2.value?.id
  }))

  // if any of the data for submitting a battle changes while submitting,
  // cancel the submission
  watch(
    () => ({
      address: address.value,
      battleToSubmit: battleToSubmit.value
    }),
    () => resetSubmit()
  )

  async function startMatch () {
    if (!canStartMatch.value) { return }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const { address, message, signature } = await signTrainingBattle(battleToSubmit.value)
      if (isStale()) { return }
      const battleId = await submitTrainingBattle({
        ...battleToSubmit.value,
        address,
        message,
        signature
      })
      if (isStale()) { return }
      if (battleId) {
        completedBattleId.value = battleId
        showCompletedBattleWinner.value = false
      }
      setLoaded()
    } catch (e) {
      if (isStale()) { return }
      setError(e.message)
    }
  }

  function resetAndEditTeams () {
    resetSubmit()
    completedBattleId.value = null
  }

  // List of training battles for the current address
  const trainingBattleStore = useTrainingBattlesStore()
  const trainingBattles = computed(() => {
    if (!address.value) { return null }
    return trainingBattleStore.getBattles(address.value)
  })

  function loadTrainingBattle (battle) {
    completedBattleId.value = battle.id
    // console.log('loading training battle', 'old team', team1.value, 'new team', battle.teams[0])

    // Training battle gotchi IDs are different to the onchain gotchi IDs.
    // So that we can load old training battles, set the gotchi IDs back to the onchain ones.
    const newTeam1 = JSON.parse(JSON.stringify(battle.teams[0]))
    const idToOnchainId = Object.fromEntries(newTeam1.gotchis.map(gotchi => [gotchi.id, gotchi.onchainId]))
    newTeam1.gotchis = newTeam1.gotchis.map(gotchi => ({
      ...gotchi,
      id: gotchi.onchainId
    }))
    newTeam1.formation = {
      back: newTeam1.formation.back.map(id => idToOnchainId[id] || null),
      front: newTeam1.formation.front.map(id => idToOnchainId[id] || null)
    }
    newTeam1.leader = idToOnchainId[newTeam1.leader] || null

    // console.log('adjusted team for loading', newTeam1)
    team1.value = newTeam1
    team2.value = battle.teams[1]
    resetSubmit()
    // wait for nextTick because changing team will cause resetSubmit again
    nextTick(() => {
      // eslint-disable-next-line no-unused-vars
      const [isStale, setLoaded, setError] = setLoading()
      setLoaded()
    })
  }
</script>

<template>
  <main>
    <SiteHeading>Training</SiteHeading>
    <BattleField
      class="training-battle"
      :battle="completedBattle || battle"
      emptyTeam1Name="Create team"
      emptyTeam2Name="Choose opponent"
    >
      <template #empty-team-1>
        <SiteButton
          v-if="isConnected && !isEditingLocked"
          @click="createTeamDialogIsOpen = true"
        >
          Create Team
        </SiteButton>
        <SiteConnectWallet v-else />
      </template>
      <template #empty-team-2>
        <SiteButton
          v-if="!isEditingLocked"
          @click="trainingTeamsDialogIsOpen = true"
        >
          Choose Team
        </SiteButton>
      </template>
      <template #not-started>
        <BattleVs
          v-if="!team1 || !team2"
          class="training-vs"
          :size="4"
        />
        <div v-else-if="!canStartMatch">
          Loading...
        </div>
        <template v-else>
          <SiteError
            v-if="submitStatus.error"
            class="training-battle__error"
          >
            {{ submitStatus.errorMessage }}
          </SiteError>
          <SiteButtonPrimary
            class="training-battle__start"
            @click="startMatch"
          >
            Start Match
          </SiteButtonPrimary>
        </template>
      </template>
      <template
        v-if="team1 && !isEditingLocked"
        #after-team-1
      >
        <SiteButton @click="createTeamDialogIsOpen = true">
          Edit Your Team
        </SiteButton>
      </template>
      <template
        #after-team-2
        v-if="team2 && !isEditingLocked"
      >
        <SiteButton @click="trainingTeamsDialogIsOpen = true">
          Choose Team
        </SiteButton>
      </template>
    </BattleField>
    <div
      v-if="completedBattle"
      style="display: grid; place-content: center; margin-top: 1.5rem"
    >
      <SiteButton @click="resetAndEditTeams">
        Edit Teams and Try Again
      </SiteButton>
    </div>
    <div
      v-if="trainingBattles?.length"
      class="training-battle__history"
    >
      <table class="training-battle__history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Team</th>
            <th>Training Team</th>
            <th>Training Power Level</th>
            <th>Result</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="battle in trainingBattles"
            :key="battle.id"
          >
            <td>
              {{ formatDateTime(battle.createdDate) }}
            </td>
            <td class="word-break">
              {{ battle.teams[0]?.name }}
            </td>
            <td>
              {{ battle.teams[1]?.name }}
            </td>
            <td class="training-battle__history-table-difficulty">
              {{ battle.teams[1]?.difficulty }}
            </td>
            <td>
              <template v-if="battle.winnerId">
                <template v-if="battle.id === completedBattleId && !showCompletedBattleWinner">
                  <SiteButtonSmall @click="showCompletedBattleWinner = true">
                    Reveal
                  </SiteButtonSmall>
                </template>
                <template v-else>
                  {{ battle.winnerId === battle.teams[0]?.id ? 'Win' : 'Loss' }}
                </template>
              </template>
            </td>
            <td class="training-battle__history-table-select">
              <SiteButtonSmall @click="loadTrainingBattle(battle)">
                Load
              </SiteButtonSmall>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
  <CreateTeamDialog
    v-if="createTeamDialogIsOpen"
    v-model:isOpen="createTeamDialogIsOpen"
    v-model:team="team1"
    mode="create"
    closeOnSave
  />
  <TrainingTeamsDialog
    v-if="trainingTeamsDialogIsOpen"
    v-model:isOpen="trainingTeamsDialogIsOpen"
    v-model:team="team2"
  />
</template>

<style scoped>
  .training-battle {
    margin-top: 2rem;
  }
  .training-vs {
    font-size: 1.5rem;
    line-height: 2rem;
    letter-spacing: 0.045rem;
  }
  .training-battle__error {
    max-width: 90%;
    margin-bottom: 1.5rem;
    align-self: end;
  }
  .training-battle__error + .training-battle__start {
    align-self: start;
  }

  .training-battle__history {
    margin-top: 4rem;
  }
  .training-battle__history-table {
    width: 100%;
    margin-bottom: 3rem;
    border: none;
  }
  .training-battle__history-table th {
    white-space: nowrap;
    text-align: left;
    padding-bottom: 1.5rem;
    text-transform: uppercase;
    font-size: 1.125rem;
    line-height: 1.5rem;
  }
  .training-battle__history-table th:not(:last-child) {
    padding-right: 1rem;
  }
  .training-battle__history-table td {
    vertical-align: top;
    padding-top: 0.3rem;
    font-size: 1rem;
    line-height: 1rem;
  }
  .training-battle__history-table td:not(:last-child) {
    padding-right: 1rem;
  }
  .training-battle__history-table-difficulty {
    text-transform: capitalize;
  }
  .training-battle__history-table td.training-battle__history-table-select {
    padding-top: 0;
    padding-bottom: 0.5rem;
  }
</style>