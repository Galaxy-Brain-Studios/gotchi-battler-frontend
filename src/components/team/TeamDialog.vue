<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useTeamStore } from '../../data/teamStore'
  import tournamentsService from '../../data/tournamentsService'
  import useStatus from '../../utils/useStatus'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteError from '../common/SiteError.vue'
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
    canReplace: {
      type: Boolean,
      default: false
    },
    canEdit: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['update:isOpen', 'deletedTeam', 'requestReplaceTeam', 'requestEditTeam'])

  const teamStore = useTeamStore({ teamId: props.id })()
  const { team, fetchStatus } = storeToRefs(teamStore)

  const displayGotchi = ref(null)

  const { status: deleteStatus, setLoading: setDeleteLoading, reset: resetDeleteStatus } = useStatus()

  watch(
    () => team.value,
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

  const showReplaceButton = computed(() => props.canReplace && (props.id || props.id === 0) && props.tournamentId)

  function requestReplaceTeam () {
    emit('requestReplaceTeam')
  }

  const showEditButton = computed(() => props.canEdit && (props.id || props.id === 0) && props.tournamentId)

  function requestEditTeam () {
    emit('requestEditTeam')
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
        {{ team?.name || 'Team' }}
      </div>
    </template>
    <div
      v-if="fetchStatus.loading"
      class="team__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchStatus.error"
      class="team__error"
    >
      {{ fetchStatus.errorMessage }}
    </div>
    <div
      v-else-if="fetchStatus.loaded"
      class="team__details"
    >
      <div class="team__formation">
        <TeamFormation
          :team="team"
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
              withSpecialInfoBadge
            />
          </template>
          <template #gotchi="{ gotchi }">
            <GotchiInFormation
              :gotchi="gotchi"
              :isLeader="gotchi.id === team.leader"
              :teamId="id"
              isSelectable
              withSpecialInfoBadge
              variant="small"
              @select="displayGotchi = gotchi"
            />
          </template>
        </TeamFormation>
        <TeamSubstitutes
          :team="team"
          :selectedGotchiId="displayGotchi?.id"
          class="team__formation-substitutes"
        >
          <template #position>
            <GotchiInFormation
              emptyMode="disabled"
              variant="small"
              withSpecialInfoBadge
            />
          </template>
          <template #gotchi="{ gotchi }">
            <GotchiInFormation
              :gotchi="gotchi"
              :teamId="id"
              isSelectable
              withSpecialInfoBadge
              variant="small"
              @select="displayGotchi = gotchi"
            />
          </template>
        </TeamSubstitutes>
      </div>

      <div
        v-if="showDeleteButton || showReplaceButton || showEditButton"
        class="team__manage"
      >
        <SiteButton
          v-if="showEditButton"
          class="team__manage-button"
          @click="requestEditTeam"
        >
          Edit Team
        </SiteButton>
        <SiteButton
          v-if="showReplaceButton"
          class="team__manage-button"
          @click="requestReplaceTeam"
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
        :isLeader="displayGotchi?.id === team.leader"
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
    }
    .team__manage {
      grid-area: manage;
    }
    .team__gotchi-details {
      grid-area: gotchidetails;
    }
  }

  .team__formation-substitutes {
    margin-top: 1.88rem;
    margin-bottom: 2rem;
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
</style>