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
  import GotchiInFormation from './GotchiInFormation.vue'
  import GotchiDetails from './GotchiDetails.vue'
  import GotchiSpecialWithInfo from './GotchiSpecialWithInfo.vue'

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

  const gotchisById = computed(() => {
    if (!team.value?.gotchis) { return {} }
    return Object.fromEntries(team.value.gotchis.map(gotchi => [gotchi.id, gotchi]))
  })

  const displayGotchiId = ref(null)

  const { status: deleteStatus, setLoading: setDeleteLoading, reset: resetDeleteStatus } = useStatus()

  watch(
    () => team.value,
    (newTeam) => {
      if (newTeam && newTeam.leader) {
        displayGotchiId.value = newTeam.leader
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
      emit('deletedTeam')
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
      <TeamFormation
        :team="team"
        :selectedGotchiId="displayGotchiId"
        withRowLabels
        class="team__formation"
      >
        <template #position>
          <GotchiInFormation
            emptyMode="blank"
            variant="large"
          />
        </template>
        <template #gotchi="{ gotchi }">
          <GotchiInFormation
            :gotchi="gotchi"
            :isLeader="gotchi.id === team.leader"
            :teamId="id"
            isSelectable
            variant="large"
            @select="displayGotchiId = gotchi.id"
          >
              <template #after-name>
                <GotchiSpecialWithInfo
                  v-if="gotchi.specialId"
                  :id="gotchi.specialId"
                  variant="small"
                  class="team__formation-gotchi-special"
                />
              </template>
            </GotchiInFormation>
        </template>
      </TeamFormation>

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
        v-if="gotchisById[displayGotchiId]"
        :gotchi="gotchisById[displayGotchiId]"
        :isLeader="displayGotchiId === team.leader"
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

  .team__details {
    display: grid;
    grid-template-areas:
      "formation manage"
      "formation gotchidetails";
    grid-template-columns: 30rem auto;
    grid-template-rows: max(2rem, auto) auto;
    column-gap: 3rem;
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
  .team__formation-gotchi-special {
    margin-top: 0.5rem;
    display: inline-block;
    position: relative;
    z-index: 1; /* rise above selection button */
  }
</style>