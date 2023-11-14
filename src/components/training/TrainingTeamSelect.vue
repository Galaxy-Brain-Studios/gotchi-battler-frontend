<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'

  const props = defineProps({
    modelValue: {
      type: Number,
      default: null
    },
    groupName: {
      type: String,
      required: true
    },
    teamId: {
      type: Number,
      default: null
    }
  })
  const emit = defineEmits(['update:modelValue'])

  const passThroughModel = computed({
    get () {
      return props.modelValue
    },
    set (value) {
      emit('update:modelValue', value - 0)
    }
  })

  const inputNs = ref(uniqueId('training-team-select'))
</script>

<template>
  <div class="training-team-select">
    <input
      :id="inputNs"
      v-model="passThroughModel"
      type="radio"
      :name="groupName"
      :value="teamId"
      class="sr-only"
    />
    <span class="training-team-select__selected">
      Selected:
    </span>
    <label
      :for="inputNs"
      class="extended-target"
    >
      <slot></slot>
    </label>
  </div>
</template>

<style scoped>
  .training-team-select__selected {
    display: none;
  }
  input:checked + .training-team-select__selected {
    display: inline;
  }
  input:focus-visible ~ label {
    outline: 2px solid var(--c-light-blue);
    outline-offset: 7px;
    outline-style: dashed;
  }
  input:not(:checked) ~ label:hover::before {
    cursor: pointer;
    background: rgba(var(--c-medium-yellow-rgb), 0.3);
    z-index: 2; /* bring above gotchi */
  }
  input:checked ~ label::before {
    /* override extended target */
    display: none;
  }

  .training-team-select {
    font-size: 1.5rem;
    line-height: 2rem;
    letter-spacing: 0.045rem;
    font-weight: bold;
  }
  .training-team-select__selected {
    font-weight: normal;
  }
</style>