<script setup>
  import { computed } from 'vue'
  import SiteIcon from './SiteIcon.vue'

  defineOptions({
    inheritAttrs: false
  })

  const props = defineProps({
    modelValue: {
      type: String,
      default: null
    },
    subtle: {
      type: Boolean,
      default: false
    },
    search: {
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
</script>

<template>
  <div
    class="site-text-field"
    :class="{
      'site-text-field--search': search,
      'site-text-field--subtle': subtle
    }"
  >
    <input
      v-model="passThroughModel"
      v-bind="$attrs"
      type="text"
      class="site-text-field__input"
    />
    <SiteIcon
      v-if="search"
      name="search"
      :width="1.5"
      :height="1.5"
      class="site-text-field__icon"
    />
  </div>
</template>

<style scoped>
  .site-text-field {
    display: grid;
    --site-text-field-icon-offset-top: 0.5rem;
    --site-text-field-icon-offset-left: 0.4rem;
    --site-text-field-icon-space: 2.2rem;
    --site-text-field-color-border-rgb: 255, 255, 255;
    --site-text-field-color-border: rgba(var(--site-text-field-color-border-rgb), 0.5);
    --site-text-field-color-border--focus: rgba(var(--site-text-field-color-border-rgb), 1);
    --site-text-field-outline-offset: -3px;
  }
  .site-text-field--subtle {
    --site-text-field-icon-offset-top: 0.3rem;
    --site-text-field-icon-offset-left: 0.2rem;
    --site-text-field-icon-space: 1.85rem;
    --site-text-field-color-border: transparent;
    --site-text-field-color-border--focus: transparent;
    --site-text-field-outline-offset: 0px;
  }
  .site-text-field__input {
    min-width: 50px;
    outline-offset: var(--site-text-field-outline-offset);
    border-radius: 0;
    border: 2px solid var(--site-text-field-color-border);
    padding: calc(0.5rem - 2px) 1rem;
    background: transparent;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .site-text-field--subtle .site-text-field__input {
    padding: 0.15rem 0.5rem;
  }
  .site-text-field__input:focus {
    border-radius: 0;
    border-color: var(--site-text-field-color-border--focus);
    outline: 2px solid var(--c-light-blue);
  }
  .site-text-field__input::placeholder {
    color: var(--c-white);
    opacity: 0.6;
  }

  .site-text-field--search {
    position: relative;
  }
  .site-text-field__icon {
    position: absolute;
    top: var(--site-text-field-icon-offset-top);
    left: var(--site-text-field-icon-offset-left);
    opacity: 0.5;
    color: var(--c-white);
  }
  .site-text-field--search .site-text-field__input {
    padding-left: var(--site-text-field-icon-space);
  }
  .site-text-field__input:focus + .site-text-field__icon {
    opacity: 1;
  }
</style>
