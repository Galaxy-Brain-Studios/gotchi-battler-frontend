<script setup>
  import { watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import CommonSavedTeams from './CommonSavedTeams.vue'
  import ProfileTeamDelete from './ProfileTeamDelete.vue'

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

</script>

<template>
  <CommonSavedTeams
    v-if="isConnectedProfile"
    :address="address"
  >
    <template #actions="{ team, fetchTeams }">
      <ProfileTeamDelete
        :id="team.id"
        :name="team.name"
        @deleted="fetchTeams"
      />
    </template>
  </CommonSavedTeams>
</template>

<style scoped>
</style>