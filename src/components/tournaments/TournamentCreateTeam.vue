<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import CreateTeamDialog from '../team/CreateTeamDialog.vue'
  import useStatus from '../../utils/useStatus'
  import { generateTeamToSubmit } from '../../data/teamUtils'
  import tournamentsService from '../../data/tournamentsService'

  const props = defineProps({
    tournamentId: {
      type: Number,
      required: true
    }
  })
  const emit = defineEmits(['createdTeam'])
  const accountStore = useAccountStore()
  const { address } = storeToRefs(accountStore)

  const createTeamDialogIsOpen = ref(false)
  const { status: submitStatus, setLoading, reset: resetSubmit } = useStatus()

  watch(
    () => address.value,
    () => {
      resetSubmit()
      createTeamDialogIsOpen.value = false
    }
  )

  const canCreateTeam = computed(() => {
    return props.tournamentId && address.value
  })

  watch(
    () => canCreateTeam.value,
    () => {
      if (!canCreateTeam.value) {
        createTeamDialogIsOpen.value = false
      }
    }
  )

  async function submitTeam (team) {
    if (!team) { return }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      await tournamentsService.createTeam({
        tournamentId: props.tournamentId,
        team: generateTeamToSubmit(team)
      })
      if (isStale()) { return }
      setLoaded()
      createTeamDialogIsOpen.value = false
      emit('createdTeam')
    } catch (e) {
      if (isStale()) { return }
      console.error('Error submitting team', e)
      setError(`Error: ${e.message}`)
    }
  }

</script>

<template>
  <div
    v-if="canCreateTeam"
  >
    <SiteButtonPrimary
      @click="createTeamDialogIsOpen = true"
    >
      Create Team
    </SiteButtonPrimary>
    <CreateTeamDialog
      v-if="createTeamDialogIsOpen"
      v-model:isOpen="createTeamDialogIsOpen"
      :tournamentId="tournamentId"
      :isSaving="submitStatus.loading"
      :errorMessage="submitStatus.error && submitStatus.errorMessage || null"
      mode="create"
      @update:team="submitTeam"
    />
  </div>
</template>

<style scoped>
</style>