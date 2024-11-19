<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'

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

  const inputNs = ref(uniqueId('volume-select'))

  const VOLUMES = []
  for (let i = 0; i <= 100; i += 10) {
    VOLUMES.push({
      value: `${i/100}`, // Store value as string to avoid type confusion
      label: `${i}%`
    })
  }
</script>

<template>
  <div class="volumes">
    <div
      v-for="option in VOLUMES"
      :key="option.value"
      class="volumes__option"
    >
      <input
        :id="`${inputNs}-input-${option.value}`"
        v-model="passThroughModel"
        type="radio"
        :name="inputNs"
        :value="option.value"
        class="sr-only"
      />
      <label
        :for="`${inputNs}-input-${option.value}`"
      >
        {{ option.label }}
      </label>
    </div>
  </div>
</template>

<style scoped>
  .volumes {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }

  label {
    cursor: pointer;
    display: grid;
    place-items: center;
    border: 2px solid var(--c-black);
    padding: calc(0.75rem - 2px) 0.8rem;
    font-weight: normal;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
    user-select: none;
  }
  input:checked + label {
    font-weight: bold;
  }
  input:checked + label,
  label:hover {
    border-color: var(--c-light-yellow);
    background: var(--c-light-yellow);
    color: var(--c-black);
  }
  input:focus-visible + label {
    outline: 3px solid var(--c-light-blue);
    outline-offset: 3px;
  }
</style>