<script setup>
  import { ref, computed } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useProfile from '@/data/useProfile'
  import SiteTextField from '../common/SiteTextField.vue'
  import SavedTeamFormation from '../team/SavedTeamFormation.vue'
  import ProfileTeamDelete from './ProfileTeamDelete.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const { fetchTeams, teams, fetchTeamsStatus } = useProfile(props.address)
  fetchTeams()

  const query = ref('')

  const filteredTeams = computed(() => {
    if (!teams.value.length) { return [] }
    let result = teams.value
    if (query.value) {
      const queryLc = query.value.toLowerCase()
      result = result.filter(team => team.name?.toLowerCase().includes(queryLc))
    }

    return result
  })
  const teamsToDisplay = computed(() => {
    return filteredTeams.value
  })

  const store = useAccountStore()
  const { isConnected, address: connectedAddress } = storeToRefs(store)

  const isConnectedProfile = computed(() => props.address && isConnected.value && connectedAddress.value && connectedAddress.value.toLowerCase() === props.address.toLowerCase())
</script>

<template>
  <div>
    <div
      v-if="fetchTeamsStatus.loading"
      class="profile-teams__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchTeamsStatus.error"
      class="profile-teams__error"
    >
      {{ fetchTeamsStatus.errorMessage }}
    </div>
    <div
      v-else-if="fetchTeamsStatus.loaded"
      class="profile-teams__layout"
    >
      <div class="profile-teams__header">
        <div class="profile-teams__count">
          {{ teamsToDisplay.length }}
          team{{ teamsToDisplay.length === 1 ? '' : 's' }}
        </div>
        <div class="profile-teams__search">
          <SiteTextField
            v-model="query"
            search
            subtle
            placeholder="Search team"
            class="profile-teams__search-field"
          />
        </div>
      </div>
      <div
        v-if="!teamsToDisplay.length"
        class="profile-teams__empty"
      >
        No teams found.
      </div>
      <ol
        v-else
        class="list-reset profile-teams__list"
      >
        <li
          v-for="team in teamsToDisplay"
          :key="team.id"
          class="profile-teams__team"
        >
          <div class="profile-teams__team__details">
            <div class="profile-teams__team__name word-break">
              {{ team.name }}
            </div>
            <div class="profile-teams__team__brs">
              Total: {{ team.totalBrs }} BRS
            </div>
          </div>
          <div class="profile-teams__team__formation">
            <SavedTeamFormation
              :team="team"
            />
          </div>
          <div
            v-if="isConnectedProfile"
            class="profile-teams__team__manage"
          >
            <ProfileTeamDelete
              :id="team.id"
              :name="team.name"
              @deleted="fetchTeams"
            />
          </div>
        </li>
      </ol>
    </div>
  </div>
</template>

<style scoped>
  .profile-teams__header {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }
  .profile-teams__count {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }

  .profile-teams__team {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    background: rgba(var(--c-black-rgb), 0.5);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  /* put right-padding on the child because management div has a background colour */
  .profile-teams__team > div:last-child {
    padding-right: 1rem;
  }

  .profile-teams__team__details {
    flex: 1 1 auto;
    margin: 1rem 0;
  }
  .profile-teams__team__formation {
    flex: none;
  }

  .profile-teams__team__name {
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .profile-teams__team__brs {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }

  .profile-teams__team__manage {
    align-self: stretch;
    padding: 0.75rem 1rem;
    background: var(--c-black);
  }
</style>