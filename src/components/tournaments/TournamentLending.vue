<script setup>
  import { ref, computed } from 'vue'
  import debounce from 'lodash.debounce'
  import orderBy from 'lodash.orderby'
  import { storeToRefs } from 'pinia'
  import useGotchiLendings from '@/data/useGotchiLendings'
  import { useSpecialsStore } from '../../data/specialsStore'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonWhiteBox from '../common/SiteButtonWhiteBox.vue'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SitePopupDropdown from '../common/SitePopupDropdown.vue'
  import GotchiStats from '../team/GotchiStats.vue'
  import GotchiSpecial from '../team/GotchiSpecial.vue'

  const props = defineProps({
    tournamentId: {
      type: Number,
      required: true
    }
  })

  const { fetchGotchis, gotchis, fetchGotchisStatus } = useGotchiLendings(props.tournamentId)

  const specialsStore = useSpecialsStore()
  const { specials, specialsById } = storeToRefs(specialsStore)

  fetchGotchis()

  const TRAITS = [
    {
      id: 'speed',
      label: 'Speed'
    },
    {
      id: 'health',
      label: 'Health'
    },
    {
      id: 'accuracy',
      label: 'Accuracy'
    },
    {
      id: 'evade',
      label: 'Evasiveness'
    },
    {
      id: 'physical',
      label: 'Physical Power'
    },
    {
      id: 'magic',
      label: 'Magic Power'
    },
    {
      id: 'armor',
      label: 'Armor'
    },
    {
      id: 'resist',
      label: 'Resistance'
    },
    {
      id: 'crit',
      label: 'Critical Hit'
    }
  ]

  const sortOptions = [
    {
      id: 'createdDate_desc',
      label: 'Most Recent'
    },
    {
      id: 'brs_desc',
      label: 'Rarity Score'
    },
    {
      id: 'lendingGhstPrice_asc',
      label: 'Lending Price'
    },
    ...TRAITS.map(({ id, label }) => ({ id: `${id}_desc`, label }))
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

  const OPERATORS = [
    {
      id: 'GTE',
      label: '>= Higher Than',
      matches (actualValue, ruleValue) {
        return actualValue >= ruleValue
      }
    },
    {
      id: 'LTE',
      label: '<= Less Than',
      matches (actualValue, ruleValue) {
        return actualValue <= ruleValue
      }
    }
  ]
  const OPERATORS_BY_ID = Object.fromEntries(OPERATORS.map(item => [item.id, item]))

  let lastTraitFilterId = 0;
  const newTraitFilter = function () {
    lastTraitFilterId++
    return {
      id: lastTraitFilterId,
      trait: TRAITS[0].id,
      operator: OPERATORS[0].id,
      value: ''
    }
  }

  const filters = ref({
    specials: Object.keys(specialsById.value).map(id => '' + id), // input will store value as strings
    traits: [newTraitFilter()],
    price: {
      trait: 'lendingGhstPrice',
      operator: 'LTE',
      value: ''
    }
  })

  const addTraitFilter = function () {
    filters.value.traits.push(newTraitFilter())
  }
  const removeTraitFilter = function (filter) {
    const index = filters.value.traits.indexOf(filter)
    if (index !== -1) {
      filters.value.traits.splice(index, 1)
    }
  }

  const matchesTraitFilter = function (gotchi, filter) {
    const operator = OPERATORS_BY_ID[filter.operator]
    if (operator && filter.value.match(/\d/)) {
      const valueAsNumber = filter.value - 0
      if (!isNaN(valueAsNumber)) {
        return operator.matches(gotchi[filter.trait], valueAsNumber)
      }
    }
    return true
  }

  const matchesTraitFilters = function (gotchi) {
    return filters.value.traits.every(filter => matchesTraitFilter(gotchi, filter))
  }

  const matchesPriceFilter = function (gotchi) {
    return matchesTraitFilter(gotchi, filters.value.price)
  }

  const matchesSpecial = function (gotchi) {
    const filterSpecials = filters.value.specials
    for (const id of filterSpecials) {
      if (gotchi.availableSpecials.includes(id - 0)) {
        return true
      }
    }
    return false
  }

  const numToShow = ref(18)

  const annotatedGotchis = computed(() => {
    if (!gotchis.value) { return [] }
    return gotchis.value.map(gotchi => ({
      ...gotchi,
      lendingUrl: `https://dapp.aavegotchi.com/lending/aavegotchis?id=${encodeURIComponent(gotchi.lendingId)}`,
    }))
  })

  const filteredAndSortedGotchis = computed(() => {
    if (!annotatedGotchis.value.length) { return [] }
    let result = annotatedGotchis.value
    if (query.value) {
      const queryLc = query.value.toLowerCase()
      result = result.filter(gotchi => `${gotchi.onchainId}` === queryLc || gotchi.name?.toLowerCase().includes(queryLc))
    }
    result = result
      .filter(matchesSpecial)
      .filter(matchesPriceFilter)
      .filter(matchesTraitFilters)

    result = orderBy(result, [sortingProperty.value], [sortingDirection.value])
    return result
  })
  const gotchisToDisplay = computed(() => {
    if (!filteredAndSortedGotchis.value) { return null }
    return filteredAndSortedGotchis.value.slice(0, numToShow.value)
  })

  function loadMore () {
    numToShow.value += 18
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
            <SiteButtonIcon
              iconName="refresh"
              label="Refetch available gotchis from server"
              :disabled="fetchGotchisStatus.loading"
              @click="fetchGotchis"
            />
            {{ filteredAndSortedGotchis.length }} Available
          </div>
          <div class="lending-gotchis__search">
            <SiteTextField
              v-model="query"
              search
              subtle
              placeholder="Search by ID or name"
              class="lending-gotchis__search-field"
              @input="debouncedSetQuery"
            />
          </div>
          <div>
            <SitePopupDropdown>
                <button
                  type="button"
                  class="button-reset lending-gotchis__filter-popup-button"
                >
                  Class
                  <SiteIcon
                    name="chevron-down"
                    class="lending-gotchis__filter-popup-button__icon"
                    :width="0.625"
                    :height="0.625"
                  />
                </button>
                <template #popper>
                  <div class="lending-gotchis__filter-container">
                    <div class="lending-gotchis__filter-class">
                      <label
                        v-for="special in specials"
                        :key="special.id"
                        :value="special.id"
                        :style="{
                          '--filter-special--color-background--selected': `var(--c-special-${special.id})`
                        }"
                      >
                        <SiteIcon
                          :name="`special-${special.id}`"
                          class="lending-gotchis__filter-class-icon"
                          :width="2"
                          :height="2"
                        />
                        <div class="lending-gotchis__filter-class-text">
                          {{ special.class }}
                        </div>
                        <input
                          v-model="filters.specials"
                          type="checkbox"
                          :value="special.id"
                          class="lending-gotchis__filter-class-checkbox"
                        />
                        <SiteIcon
                          name="check"
                          class="lending-gotchis__filter-class-checked-icon"
                          :width="0.7"
                          :height="0.7"
                        />
                      </label>
                    </div>
                  </div>
                </template>
            </SitePopupDropdown>
          </div>
          <div>
            <SitePopupDropdown>
              <button
                type="button"
                class="button-reset lending-gotchis__filter-popup-button"
              >
                Trait
                <SiteIcon
                  name="chevron-down"
                  class="lending-gotchis__filter-popup-button__icon"
                  :width="0.625"
                  :height="0.625"
                />
              </button>
              <template #popper="{ hide }">
                <div class="lending-gotchis__filter-container">
                  <div class="lending-gotchis__filter-traits">
                    <ol class="list-reset">
                      <li
                        v-for="filter in filters.traits"
                        :key="filter.id"
                      >
                        <SiteSelect
                          v-model="filter.trait"
                          aria-label="Trait"
                          withBorder
                        >
                          <option
                            v-for="option in TRAITS"
                            :key="option.id"
                            :value="option.id"
                          >
                            {{ option.label }}
                          </option>
                        </SiteSelect>
                        <SiteSelect
                          v-model="filter.operator"
                          aria-label="Operator"
                          withBorder
                        >
                          <option
                            v-for="option in OPERATORS"
                            :key="option.id"
                            :value="option.id"
                          >
                            {{ option.label }}
                          </option>
                        </SiteSelect>
                        <SiteTextField
                          v-model="filter.value"
                          placeholder="Value"
                          aria-label="Value"
                        />
                        <SiteButtonIcon
                          v-if="filters.traits.length > 1"
                          iconName="close"
                          label="delete"
                          class="lending-gotchis__filter-traits-delete-button"
                          @click="removeTraitFilter(filter)"
                        />
                      </li>
                    </ol>
                    <div class="button-reset lending-gotchis__filter-traits-footer">
                      <button
                        type="button"
                        class="button-reset lending-gotchis__filter-traits-add-button"
                        @click="addTraitFilter"
                      >
                        + Add another filter
                      </button>
                      <SiteButton
                        @click="hide"
                      >
                        Close
                      </SiteButton>
                    </div>
                  </div>
                </div>
              </template>
            </SitePopupDropdown>
          </div>
          <div>
            <SitePopupDropdown>
              <button
                type="button"
                class="button-reset lending-gotchis__filter-popup-button"
              >
                Price
                <SiteIcon
                  name="chevron-down"
                  class="lending-gotchis__filter-popup-button__icon"
                  :width="0.625"
                  :height="0.625"
                />
              </button>
              <template #popper="{ hide }">
                <div class="lending-gotchis__filter-container">
                  <div class="lending-gotchis__filter-price">
                    <div class="lending-gotchis__filter-price-fields">
                      <SiteSelect
                        v-model="filters.price.operator"
                        aria-label="Operator"
                        withBorder
                      >
                        <option
                          v-for="option in OPERATORS"
                          :key="option.id"
                          :value="option.id"
                        >
                          {{ option.label }}
                        </option>
                      </SiteSelect>
                      <SiteTextField
                        v-model="filters.price.value"
                        placeholder="Value in GHST"
                        aria-label="Value in GHST"
                      />
                      <SiteIcon
                        name="token-ghst"
                        :width="1.5"
                        :height="1.5"
                      />
                    </div>
                    <div class="button-reset lending-gotchis__filter-price-footer">
                      <SiteButton
                        @click="hide"
                      >
                        Close
                      </SiteButton>
                    </div>
                  </div>
                </div>
              </template>
            </SitePopupDropdown>
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
                      Warning: as the rental period for this gotchi ends before registration closes,
                      the wearables for this gotchi could be changed/removed for the tournament.
                      <br>Are you sure you still want to borrow this gotchi?
                    </div>
                    <a
                      :href="gotchi.lendingUrl"
                      target="_blank"
                      class="link-reset gotchi-lending-warning-link"
                    >
                      <SiteButtonWhiteBox>
                        Continue
                      </SiteButtonWhiteBox>
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
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
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
    padding-top: 1rem;
    background: linear-gradient(180deg, var(--c-dark-purple) 0%, var(--c-black) 100%);
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

  .lending-gotchis__filter-popup-button {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    color: var(--c-white);
    font-weight: bold;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
    text-transform: uppercase;
  }
  .lending-gotchis__filter-popup-button[data-popper-shown] {
    color: var(--c-bright-yellow);
  }
  .lending-gotchis__filter-container {
    background-color: var(--c-black);
  }

  .lending-gotchis__filter-class {
    display: grid;
    grid-template-columns: repeat(4, auto);
    padding: 1rem;
  }

  .lending-gotchis__filter-class label {
    --filter-special--color-background: rgba(255, 255, 255, 0.1);
    --filter-special--opacity: 0.5;
    position: relative;
    display: flex;
    flex-direction: column;
    row-gap: 0.75rem;
    align-items: center;
    max-width: 5rem;

    padding: 1rem 1.5rem 0.75rem 1.5rem;
    color: var(--c-white);
    background: var(--filter-special--color-background);
    opacity: var(--filter-special--opacity);
  }
  .lending-gotchis__filter-class label:has(input:checked) {
    --filter-special--color-background: var(--filter-special--color-background--selected, white);
    --filter-special--opacity: 1;
  }
  .lending-gotchis__filter-class label:has(input:focus-visible) {
    --filter-special--color-background: rgba(255, 255, 255, 0.15);
    --filter-special--opacity: 1;
  }
  .lending-gotchis__filter-class label:hover {
    --filter-special--color-background: rgba(255, 255, 255, 0.15);
    --filter-special--opacity: 1;
    cursor: pointer;
  }
  .lending-gotchis__filter-class-text {
    white-space: nowrap;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .lending-gotchis__filter-class-checkbox {
    position: absolute;
    opacity: 0;
  }
  .lending-gotchis__filter-class-checked-icon {
    visibility: hidden;
    position: absolute;
    top: 0.3rem;
    left: 0.3rem;
  }
  .lending-gotchis__filter-class-checkbox:checked + .lending-gotchis__filter-class-checked-icon {
    visibility: visible;
  }

  .lending-gotchis__filter-traits {
    padding: 1.5rem;
    color: var(--c-white);
  }
  .lending-gotchis__filter-traits ol li {
    margin-bottom: 1rem;
    display: grid;
    grid-template-columns: auto auto 1fr auto;
    column-gap: 1.5rem;
  }
  .lending-gotchis__filter-traits-footer {
    margin-top: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .lending-gotchis__filter-traits-add-button {
    padding: 0.5rem 0.75rem;
    color: var(--c-white);
    font-size: 0.875rem;
    font-weight: bold;
    letter-spacing: 0.02625rem;
    line-height: 1.5rem;
  }
  .lending-gotchis__filter-traits-add-button:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .lending-gotchis__filter-price {
    padding: 1.5rem;
  }
  .lending-gotchis__filter-price-fields {
    display: grid;
    grid-template-columns: auto 10rem auto;
    column-gap: 1rem;
  }
  .lending-gotchis__filter-price-fields > *:last-child {
    align-self: center;
  }
  .lending-gotchis__filter-price-footer {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
  }
</style>