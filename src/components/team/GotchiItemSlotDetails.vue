<script setup>
  import { computed } from 'vue'
  import useShop from '@/data/useShop'
  import SiteError from '../common/SiteError.vue'
  import ItemImage from '../item/ItemImage.vue'

  const { items, fetchItemsStatus } = useShop()

  const props = defineProps({
    id: {
      type: Number,
      required: true
    }
  })

  const item = computed(() => fetchItemsStatus.value.loaded && items.value?.find(item => item.id === props.id))
</script>

<template>
  <div
    v-if="item"
    class="slot-item-details"
  >
    <ItemImage
      class="slot-item-details__image"
      :imageUrl="item.image"
      :rarity="item.rarity"
    />
    <div class="slot-item-details__label">
      {{ item.name }}
    </div>
    <div class="slot-item-details__rarity">
      {{ item.rarity }}
    </div>
    <div class="slot-item-details__description">
      {{ item.description }}
    </div>
  </div>
  <SiteError
    v-else
    small
  >
    Unable to find details of this item.
  </SiteError>
</template>

<style scoped>
  .slot-item-details {
    max-width: 8rem;
  }
  .slot-item-details__image {
    width: 8rem;
    height: 8rem;
  }
  .slot-item-details__label {
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.5rem;
  }
  .slot-item-details__rarity {
    text-transform: capitalize;
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .slot-item-details__description {
    margin-bottom: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
  }
</style>
