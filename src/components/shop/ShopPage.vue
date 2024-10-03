<script setup>
  import { ref } from 'vue'
  import SiteHeading from '../common/SiteHeading.vue'
  import ItemList from '../item/ItemList.vue'
  import useShop from '../../data/useShop'
  import ItemDialog from './ItemDialog.vue'

  const { items, fetchItemsStatus } = useShop()

  const item = ref(null)

  const onDialogUpdate = function(newIsOpen) {
    if (!newIsOpen) {
      item.value = null
    }
  }
</script>

<template>
  <div>
    <SiteHeading>Item Shop</SiteHeading>

    <div
      v-if="fetchItemsStatus.loading"
      class="shop__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchItemsStatus.error"
      class="shop__error"
    >
      {{ fetchItemsStatus.errorMessage }}
    </div>
    <ItemList
      v-else-if="fetchItemsStatus.loaded"
      :items="items"
      defaultSort="costGhst_asc"
      clickable
      @click:item="item = $event"
    />
    <ItemDialog
      v-if="item"
      :item="item"
      @update:isOpen="onDialogUpdate"
    />
  </div>
</template>

<style scoped>
</style>