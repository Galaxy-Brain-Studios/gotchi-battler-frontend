<script setup>
  defineProps({
    difficulty: {
      type: String,
      required: true
    }
  })
</script>

<template>
  <div
    class="team-difficulty-badge"
    :class="{
      [`team-difficulty-badge--${difficulty}`]: true
    }"
  >
    {{ difficulty }}
  </div>
</template>

<style scoped>
  .team-difficulty-badge {
    --team-difficulty-badge-color-background: var(--c-white);
    --team-difficulty-badge-color-text: var(--c-black);
  }
  .team-difficulty-badge--garbage {
    --team-difficulty-badge-color-background: var(--c-rarity-garbage);
    --team-difficulty-badge-color-text: var(--c-rarity-garbage-contrast);
  }
  .team-difficulty-badge--common {
    --team-difficulty-badge-color-background: var(--c-rarity-common);
    --team-difficulty-badge-color-text: var(--c-rarity-common-contrast);
  }
  .team-difficulty-badge--uncommon {
    --team-difficulty-badge-color-background: var(--c-rarity-uncommon);
    --team-difficulty-badge-color-text: var(--c-rarity-uncommon-contrast);
  }
  .team-difficulty-badge--rare {
    --team-difficulty-badge-color-background: var(--c-rarity-rare);
    --team-difficulty-badge-color-text: var(--c-rarity-rare-contrast);
  }
  .team-difficulty-badge--legendary {
    --team-difficulty-badge-color-background: var(--c-rarity-legendary);
    --team-difficulty-badge-color-text: var(--c-rarity-legendary-contrast);
  }
  .team-difficulty-badge--mythical {
    --team-difficulty-badge-color-background: var(--c-rarity-mythical);
    --team-difficulty-badge-color-text: var(--c-rarity-mythical-contrast);
  }
  .team-difficulty-badge--godlike {
    --team-difficulty-badge-color-background: var(--c-rarity-godlike);
    --team-difficulty-badge-color-text: var(--c-rarity-godlike-contrast);
  }

  .team-difficulty-badge {
    display: inline-block;
    padding: 0.2rem 0.6rem;
    font-weight: normal;
    font-size: 0.8rem;
    line-height: 1.25rem;
    letter-spacing: 0.02625rem;
    text-transform: capitalize;
    background: var(--team-difficulty-badge-color-background);
    color: var(--team-difficulty-badge-color-text);
  }
</style>