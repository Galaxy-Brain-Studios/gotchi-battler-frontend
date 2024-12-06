<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '@/data/accountStore'
  import { useTeamStore } from '../../data/teamStore'
  import tournamentsService from '../../data/tournamentsService'
  import profileService from '../../data/profileService'
  import useStatus from '../../utils/useStatus'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteError from '../common/SiteError.vue'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import TeamFormation from './TeamFormation.vue'
  import TeamSubstitutes from './TeamSubstitutes.vue'
  import GotchiInFormation from './GotchiInFormation.vue'
  import GotchiDetails from './GotchiDetails.vue'

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    /* Team's onchain ID */
    id: {
      type: Number,
      default: null
    },
    tournamentId: {
      type: Number,
      default: null
    },
    canDelete: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['update:isOpen', 'deletedTeam', 'requestEditTeam'])

  const accountStore = useAccountStore()
  const { address, signedSession } = storeToRefs(accountStore)

  // Normally we display the public version of the team
  const teamStore = useTeamStore({ teamId: props.id })()
  const { team, fetchStatus } = storeToRefs(teamStore)

  // If canEdit is enabled, and the user is viewing their own team,
  // we should fetch and display the latest submitted team (protected endpoint)
  const protectedTeam = ref(null)
  const { status: protectedTeamFetchStatus, setLoading: setProtectedTeamFetchLoading, reset: resetProtectedTeamFetchLoading } = useStatus()

  const displayProtectedTeam = computed(() => props.canEdit && signedSession.value)

  watch(
    () => [displayProtectedTeam.value, props.id, props.tournamentId],
    async () => {
      if (!displayProtectedTeam.value) {
        protectedTeam.value = null
        resetProtectedTeamFetchLoading()
        return
      }
      const [isStale, setLoaded, setError] = setProtectedTeamFetchLoading()
      try {
        const result = await profileService.fetchTournamentTeamToEdit({
          tournamentId: props.tournamentId,
          teamId: props.id
        })
        if (isStale()) { return }
        protectedTeam.value = result
        setLoaded()
      } catch (e) {
        if (isStale()) { return }
        console.error('Error fetching protected team', e)
        setError(`Error: ${e.message}`)
      }
    },
    { immediate: true }
  )

  const teamToDisplay = computed(() => displayProtectedTeam?.value ? protectedTeam.value : team.value)
  const teamToDisplayFetchStatus = computed(() => displayProtectedTeam?.value ? protectedTeamFetchStatus.value : fetchStatus.value )

  const displayGotchi = ref(null)

  const { status: deleteStatus, setLoading: setDeleteLoading, reset: resetDeleteStatus } = useStatus()

  watch(
    () => teamToDisplay.value,
    (newTeam) => {
      if (newTeam && newTeam.leader && newTeam.formation) {
        displayGotchi.value = [...newTeam.formation.front, ...newTeam.formation.back].find(g => g?.id === newTeam.leader) || null
      }
      resetDeleteStatus()
    },
    { immediate: true }
  )

  const showDeleteButton = computed(() => props.canDelete && (props.id || props.id === 0) && props.tournamentId)

  async function deleteTeam () {
    if (!showDeleteButton.value) { return }
    const [isStale, setLoaded, setError] = setDeleteLoading()
    try {
      await tournamentsService.deleteTeam({ teamId: props.id, tournamentId: props.tournamentId })
      if (isStale()) { return }
      setLoaded()
      // To avoid disrupting activity, emit events that will only trigger refresh if this dialog is still open.
      // TODO always alert to notify user that deletion has happened and they can manually refresh the page to update the teams list.
      emit('update:isOpen', false)
      emit('deletedTeam', props.id)
    } catch (e) {
      if (isStale()) { return }
      console.error('Error deleting team', e)
      setError('Error deleting team: ' + e.message)
    }
  }

  const showEditButton = computed(() => props.canEdit && (props.id || props.id === 0) && props.tournamentId)

  function requestEditTeam () {
    emit('requestEditTeam')
  }

  const showSignInToViewProtectedTeam = computed(() => showEditButton.value && !signedSession.value)


  // Allow connected user to save a copy of the team
  const canSaveProfileTeam = computed(() => address.value)
  const showSaveProfileTeamSuccess = ref(false)
  const { status: submitProfileTeamStatus, setLoading: setProfileTeamLoading, reset: resetProfileTeamStatus } = useStatus()

  watch(
    () => teamToDisplay.value,
    () => {
      showSaveProfileTeamSuccess.value = false
      resetProfileTeamStatus()
    }
  )

  async function saveProfileTeam () {
    const teamData = {
      name: teamToDisplay.value.name,
      formation: teamToDisplay.value.formation,
      leader: teamToDisplay.value.leader
    }

    const [isStale, setLoaded, setError] = setProfileTeamLoading()
    try {
      await profileService.createTeam({
        owner: address.value,
        ...teamData
      })
      if (isStale()) { return; }
      setLoaded()
      showSaveProfileTeamSuccess.value = true
    } catch (e) {
      setError(e.message)
    }
  }

</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="large"
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <template #title>
      <div class="team__title">
        {{ teamToDisplay?.name || 'Team' }}
      </div>
    </template>
    <div
      v-if="teamToDisplayFetchStatus.loading"
      class="team__loading"
    >
      Loading...
    </div>
    <div
      v-if="teamToDisplayFetchStatus.error"
      class="team__error"
    >
      {{ teamToDisplayFetchStatus.errorMessage }}
    </div>
    <div
      v-else-if="teamToDisplayFetchStatus.loaded"
      class="team__details"
    >
      <div class="team__formation">
        <TeamFormation
          :team="teamToDisplay"
          :selectedGotchiId="displayGotchi?.id"
          horizontal
          reverseRows
          withRowLabels
          withRowBoosts
        >
          <template #position>
            <GotchiInFormation
              emptyMode="disabled"
              variant="small"
              withItemBadge
              withSpecialInfoBadge
            />
          </template>
          <template #gotchi="{ gotchi }">
            <GotchiInFormation
              :gotchi="gotchi"
              :isLeader="gotchi.id === teamToDisplay.leader"
              :teamId="id"
              isSelectable
              withItemBadge
              withSpecialInfoBadge
              variant="small"
              @select="displayGotchi = gotchi"
            />
          </template>
        </TeamFormation>
        <TeamSubstitutes
          :team="teamToDisplay"
          :selectedGotchiId="displayGotchi?.id"
          class="team__formation-substitutes"
        >
          <template #position>
            <GotchiInFormation
              emptyMode="disabled"
              variant="small"
              withItemBadge
              withSpecialInfoBadge
            />
          </template>
          <template #gotchi="{ gotchi }">
            <GotchiInFormation
              :gotchi="gotchi"
              :teamId="id"
              isSelectable
              withItemBadge
              withSpecialInfoBadge
              variant="small"
              @select="displayGotchi = gotchi"
            />
          </template>
        </TeamSubstitutes>
        <SiteRequireSignIn
          v-if="showSignInToViewProtectedTeam"
          class="team__view-protected-team"
        >
          <template #signin-message>
            to view your latest submitted team
          </template>
        </SiteRequireSignIn>
        <div
          v-if="canSaveProfileTeam"
          class="team__save-team"
        >
          <div
            v-if="showSaveProfileTeamSuccess"
            class="team__save-team-success"
          >
            <SiteIcon name="check" />
            <span>Saved Team</span>
          </div>
          <SiteButton
            v-else-if="submitProfileTeamStatus.loading"
            disabled
          >
            Saving...
          </SiteButton>
          <SiteError
            v-else-if="submitProfileTeamStatus.error"
          >
            {{ submitProfileTeamStatus.errorMessage }}
          </SiteError>
          <SiteButton
            v-else
            icon="favorite"
            @click="saveProfileTeam"
          >
            Add to My Saved Teams
          </SiteButton>
        </div>
      </div>

      <div
        v-if="showDeleteButton || showEditButton"
        class="team__manage"
      >
        <SiteButton
          v-if="showEditButton"
          class="team__manage-button"
          @click="requestEditTeam"
        >
          Edit Team
        </SiteButton>
        <template v-if="showDeleteButton">
          <SiteError
            v-if="deleteStatus.error"
            small
            class="team__manage-error"
          >
            {{ deleteStatus.errorMessage }}
          </SiteError>
          <SiteButton
            type="button"
            :disabled="deleteStatus.loading"
            class="team__manage-button"
            @click="deleteTeam"
          >
            <template v-if="deleteStatus.loading">
              Deleting...
            </template>
            <template v-else>
              Delete Team
            </template>
          </SiteButton>
        </template>
      </div>
      <GotchiDetails
        v-if="displayGotchi"
        :gotchi="displayGotchi"
        :isLeader="displayGotchi?.id === teamToDisplay.leader"
        :teamId="id"
        class="team__gotchi-details"
      />
    </div>
  </SiteDialog>
</template>

<style scoped>
  .team__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .team__formation {
    display: flex;
    flex-direction: column;
    gap: 1.88rem;
    margin-bottom: 2rem;
    align-items: flex-start;
  }

  @media (min-width: 1500px) {
    .team__details {
      display: grid;
      grid-template-areas:
        "formation manage"
        "formation gotchidetails";
      grid-template-columns: auto auto;
      grid-template-rows: minmax(0, auto) auto;
      column-gap: 2rem;
      align-items: start;
    }
    .team__formation {
      grid-area: formation;
      margin-bottom: 0;
    }
    .team__manage {
      grid-area: manage;
    }
    .team__gotchi-details {
      grid-area: gotchidetails;
    }
  }

  .team__view-protected-team,
  .team__save-team {
    align-self: center;
  }

  .team__manage {
    margin-top: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }
  .team__manage-error {
    margin-bottom: 1rem;
    flex: 1 1 auto;
  }
  .team__manage-button {
    margin-right: 1rem;
    flex: none;
    align-self: flex-start;
  }

  .team__save-team-success {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: bold;
    color: var(--c-white);
    text-transform: uppercase;
  }
</style>