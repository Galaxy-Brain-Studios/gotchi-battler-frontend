<script setup>
  import { ref, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '@/data/accountStore'
  import profileService from '@/data/profileService'
  import useStatus from '@/utils/useStatus'
  import { generateTournamentTeamToSubmit } from '@/data/teamUtils'
  import tournamentsService from '@/data/tournamentsService'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
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
  const emit = defineEmits(['update:isOpen', 'editedTeam'])

  const accountStore = useAccountStore()
  const { signedSession } = storeToRefs(accountStore)

  const team = ref(null)
  const { status: fetchStatus, setLoading: setFetchLoading, reset: resetFetchLoading } = useStatus()

  watch(
    () => [props.id, props.tournamentId, signedSession.value],
    async () => {
      if (!props.id || !props.tournamentId || !signedSession.value) {
        team.value = null
        resetFetchLoading()
        return
      }
      const [isStale, setLoaded, setError] = setFetchLoading()
      try {
        const result = await profileService.fetchTournamentTeamToEdit({
          tournamentId: props.tournamentId,
          teamId: props.id
        })
        if (isStale()) { return }
        team.value = result
        setLoaded()
      } catch (e) {
        if (isStale()) { return }
        console.error('Error fetching team', e)
        setError(`Error: ${e.message}`)
      }
    },
    { immediate: true }
  )

  const { status: submitStatus, setLoading: setLoading } = useStatus()

  function updateTeam (team) {
    if (!team || !(props.id || props.id === 0)) { return }
    if (props.mode === 'edit') {
      editTeam(team)
    }
  }

  async function editTeam (team) {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      await tournamentsService.editTeam({
        tournamentId: props.tournamentId,
        teamId: props.id,
        team: generateTournamentTeamToSubmit(team)
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
    v-if="!team"
    :isOpen="isOpen"
    variant="medium"
  >
    <SiteRequireSignIn>
      <template #signin-message>
        to edit your team
      </template>
      <template v-if="fetchStatus.loading">
        Loading...
      </template>
      <template v-else-if="fetchStatus.error">
        Error loading team ({{ fetchStatus.errorMessage }})
      </template>
      <template v-else-if="fetchStatus.loaded">
        Unexpected error, no team data received
      </template>
    </SiteRequireSignIn>
  </SiteDialog>
  <CreateTeamDialog
    v-else
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
