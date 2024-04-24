<script setup>
  import { ref, computed, watch } from 'vue'
  import debounce from 'lodash.debounce'
  import orderBy from 'lodash.orderby'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useTournamentGotchis from '../../data/useTournamentGotchis'
  import SiteCheckbox from '../common/SiteCheckbox.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteTable from '../common/SiteTable.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteButton from '../common/SiteButton.vue'
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

  const store = useAccountStore()
  const { isConnected, address } = storeToRefs(store)

  const onlyShowMine = ref(false)
  const sortOptions = [
    {
      id: 'onchainId_asc',
      label: 'ID'
    },
    {
      id: 'name_asc',
      label: 'Name'
    },
    {
      id: 'brs_desc',
      label: 'BRS'
    },
    {
      id: 'teamName_asc',
      label: 'Team Name'
    },
    {
      id: 'teamOwner_asc',
      label: 'Team Owner'
    }
  ]
  const sorting = ref(sortOptions[0].id)
  const sortingProperty = computed(() => sorting.value.split('_')[0])
  const sortingDirection = computed(() => sorting.value.split('_')[1])

  const query = ref('')
  const debouncedQuery = ref('')
  function setQuery () {
    debouncedQuery.value = query.value
  }
  const debouncedSetQuery = debounce(setQuery, 200)

  const numToShow = ref(10)

  const filteredAndSortedGotchis = computed(() => {
    if (!gotchis.value?.length) { return [] }
    let result = gotchis.value
    if (isConnected.value && onlyShowMine.value) {
      const myAddressLc = address.value.toLowerCase()
      result = result.filter(gotchi => gotchi.teamOwner?.toLowerCase() === myAddressLc)
    }
    if (query.value) {
      const queryLc = query.value.toLowerCase()
      result = result.filter(gotchi => `${gotchi.onchainId}` === queryLc || gotchi.name?.toLowerCase().includes(queryLc))
    }
    result = orderBy(result, [sortingProperty.value], [sortingDirection.value])
    return result
  })
  const gotchisToDisplay = computed(() => {
    if (!filteredAndSortedGotchis.value) { return null }
    return filteredAndSortedGotchis.value.slice(0, numToShow.value)
  })

  function loadMore () {
    numToShow.value += 10
  }
  const canLoadMore = computed(() => filteredAndSortedGotchis.value?.length > numToShow.value)

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
        <div class="tournament-gotchis__header">
          <SiteCheckbox
            v-if="isConnected"
            v-model="onlyShowMine"
          >
            My team's gotchis only
          </SiteCheckbox>
          <div class="tournament-gotchis__search-teams">
            <SiteTextField
              v-model="query"
              search
              subtle
              placeholder="Search gotchi id or name"
              class="tournament-gotchis__search-field"
              @input="debouncedSetQuery"
            />
          </div>
          <div class="tournament-gotchis__sort-teams">
            Sort by:
            <SiteSelect v-model="sorting">
              <option
                v-for="option in sortOptions"
                :key="option.id"
                :value="option.id"
              >
                {{ option.label }}
              </option>
            </SiteSelect>
          </div>
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
                <span>ID</span>
                <SiteIcon
                  v-if="sortingProperty === 'onchainId'"
                  :label="sortingDirection === 'asc' ? 'Sorted Ascending' : 'Sorted Descending'"
                  :name="sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'"
                  class="tournament-gotchis__header-sort-icon"
                  :width="0.625"
                  :height="0.625"
                />
              </th>
              <th class="site-table--no-grow">
              </th>
              <th>
                <span>Name</span>
                <SiteIcon
                  v-if="sortingProperty === 'name'"
                  :label="sortingDirection === 'asc' ? 'Sorted Ascending' : 'Sorted Descending'"
                  :name="sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'"
                  class="tournament-gotchis__header-sort-icon"
                  :width="0.625"
                  :height="0.625"
                />
              </th>
              <th class="site-table--no-grow">
                <span>BRS</span>
                <SiteIcon
                  v-if="sortingProperty === 'brs'"
                  :label="sortingDirection === 'asc' ? 'Sorted Ascending' : 'Sorted Descending'"
                  :name="sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'"
                  class="tournament-gotchis__header-sort-icon"
                  :width="0.625"
                  :height="0.625"
                />
              </th>
              <th>
                <span>Team</span>
                <SiteIcon
                  v-if="sortingProperty === 'teamName'"
                  :label="sortingDirection === 'asc' ? 'Sorted Ascending' : 'Sorted Descending'"
                  :name="sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'"
                  class="tournament-gotchis__header-sort-icon"
                  :width="0.625"
                  :height="0.625"
                />
              </th>
              <th class="site-table--no-grow">
                <span>Team Owner</span>
                <SiteIcon
                  v-if="sortingProperty === 'teamOwner'"
                  :label="sortingDirection === 'asc' ? 'Sorted Ascending' : 'Sorted Descending'"
                  :name="sortingDirection === 'asc' ? 'chevron-up' : 'chevron-down'"
                  class="tournament-gotchis__header-sort-icon"
                  :width="0.625"
                  :height="0.625"
                />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="gotchi in gotchisToDisplay"
              :key="gotchi.id"
            >
              <td class="gotchi-id">
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
              <td>
                {{ gotchi.brs }}
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
        <div class="tournament-gotchis__footer">
          <SiteButton
            v-if="canLoadMore"
            @click="loadMore"
          >
            Load More Gotchis
          </SiteButton>
        </div>
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
.tournament-gotchis__header {
  margin-bottom: 1.75rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.tournament-gotchis__search-field {
  flex: none;
}

span + .tournament-gotchis__header-sort-icon {
  margin-left: 0.4rem;
}

.tournament-gotchis__table .gotchi-id {
  font-size: 0.875rem;
  line-height: 1.5rem;
  letter-spacing: 0.02625rem;
}
.gotchi-image {
  width: 3rem;
  height: 3rem;
}
.tournament-gotchis__table .team-owner {
  font-size: 1rem;
  letter-spacing: 0.03rem;
  opacity: 0.5;
}
.tournament-gotchis__footer {
  display: grid;
  place-items: center;
}
</style>