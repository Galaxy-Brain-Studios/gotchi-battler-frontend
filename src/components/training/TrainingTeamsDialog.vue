<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useTrainingTeamsStore } from '../../data/trainingTeamsStore'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import SiteError from '../common/SiteError.vue'
  import TeamFormation from '../team/TeamFormation.vue'
  import GotchiInFormation from '../team/GotchiInFormation.vue'
  import GotchiStats from '../team/GotchiStats.vue'
  import TrainingTeamSelect from './TrainingTeamSelect.vue'
  import TeamDifficultySelect from './TeamDifficultySelect.vue'

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    team: {
      type: Object,
      default: null
    }
  })
  const emit = defineEmits(['update:isOpen', 'update:team'])

  // Fetch training teams
  const store = useTrainingTeamsStore()
  const { teams, fetchStatus } = storeToRefs(store)

  // Filter teams
  const DEFAULT_DIFFICULTY = 'common'
  const selectedDifficulty = ref(DEFAULT_DIFFICULTY)
  const teamsToDisplay = computed(() => teams.value?.filter(team => team.difficulty === selectedDifficulty.value))

  // Form data storage
  const selectedTeamId = ref(null)

  // Sync incoming team data
  watch(
    () => props.team,
    (newTeam) => {
      if (!newTeam) { return }
      selectedTeamId.value = newTeam.id
      selectedDifficulty.value = newTeam.difficulty || DEFAULT_DIFFICULTY
    },
    { immediate: true }
  )

  // Validating and saving the team
  const teamToSave = computed(() => {
    if (!teams.value || !selectedTeamId.value) { return null }
    const team = teams.value.find(team => team.id === selectedTeamId.value)
    return team
  })

  const validationError = computed(() => {
    const teamData = teamToSave.value
    if (!teamData) {
      return 'Please select a team.'
    }
    return false
  })
  const showValidationError = ref(false)
  watch(
    () => teamToSave.value,
    () => showValidationError.value = false
  )

  function saveTeam () {
    if (validationError.value) {
      showValidationError.value = true
      return
    }

    const teamData = teamToSave.value
    emit('update:team', teamData)
    emit('update:isOpen', false)
  }
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="scrolling"
    strict
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <template #title>
      Select Opponent Team
    </template>

    <template #default>
      <div class="choose-training-team__teams">
        <div
          v-if="fetchStatus.loading"
          class="choose-training-team__teams-loading"
        >
          Loading...
        </div>
        <div
          v-if="fetchStatus.error"
          class="choose-training-team__teams-error"
        >
          {{ fetchStatus.errorMessage }}
        </div>
        <template v-else-if="fetchStatus.loaded">
          <div
            v-if="!teams?.length"
            class="choose-training-team__teams-empty"
          >
            No teams found.
          </div>
          <ol
            v-else
            class="list-reset choose-training-team__teams-results"
          >
            <li
              v-for="team in teamsToDisplay"
              :key="team.id"
              class="choose-training-team__teams-result"
              :class="{
                'choose-training-team__teams-result--selected': team.id === selectedTeamId
              }"
            >
              <TrainingTeamSelect
                v-model="selectedTeamId"
                :teamId="team.id"
                groupName="training-team"
                class="choose-training-team__team-name"
              >
                {{ team.name }}
              </TrainingTeamSelect>

              <TeamFormation
                :team="team"
                withRowLabels
                horizontal
                reverseRows
              >
                <template #position>
                  <GotchiInFormation
                    emptyMode="blank"
                    variant="small"
                  />
                </template>
                <template #gotchi="{ gotchi }">
                  <template v-if="team.id === selectedTeamId">
                    <SitePopupHoverMenu>
                      <button
                        type="button"
                        class="button-reset choose-training-team__gotchi-info-button"
                      >
                        <GotchiInFormation
                          :gotchi="gotchi"
                          variant="small"
                          :isLeader="team.leader === gotchi.id"
                          withSpecialBadge
                        />
                      </button>

                      <template #popper>
                        <GotchiStats
                          :gotchi="gotchi"
                          variant="small"
                        />
                      </template>
                    </SitePopupHoverMenu>
                  </template>
                  <template v-else>
                    <GotchiInFormation
                      :gotchi="gotchi"
                      :teamId="team.id"
                      variant="small"
                      :isLeader="team.leader === gotchi.id"
                      withSpecialBadge
                    />
                  </template>
                </template>
              </TeamFormation>
            </li>
          </ol>
        </template>
      </div>
    </template>

    <template #footer>
      <SiteError
        v-if="showValidationError && validationError"
        class="choose-training-team__error"
      >
        {{ validationError }}
      </SiteError>
      <div class="choose-training-team__footer">
        <div class="choose-training-team__difficulty">
          <div class="choose-training-team__difficulty-label">
            Select Difficulty:
          </div>
          <TeamDifficultySelect
            v-model="selectedDifficulty"
          />
        </div>
        <div class="choose-training-team__submit">
          <SiteButtonPrimary @click="saveTeam">
            Continue
          </SiteButtonPrimary>
        </div>
      </div>
    </template>
  </SiteDialog>
</template>

<style scoped>
  .choose-training-team__teams {
    min-height: 50vh;
  }

  .choose-training-team__teams-loading,
  .choose-training-team__teams-error,
  .choose-training-team__teams-empty {
    font-size: 1.25rem;
  }

  .choose-training-team__teams-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, 38rem);
    gap: 0.2rem;
    justify-content: space-around;
  }
  .choose-training-team__teams-result {
    position: relative;
    border: 3px solid transparent;
    padding: 1.5rem 2.3rem 2rem 2rem;
  }
  .choose-training-team__teams-result--selected {
    border-color: var(--c-light-yellow);
    background: var(--c-medium-yellow);
  }
  .choose-training-team__team-name {
    margin-bottom: 1rem;
  }
  .choose-training-team__gotchi-info-button {
    display: block;
    width: 100%;
  }
  .choose-training-team__error {
    margin: 1rem;
  }

  .choose-training-team__footer {
    margin: 0.5rem 0.75rem 0.5rem 2rem;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: 2rem;
  }
  .choose-training-team__difficulty {
    margin-left: 2rem;

    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: 0.75rem;
    align-items: center;
  }
  .choose-training-team__difficulty-label {
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
</style>
