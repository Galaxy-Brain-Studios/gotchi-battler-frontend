import { ref, computed, watch } from 'vue'

const musicVolume = ref("0.5") /* between 0 and 1, store it as a string to avoid confusion in serialisation */
const sfxVolume = ref("0.5") /* between 0 and 1, store it as a string to avoid confusion in serialisation */

const settingsToStore = computed(() => ({
  musicVolume: musicVolume.value,
  sfxVolume: sfxVolume.value
}))

const STORAGE_KEY = 'GB_SETTINGS'

// load initial values from local storage
const storedSettingsJson = localStorage.getItem(STORAGE_KEY)
if (storedSettingsJson) {
  try {
    const storedSettings = JSON.parse(storedSettingsJson)
    if (storedSettings) {
      musicVolume.value = storedSettings.musicVolume
      sfxVolume.value = storedSettings.sfxVolume
    }
  } catch (e) {
    console.error('Error loading settings from storage', e)
  }
}

watch(
  () => settingsToStore.value,
  () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settingsToStore.value))
  }
)


export default function useSettings () {
  return { musicVolume, sfxVolume }
}
