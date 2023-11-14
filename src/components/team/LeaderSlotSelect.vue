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

  const inputNs = ref(uniqueId('leader-slot-select'))
</script>

<template>
  <div class="leader-slots">
    <div
      v-for="n in 5"
      :key="n"
      class="leader-slot"
    >
      <input
        :id="`${inputNs}-leader-slot-input-${n}`"
        v-model="passThroughModel"
        type="radio"
        :name="`${inputNs}-leader-slot`"
        :value="`${n}`"
        class="leader-slot-input sr-only"
      />
      <label
        :for="`${inputNs}-leader-slot-input-${n}`"
        class="leader-slot-label"
      >
        {{ n }}
      </label>
    </div>
  </div>
</template>

<style scoped>
  .leader-slots {
    display: grid;
    grid-template-columns: repeat(auto-fill, 2.5rem);
    gap: 0.5rem;
    justify-content: start;
  }

  .leader-slot-label {
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid var(--c-white);
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
    user-select: none;
  }
  .leader-slot-input:checked + .leader-slot-label {
    background: var(--c-white);
    color: var(--c-black);
  }
  .leader-slot-input:checked + .leader-slot-label,
  .leader-slot-label:hover {
    background: var(--c-white);
    color: var(--c-black);
  }
  .leader-slot-input:focus-visible + .leader-slot-label {
    outline: 3px solid var(--c-light-blue);
  }
</style>