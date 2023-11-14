<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'
  import FORMATION_PATTERNS from './formationPatterns.json'

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
</script>

<template>
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
      >
      <label
        :for="`${inputNs}--${pattern.id}`"
        class="formation-pattern-label"
        :style="{
          '--pattern-back-0': pattern.back[0] ? 0 : 1,
          '--pattern-back-1': pattern.back[1] ? 0 : 1,
          '--pattern-back-2': pattern.back[2] ? 0 : 1,
          '--pattern-back-3': pattern.back[3] ? 0 : 1,
          '--pattern-back-4': pattern.back[4] ? 0 : 1,
          '--pattern-front-0': pattern.front[0] ? 0 : 1,
          '--pattern-front-1': pattern.front[1] ? 0 : 1,
          '--pattern-front-2': pattern.front[2] ? 0 : 1,
          '--pattern-front-3': pattern.front[3] ? 0 : 1,
          '--pattern-front-4': pattern.front[4] ? 0 : 1
        }"
      >
        <span class="sr-only">{{ pattern.name }}</span>
      </label>
    </div>
  </div>
</template>

<style scoped>
  .formation-patterns {
    --formation-pattern-border-width: 4px;
    display: grid;
    grid-template-columns: repeat(auto-fill, calc(5rem + 2 * var(--formation-pattern-border-width)));
    column-gap: calc(1.5rem - 2 * var(--formation-pattern-border-width));
    row-gap: 0.8rem;
  }
  .formation-pattern-label {
    cursor: pointer;
    height: calc(2rem + 2 * var(--formation-pattern-border-width));
    display: block;
    border: var(--formation-pattern-border-width) solid #fff;
    opacity: 0.3;
  }
  .formation-pattern-input:checked + .formation-pattern-label,
  .formation-pattern-label:hover {
    opacity: 1;
  }
  .formation-pattern-input:focus-visible + .formation-pattern-label {
    outline: 3px solid var(--c-light-blue);
  }
  .formation-pattern-label {
    /* generate formation block pattern using linear-gradients with sharp color/opacity changes */
    background-image:
      linear-gradient(90deg,
        rgba(255, 255, 255, var(--pattern-back-0)) 0%,
        rgba(255, 255, 255, var(--pattern-back-0)) 20%,
        rgba(255, 255, 255, var(--pattern-back-1)) 20%,
        rgba(255, 255, 255, var(--pattern-back-1)) 40%,
        rgba(255, 255, 255, var(--pattern-back-2)) 40%,
        rgba(255, 255, 255, var(--pattern-back-2)) 60%,
        rgba(255, 255, 255, var(--pattern-back-3)) 60%,
        rgba(255, 255, 255, var(--pattern-back-3)) 80%,
        rgba(255, 255, 255, var(--pattern-back-4)) 80%,
        rgba(255, 255, 255, var(--pattern-back-4)) 100%
      ),
      linear-gradient(90deg,
        rgba(255, 255, 255, var(--pattern-front-0)) 0%,
        rgba(255, 255, 255, var(--pattern-front-0)) 20%,
        rgba(255, 255, 255, var(--pattern-front-1)) 20%,
        rgba(255, 255, 255, var(--pattern-front-1)) 40%,
        rgba(255, 255, 255, var(--pattern-front-2)) 40%,
        rgba(255, 255, 255, var(--pattern-front-2)) 60%,
        rgba(255, 255, 255, var(--pattern-front-3)) 60%,
        rgba(255, 255, 255, var(--pattern-front-3)) 80%,
        rgba(255, 255, 255, var(--pattern-front-4)) 80%,
        rgba(255, 255, 255, var(--pattern-front-4)) 100%
      );
    background-size: 100% 50%, 100% 50%;
    background-repeat: no-repeat, no-repeat;
    background-position: top, bottom;
  }
</style>