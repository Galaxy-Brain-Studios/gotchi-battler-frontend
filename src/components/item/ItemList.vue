<script setup>
  import { ref, computed } from 'vue'
  import orderBy from 'lodash.orderby'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import ItemImage from './ItemImage.vue'

  defineEmits(['click:item'])

  const props = defineProps({
    items: {
      type: Array,
      required: true
    },
    showCount: {
      type: Boolean,
      default: false
    },
    clickable: {
      type: Boolean,
      default: false
    }
  })

  const sortOptions = [
    {
      id: 'id_asc',
      label: 'Default'
    },
    {
      id: 'raritySortable_asc',
      label: 'Rarity'
    },
    {
      id: 'cost_asc',
      label: 'Price (lowest)'
    },
    {
      id: 'cost_desc',
      label: 'Price (highest)'
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

  const annotatedItems = computed(() => {
    if (!props.items) { return [] }
    return props.items.map(item => ({
      ...item,
      raritySortable: RARITY_ID_TO_SORTABLE[item.rarity] || 0
    }))
  })

  const itemsToDisplay = computed(() => {
    let result = annotatedItems.value
    if (result.length) {
      result = orderBy(result, [sortingProperty.value], [sortingDirection.value])
    }
    return result
  })

</script>

<template>
  <div>
    <div
      v-if="!itemsToDisplay.length"
      class="items-list__empty"
    >
      No items.
    </div>
    <template v-else>
      <div class="items-list__header">
        <div class="items-list__count">
          {{ itemsToDisplay.length }}
          item{{ itemsToDisplay.length === 1 ? '' : 's' }}
        </div>
        <div class="items-list__sort">
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
      <ol class="list-reset items-list__list">
        <li
          v-for="item in itemsToDisplay"
          :key="item.id"
          class="items-list__item"
          :class="{
            'items-list__item--clickable': clickable
          }"
        >
          <ItemImage
            class="items-list__item__image"
            :imageUrl="item.image"
            :rarity="item.rarity"
            :imageSize="8.5"
          />
          <div class="items-list__item__details">
            <div>
              <button
                v-if="clickable"
                type="button"
                class="button-reset extended-target items-list__item__button items-list__item__name"
                @click="$emit('click:item', item)"
              >
                {{ item.name }}
              </button>
              <div
                v-else
                class="items-list__item__name"
              >
                {{ item.name }}
              </div>
            </div>
            <div class="items-list__item__rarity">
              {{ item.rarity }}
            </div>
            <div class="items-list__item__description">
              {{ item.description }}
            </div>
            <div class="items-list__item__footer">
              <SiteIcon
                name="token-ghst"
                :width="1.75"
                :height="1.75"
              />
              <div>
                <div class="items-list__item__cost">
                  {{ item.cost }} GHST
                </div>
                <div
                  v-if="showCount"
                  class="items-list__item__quantity"
                >
                  YOU OWN: <b>{{ item.quantity }}x</b>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ol>
    </template>
  </div>
</template>

<style scoped>
  .items-list__header {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  .items-list__list {
    --items-list__item--border-radius: 1rem;
    --items-list__item--image-width: 8.5rem;
    --items-list__item--image-padding: 1.5rem;
    --items-list__item--card-width: calc(var(--items-list__item--image-width) + 2 * var(--items-list__item--image-padding));
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--items-list__item--card-width), 1fr));
    gap: 1.5rem;
  }

  .items-list__item__image {
    border-top-left-radius: var(--items-list__item--border-radius);
    border-top-right-radius: var(--items-list__item--border-radius);
  }

  .items-list__item__details {
    border-bottom-left-radius: var(--items-list__item--border-radius);
    border-bottom-right-radius: var(--items-list__item--border-radius);
    padding: 0.5rem 0.75rem 0.75rem 0.75rem;
    color: black;
    background: var(--c-white);
  }
  .items-list__item__name {
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: bold;
  }
  .items-list__item__rarity {
    text-transform: capitalize;
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .items-list__item__description {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
  }

  .items-list__item__footer {
    margin-top: 0.5rem;
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .items-list__item__cost {
    font-size: 0.875rem;
    line-height: 1rem;
    letter-spacing: 0.02625rem;
    font-weight: bold;
  }
  .items-list__item__quantity {
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0.0225rem;
  }


  .items-list__item--clickable {
    position: relative;
  }
  .items-list__item__button:before {
    border-radius: var(--items-list__item--border-radius);
  }
  .items-list__item__button:hover::before {
    border: 2px solid var(--c-light-blue);
  }
  .items-list__item__button:focus-visible {
    outline-offset: 2px;
    outline: 2px solid var(--c-black);
  }
  .items-list__item__button:focus-visible::before {
    outline: 2px solid var(--c-light-blue);
  }
</style>