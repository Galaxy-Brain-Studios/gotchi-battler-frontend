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
    },
    forSpecial: {
      type: Boolean,
      default: true
    },
    forSpecialShowClass: {
      type: Boolean,
      default: false
    }
  })

  const store = useSpecialsStore()
  const { specialsById } = storeToRefs(store)

  const name = computed(() => specialsById.value[props.id]?.name)
  const gotchiClass = computed(() => specialsById.value[props.id]?.class)
  const effects = computed(() => specialsById.value[props.id]?.effects)
  const leader = computed(() => specialsById.value[props.id]?.leader)
  const leaderEffects = computed(() => specialsById.value[props.id]?.leaderEffects)
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
        :forSpecial="forSpecial"
        :fullWidth="fullWidth"
        :forSpecialShowClass="forSpecialShowClass"
      />
    </button>

    <template #popper>
      <div class="gotchi-special__popup">
        <template v-if="name">
          <template v-if="forSpecial">
            <div class="gotchi-special__popup-header">
              {{ forSpecialShowClass ? gotchiClass : name }}
            </div>
            <ul class="gotchi-special__popup-effects">
              <li v-for="effect in effects" :key="effect">
                {{ effect }}
              </li>
            </ul>
          </template>
          <template v-else>
            <div class="gotchi-special__popup-header">
              {{ leader }}
            </div>
            <ul class="gotchi-special__popup-effects">
              <li v-for="leaderEffect in leaderEffects" :key="leaderEffect">
                {{ leaderEffect }}
              </li>
            </ul>
          </template>
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
    font-size: 0.9rem;
    line-height: 1rem;
  }
  .gotchi-special__popup-header {
    font-weight: bold;
  }

  .gotchi-special__popup-effects {
    line-height: 1.4rem;
    margin: 0;
    padding-left: 20px;
  }
</style>