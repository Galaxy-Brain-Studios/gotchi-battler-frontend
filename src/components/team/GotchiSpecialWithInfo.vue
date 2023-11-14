<script setup>
  import { computed } from 'vue'
  import GotchiSpecial from './GotchiSpecial.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import { storeToRefs } from 'pinia'
  import { useSpecialsStore } from '../../data/specialsStore'

  const props = defineProps({
    id: {
      type: Number,
      required: true
    },
    variant: {
      type: String,
      default: 'small'
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  })

  const store = useSpecialsStore()
  const { specialsById } = storeToRefs(store)

  const name = computed(() => specialsById.value[props.id]?.name)
  const info = computed(() => specialsById.value[props.id]?.info)
</script>

<template>
  <SitePopupHoverMenu>
    <button
      type="button"
      class="button-reset gotchi-special__popup-trigger"
      :class="{
        'gotchi-special__popup-trigger--full-width': fullWidth
      }"
    >
      <GotchiSpecial
        :id="id"
        :variant="variant"
        :fullWidth="fullWidth"
      />
    </button>

    <template #popper>
      <div class="gotchi-special__popup">
        <template v-if="info">
          <div class="gotchi-special__popup-header">
            {{ name }}:
            {{ info.header }}
          </div>
          <div v-if="info.description">
            {{ info.description }}
          </div>
          <div v-if="info.leader">
            <b>Leader bonus:</b>  {{ info.leader }}
          </div>
        </template>
        <div v-else>
          Unknown special.
        </div>
      </div>
      </template>
  </SitePopupHoverMenu>
</template>

<style scoped>
  .gotchi-special__popup-trigger {
    display: block;
  }

  .gotchi-special__popup-trigger--full-width {
    width: 100%;
  }

  .gotchi-special__popup {
    display: grid;
    row-gap: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
  }
  .gotchi-special__popup-header {
    font-weight: bold;
  }
</style>