<script setup>
  import { storeToRefs } from 'pinia'
  import { useTeamStore } from '../../data/teamStore'
  import useStatus from '../../utils/useStatus'
  import { generateTeamToSubmit } from '../../data/teamUtils'
  import tournamentsService from '../../data/tournamentsService'
  import SiteDialog from '../common/SiteDialog.vue'
  import CreateTeamDialog from './CreateTeamDialog.vue'

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    id: {
      type: Number,
      default: null
    },
    tournamentId: {
      type: Number,
      default: null
    },
    mode: {
      type: String,
      default: null
    }
  })
  const emit = defineEmits(['update:isOpen', 'replacedTeam', 'editedTeam'])

  const teamStore = useTeamStore({ teamId: props.id })()
  const { team, fetchStatus } = storeToRefs(teamStore)

  const { status: submitStatus, setLoading: setLoading } = useStatus()

  function updateTeam (team) {
    if (!team || !(props.id || props.id === 0)) { return }
    if (props.mode === 'replace') {
      replaceTeam(team)
    } else if (props.mode === 'edit') {
      editTeam(team)
    }
  }

  async function replaceTeam (team) {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      await tournamentsService.replaceTeam({
        tournamentId: props.tournamentId,
        teamId: props.id,
        team: generateTeamToSubmit(team)
      })
      if (isStale()) { return }
      setLoaded()
      emit('update:isOpen', false)
      emit('replacedTeam')
    } catch (e) {
      if (isStale()) { return }
      console.error('Error replacing team', e)
      setError(`Error: ${e.message}`)
    }
  }

  async function editTeam (team) {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      await tournamentsService.editTeam({
        tournamentId: props.tournamentId,
        teamId: props.id,
        team: generateTeamToSubmit(team)
      })
      if (isStale()) { return }
      setLoaded()
      emit('update:isOpen', false)
      emit('editedTeam')
    } catch (e) {
      if (isStale()) { return }
      console.error('Error editing team', e)
      setError(`Error: ${e.message}`)
    }
  }

</script>

<template>
  <SiteDialog
    v-if="fetchStatus.loading"
    :isOpen="isOpen"
    variant="medium"
  >
    Loading...
  </SiteDialog>
  <SiteDialog
    v-else-if="fetchStatus.error"
    :isOpen="isOpen"
    variant="medium"
  >
    Error loading team ({{ fetchStatus.errorMessage }})
  </SiteDialog>
  <CreateTeamDialog
    v-else-if="team"
    :isOpen="isOpen"
    :mode="mode"
    :team="team"
    :tournamentId="tournamentId"
    :isSaving="submitStatus.loading"
    :errorMessage="submitStatus.error && submitStatus.errorMessage || null"
    @update:isOpen="$emit('update:isOpen', $event)"
    @update:team="updateTeam"
  />
</template>
