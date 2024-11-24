<script setup>
  import { ref, computed } from 'vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SavedTeamFormation from '../team/SavedTeamFormation.vue'
  import TeamDifficultyBadge from '../training/TeamDifficultyBadge.vue'

  const props = defineProps({
    teams: {
      type: Array,
      default: null
    },
    unavailableGotchiIds: {
      type: Array,
      default: null
    },
    showTeamCount: {
      type: Boolean,
      default: false
    }
  })  

  const query = ref('')

  const filteredTeams = computed(() => {
    if (!props.teams?.length) { return [] }
    let result = props.teams
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
  <div class="common-saved-teams-list__header">
    <div
      v-if="showTeamCount"
      class="common-saved-teams-list__count"
    >
      {{ teamsToDisplay.length }}
      team{{ teamsToDisplay.length === 1 ? '' : 's' }}
    </div>
    <div class="common-saved-teams-list__search">
      <SiteTextField
        v-model="query"
        search
        subtle
        placeholder="Search team"
        class="common-saved-teams-list__search-field"
      />
    </div>
  </div>
  <div
    v-if="!teamsToDisplay.length"
    class="common-saved-teams-list__empty"
  >
    No teams found.
  </div>
  <ol
    v-else
    class="list-reset common-saved-teams-list__list create-team-source__items-available"
  >
    <li
      v-for="team in teamsToDisplay"
      :key="team.id"
      class="common-saved-teams-list__team"
    >
      <div class="common-saved-teams-list__team__details">
        <div class="common-saved-teams-list__team__name word-break">
          {{ team.name }}
        </div>
        <div>
          <TeamDifficultyBadge
            v-if="team.difficulty"
            :difficulty="team.difficulty"
            class="common-saved-teams-list__team__difficulty"
          />
          <span class="common-saved-teams-list__team__total-brs">
            Total: {{ team.totalBrs }} BRS
          </span>
        </div>
      </div>
      <div class="common-saved-teams-list__team__formation">
        <SavedTeamFormation
          :team="team"
          :unavailableGotchiIds="unavailableGotchiIds"
        />
      </div>
      <div
        v-if="$slots['actions']"
        class="common-saved-teams-list__team__manage"
      >
        <slot
          name="actions"
          :team="team"
        ></slot>
      </div>
    </li>
  </ol>
</template>

<style scoped>
  .common-saved-teams-list__header {
    margin-bottom: 1rem;
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    align-items: center;
  }
  .common-saved-teams-list__count {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }

  .common-saved-teams-list__team {
    margin-bottom: 1rem;
    padding-left: 1.5rem;
    background: rgba(var(--c-black-rgb), 0.5);
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  /* put right-padding on the child because management div has a background colour */
  .common-saved-teams-list__team > div:last-child {
    padding-right: 1rem;
  }

  .common-saved-teams-list__team__details {
    flex: 1 1 auto;
    margin: 1rem 0;
  }
  .common-saved-teams-list__team__formation {
    flex: none;
  }

  .common-saved-teams-list__team__name {
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .common-saved-teams-list__team__difficulty {
    opacity: 0.8;
    margin-top: 0.2rem;
    margin-right: 0.5rem;
  }
  .common-saved-teams-list__team__total-brs {
    opacity: 0.5;
    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }

  .common-saved-teams-list__team__manage {
    align-self: stretch;
    padding: 0.2rem 1rem;
    background: var(--c-black);

    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    justify-content: center;
  }
</style>
