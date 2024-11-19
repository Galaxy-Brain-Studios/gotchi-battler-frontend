<script setup>
  import { watch, onUnmounted } from 'vue'
  import useInventoryItemCount from '../../data/useInventoryItemCount'
  import SiteError from '../common/SiteError.vue'

  /* Assume that itemId and the connectedAddress will not change for the lifetime of this component. */
  /* The purchaseTxId can change, which will trigger a refetch. */

  const props = defineProps({
    itemId: {
      type: [String, Number],
      required: true
    },
    purchaseTxId: {
      type: String,
      default: null
    }
  })

  const { inventoryItemCount, fetchInventoryItemCountStatus, setPurchaseTxId, resetCountLoading } = useInventoryItemCount({
    itemId: props.itemId,
    purchaseTxId: props.purchaseTxId
  })

  watch(
    () => props.purchaseTxId,
    () => setPurchaseTxId(props.purchaseTxId)
  )

  onUnmounted(resetCountLoading)
</script>

<template>
  <div
    class="item-count-for-user"
    :class="{
      'item-dialog__own-count--loading': fetchInventoryItemCountStatus.loading
    }"
  >
    <template v-if="fetchInventoryItemCountStatus.loading">
      <i>Fetching quantity...</i>
    </template>
    <SiteError
      v-if="fetchInventoryItemCountStatus.error"
      small
    >
      {{ fetchInventoryItemCountStatus.errorMessage }}
    </SiteError>
    <template v-if="fetchInventoryItemCountStatus.loaded">
      <template v-if="inventoryItemCount === 0">
        You do not own any of this item.
      </template>
      <template v-else-if="inventoryItemCount">
        You own: <b>{{ inventoryItemCount }}x</b>
      </template>
    </template>
  </div>
</template>

<style scoped>
  .item-count-for-user {
    font-size: 1rem;
  }
  .item-count-for-user b {
    letter-spacing: 0.03rem;
  }
</style>