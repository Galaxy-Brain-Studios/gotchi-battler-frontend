<script setup>
  import { ref, watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import profileService from '@/data/profileService'
  import useStatus from '../../utils/useStatus'
  import CommonSavedTeams from './CommonSavedTeams.vue'
  import ProfileTeamDelete from './ProfileTeamDelete.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
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

  function refreshSavedTeamsList () {
    savedTeamsLastChanged.value = Date.now()
  }

  // Create Team
  const createTeamDialogIsOpen = ref(false)
  const { status: submitCreateStatus, setLoading: setCreateLoading, reset: resetCreateStatus } = useStatus()

  function createTeam () {
    createTeamDialogIsOpen.value = true
    resetCreateStatus()
  }

  function closeCreateTeam () {
    createTeamDialogIsOpen.value = false
    resetCreateStatus()
  }

  async function saveNewTeam (team) {
    const [isStale, setLoaded, setError] = setCreateLoading()
    try {
      await profileService.createTeam({
        ...team
      })
      // teams list will need updating, even if we've moved on from this dialog
      refreshSavedTeamsList()
      if (isStale()) { return }
      setLoaded()
      closeCreateTeam()
    } catch (e) {
      if (isStale()) { return }
      console.error('Error saving team', e)
      setError(`Error: ${e.message}`)
    }
  }


  // Edit Team
  const editTeamDialogIsOpen = ref(false)
  const editingTeam = ref(null)
  const { status: submitEditStatus, setLoading: setEditLoading, reset: resetEditStatus } = useStatus()

  function editTeam (team) {
    editTeamDialogIsOpen.value = true
    editingTeam.value = team
    resetEditStatus()
  }

  function closeEditTeam () {
    editTeamDialogIsOpen.value = false
    editingTeam.value = null
    resetEditStatus()
  }

  async function updateTeam (team) {
    const editTeamId = editingTeam.value?.id
    if (!editTeamId) { return }
    const [isStale, setLoaded, setError] = setEditLoading()
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

</script>

<template>
  <CommonSavedTeams
    v-if="isConnectedProfile"
    :address="address"
    :savedTeamsLastChanged="savedTeamsLastChanged"
    showTeamCount
  >
    <template #headerActions>
      <div>
        <SiteButtonSmall
          @click="createTeam()"
        >
          Create Saved Team
        </SiteButtonSmall>
      </div>
    </template>
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
    v-if="createTeamDialogIsOpen"
    v-model:isOpen="createTeamDialogIsOpen"
    mode="create_profile_saved"
    :isSaving="submitCreateStatus.loading"
    :errorMessage="submitCreateStatus.error && submitCreateStatus.errorMessage || null"
    @update:team="saveNewTeam"
  />
  <CreateTeamDialog
    v-else-if="editTeamDialogIsOpen && editingTeam"
    v-model:isOpen="editTeamDialogIsOpen"
    :team="editingTeam"
    mode="edit_profile_saved"
    :isSaving="submitEditStatus.loading"
    :errorMessage="submitEditStatus.error && submitEditStatus.errorMessage || null"
    @update:team="updateTeam"
    @savedProfileTeam="refreshSavedTeamsList"
  />
</template>

<style scoped>
</style>