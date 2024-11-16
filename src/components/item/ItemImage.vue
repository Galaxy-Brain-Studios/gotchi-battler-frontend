<script setup>
  defineProps({
    imageUrl: {
      type: String,
      required: true
    },
    rarity: {
      type: String,
      required: true
    }
  })

  const escapeUrl = url => CSS.escape(url)
</script>

<template>
  <div
    v-if="imageUrl"
    class="item-image-container"
    :class="{
      [`item-image-container--${rarity?.toLowerCase()}`]: !!rarity
    }"
  >
    <div
      class="item-image"
      :style="{
       '--image-url': `url(${escapeUrl(imageUrl || '')})`
      }"
    />
  </div>
</template>

<style scoped>
  .item-image-container {
    --item-background: var(--c-black);
    --item-padding: 1.5rem;

    display: grid;
    justify-content: stretch;
    padding: var(--item-padding);
    background: var(--item-background);
  }
  .item-image-container--common {
    --item-background: var(--gradient-rarity-common);
  }
  .item-image-container--uncommon {
    --item-background: var(--gradient-rarity-uncommon);
  }
  .item-image-container--rare {
    --item-background: var(--gradient-rarity-rare);
  }
  .item-image-container--legendary {
    --item-background: var(--gradient-rarity-legendary);
  }
  .item-image-container--mythical {
    --item-background: var(--gradient-rarity-mythical);
  }
  .item-image-container--godlike {
    --item-background: var(--gradient-rarity-godlike);
  }

  .item-image {
    width: 100%;
    aspect-ratio: 1;
    background-image: var(--image-url);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>