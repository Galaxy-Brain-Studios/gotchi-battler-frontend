<script setup>
  import { computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import TournamentCreateTeam from './TournamentCreateTeam.vue'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'

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
  <SiteRequireSignIn
    v-if="address && tournamentId && canCreateTeam"
  >
    <template #signin-message>
      to create a team for this tournament
    </template>
    <TournamentCreateTeam
      :tournamentId="tournamentId"
      style="white-space: nowrap;"
      @createdTeam="emit('createdTeam')"
    />
  </SiteRequireSignIn>
</template>

<style scoped>
</style>