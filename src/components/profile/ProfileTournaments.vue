<script setup>
  import { watch } from 'vue'
  import { useRouter } from 'vue-router'
  import useProfile from '@/data/useProfile'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import SiteTable from '../common/SiteTable.vue'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import TournamentStatusBadge from '../tournaments/TournamentStatusBadge.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const router = useRouter()

  const { isConnectedProfile, isConnectedSignedInProfile, fetchTournaments, tournaments, fetchTournamentsStatus } = useProfile(props.address)

  watch(
    () => isConnectedProfile.value,
    () => {
      if (!isConnectedProfile.value) {
        // Cannot view other people's tournaments, redirect to their profile home
        router.push({ name: 'profile-address', params: { address: props.address } })
      }
    },
    { immediate: true }
  )

  watch(
    () => isConnectedSignedInProfile.value,
    () => {
      if (isConnectedSignedInProfile.value && !fetchTournamentsStatus.loaded && !fetchTournamentsStatus.loading) {
        fetchTournaments()
      }
    },
    { immediate: true }
  )

</script>

<template>
  <SiteRequireSignIn v-if="isConnectedProfile">
    <template #signin-message>
      to view tournaments you created
    </template>

    <div
      v-if="fetchTournamentsStatus.loading"
      class="profile-tournaments__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchTournamentsStatus.error"
      class="profile-tournaments__error"
    >
      {{ fetchTournamentsStatus.errorMessage }}
    </div>
    <div
      v-else-if="fetchTournamentsStatus.loaded"
    >
      <div class="profile-tournaments__header">
        <SiteButtonLink :to="{ name: 'profile-tournament-create', params: { address } }">
          Create Tournament
        </SiteButtonLink>
      </div>

      <div v-if="!tournaments?.length">
        You have not created any tournaments.
      </div>
      <SiteTable
        v-else
        class="profile-tournaments"
      >
        <tbody>
          <tr
            v-for="tournament in tournaments"
            :key="tournament.id"
          >
            <td class="profile-tournaments__tournament-status">
              <TournamentStatusBadge :status="tournament.status" />
            </td>
            <td>
              <RouterLink
                :to="{ name: 'tournament', params: { id: tournament.id } }"
                class="link-reset link-reset--hover-underline word-break"
              >
                {{ tournament.name }}
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </SiteTable>
    </div>
  </SiteRequireSignIn>
</template>

<style scoped>
  .profile-tournaments__header {
    display: flex;
    justify-content: flex-end;
  }

  .profile-tournaments td {
    vertical-align: top;
  }
  .profile-tournaments__tournament-status {
    text-align: right;
  }
</style>