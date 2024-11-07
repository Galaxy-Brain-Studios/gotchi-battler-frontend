<script setup>
  import SitePopupDropdown from '../common/SitePopupDropdown.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
  import GotchiItemSlotItem from './GotchiItemSlotItem.vue'
  import GotchiItemSlotDetails from './GotchiItemSlotDetails.vue'

  const emit = defineEmits(['remove'])

  defineProps({
    itemId: {
      type: Number,
      default: null
    }
  })

  const requestRemoveItem = function (hidePopup) {
    emit('remove')
    hidePopup()
  }
</script>


<template>
  <div class="gotchi-item-slot">
    <SitePopupDropdown
      v-if="itemId"
      class="gotchi-item-popup"
    >
      <button
        type="button"
        class="button-reset gotchi-item-popup__popup-trigger"
      >
        <GotchiItemSlotItem :id="itemId" />
      </button>

      <template #popper="{ hide }">
        <div class="gotchi-item-popup__popup-contents">
          <GotchiItemSlotDetails :id="itemId" />
          <SiteButtonSmall
            @click="requestRemoveItem(hide)"
          >
            Unequip item
          </SiteButtonSmall>
        </div>
      </template>
    </SitePopupDropdown>
    <div
      v-else
      class="gotchi-item-slot__no-item"
    >
      No Item
    </div>
  </div>
</template>

<style scoped>
  .gotchi-item-slot {
    height: 1.5rem;
    display: flex;

    border-top: 2px solid var(--c-black);
    border-bottom: 2px solid var(--c-black);
  }
  .gotchi-item-slot > * {
    flex: 1 1 auto;
  }
  .gotchi-item-slot__no-item {
    display: grid;
    place-items: center;

    opacity: 0.25;
    background: var(--c-black);
    color: var(--c-white);
    font-size: 0.625rem;
    line-height: 0.75rem;
    text-transform: uppercase;
  }

  .gotchi-item-popup__popup-trigger {
    display: block;
    width: 100%;
    height: 100%;
  }
  .gotchi-item-popup__popup-contents {
    padding: 0.5rem;
  }
</style>
