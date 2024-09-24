<script setup>
  import { ref, computed } from 'vue'
  import orderBy from 'lodash.orderby'
  import useProfile from '@/data/useProfile'
  import SiteSelect from '../common/SiteSelect.vue'

  const props = defineProps({
    address: {
      type: String,
      required: true
    }
  })  

  const { fetchInventory, inventory, fetchInventoryStatus } = useProfile(props.address)
  fetchInventory()

  const sortOptions = [
    {
      id: 'raritySortable_asc',
      label: 'Rarity'
    },
    {
      id: 'nameSortable_asc',
      label: 'Name'
    }
  ]
  const sorting = ref(sortOptions[0].id)
  const sortingProperty = computed(() => sorting.value.split('_')[0])
  const sortingDirection = computed(() => sorting.value.split('_')[1])

  const RARITY_ID_TO_SORTABLE = {
    'common': 1,
    'uncommon': 2,
    'rare': 3,
    'legendary': 4,
    'mythical': 5,
    'godlike': 6
  }

  const annotatedInventory = computed(() => {
    if (!inventory.value) { return [] }
    return inventory.value.map(item => ({
      ...item,
      raritySortable: RARITY_ID_TO_SORTABLE[item.rarity] || 0
    }))
  })

  const inventoryToDisplay = computed(() => {
    let result = annotatedInventory.value
    if (result.length) {
      result = orderBy(result, [sortingProperty.value], [sortingDirection.value])
    }
    return result
  })

  const escapeUrl = url => CSS.escape(url)
</script>

<template>
  <div>
    <div
      v-if="fetchInventoryStatus.loading"
      class="profile-inventory__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchInventoryStatus.error"
      class="profile-inventory__error"
    >
      {{ fetchInventoryStatus.errorMessage }}
    </div>
    <template v-else-if="fetchInventoryStatus.loaded">
      <div
        v-if="!inventoryToDisplay.length"
        class="profile-inventory__empty"
      >
        No items.
      </div>
      <template v-else>
        <div class="profile-inventory__header">
          <div class="profile-inventory__count">
            {{ inventoryToDisplay.length }}
            item{{ inventoryToDisplay.length === 1 ? '' : 's' }}
          </div>
          <div class="profile-inventory__sort">
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
        <ol class="list-reset profile-inventory__list">
          <li
            v-for="item in inventoryToDisplay"
            :key="item.id"
            class="profile-inventory__item"
          >
            <div
              class="profile-inventory__item__image"
              :style="{
               '--image-url': `url(${escapeUrl(item.imageUrl || '')})`
              }"
            />
            <div class="profile-inventory__item__details">
              <div class="profile-inventory__item__name">
                {{ item.name }}
              </div>
              <div class="profile-inventory__item__rarity">
                {{ item.rarity }}
              </div>
              <div class="profile-inventory__item__description">
                {{ item.description }}
              </div>
              <div class="profile-inventory__item__count">
                OWNED: <b>{{ item.count }}x</b>
              </div>
            </div>
          </li>
        </ol>
      </template>
    </template>
  </div>
</template>

<style scoped>
  .profile-inventory__header {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  .profile-inventory__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(11.5rem, 100%), 1fr));
    gap: 1.5rem;
  }

  .profile-inventory__item__image {
    height: 11.5rem;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    background-color: var(--c-black);
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .profile-inventory__item__details {
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    padding: 0.5rem 0.75rem 0.75rem 0.75rem;
    color: black;
    background: var(--c-white);
  }
  .profile-inventory__item__name {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: bold;
  }
  .profile-inventory__item__rarity {
    text-transform: capitalize;
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .profile-inventory__item__description {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .profile-inventory__item__count {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.0225rem;
  }
</style>