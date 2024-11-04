<script setup>
  import { ref, computed, watch, nextTick } from 'vue'
  import { storeToRefs } from 'pinia'
  import { formatDateTime } from '../../utils/date'
  import { useBattleStore, runTrainingBattle, useTrainingBattlesStore } from '../../data/battleStore'
  import SiteButton from '../common/SiteButton.vue' 
  import SiteError from '../common/SiteError.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import BattleField from '../battle/BattleField.vue'
  import BattleVs from '../battle/BattleVs.vue'
  import CreateTeamDialog from '../team/CreateTeamDialog.vue'
  import TrainingTeamsDialog from './TrainingTeamsDialog.vue'
  import useStatus from '../../utils/useStatus'
  import { getTotalBrsFromFormation } from '../../data/teamUtils'

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

  const isEditingLocked = computed(() => {
    return submitStatus.value.loading || submitStatus.value.loaded
  })

  const canStartMatch = computed(() => {
    if (!team1.value || !team2.value) { return false }
    if (isEditingLocked.value) { return false }
    if (completedBattleId.value) { return false }
    return true
  })

  const battleToSubmit = computed(() =>({
    team1: team1.value,
    team2: team2.value
  }))

  // if any of the data for submitting a battle changes while submitting,
  // cancel the submission
  watch(
    () => battleToSubmit.value,
    () => resetSubmit()
  )

  async function startMatch () {
    if (!canStartMatch.value) { return }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const battleId = runTrainingBattle(battleToSubmit.value)
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

  // List of training battles
  const trainingBattleStore = useTrainingBattlesStore()
  const { trainingBattles } = storeToRefs(trainingBattleStore)

  function loadTrainingBattle (battle) {
    completedBattleId.value = battle.id
    // console.log('loading training battle', 'old team', team1.value, 'new team', battle.teams[0])
    team1.value = JSON.parse(JSON.stringify(battle.teams[0]))
    team2.value = JSON.parse(JSON.stringify(battle.teams[1]))
    resetSubmit()
    // wait for nextTick because changing team will cause resetSubmit again
    nextTick(() => {
      // eslint-disable-next-line no-unused-vars
      const [isStale, setLoaded, setError] = setLoading()
      setLoaded()
    })
  }

  function getTotalBrs (team) {
    if (!team?.formation) { return '' }
    return getTotalBrsFromFormation(team.formation)
  }
</script>

<template>
  <main>
    <BattleField
      class="training-battle"
      :battle="completedBattle || battle"
      emptyTeam1Name="Create team"
      emptyTeam2Name="Choose opponent"
    >
      <template #empty-team-1>
        <SiteButton
          v-if="!isEditingLocked"
          @click="createTeamDialogIsOpen = true"
        >
          Create Team
        </SiteButton>
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
        #before-team-1
      >
        <SiteButton @click="createTeamDialogIsOpen = true">
          Edit Your Team
        </SiteButton>
      </template>
      <template
        #before-team-2
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
            <th>Opponent</th>
            <th>Total BRS</th>
            <th>
              <div class="training-battle__win-rate-title">
                <div>Win rate</div>
                <SitePopupHoverMenu class="training-battle__win-rate-popup">
                  <SiteButtonIcon
                    iconName="info"
                    label="about"
                  />
                  <template #popper>
                    This win rate shows what percentage your team wins over 200 battles.
                  </template>
                </SitePopupHoverMenu>
              </div>
            </th>
            <th>Result</th>
            <th>Replay</th>
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
            <td>
              {{ getTotalBrs(battle.teams[1]) }}
            </td>
            <td class="training-battle__history-table-win-rate">
              {{ battle.team1WinRate }} %
            </td>
            <td
              class="training-battle__history-table-result"
              :class="{
                'training-battle__history-table-result--winner': battle.winner === 1
              }"
            >
              <template v-if="battle.winner">
                <template v-if="battle.id === completedBattleId && !showCompletedBattleWinner">
                  <SiteButtonSmall @click="showCompletedBattleWinner = true">
                    Reveal
                  </SiteButtonSmall>
                </template>
                <template v-else>
                  {{ battle.winner === 1 ? 'Winner' : 'Loser' }}
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
    mode="create_training"
    closeOnSave
  />
  <TrainingTeamsDialog
    v-if="trainingTeamsDialogIsOpen"
    v-model:isOpen="trainingTeamsDialogIsOpen"
    v-model:team="team2"
  />
</template>

<style scoped>
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
  .training-battle__win-rate-title {
    display: flex;
    align-items: center;
    column-gap: 0.25rem;
  }
  .training-battle__win-rate-popup {
    flex: none;
    display: grid;
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
  .training-battle__history-table-win-rate {
    font-weight: bold;
  }
  .training-battle__history-table-result {
    font-weight: bold;
    text-transform: uppercase;
  }
  .training-battle__history-table-result--winner {
    color: var(--c-light-yellow);
  }
  .training-battle__history-table td:has(button) {
    padding-top: 0;
    padding-bottom: 0.5rem;
  }
</style>