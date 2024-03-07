<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'
  import SitePopupDropdown from '../common/SitePopupDropdown.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import GotchiSpecial from './GotchiSpecial.vue'
  import { storeToRefs } from 'pinia'
  import { useSpecialsStore } from '../../data/specialsStore'

  const props = defineProps({
    modelValue: {
      type: Number,
      default: null
    },
    availableSpecials: {
      type: Array,
      required: true
    },
    fullWidth: {
      type: Boolean,
      default: false
    }
  })
  const emit = defineEmits(['update:modelValue'])

  const passThroughModel = computed({
    get () {
      return props.modelValue
    },
    set (value) {
      emit('update:modelValue', value)
    }
  })

  const inputNs = ref(uniqueId('gotchi-special-select'))

  const store = useSpecialsStore()
  const { specialsById } = storeToRefs(store)
</script>

<template>
  <SitePopupDropdown class="gotchi-special-select">
    <button
      type="button"
      class="button-reset gotchi-special-select__popup-trigger"
      :class="{
        'gotchi-special-select__popup-trigger--without-special': !modelValue,
        'gotchi-special-select__popup-trigger--with-special': !!modelValue,
        'gotchi-special-select__popup-trigger--full-width': fullWidth
      }"
    >
      <GotchiSpecial
        v-if="modelValue"
        :id="modelValue"
        :forSpecialShowClass="true"
        :fullWidth="fullWidth"
      >
        <template #after>
          <SiteIcon
            name="chevron-down"
            :width="0.4"
            :height="0.25"
          />
        </template>
      </GotchiSpecial>
      <template v-else>
        <span>
          Choose Class
        </span>
        <SiteIcon
          name="chevron-down"
          :width="0.4"
          :height="0.25"
        />
      </template>
    </button>

    <template #popper="{ hide }">
      <ul
        class="list-reset gotchi-special-select__options"
        data-a11y-dialog-ignore-focus-trap
      >
        <li
          v-for="special in availableSpecials"
          :key="special"
        >
          <input
            :id="`${inputNs}-gotchi-special-input-${special}`"
            v-model="passThroughModel"
            type="radio"
            :name="`${inputNs}-gotchi-special`"
            :value="special"
            class="sr-only"
            @input="hide"
          />
          <label :for="`${inputNs}-gotchi-special-input-${special}`">
            {{ specialsById[special]?.['class'] }}
          </label>
        </li>
      </ul>
    </template>
  </SitePopupDropdown>
</template>

<style scoped>
  .gotchi-special-select__popup-trigger {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.2rem;
  }
  .gotchi-special-select__popup-trigger--without-special {
    width: 100%;
    height: 1.25rem;
    text-align: center;
    padding: 0.25rem;
    background: var(--c-white);
    color: var(--c-black);
    text-transform: uppercase;
    font-size: 0.625rem;
    line-height: 0.625rem;
    font-weight: bold;
  }
  .gotchi-special-select__popup-trigger--full-width {
    width: 100%;
  }

  .gotchi-special-select__options {
    background: var(--c-white);
  }
  .gotchi-special-select__options label {
    display: block;
    padding: 0.25rem 0.9rem;
    color: var(--c-black);
    opacity: 0.5;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
    text-transform: uppercase;
  }
  .gotchi-special-select__options input:checked + label,
  .gotchi-special-select__options label:hover,
  .gotchi-special-select__options input:focus {
    opacity: 1;
    background: rgba(var(--c-black-rgb), 0.1);
  }
</style>