<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'
  import DIFFICULTIES from '../../data/trainingTeamDifficulties.json'

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

  const inputNs = ref(uniqueId('team-difficulty-select'))
</script>

<template>
  <div class="team-difficulties">
    <div
      v-for="option in DIFFICULTIES"
      :key="option"
      class="team-difficulties__option"
      :class="{
        [`team-difficulties__option--${option}`]: !!option
      }"
    >
      <input
        :id="`${inputNs}-input-${option}`"
        v-model="passThroughModel"
        type="radio"
        :name="inputNs"
        :value="option"
        class="sr-only"
      />
      <label
        :for="`${inputNs}-input-${option}`"
      >
        {{ option }}
      </label>
    </div>
  </div>
</template>

<style scoped>
  .team-difficulties {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    --team-difficulty-color-background: var(--c-white);
    --team-difficulty-color-text: var(--c-black);    
  }
  .team-difficulties__option--garbage {
    --team-difficulty-color-background: var(--c-rarity-garbage);
    --team-difficulty-color-text: var(--c-rarity-garbage-contrast);
  }
  .team-difficulties__option--common {
    --team-difficulty-color-background: var(--c-rarity-common);
    --team-difficulty-color-text: var(--c-rarity-common-contrast);
  }
  .team-difficulties__option--uncommon {
    --team-difficulty-color-background: var(--c-rarity-uncommon);
    --team-difficulty-color-text: var(--c-rarity-uncommon-contrast);
  }
  .team-difficulties__option--rare {
    --team-difficulty-color-background: var(--c-rarity-rare);
    --team-difficulty-color-text: var(--c-rarity-rare-contrast);
  }
  .team-difficulties__option--legendary {
    --team-difficulty-color-background: var(--c-rarity-legendary);
    --team-difficulty-color-text: var(--c-rarity-legendary-contrast);
  }
  .team-difficulties__option--mythical {
    --team-difficulty-color-background: var(--c-rarity-mythical);
    --team-difficulty-color-text: var(--c-rarity-mythical-contrast);
  }
  .team-difficulties__option--godlike {
    --team-difficulty-color-background: var(--c-rarity-godlike);
    --team-difficulty-color-text: var(--c-rarity-godlike-contrast);
  }

  label {
    cursor: pointer;
    display: grid;
    place-items: center;
    border: 2px solid var(--c-white);
    padding: calc(0.5rem - 2px) 1rem;
    font-weight: normal;
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
    text-transform: capitalize;
    user-select: none;
  }
  input:checked + label {
    font-weight: bold;
  }
  input:checked + label,
  label:hover {
    border-color: var(--team-difficulty-color-background);
    background: var(--team-difficulty-color-background);
    color: var(--team-difficulty-color-text);
  }
  input:focus-visible + label {
    outline: 3px solid var(--c-light-blue);
    outline-offset: 3px;
  }
</style>