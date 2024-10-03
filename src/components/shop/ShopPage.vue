<script setup>
  import SiteHeading from '../common/SiteHeading.vue'
  import ItemList from '../item/ItemList.vue'
  import useShop from '../../data/useShop'

  const { items, fetchItemsStatus } = useShop()

  const onItemClicked = function (item) {
    console.log("TODO show item", item)
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
      @click:item="onItemClicked"
    />
  </div>
</template>

<style scoped>
</style>