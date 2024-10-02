<script setup>
  import { ref, useTemplateRef, computed } from 'vue'
  import profileService from '../../data/profileService'
  import useStatus from '../../utils/useStatus'
  import SiteButtonWhite from '../common/SiteButtonWhite.vue'
  import SiteButtonWhiteBox from '../common/SiteButtonWhiteBox.vue'
  import SiteError from '../common/SiteError.vue'
  import SiteDialog from '../common/SiteDialog.vue'

  const emit = defineEmits(['update:isOpen', 'saved'])

  defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    imageUrl: {
      type: String,
      default: null
    }
  })

  const { status: submitStatus, setLoading } = useStatus()
  const deleteImage = async function () {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const profile = await profileService.deleteImage()
      if (isStale()) { return; }
      setLoaded()
      emit("saved", profile)
      emit("update:isOpen", false)
    } catch (e) {
      setError(e.message)
    }
  }

  // TODO:
  // * confirm what the image file types and size limit are server-side and match those
  // * confirm method of fetching upload URL from server
  // * confirm method of uploading image to cloud storage
  // * find out how to get the updated profile imageUrl after uploading file

  const ACCEPTED_FILE_TYPES = ['gif', 'jpg', 'jpeg', 'png', 'webp']
  const MAX_FILE_SIZE_MB = 5
  const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

  const fileInputRef = useTemplateRef('file-input')

  // We can't use v-model on file inputs, have to monitor it manually for changes
  const selectedFile = ref(null)
  const onFileInputChange = function () {
    const selectedFiles = fileInputRef.value?.files
    if (selectedFiles?.length === 1) {
      selectedFile.value = selectedFiles[0]
    } else {
      selectedFile.value = null
    }
  }
  const selectedValidImage = computed(() => {
    if (!selectedFile.value) { return false }
    if (selectedFile.value.size > MAX_FILE_SIZE_BYTES) { return false }
    const name = selectedFile.value.name
    if (name.lastIndexOf('.') === -1) { return false }
    const fileExt = name.substring(name.lastIndexOf('.') + 1, name.length)
    if (!ACCEPTED_FILE_TYPES.includes(fileExt.toLowerCase())) { return false }
    return true
  })

  const uploadImage = async function () {
    if (submitStatus.loading || !selectedFile.value) { return }
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const uploadUrl = await profileService.fetchImageUploadUrl(selectedFile.value.name)
      if (isStale()) { return; }
      await profileService.uploadImage({ uploadUrl, file: selectedFile.value })
      if (isStale()) { return; }
      setLoaded()
      // Clear the file input
      if (fileInputRef.value) {
        fileInputRef.value.value = null
        onFileInputChange()
      }
      // TODO get updated profile?
      const newProfile = {}
      emit("saved", newProfile)
      emit("update:isOpen", false)
    } catch (e) {
      setError(e.message)
    }
  }
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="small"
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <div class="profile-image-edit__dialog">
      <div
        v-if="imageUrl"
        class="profile-image-edit__delete"
      >
        You already have an image set.
        <SiteButtonWhite
          small
          active
          :disabled="submitStatus.loading"
          class="profile-image-edit__delete-button"
          @click="deleteImage"
        >
          Delete image
        </SiteButtonWhite>
      </div>
      <div class="profile-image-edit__upload">
        <input
          ref="file-input"
          type="file"
          id="profile-image-edit__file-input"
          :accept="ACCEPTED_FILE_TYPES.map(t => '.' + t).join(',')"
          class="profile-image-edit__file-input"
          @click="requestUploadUrl"
          @change="onFileInputChange"
          @clear="onFileInputChange"
        />
        <label
          for="profile-image-edit__file-input"
          class="profile-image-edit__file-input-label"
        >
          <SiteButtonWhiteBox
            small
            active
            interactive
            class="profile-image-edit__upload-request-button"
          >
            Select image to upload
          </SiteButtonWhiteBox>
        </label>
        <div class="profile-image-edit__upload-help">
          Accepted file types: {{ ACCEPTED_FILE_TYPES.join(', ') }}
          <br>Maximum file size {{ MAX_FILE_SIZE_MB }}MB.
        </div>
        <SiteButtonWhite
          v-if="selectedValidImage"
          small
          active
          :disabled="submitStatus.loading"
          class="profile-image-edit__upload-submit-button"
          @click="uploadImage"
        >
          Upload Image
        </SiteButtonWhite>
      </div>
      <div
        v-if="submitStatus.loading"
        class="profile-image-edit__loading"
      >
        Submitting...
      </div>
      <div
        v-if="submitStatus.error"
        class="profile-image-edit__error-message"
      >
        <SiteError small>
          {{ submitStatus.errorMessage }}
        </SiteError>
      </div>
    </div>
  </SiteDialog>
</template>

<style scoped>
  .profile-image-edit__dialog {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .profile-image-edit__delete-button,
  .profile-image-edit__upload-request-button,
  .profile-image-edit__upload-submit-button {
    display: inline-block;
  }
  .profile-image-edit__delete-button {
    margin-left: 0.5rem;
  }

  /* hide the native file input while leaving it accessible */
  .profile-image-edit__file-input {
    opacity: 0;
    width: 0.1px;
    height: 0.1px;
    position: absolute;
  }
  /* when the hidden file input is focused with keyboard, duplicate focus styles on label  */
  .profile-image-edit__file-input:focus + label .profile-image-edit__upload-request-button {
    box-shadow: inset 0 0 12px var(--button-color-border), inset 0 0 15px var(--button-color-focus);
  }

  .profile-image-edit__upload-help {
    opacity: 0.5;
    margin-top: 0.5rem;
    font-size: 0.875rem;
  }

  .profile-image-edit__upload-submit-button {
    margin-top: 1rem;
  }
</style>