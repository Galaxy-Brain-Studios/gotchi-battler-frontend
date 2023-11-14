<template>
  <button
    class="site-button-primary__button button-reset"
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

    box-shadow:
      0 calc(-1 * var(--button-border-width)) 0 0 var(--button-color-border-dark),
      var(--button-border-width) 0 0 0 var(--button-color-border-dark),
      0 var(--button-border-width) 0 0 var(--button-color-border-dark),
      calc(-1 * var(--button-border-width)) 0 var(--button-color-border-dark),
      inset calc(-1 * var(--button-border-width)) calc(-1 * var(--button-border-width)) 0 0 var(--button-color-border-light)
      ;
    margin: var(--button-border-width); /* include box shadow in dimensions of component */
    border: none;
    padding: 0.75rem calc(4.5rem + var(--button-border-width)) calc(0.75rem + var(--button-border-width)) 4.5rem;
    outline-color: transparent;
    text-transform: uppercase;
    font-size: 1.3125rem;
    font-weight: 700;
    letter-spacing: 0.04rem;
    color: var(--button-color-text);
    background: var(--button-color-background);
  }
  .site-button-primary__button:hover,
  .site-button-primary__button:focus {
    --button-color-text: #221808;
    --button-color-background: #E4C000;
    --button-color-border-light: #6A47BF;
    --button-color-border-dark: #1C1C1C;
  }
</style>