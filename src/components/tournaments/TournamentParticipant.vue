<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import TournamentCreateTeam from './TournamentCreateTeam.vue'

  const props = defineProps({
    tournamentId: {
      type: Number,
      required: true
    },
    tournamentStatus: {
      type: String,
      required: true
    }
  })
  const emit = defineEmits(['createdTeam'])

  const accountStore = useAccountStore()
  const { address } = storeToRefs(accountStore)

  const canCreateTeam = computed(() => {
    return props.tournamentStatus === 'registering' && props.tournamentId && address.value
  })

</script>

<template>
  <TournamentCreateTeam
    v-if="address && tournamentId && canCreateTeam"
    :tournamentId="tournamentId"
    @createdTeam="emit('createdTeam')"
  />
</template>

<style scoped>
</style>