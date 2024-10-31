<script setup>
  import { ref, computed, watch } from 'vue'
  import useProfile from '@/data/useProfile'
  import SiteRequireSignIn from '../site/SiteRequireSignIn.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SavedTeamFormation from '../team/SavedTeamFormation.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const { isConnectedSignedInProfile, fetchTeams, teams, fetchTeamsStatus } = useProfile(props.address)

  watch(
    () => isConnectedSignedInProfile.value,
    () => {
      if (isConnectedSignedInProfile.value && !fetchTeamsStatus.loaded && !fetchTeamsStatus.loading) {
        fetchTeams()
      }
    },
    { immediate: true }
  )

  const query = ref('')

  const filteredTeams = computed(() => {
    if (!teams.value?.length) { return [] }
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
</script>

<template>
  <SiteRequireSignIn>
    <template #signin-message>
      to view your saved teams
    </template>

    <div class="common-saved-teams__header">
      <div class="common-saved-teams__count">
        {{ teamsToDisplay.length }}
        team{{ teamsToDisplay.length === 1 ? '' : 's' }}
      </div>
      <div class="common-saved-teams__search">
        <SiteTextField
          v-model="query"
          search
          subtle
          placeholder="Search team"
          class="common-saved-teams__search-field"
        />
      </div>
    </div>
    <div
      v-if="!teamsToDisplay.length"
      class="common-saved-teams__empty"
    >
      No teams found.
    </div>
    <ol
      v-else
      class="list-reset common-saved-teams__list"
    >
      <li
        v-for="team in teamsToDisplay"
        :key="team.id"
        class="common-saved-teams__team"
      >
        <div class="common-saved-teams__team__details">
          <div class="common-saved-teams__team__name word-break">
            {{ team.name }}
          </div>
          <div class="common-saved-teams__team__brs">
            Total: {{ team.totalBrs }} BRS
          </div>
        </div>
        <div class="common-saved-teams__team__formation">
          <SavedTeamFormation
            :team="team"
          />
        </div>
        <div
          v-if="$slots['actions']"
          class="common-saved-teams__team__manage"
        >
          <slot
            name="actions"
            :team="team"
            :fetchTeams="fetchTeams"
          ></slot>
        </div>
      </li>
    </ol>
  </SiteRequireSignIn>
</template>

<style scoped>
  .common-saved-teams__header {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }
  .common-saved-teams__count {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }

  .common-saved-teams__team {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    background: rgba(var(--c-black-rgb), 0.5);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  /* put right-padding on the child because management div has a background colour */
  .common-saved-teams__team > div:last-child {
    padding-right: 1rem;
  }

  .common-saved-teams__team__details {
    flex: 1 1 auto;
    margin: 1rem 0;
  }
  .common-saved-teams__team__formation {
    flex: none;
  }

  .common-saved-teams__team__name {
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .common-saved-teams__team__brs {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }

  .common-saved-teams__team__manage {
    align-self: stretch;
    padding: 0.75rem 1rem;
    background: var(--c-black);
  }
</style>