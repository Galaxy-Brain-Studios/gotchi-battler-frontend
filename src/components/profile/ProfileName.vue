<script setup>
  import { ref, watch } from 'vue'
  import useProfile from '../../data/useProfile'
  import profileService from '../../data/profileService'
  import useStatus from '../../utils/useStatus'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteButtonWhite from '../common/SiteButtonWhite.vue'
  import SiteError from '../common/SiteError.vue'

  const emit = defineEmits(['saved'])

  const props = defineProps({
    address: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: null
    }
  })

  const { isConnectedProfile } = useProfile(props.address)

  const isEditMode = ref(false)
  const nameInput = ref('')

  // If not connected to this profile, make sure we are not in edit mode
  watch(
    () => isConnectedProfile.value,
    () => {
      if (!isConnectedProfile.value && isEditMode.value) {
        isEditMode.value = false
      }
    }
  )

  // Sync the incoming name to the input field
  watch(
    () => [props.address, props.name],
    () => {
      nameInput.value = props.name || ''
    },
    { immediate: true }
  )

  // After leaving edit mode, reset any changes to the name input
  watch(
    () => isEditMode.value,
    () => {
      if (!isEditMode.value) {
        nameInput.value = props.name || ''
      }
    }
  )

  const { status: saveStatus, setLoading } = useStatus()
  const saveName = async function () {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const profile = await profileService.saveName(nameInput.value)
      if (isStale()) { return; }
      setLoaded()
      isEditMode.value = false
      emit("saved", profile)
    } catch (e) {
      setError(e.message)
    }
  }
</script>

<template>
  <div
    v-if="isEditMode"
    class="profile-name profile-name--edit"
  >
    <SiteTextField
      v-model="nameInput"
    />
    <div class="profile-name__edit-controls">
      <SiteButtonWhite
        small
        @click="isEditMode = false"
      >
        Cancel
      </SiteButtonWhite>
      <SiteButtonWhite
        small
        active
        :disabled="saveStatus.loading"
        @click="saveName"
      >
        Save
      </SiteButtonWhite>
    </div>
    <div
      v-if="saveStatus.loading"
      class="profile-name__edit-message"
    >
      Saving...
    </div>
    <div
      v-if="saveStatus.error"
      class="profile-name__edit-message"
    >
      <SiteError small>
        {{ saveStatus.errorMessage }}
      </SiteError>
    </div>
  </div>
  <div
    v-else
    class="profile-name"
    :class="{
      'profile-name--unset': !name
    }"
  >
    <template v-if="name">
      {{ name }}
    </template>
    <template v-else>
      Noname
    </template>
    <SiteButtonIcon
      v-if="isConnectedProfile"
      class="profile-name__edit-button"
      label="Edit Name"
      iconName="edit"
      @click="isEditMode = true"
    />
  </div>
</template>

<style scoped>
  .profile-name {
    text-align: center;
    font-size: 1.125rem;
    font-weight: bold;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
  .profile-name--unset {
    opacity: 0.6;
  }

  .profile-name__edit-button {
    margin-left: 0.5rem;
  }
  .profile-name__edit-controls {
    margin-top: 0.5rem;
    display: flex;
    gap: 1rem;
    justify-content: space-around;
  }
  .profile-name__edit-controls > * {
    flex: none;
  }
  .profile-name__edit-message {
    margin-top: 0.75rem;
    margin-bottom: 1rem;
    font-size: 1rem;
    font-weight: normal;
  }
</style>