<script setup>
</script>

<template>
  <h1>
    <slot />
  </h1>
</template>

<style scoped>
  h1 {
    --heading-color: var(--c-white);
    --heading-block-width: 0.75rem;
    --heading-line-width: 0.25rem;

    margin: 0;

    display: flex;
    gap: 0.3em;
    align-items: center;

    color: var(--heading-color);
    text-transform: uppercase;
    font-size: 3rem;
    letter-spacing: 0.09rem;
  }

  h1::before,
  h1::after {
    content: '';
    flex: 1 1 auto;
    height: var(--heading-block-width);
    background-color: var(--heading-color);
  }

  h1::before {
    clip-path: polygon(
      0 0,
      var(--heading-block-width) 0,
      var(--heading-block-width) calc(0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      100% calc(0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      100% calc(100% - 0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      var(--heading-block-width) calc(100% - 0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      var(--heading-block-width) 100%,
      0 100%
    );
  }

  h1::after {
    clip-path: polygon(
      0 calc(0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      calc(100% - var(--heading-block-width)) calc(0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      calc(100% - var(--heading-block-width)) 0,
      100% 0,
      100% 100%,
      calc(100% - var(--heading-block-width)) 100%,
      calc(100% - var(--heading-block-width)) calc(100% - 0.5 * (var(--heading-block-width) - var(--heading-line-width))),
      0  calc(100% - 0.5 * (var(--heading-block-width) - var(--heading-line-width)))
    );
  }
</style>