<script setup>
  import { ref, computed } from 'vue'
  import uniqueId from 'lodash.uniqueid'  
  import SiteIcon from './SiteIcon.vue'

  const props = defineProps({
    modelValue: {
      type: Boolean,
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

  const inputId = ref(uniqueId('site-checkbox'))  
</script>

<template>
  <div class="site-checkbox">
    <input
      :id="inputId"
      v-model="passThroughModel"
      type="checkbox"
      class="site-checkbox__input"
    />
    <label
      :for="inputId"
      class="site-checkbox__label"
    >
      <div class="site-checkbox__icon">
        <SiteIcon
          name="check"
          :width="1"
          :height="1"
        />
      </div>
      <slot />
    </label>
  </div>
</template>

<style scoped>
  .site-checkbox {
    position: relative;
  }
  .site-checkbox__input {
    position: absolute;
    left: 0;
    top: 0;
    width: 1.5rem;
    height: 1.5rem;
    opacity: 0;
    cursor: pointer;
  }
  .site-checkbox__label {
    display: grid;
    align-items: center;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0.75rem;
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
    user-select: none;
    cursor: pointer;
  }
  .site-checkbox__icon {
    display: grid;
    place-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border: 2px solid var(--c-white);
    background: transparent;
    color: transparent;
  }
  .site-checkbox__input:checked + .site-checkbox__label .site-checkbox__icon {
    background: var(--c-white);
    color: var(--c-black);
  }
  .site-checkbox__input:focus {
    outline: none;
  }
  .site-checkbox__input:focus + .site-checkbox__label .site-checkbox__icon,
  .site-checkbox__input:hover + .site-checkbox__label .site-checkbox__icon {
    outline: 2px solid var(--c-light-blue);
    outline-offset: -3px;

  }
</style>