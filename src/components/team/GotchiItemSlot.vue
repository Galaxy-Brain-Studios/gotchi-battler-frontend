<script setup>
  import SitePopupDropdown from '../common/SitePopupDropdown.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'
  import SiteError from '../common/SiteError.vue'
  import GotchiItemBadge from './GotchiItemBadge.vue'
  import GotchiItemBadgeEmpty from './GotchiItemBadgeEmpty.vue'
  import GotchiItemSlotDetails from './GotchiItemSlotDetails.vue'

  const emit = defineEmits(['remove'])

  defineProps({
    itemId: {
      type: Number,
      default: null
    },
    isOverBudget: {
      type: Boolean,
      default: false
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
        <GotchiItemBadge
          :id="itemId"
          :isOverBudget="isOverBudget"
        />
      </button>

      <template #popper="{ hide }">
        <div class="gotchi-item-popup__popup-contents">
          <GotchiItemSlotDetails :id="itemId" />
          <SiteError
            v-if="isOverBudget"
            small
            class="gotchi-item-popup__error"
          >
            You don't have enough of this item.
          </SiteError>
          <SiteButtonSmall
            @click="requestRemoveItem(hide)"
          >
            Unequip item
          </SiteButtonSmall>
        </div>
      </template>
    </SitePopupDropdown>
    <GotchiItemBadgeEmpty v-else />
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

  .gotchi-item-popup__popup-trigger {
    display: block;
    width: 100%;
    height: 100%;
  }
  .gotchi-item-popup__popup-contents {
    padding: 0.5rem;
  }

  .gotchi-item-popup__error {
    margin: 0.5rem 0 1rem 0;
  }
</style>
