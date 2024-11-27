<script setup>
  defineProps({
    level: {
      type: Number,
      default: 1
    }
  })

  const TAG_FOR_LEVEL = {
    1: 'h1',
    2: 'h2'
  }
</script>

<template>
  <component
    :is="TAG_FOR_LEVEL[level]"
    class="site-heading"
  >
    <slot />
  </component>
</template>

<style scoped>
  h1 {
    --heading-font-size: 2.5rem;
    --heading-letter-spacing: 0.075rem;
    --heading-line-height: 3rem;
    --heading-line-width: 0.1875rem;
    --heading-block-width: 0.75rem;
  }

  h2 {
    --heading-font-size: 1.5rem;
    --heading-letter-spacing: 0.045rem;
    --heading-line-height: 2rem;
    --heading-line-width: 0.125rem;
    --heading-block-width: 0.5rem;
  }

  .site-heading {
    --heading-color: var(--c-white);
    margin: 0;

    display: flex;
    gap: 2rem;
    align-items: center;

    color: var(--heading-color);
    text-transform: uppercase;
    font-size: var(--heading-font-size);
    letter-spacing: var(--heading-letter-spacing);
    line-height: var(--heading-line-height);
    font-weight: bold;
  }

  .site-heading::before,
  .site-heading::after {
    content: '';
    flex: 1 1 auto;
    height: var(--heading-block-width);
    background-color: var(--heading-color);
  }

  .site-heading::before {
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

  .site-heading::after {
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