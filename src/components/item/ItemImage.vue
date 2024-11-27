<script setup>
  defineProps({
    imageUrl: {
      type: String,
      required: true
    },
    rarity: {
      type: String,
      required: true
    },
    imageSize: {
      type: Number, // rem
      default: null // defaults to 100%
    },
    paddingX: {
      type: Number, // rem
      default: null
    },
    paddingY: {
      type: Number, // rem
      default: null
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
    :style="{
      '--item-image-width--custom': (imageSize - 0) > 0 ? `${imageSize - 0}rem` : undefined,
      '--item-justify-content--custom': (imageSize - 0) > 0 ? 'center' : undefined,
      '--item-padding-x--custom': paddingX !== null ? `${paddingX - 0}rem` : undefined,
      '--item-padding-y--custom': paddingY !== null ? `${paddingY - 0}rem` : undefined,
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
    --item-padding-x: var(--item-padding-x--custom, 1.5rem);
    --item-padding-y: var(--item-padding-y--custom, 1.5rem);
    --item-image-width: var(--item-image-width--custom, 100%);
    --item-justify-content: var(--item-justify-content--custom, stretch);

    display: grid;
    justify-content: var(--item-justify-content);
    padding: var(--item-padding-y) var(--item-padding-x);
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
    min-width: 0;
    width: var(--item-image-width);
    aspect-ratio: 1;
    background-image: var(--image-url);
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
</style>