<template>
  <button
    class="site-button-small__button button-reset"
    type="button"
  >
    <slot />
  </button>
</template>

<style scoped>
  .site-button-small__button {
    --button-color-text: var(--c-white);
    --button-color-background: #004E79;
    --button-color-border: #49DBFB;

    margin: 0;
    border: 1px solid var(--button-color-border);
    padding: 0.25rem 0.9rem;
    outline-color: transparent;
    text-transform: uppercase;
    font-size: 0.9rem;
    line-height: 1.25rem;
    font-weight: normal;
    letter-spacing: 0.04rem;
    color: var(--button-color-text);
    background: var(--button-color-background);
  }
  .site-button-small__button:hover,
  .site-button-small__button:focus {
    box-shadow: 0 0 10px var(--button-color-border);
  }
</style>