<script setup>
  import { ref, computed, watch } from 'vue'
  import debounce from 'lodash.debounce'
  import orderBy from 'lodash.orderby'
  import useTournamentGotchis from '../../data/useTournamentGotchis'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteTable from '../common/SiteTable.vue'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SiteEthAddress from '../common/SiteEthAddress.vue'
  import TeamDialog from '../team/TeamDialog.vue'

  const props = defineProps({
    tournamentId: {
      type: Number,
      required: true
    }
  })

  const { fetchGotchis, gotchis, fetchGotchisStatus } = useTournamentGotchis()

  const teamId = ref(null)
  const teamDialogIsOpen = ref(false)

  watch(
    () => teamDialogIsOpen.value,
    (newIsOpen) => {
      if (!newIsOpen && teamId.value) {
        teamId.value = null
      }
    }
  )

  watch(
    () => props.tournamentId,
    () => {
      fetchGotchis(props.tournamentId)
      teamId.value = null
      teamDialogIsOpen.value = false
    },
    { immediate: true }
  )

  const sorting = ref({ property: 'onchainId', direction: 'asc' })

  function sort(property, direction) {
    sorting.value.property = property;
    sorting.value.direction = direction;
  }

  const query = ref('')
  const debouncedQuery = ref('')
  function setQuery () {
    debouncedQuery.value = query.value
  }
  const debouncedSetQuery = debounce(setQuery, 200)

  const gotchisToDisplay = computed(() => {
    if (!gotchis.value?.length) { return [] }
    let result = gotchis.value
    if (query.value) {
      const queryLc = query.value.toLowerCase()
      result = result.filter(gotchi => `${gotchi.onchainId}` === queryLc || gotchi.name?.toLowerCase().includes(queryLc))
    }
    result = orderBy(result, [sorting.value.property], [sorting.value.direction])
    return result
  })

  const showTeam = function (gotchiTeamId) {
    teamId.value = gotchiTeamId
    teamDialogIsOpen.value = true
  }
</script>

<template>
  <div>
    <div
      v-if="fetchGotchisStatus.loading"
      class="tournament-gotchis__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchGotchisStatus.error"
      class="tournament-gotchis__error"
    >
      {{ fetchGotchisStatus.errorMessage }}
    </div>
    <template v-else-if="fetchGotchisStatus.loaded">
      <div
        v-if="!gotchis?.length"
        class="tournament-gotchis__empty"
      >
        No gotchis in this tournament.
      </div>
      <div v-else>
      <div class="tournament-gotchis__search-container">
        <SiteTextField
          v-model="query"
          search
          placeholder="Find gotchi by ID or name"
          class="tournament-gotchis__search-field"
          @input="debouncedSetQuery"
        />
      </div>
        <div
          v-if="!gotchisToDisplay.length"
          class="tournament-gotchis__empty"
        >
          No gotchis found.
        </div>
        <SiteTable
          v-else
          class="tournament-gotchis__table"
        >
          <thead>
            <tr>
              <th class="site-table--no-grow">
                <span>Onchain ID</span>
                <SiteButtonIcon
                  label="Sort Ascending"
                  iconName="chevron-up"
                  :active="sorting.property === 'onchainId' && sorting.direction === 'asc'"
                  @click="sort('onchainId', 'asc')"
                />
                <SiteButtonIcon
                  label="Sort Descending"
                  iconName="chevron-down"
                  :active="sorting.property === 'onchainId' && sorting.direction === 'desc'"
                  @click="sort('onchainId', 'desc')"
                />
              </th>
              <th class="site-table--no-grow">
              </th>
              <th>
                <span>Name</span>
                <SiteButtonIcon
                  label="Sort Ascending"
                  iconName="chevron-up"
                  :active="sorting.property === 'name' && sorting.direction === 'asc'"
                  @click="sort('name', 'asc')"
                />
                <SiteButtonIcon
                  label="Sort Descending"
                  iconName="chevron-down"
                  :active="sorting.property === 'name' && sorting.direction === 'desc'"
                  @click="sort('name', 'desc')"
                />
              </th>
              <th>
                <span>Team</span>
                <SiteButtonIcon
                  label="Sort Ascending"
                  iconName="chevron-up"
                  :active="sorting.property === 'teamName' && sorting.direction === 'asc'"
                  @click="sort('teamName', 'asc')"
                />
                <SiteButtonIcon
                  label="Sort Descending"
                  iconName="chevron-down"
                  :active="sorting.property === 'teamName' && sorting.direction === 'desc'"
                  @click="sort('teamName', 'desc')"
                />
              </th>
              <th class="site-table--no-grow">
                <span>Team Owner</span>
                <SiteButtonIcon
                  label="Sort Ascending"
                  iconName="chevron-up"
                  :active="sorting.property === 'teamOwner' && sorting.direction === 'asc'"
                  @click="sort('teamOwner', 'asc')"
                />
                <SiteButtonIcon
                  label="Sort Descending"
                  iconName="chevron-down"
                  :active="sorting.property === 'teamOwner' && sorting.direction === 'desc'"
                  @click="sort('teamOwner', 'desc')"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="gotchi in gotchisToDisplay"
              :key="gotchi.id"
            >
              <td>
                {{ gotchi.onchainId }}
              </td>
              <td class="gotchi-image-cell">
                <img
                  :src="gotchi.svgFront"
                  alt=""
                  class="gotchi-image"
                  loading="lazy"
                />
              </td>
              <td class="word-break">
                {{ gotchi.name }}
              </td>
              <td
                class="word-break"
                style="position: relative;"
              >
                <a
                  href="#"
                  class="link-reset link-reset--hover-underline extended-target"
                  :data-team-id="gotchi.teamId"
                  @click="showTeam(gotchi.teamId)"
                >
                  {{ gotchi.teamName }}
                </a>
              </td>
              <td class="team-owner">
                <SiteEthAddress
                  :address="gotchi.teamOwner"
                />
              </td>
            </tr>
          </tbody>
        </SiteTable>
        <TeamDialog
          v-if="teamId"
          v-model:isOpen="teamDialogIsOpen"
          :id="teamId"
          :tournamentId="tournamentId"
          :canDelete="false"
          :canReplace="false"
          :canEdit="false"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.tournament-gotchis__empty {
  color: var(--c-white);
  font-size: 1.5rem;
}
.tournament-gotchis__search-container {
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}
.tournament-gotchis__search-field {
  flex: none;
}
.tournament-gotchis__table .gotchi-image-cell {
  padding-top: 0.2rem;
}
.gotchi-image {
  width: 60px;
}
.tournament-gotchis__table .team-owner {
  font-size: 1rem;
  letter-spacing: 0.03rem;
  opacity: 0.5;
}
</style>