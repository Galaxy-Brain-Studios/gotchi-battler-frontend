<script setup>
  import { computed } from 'vue'
  import useShop from '@/data/useShop'
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
    v-if="id"
    class="gotchi-item"
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
        Unknown item!
      </div>
    </template>
  </div>
</template>

<style scoped>
  .gotchi-item {
    height: 100%;
    display: flex;
    gap: 0.25rem;
    align-items: center;
    justify-content: center;

    padding: 0.25rem;
    background: #41A6BD;
    color: var(--c-white);
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
    font-size: 0.7rem;
    line-height: 0.625rem;
    letter-spacing: 0.01875rem;
    font-style: italic;
  }
</style>
