<script setup>
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import profileService from '@/data/profileService'
  import useStatus from '../../utils/useStatus'
  import CommonSavedTeams from './CommonSavedTeams.vue'
  import ProfileTeamDelete from './ProfileTeamDelete.vue'
  import SiteButtonWhite from '../common/SiteButtonWhite.vue'
  import CreateTeamDialog from '../team/CreateTeamDialog.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const router = useRouter()

  const { isConnectedProfile } = useProfile(props.address)

  watch(
    () => isConnectedProfile.value,
    () => {
      if (!isConnectedProfile.value) {
        // Cannot view other people's teams, redirect to their profile home
        router.push({ name: 'profile-address', params: { address: props.address } })
      }
    },
    { immediate: true }
  )

  const savedTeamsLastChanged = ref(Date.now())

  const createTeamDialogIsOpen = ref(false)
  const editingTeam = ref(null)
  const { status: submitStatus, setLoading: setLoading, reset: resetStatus } = useStatus()

  function editTeam (team) {
    createTeamDialogIsOpen.value = true
    editingTeam.value = team
    resetStatus()
  }

  function closeEditTeam () {
    createTeamDialogIsOpen.value = false
    editingTeam.value = null
    resetStatus()
  }

  async function updateTeam (team) {
    const editTeamId = editingTeam.value?.id
    if (!editTeamId) { return }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      await profileService.updateTeam({
        ...team,
        id: editTeamId
      })
      // teams list will need updating, even if we've moved on from this dialog
      refreshSavedTeamsList()
      if (isStale()) { return }
      setLoaded()
      if (editingTeam.value?.id === editTeamId) {
        closeEditTeam()
      }
    } catch (e) {
      if (isStale()) { return }
      console.error('Error updating team', e)
      setError(`Error: ${e.message}`)
    }
  }

  function refreshSavedTeamsList () {
    savedTeamsLastChanged.value = Date.now()
  }
</script>

<template>
  <CommonSavedTeams
    v-if="isConnectedProfile"
    :address="address"
    :savedTeamsLastChanged="savedTeamsLastChanged"
    showTeamCount
  >
    <template #actions="{ team }">
      <SiteButtonWhite
        small
        active
        @click="editTeam(team)"
      >
        Edit
      </SiteButtonWhite>
      <ProfileTeamDelete
        :id="team.id"
        :name="team.name"
        @deleted="refreshSavedTeamsList"
      />
    </template>
  </CommonSavedTeams>
  <CreateTeamDialog
    v-if="createTeamDialogIsOpen && editingTeam"
    v-model:isOpen="createTeamDialogIsOpen"
    :team="editingTeam"
    mode="edit_profile_saved"
    :isSaving="submitStatus.loading"
    :errorMessage="submitStatus.error && submitStatus.errorMessage || null"
    @update:team="updateTeam"
    @savedProfileTeam="refreshSavedTeamsList"
  />
</template>

<style scoped>
</style>