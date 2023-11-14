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
  <div v-if="address && tournamentId">
    <template v-if="canCreateTeam">
      Find your teams in 'Entrants' below, or create a new team.
      <TournamentCreateTeam
        :tournamentId="tournamentId"
        style="margin-top: 1rem;"
        @createdTeam="emit('createdTeam')"
      />
    </template>
    <template v-else>
      Find your teams in 'Entrants' below.
    </template>
  </div>
</template>

<style scoped>
</style>