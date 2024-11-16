<script setup>
  import { computed } from 'vue'
  import useShop from '@/data/useShop'
  import SiteIcon from '../common/SiteIcon.vue'

  const { items, fetchItemsStatus } = useShop()

  const props = defineProps({
    id: {
      type: Number,
      required: true
    },
    isOverBudget: {
      type: Boolean,
      default: false
    }
  })

  const item = computed(() => fetchItemsStatus.value.loaded && items.value?.find(item => item.id === props.id))
</script>

<template>
  <div
    v-if="id"
    class="gotchi-item"
    :class="{
      [`gotchi-item--${item?.rarity?.toLowerCase()}`]: !!item?.rarity
    }"
  >
    <template v-if="fetchItemsStatus.loading">
      ...
    </template>
    <div
      v-else-if="fetchItemsStatus.error"
      class="gotchi-item__error"
    >
      Error loading
    </div>
    <template v-else-if="fetchItemsStatus.loaded && items">
      <template v-if="item">
        <SiteIcon
          v-if="isOverBudget"
          name="warning"
          :width="1"
          :height="1"
          class="gotchi-item__error-icon"
        />
        <img
          class="gotchi-item__image"
          :src="item.image"
          alt=""
        />
        <div class="gotchi-item__label">
          {{ item.name }}
        </div>
      </template>
      <div
        v-else
        class="gotchi-item__error"
      >
        <SiteIcon
          name="error"
          :width="1"
          :height="1"
        />
        <div>
          Unknown!
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .gotchi-item {
    --item-background: var(--c-black);
    height: 100%;
    display: flex;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;

    padding: 0.25rem;
    background: var(--item-background);
    color: var(--c-white);
  }
  .gotchi-item--common {
    --item-background: var(--gradient-rarity-common);
  }
  .gotchi-item--uncommon {
    --item-background: var(--gradient-rarity-uncommon);
  }
  .gotchi-item--rare {
    --item-background: var(--gradient-rarity-rare);
  }
  .gotchi-item--legendary {
    --item-background: var(--gradient-rarity-legendary);
  }
  .gotchi-item--mythical {
    --item-background: var(--gradient-rarity-mythical);
  }
  .gotchi-item--godlike {
    --item-background: var(--gradient-rarity-godlike);
  }

  .gotchi-item__error-icon {
    flex: none;
  }
  .gotchi-item__image {
    flex: none;
    width: 1rem;
    height: 1rem;
  }
  .gotchi-item__label {
    flex: 0 1 auto;
    font-size: 0.625rem;
    font-weight: bold;
    line-height: 0.625rem;
    letter-spacing: 0.01875rem;
  }

  .gotchi-item__error {
    display: flex;
    align-items: center;
    gap: 0.25rem;

    font-size: 0.7rem;
    line-height: 0.625rem;
    letter-spacing: 0.01875rem;
    font-style: italic;
  }
</style>
