import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import SPECIALS from './specials.json'

export const useSpecialsStore = defineStore('specials', () => {
  const specials = ref(SPECIALS)
  const specialsById = computed(() => Object.fromEntries(
    specials.value.map(item => [item.id, item])
  ))

  return { specials, specialsById }
})
