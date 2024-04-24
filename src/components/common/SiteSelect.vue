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
    withBorder: {
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
    class="site-select"
    :class="{
      'site-select--with-border': withBorder
    }"
  >
    <select
      v-model="passThroughModel"
      v-bind="$attrs"
      class="site-select__select"
    >
      <slot />
    </select>
    <SiteIcon
      name="chevron-down"
      class="site-select__icon"
      :width="0.625"
      :height="0.36"
    />
  </div>
</template>

<style scoped>
  .site-select {
    position: relative;
    display: inline-grid;
    padding-right: 2px; /* include browser outline styles in dimensions */
  }
  .site-select--with-border {
    border: 2px solid rgba(255, 255, 255, 0.3);
  }
  .site-select__select {
    appearance: none;
    border: none;
    padding: 0.2rem 1.6rem 0.2rem 0.5rem;
    background: transparent;
    color: var(--c-white);
    font-weight: bold;
  }
  .site-select__select :deep(option) {
    color: var(--c-white);
    background: var(--c-black);
  }
  .site-select__select:focus:not(:focus-visible) {
    outline: none;
  }
  .site-select__select:focus-visible {
    outline: 2px solid var(--c-light-blue);
  }
  .site-select__icon {
    position: absolute;
    top: 50%;
    right: 0.6rem;
    margin-top: -0.18rem
  }
</style>