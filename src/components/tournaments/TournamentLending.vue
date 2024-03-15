<script setup>
  import { ref, computed } from 'vue'
  import debounce from 'lodash.debounce'
  import orderBy from 'lodash.orderby'
  import useGotchiLendings from '@/data/useGotchiLendings'
  import useReactiveDate from '@/data/useReactiveDate'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonBox from '../common/SiteButtonBox.vue'
  import SitePopupDropdown from '../common/SitePopupDropdown.vue'
  import GotchiStats from '../team/GotchiStats.vue'
  import GotchiSpecial from '../team/GotchiSpecial.vue'

  const props = defineProps({
    tournamentStartDate: {
      type: Object,
      required: true
    }
  })

  const { tickerDate } = useReactiveDate()

  const { fetchGotchis, gotchis, fetchGotchisStatus } = useGotchiLendings()

  fetchGotchis()

  const sortOptions = [
    {
      id: 'brs_desc',
      label: 'Rarity Score'
    },
    {
      id: 'lendingGhstPrice_asc',
      label: 'Lending Price'
    },
    {
      id: 'speed_desc',
      label: 'Speed'
    },
    {
      id: 'health_desc',
      label: 'Health'
    },
    {
      id: 'accuracy_desc',
      label: 'Accuracy'
    },
    {
      id: 'evade_desc',
      label: 'Evasiveness'
    },
    {
      id: 'physical_desc',
      label: 'Physical Power'
    },
    {
      id: 'magic_desc',
      label: 'Magic Power'
    },
    {
      id: 'armor_desc',
      label: 'Armor'
    },
    {
      id: 'resist_desc',
      label: 'Resistance'
    },
    {
      id: 'crit_desc',
      label: 'Critical Hit'
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

  const numToShow = ref(20)

  const annotatedGotchis = computed(() => {
    if (!gotchis.value) { return [] }
    const tournamentEndMs = props.tournamentStartDate - 0
    const nowMs = tickerDate.value - 0
    return gotchis.value.map(gotchi => ({
      ...gotchi,
      lendingUrl: `https://app.aavegotchi.com/lending/${encodeURIComponent(gotchi.lendingId)}`,
      lendingEndsEarly: (nowMs + gotchi.lendingPeriod * 1000) < tournamentEndMs
    }))
  })

  const filteredAndSortedGotchis = computed(() => {
    if (!annotatedGotchis.value.length) { return [] }
    let result = annotatedGotchis.value
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
    numToShow.value += 20
  }
  const canLoadMore = computed(() => filteredAndSortedGotchis.value?.length > numToShow.value)
</script>

<template>
  <div>
    <div
      v-if="fetchGotchisStatus.loading"
      class="lending-gotchis__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchGotchisStatus.error"
      class="lending-gotchis__error"
    >
      {{ fetchGotchisStatus.errorMessage }}
    </div>
    <template v-else-if="fetchGotchisStatus.loaded">
      <div
        v-if="!gotchis?.length"
        class="lending-gotchis__empty"
      >
        No gotchi lendings available.
      </div>
      <div v-else>
        <div class="lending-gotchis__header">
          <div class="lending-gotchis__count">
            {{ annotatedGotchis.length }} Available
          </div>
          <div class="lending-gotchis__search">
            <SiteTextField
              v-model="query"
              search
              placeholder="Search by ID or name"
              class="lending-gotchis__search-field"
              @input="debouncedSetQuery"
            />
          </div>
          <div class="lending-gotchis__sort">
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
          class="lending-gotchis__empty"
        >
          No gotchis found.
        </div>
        <ol
          v-else
          class="list-reset lending-gotchis__list"
        >
          <li
            v-for="gotchi in gotchisToDisplay"
            :key="gotchi.id"
          >
            <div class="gotchi-image-container">
              <img
                :src="gotchi.svgFront"
                alt=""
                class="gotchi-image"
                loading="lazy"
              />
            </div>
            <div class="gotchi-info">
              <div>
                <span class="gotchi-name word-break">
                  {{ gotchi.name }}
                </span>
                <span class="gotchi-id">
                  (#{{ gotchi.onchainId }})
                </span>
              </div>
              <div class="gotchi-brs">
                BRS: <b>{{ gotchi.brs }}</b>
              </div>
            </div>
            <div class="gotchi-available-specials">
              <GotchiSpecial
                v-for="specialId in gotchi.availableSpecials"
                :key="specialId"
                :id="specialId"
                forSpecialShowClass
                :variant="gotchi.availableSpecials.length > 3 ? 'icon' : 'small'"
              />
            </div>
            <GotchiStats
              :gotchi="gotchi"
              variant="smallest"
            />
            <div class="gotchi-lending">
              <a
                v-if="!gotchi.lendingEndsEarly"
                :href="gotchi.lendingUrl"
                target="_blank"
                class="link-reset gotchi-lending-link"
              >
                <SiteIcon name="token-ghst" />
                Rent for {{ gotchi.lendingGhstPrice }} GHST
              </a>
              <SitePopupDropdown v-else>
                <button
                  type="button"
                  class="button-reset gotchi-lending-warning-button"
                >
                  <SiteIcon
                    name="warning"
                    class="gotchi-lending-warning-button__icon"
                  />
                  <SiteIcon name="token-ghst" />
                  Rent for {{ gotchi.lendingGhstPrice }} GHST
                  <span class="sr-only">
                    (warning)
                  </span>
                  <SiteIcon
                    name="warning"
                    class="gotchi-lending-warning-button__icon"
                  />
                </button>
                <template #popper>
                  <div class="gotchi-lending-warning">
                    <div>
                      This lending can be ended before this tournament starts, so it
                      <b>may not be available at the time the Gotchi Battler snapshot is taken!</b>
                      <br>Are you sure you still want to borrow this gotchi?
                    </div>
                    <a
                      :href="gotchi.lendingUrl"
                      target="_blank"
                      class="link-reset gotchi-lending-warning-link"
                    >
                      <SiteButtonBox>
                        Continue
                      </SiteButtonBox>
                    </a>
                  </div>
                </template>
              </SitePopupDropdown>
            </div>
          </li>
        </ol>
        <div class="lending-gotchis__footer">
          <SiteButton
            v-if="canLoadMore"
            @click="loadMore"
          >
            Load More Gotchis
          </SiteButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .lending-gotchis__header {
    margin-bottom: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    column-gap: 1.5rem;
    row-gap: 1rem;
    flex-wrap: wrap;
  }
  .lending-gotchis__footer {
    margin-top: 2rem;
    display: grid;
    place-items: center;
  }

  .lending-gotchis__count {
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }

  .lending-gotchis__list {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    column-gap: 1.62rem;
    row-gap: 1.62rem;
    flex-wrap: wrap;
  }
  .lending-gotchis__list > li {
    flex: 1 1 auto;
    min-width: 16.5rem;
    max-width: 29rem;

    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;

    padding-bottom: 1rem;
    background-color: var(--c-black);
  }

  .gotchi-image-container {
    display: grid;
    place-items: center;
    background-color: yellow;
  }
  .gotchi-image {
    width: 8rem;
    height: 8rem;
  }

  .gotchi-image-container ~ * {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .gotchi-name,
  .gotchi-id {
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .gotchi-name {
    font-weight: bold;
  }
  .gotchi-brs {
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.0225rem;
  }
  .gotchi-available-specials {
    display: flex;
    column-gap: 0.5rem;
  }
  .gotchi-available-specials > * {
    flex: none;
  }

  .gotchi-lending-link,
  .gotchi-lending-warning-button {
    display: flex;
    justify-content: center;
    column-gap: 0.5rem;
    padding: 0.5rem;
    background-color: var(--c-white);
    color: var(--c-black);
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.0225rem;
    text-transform: uppercase;
    font-weight: bold;
  }
  .gotchi-lending-warning-button {
    width: 100%;
    background: rgb(255,168,156);
  }
  .gotchi-lending-warning-button__icon:first-child {
    margin-right: auto;
  }
  .gotchi-lending-warning-button__icon:last-child {
    margin-left: auto;
  }
  .gotchi-lending-warning-button__icon {
    color: rgb(255, 80 , 56);
  }
  .gotchi-lending-link {
    text-decoration: none;
  }
  .gotchi-lending-link:hover,
  .gotchi-lending-link:focus {
    text-decoration: underline;
  }

  .gotchi-lending-warning {
    padding: 1rem 1.5rem;
    background-color: rgb(255, 80, 56);
    color: var(--c-white);
    text-align: center;
    font-size: 0.875rem;
    letter-spacing: 0.02625rem;
    line-height: 1.5rem;
  }
  .gotchi-lending-warning-link {
    display: inline-block;
    margin-top: 1rem;
  }
</style>