<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useTrainingTeamsStore } from '../../data/trainingTeamsStore'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import TeamFormation from '../team/TeamFormation.vue'
  import GotchiInFormation from '../team/GotchiInFormation.vue'
  import GotchiStats from '../team/GotchiStats.vue'
  import TrainingTeamSelect from './TrainingTeamSelect.vue'
  import TeamDifficultySelect from './TeamDifficultySelect.vue'
  import CreateTeamDialog from '../team/CreateTeamDialog.vue'

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

  const STAGES = {
    SELECT: 'select',
    CUSTOMIZE: 'customize'
  }
  const stage = ref(props.team ? STAGES.CUSTOMIZE : STAGES.SELECT)

  // Fetch training teams
  const store = useTrainingTeamsStore()
  const { teams, fetchStatus } = storeToRefs(store)

  // Filter teams
  const DEFAULT_DIFFICULTY = 'common'
  const selectedDifficulty = ref(DEFAULT_DIFFICULTY)
  const teamsToDisplay = computed(() => teams.value?.filter(team => team.difficulty === selectedDifficulty.value))

  // Form data storage
  const selectedTeamId = ref(null)
  const customizedTeam = ref(null)

  // Sync incoming team data
  watch(
    () => props.team,
    (newTeam) => {
      if (!newTeam) { return }
      customizedTeam.value = JSON.parse(JSON.stringify(newTeam))
    },
    { immediate: true }
  )

  const selectedTeam = computed(() => {
    if (!teams.value || !selectedTeamId.value) { return null }
    const team = teams.value.find(team => team.id === selectedTeamId.value)
    return team
  })


  function selectTeam () {
    customizedTeam.value = selectedTeam.value
    stage.value = STAGES.CUSTOMIZE
  }

  function saveTeam (teamData) {
    emit('update:team', teamData)
    emit('update:isOpen', false)
  }

  function createTeamDialogUpdateIsOpen (newIsOpen) {
    if (!newIsOpen) {
      stage.value = STAGES.SELECT
    }
  }
</script>

<template>
  <SiteDialog
    v-if="stage === STAGES.SELECT"
    :isOpen="isOpen"
    variant="full"
    strict
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <template #default>

      <div class="choose-training-team__layout">
        <div class="choose-training-team__title">
          <SiteButton
            aria-label="Close dialog"
            class="choose-training-team__title-close-button"
            icon="chevron-left"
            @click="$emit('update:isOpen', false)"
          />
          <h1 class="choose-training-team__title-text">
            Choose Training Team
          </h1>
        </div>

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
            <SiteButtonPrimary
              :disabled="!selectedTeam"
              compact
              @click="selectTeam"
            >
              Select Team and Continue
            </SiteButtonPrimary>
          </div>
        </div>
      </div>
    </template>
  </SiteDialog>
  <CreateTeamDialog
    v-if="stage === STAGES.CUSTOMIZE && customizedTeam"
    :isOpen="isOpen"
    mode="edit_training"
    :team="customizedTeam"
    @update:team="saveTeam"
    @update:isOpen="createTeamDialogUpdateIsOpen"
  />
</template>

<style scoped>
  @media (min-height: 1000px) {
    .choose-training-team__layout {
      display: grid;
      height: 100%;
      grid-template-rows: auto minmax(0, 1fr) auto;

      background: var(--color-background);
      background-image: var(--site-background-image);
    }
    .choose-training-team__footer {
      background: linear-gradient(180deg, #6027E2 0%, #3E1F6B 100%);
    }
  }

  .choose-training-team__title {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    padding: 2rem 0 2rem 4rem;
  }
  .choose-training-team__title-close-button {
    flex: none;
  }
  .choose-training-team__title-text {
    flex: 1 1 auto;
    margin: 0;
  }

  .choose-training-team__teams {
    overflow-y: auto;
  }

  .choose-training-team__teams-loading,
  .choose-training-team__teams-error,
  .choose-training-team__teams-empty {
    font-size: 1.25rem;
  }

  .choose-training-team__teams-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, 38rem);
    gap: 2.3rem;
    justify-content: space-around;
  }
  .choose-training-team__teams-result {
    position: relative;
    border: 3px solid transparent;
    padding: 1.5rem;
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

  .choose-training-team__footer {
    padding: 1rem;
    display: flex;
    flex-direction: column;
    row-gap: 1rem;
  }
  @media (min-width: 1100px) {
    .choose-training-team__footer {
      padding: 1.25rem 1.5rem 1.25rem 2rem;
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: center;
      column-gap: 2rem;
    }
    .choose-training-team__difficulty {
      display: flex;
      flex-wrap: wrap;
      row-gap: 0.75rem;
      column-gap: 0.75rem;
      align-items: center;
    }
  }

  .choose-training-team__difficulty-label {
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
    opacity: 0.6;
  }
</style>
