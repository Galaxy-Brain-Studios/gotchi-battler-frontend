<script setup>
  import SiteButtonGroup from '../common/SiteButtonGroup.vue'
  import SiteButtonLink from '../common/SiteButtonLink.vue'
  import TournamentsList from '../tournaments/TournamentsList.vue'

  defineProps({
    type: {
      type: String,
      required: true
    }
  })
</script>

<template>
  <main>
    <SiteButtonGroup
      :numButtons="5"
      class="tournament_types"
    >
      <SiteButtonLink
        :to="{ name: 'tournaments-type', params: { type: 'all' } }"
        grouped="start"
      >
        All
      </SiteButtonLink>
      <SiteButtonLink
        :to="{ name: 'tournaments-type', params: { type: 'upcoming' } }"
        grouped="middle"
      >
        Upcoming
      </SiteButtonLink>
      <SiteButtonLink
        :to="{ name: 'tournaments-type', params: { type: 'registering' } }"
        grouped="middle"
      >
        Registering
      </SiteButtonLink>
      <SiteButtonLink
        :to="{ name: 'tournaments-type', params: { type: 'active' } }"
        grouped="middle"
      >
        Active
      </SiteButtonLink>
      <SiteButtonLink
        :to="{ name: 'tournaments-type', params: { type: 'completed' } }"
        grouped="end"
      >
        Completed
      </SiteButtonLink>
    </SiteButtonGroup>

    <TournamentsList
      :type="type"
    />
  </main>
</template>

<style scoped>
  .tournament_types {
    margin: 3rem 0 2rem;
  }
</style>