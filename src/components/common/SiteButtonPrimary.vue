<script setup>
  defineProps({
    compact: {
      type: Boolean,
      default: false
    },
  })
</script>

<template>
  <button
    class="site-button-primary__button button-reset"
    :class="{
      'site-button-primary__button--compact': compact
    }"
    type="button"
  >
    <slot />
  </button>
</template>

<style scoped>
  .site-button-primary__button {
    --button-color-text: #583E16;
    --button-color-background: #F1D438;
    --button-color-border-light: #422588;
    --button-color-border-dark: #222529;
    --button-border-width: 0.5rem;
    --button-padding-vertical: 0.75rem;
    --button-padding-horizontal: 4.5rem;

    box-shadow:
      0 calc(-1 * var(--button-border-width)) 0 0 var(--button-color-border-dark),
      var(--button-border-width) 0 0 0 var(--button-color-border-dark),
      0 var(--button-border-width) 0 0 var(--button-color-border-dark),
      calc(-1 * var(--button-border-width)) 0 var(--button-color-border-dark),
      inset calc(-1 * var(--button-border-width)) calc(-1 * var(--button-border-width)) 0 0 var(--button-color-border-light)
      ;
    margin: var(--button-border-width); /* include box shadow in dimensions of component */
    border: none;
    padding: var(--button-padding-vertical)
      calc(var(--button-padding-horizontal) + var(--button-border-width))
      calc(var(--button-padding-vertical) + var(--button-border-width))
      var(--button-padding-horizontal);
    outline-color: transparent;
    text-transform: uppercase;
    font-size: 1.3125rem;
    font-weight: 700;
    letter-spacing: 0.04rem;
    color: var(--button-color-text);
    background: var(--button-color-background);
  }
  .site-button-primary__button:hover:not(:disabled),
  .site-button-primary__button:focus {
    --button-color-text: #221808;
    --button-color-background: #E4C000;
    --button-color-border-light: #6A47BF;
    --button-color-border-dark: #1C1C1C;
  }

  .site-button-primary__button:disabled {
    --button-color-background: #8b8879;
    --button-color-text: #655843;
  }
  .site-button-primary__button--compact {
    --button-padding-vertical: 0.5rem;
    --button-padding-horizontal: 2.9rem;
    font-size: 1rem;
    letter-spacing: 0.03rem;
  }
</style>