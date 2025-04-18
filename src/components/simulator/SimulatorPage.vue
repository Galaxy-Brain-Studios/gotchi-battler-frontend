<script setup>
  import { ref } from 'vue'
  import uniqueId from 'lodash.uniqueid'
  import useStatus from '../../utils/useStatus'
  import { generateTeamForBattle } from '../../data/teamUtils'
  import SiteHeading from '../common/SiteHeading.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
  import SiteButtonWhite from '../common/SiteButtonWhite.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteTable from '../common/SiteTable.vue'
  import SavedTeamFormation from '../team/SavedTeamFormation.vue'
  import CreateTeamDialog from '../team/CreateTeamDialog.vue'
  import battlesService from '@/data/battlesService'

  const matches = ref([])

  const copyTeam = function (team) {
    return JSON.parse(JSON.stringify(team))
  }

  const addMatch = function (originalMatch) {
    const team1 = originalMatch?.team1 || null
    const team2 = originalMatch?.team2 || null
    const match = {
      id: uniqueId('sim'),
      team1: copyTeam(team1),
      team2: copyTeam(team2)
    }
    resetMatchSimulations(match)
    matches.value.push(match)
  }

  const deleteMatch = function (matchIndex) {
    matches.value.splice(matchIndex, 1)
  }

  const createTeamDialogIsOpen = ref(false)
  const editMatchIndex = ref(null)
  const editMatchTeamKey = ref(null)
  const editMatchOriginalTeam = ref(null)

  const openEditTeam = function (matchIndex, teamKey) {
    editMatchIndex.value = matchIndex
    editMatchTeamKey.value = teamKey
    editMatchOriginalTeam.value = JSON.stringify(matches.value[editMatchIndex.value]?.[editMatchTeamKey.value])
    createTeamDialogIsOpen.value = true
  }

  const onTeamEdited = function (newTeam) {
    if (editMatchOriginalTeam.value !== JSON.stringify(newTeam)) {
      // Team changed, clear any old simulations
      const match = matches.value[editMatchIndex.value]
      if (match) {
        resetMatchSimulations(match)
      }
    }
  }

  const resetMatchSimulations = function (match) {
    if (match.runStatus) {
      match.runStatus.reset()
    }
    match.numRuns = 0
    match.team1Results = {
      wins: 0,
      winRate: 0,
      overallWinner: false
    }
    match.team2Results = {
      wins: 0,
      winRate: 0,
      overallWinner: false
    }
    match.runStatus = useStatus() // { status, setLoading, reset }
  }

  const numSimulations = ref("1000") // string for text input

  const delay = millis => new Promise(resolve => setTimeout(resolve, millis));

  const runSimulations = async function (match) {
    if (!match.team1 || !match.team2) {
      return
    }

    resetMatchSimulations(match)
    const [isStale, setLoaded] = match.runStatus.setLoading()
    const PAUSE_EVERY = 100
    let numToRun = numSimulations.value - 0
    if (isNaN(numToRun) || numToRun <= 0) {
      numToRun = 1
    }
    let runSoFar = 0
    let team1Wins = 0
    let team2Wins = 0

    const updateMatchStats = () => {
      match.numRuns = runSoFar
      match.team1Results.wins = team1Wins
      match.team2Results.wins = team2Wins
      match.team1Results.winRate = Math.floor(100 * match.team1Results.wins / match.numRuns)
      match.team2Results.winRate = Math.floor(100 * match.team2Results.wins / match.numRuns)
      match.team1Results.overallWinner = match.team1Results.wins > match.team2Results.wins
      match.team2Results.overallWinner = match.team2Results.wins > match.team1Results.wins
    }

    const team1ForBattle = await generateTeamForBattle(match.team1)
    const team2ForBattle = await generateTeamForBattle(match.team2)
    const matchForBattle = {
      team1: team1ForBattle,
      team2: team2ForBattle
    }
    console.log('Running simulations', matchForBattle)
    while (runSoFar < numToRun) {
      const numLeftToRun = numToRun - runSoFar
      const numInBatch = numLeftToRun < PAUSE_EVERY ? numLeftToRun : PAUSE_EVERY
      const batchResult = battlesService.runTrainingBattles(matchForBattle, numInBatch)
      team1Wins += batchResult.team1Wins
      team2Wins += batchResult.team2Wins
      runSoFar += numInBatch
      // Pause to allow UI to refresh
      updateMatchStats()
      await delay(10)
      if (isStale()) {
        // console.log('stale after '+runSoFar+', aborting')
        return;
      }
    }
    updateMatchStats()
    setLoaded()
  }

  const runAllSimulations = function () {
    for (const match of matches.value) {
      runSimulations(match)
    }
  }
</script>

<template>
  <div>
    <SiteHeading class="simulator-heading">
      Simulator
    </SiteHeading>

    <div>
      <SiteTable
        v-if="matches.length"
        variant="card"
        class="matches-table"
      >
        <thead>
          <tr>
            <th>Team 1</th>
            <th>Team 2</th>
            <th>Team 1 Wins</th>
            <th>Team 2 Wins</th>
            <th>Sims</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(match, matchIndex) in matches"
            :key="match.id"
            class="match__row"
          >
            <td
              class="match__team"
              :class="{
                'match__team--empty': !match.team1
              }"
            >
              <div>
                <div
                  v-if="match.team1"
                  class="match__team-details"
                >
                  <div class="match__team-name word-break">
                    {{ match.team1.name }}
                  </div>
                  <SavedTeamFormation
                    v-if="match.team1"
                    :team="match.team1"
                    class="match__team-formation"
                  />
                </div>
                <div class="match__team-actions">
                  <SiteButtonWhite
                    small
                    active
                    @click="openEditTeam(matchIndex, 'team1')"
                  >
                    {{ match.team1 ? 'Edit' : 'Add Team' }}
                  </SiteButtonWhite>
                </div>
              </div>
            </td>
            <td
              class="match__team"
              :class="{
                'match__team--empty': !match.team2
              }"
            >
              <div>
                <div
                  v-if="match.team2"
                  class="match__team-details"
                >
                  <div class="match__team-name word-break">
                    {{ match.team2.name }}
                  </div>
                  <SavedTeamFormation
                    v-if="match.team2"
                    :team="match.team2"
                    class="match__team-formation"
                  />
                </div>
                <div class="match__team-actions">
                  <SiteButtonWhite
                    small
                    active
                    @click="openEditTeam(matchIndex, 'team2')"
                  >
                    {{ match.team2 ? 'Edit' : 'Add Team' }}
                  </SiteButtonWhite>
                </div>
              </div>
            </td>
            <td
              class="match__team-wins"
              :class="{
                'match__team-wins--has-results': match.numRuns,
                'match__team-wins--overall-winner': match.team1Results.overallWinner
              }"
            >
              <template v-if="match.numRuns">
                {{ match.team1Results.winRate }}%
              </template>
              <div
                v-else
                class="match__team-wins-na"
              >
                N/A
              </div>
            </td>
            <td
              class="match__team-wins"
              :class="{
                'match__team-wins--has-results': match.numRuns,
                'match__team-wins--overall-winner': match.team2Results.overallWinner
              }"
            >
              <template v-if="match.numRuns">
                {{ match.team2Results.winRate }}%
              </template>
              <div
                v-else
                class="match__team-wins-na"
              >
                N/A
              </div>
            </td>
            <td class="match__num-runs">
              <template v-if="match.numRuns">
                {{ match.numRuns }}
              </template>
            </td>
            <td class="match__actions">
              <div>
                <SiteButtonSmall
                  v-if="match.team1 || match.team2"
                  @click="addMatch(match)"
                >
                  Duplicate
                </SiteButtonSmall>
                <SiteButtonSmall
                  @click="deleteMatch(matchIndex)"
                >
                  Delete
                </SiteButtonSmall>
                <SiteButtonSmall
                  v-if="match.team1 && match.team2"
                  :disabled="match.runStatus.status.loading"
                  @click="runSimulations(match)"
                >
                  <template v-if="match.runStatus.status.loading">
                    Running
                  </template>
                  <template v-else>
                    Run
                  </template>
                </SiteButtonSmall>
              </div>
            </td>
          </tr>
        </tbody>
      </SiteTable>
      <div
        class="simulator-controls"
        :class="{
          'simulator-controls--no-matches': !matches.length
        }"
      >
        <SiteButton
          class="simulator__add-match"
          @click="addMatch()"
        >
          Add Match
        </SiteButton>
        <div class="simulator__num-sims">
          <label>
            <span class="simulator__num-sims-label">
              Number of simulations:
            </span>
            <span class="simulator__num-sims-input">
              <SiteTextField v-model="numSimulations" />
            </span>
          </label>
        </div>
        <SiteButtonPrimary
          class="simulator__run-all"
          @click="runAllSimulations"
        >
          Run All
        </SiteButtonPrimary>
      </div>
    </div>
    <CreateTeamDialog
      v-if="createTeamDialogIsOpen && matches[editMatchIndex]"
      v-model:isOpen="createTeamDialogIsOpen"
      v-model:team="matches[editMatchIndex][editMatchTeamKey]"
      mode="create_training"
      @update:team="onTeamEdited"
      closeOnSave
    />
  </div>
</template>

<style scoped>
  .simulator-heading {
    margin-bottom: 1rem;
  }

  .matches-table {
    margin-bottom: 1.5rem;
  }

  .match__row {
    --site-table-card-border-width--inner: 1px;
    --site-table-card-border-width: 2px;
    --site-table-card-border-color-rgb: 93, 87, 192;
    --site-table-card-border-color-opacity: 1;
    --site-table-card-background-color-opacity: 0;
    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1.5rem;
  }
  .match__team {
    --site-table-card-padding-size: 0.5rem;
    --site-table-card-padding-size--edge: 0.5rem;
    --site-table-card-background-color-rgb: 88, 38, 198;
    --site-table-card-background-color-opacity: 1;
  }
  .match__team > div {
    display: flex;
    gap: 1.25rem;
  }
  .match__team-details {
    flex: 1 1 auto;
    min-width: 16rem;
  }
  .match__team-name {
    margin-bottom: 0.5rem;
  }
  .match__team-actions {
    flex: 1 0 auto;
    display: grid;
    place-items: center;
  }
  .match__team--empty .match__team-actions {
    min-height: calc(6rem - 2 * var(--site-table-card-padding-size));
    min-width: 9rem;
  }

  td.match__team-wins,
  td.match__num-runs {
    text-align: center;
    line-height: calc(6rem - 2 * var(--site-table-card-padding-size));
  }
  .match__team-wins--has-results {
    --site-table-card-background-color-rgb: 0, 78, 121;
    --site-table-card-background-color-opacity: 1;
    --site-table-card-border-width--inner: 2px;
    --site-table-card-border-color-rgb: 73, 219, 251;
  }
  .match__team-wins--overall-winner {
    --site-table-card-border-color-rgb: var(--c-light-yellow-rgb);
  }
  td.match__team-wins--overall-winner {
    background: var(--site-gradient-blue);
  }
  .match__team-wins-na {
    opacity: 0.5;
    font-weight: normal;
  }
  .match__team-wins--overall-winner {
    font-weight: bold;
  }
  .match__team-wins--overall-winner::before {
    content: '🏆';
    font-size: 0.875rem;
    line-height: 0.875rem;
    padding-right: 0.25rem;
  }
  .match__actions > div {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .simulator-controls {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    align-items: center;
    gap: 2rem;
  }
  .simulator__add-match,
  .simulator__run-all {
    flex: none;
  }
  .simulator__num-sims {
    flex: 1 1 auto;
    text-align: right;
  }
  .simulator-controls--no-matches {
    margin-top: 2rem;
  }
  .simulator-controls--no-matches .simulator__num-sims,
  .simulator-controls--no-matches .simulator__run-all {
    display: none;
  }
  .simulator__num-sims label {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    justify-content: flex-end;
  }
  .simulator__num-sims label > * {
    flex: none;
  }
  .simulator__num-sims-label {
    opacity: 0.5;
    font-size: 0.875rem;
  }
  .simulator__num-sims-input {
    width: 7rem;
  }
</style>