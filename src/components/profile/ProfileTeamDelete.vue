<script setup>
  import { ref } from 'vue'
  import profileService from '../../data/profileService'
  import useStatus from '../../utils/useStatus'
  import SiteButtonWhite from '../common/SiteButtonWhite.vue'
  import SiteError from '../common/SiteError.vue'
  import SiteDialog from '../common/SiteDialog.vue'

  const emit = defineEmits(['deleted'])

  const props = defineProps({
    id: {
      type: [String, Number],
      required: true
    },
    name: {
      type: String,
      default: null
    }
  })

  const isConfirmOpen = ref(false)

  const { status: submitStatus, setLoading } = useStatus()
  const deleteTeam = async function () {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      await profileService.deleteTeam(props.id)
      if (isStale()) { return; }
      isConfirmOpen.value = false
      setLoaded()
      emit("deleted")
    } catch (e) {
      setError(e.message)
    }
  }
</script>

<template>
  <div>
    <SiteButtonWhite
      small
      @click="isConfirmOpen = true"
    > 
      Remove
    </SiteButtonWhite>


    <SiteDialog
      v-model:isOpen="isConfirmOpen"
      variant="small"
    >
      <div class="profile-team-delete__dialog">
        <div class="word-break">
          Delete team "{{ name }}"?
        </div>

        <div
          v-if="submitStatus.error"
          class="profile-team-delete__error-message"
        >
          <SiteError small>
            {{ submitStatus.errorMessage }}
          </SiteError>
        </div>
      </div>
      <div class="profile-team-delete__confirm-controls">
        <div
          v-if="submitStatus.loading"
          class="profile-team-delete__loading"
        >
          Submitting...
        </div>
        <SiteButtonWhite
          small
          @click="isConfirmOpen = false"
        >
          Cancel
        </SiteButtonWhite>
        <SiteButtonWhite
          small
          active
          :disabled="submitStatus.loading"
          @click="deleteTeam"
        >
          Delete
        </SiteButtonWhite>
      </div>
    </SiteDialog>
  </div>
</template>

<style scoped>
  .profile-team-delete__dialog {
    padding-bottom: 1rem;
    font-size: 1rem;
    font-weight: normal;
    text-align: center;
  }
  .profile-team-delete__error-message {
    display: inline-block;
    margin-top: 1.25rem;
  }
  .profile-team-delete__confirm-controls {
    margin-top: 0.5rem;
    margin-right: 0.75rem;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: flex-end;
  }
  .profile-team-delete__confirm-controls > * {
    flex: none;
  }
  .profile-team-delete__loading {
    opacity: 0.5;
    font-size: 0.875rem;
    font-style: italic;
  }
</style>