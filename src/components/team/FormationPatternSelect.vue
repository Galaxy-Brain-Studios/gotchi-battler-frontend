<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'
  import FORMATION_PATTERNS from './formationPatterns.json'
  import FormationPattern from './FormationPattern.vue'
  import SitePopupDropdown from '@/components/common/SitePopupDropdown.vue'
  import SiteIcon from '@/components/common/SiteIcon.vue'

  const props = defineProps({
    modelValue: {
      type: String,
      default: null
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

  const inputNs = ref(uniqueId('formation-pattern-select'))

  const selectedPattern = computed(() => FORMATION_PATTERNS.find(pattern => pattern.id === props.modelValue))
</script>

<template>
  <SitePopupDropdown class="formation-patterns-popup">
    <button
      type="button"
      class="button-reset formation-patterns-trigger"
    >
      <div class="formation-patterns-trigger__content">
        <template v-if="!selectedPattern">
          Select formation
        </template>
        <template v-else>
          <FormationPattern :pattern="selectedPattern" />
        </template>
      </div>
      <SiteIcon
        class="formation-patterns-trigger__icon"
        name="chevron-down"
        :width="0.5265"
        :height="0.375"
      />
    </button>
    <template #popper="{ hide }">
      <div class="formation-patterns">
        <div
          v-for="pattern in FORMATION_PATTERNS"
          :key="pattern.id"
        >
          <input
            :id="`${inputNs}--${pattern.id}`"
            v-model="passThroughModel"
            type="radio"
            :name="`${inputNs}--formation-pattern`"
            :value="pattern.id"
            class="formation-pattern-input sr-only"
            @change="hide"
          >
          <label
            :for="`${inputNs}--${pattern.id}`"
            class="formation-pattern-label"
          >
            <FormationPattern :pattern="pattern" />
          </label>
        </div>
      </div>
    </template>
  </SitePopupDropdown>
</template>

<style scoped>
  .formation-patterns-popup {
    display: inline-block;
  }
  .formation-patterns-trigger {
    display: flex;
    align-items: center;
    column-gap: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.5);
  }
  .formation-patterns-trigger__content {
    flex: 1 1 auto;
  }
  .formation-patterns-trigger__icon {
    flex: none;
    margin-right: 1rem;
    color: var(--c-white);
  }
</style>
<style>
  /* global styles for popper contents */
  .formation-patterns {
    background: #6027E2;
    display: flex;
    flex-direction: column;
    row-gap: 0.7rem;
  }
  .formation-pattern-label {
    cursor: pointer;
    display: block;
    opacity: 0.3;
  }
  .formation-pattern-input:checked + .formation-pattern-label,
  .formation-pattern-label:hover {
    opacity: 1;
  }
  .formation-pattern-input:focus-visible + .formation-pattern-label {
    outline: 3px solid var(--c-light-blue);
  }
</style>