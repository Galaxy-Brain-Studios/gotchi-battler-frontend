<script setup>
  import { computed } from 'vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import ItemImage from '../item/ItemImage.vue'

  const props = defineProps({
    team: {
      type: Object,
      required: true
    },
    unavailableGotchiIds: {
      type: Array,
      default: null
    }
  })  

  const rows = computed(() => {
    return ['front', 'back'].map(row => {
      return [1, 2, 3, 4, 5].map(position => {
        const gotchi = props.team.formation[row][position - 1]
        return gotchi || null
      })
    })
  })

  const escapeUrl = url => CSS.escape(url)
</script>

<template>
  <div class="saved-team-formation">
    <div
      v-for="row in rows"
      :key="row"
      class="saved-team-formation__row"
    >
      <div
        v-for="(gotchi, positionIndex) in row"
        :key="positionIndex"
        class="saved-team-formation__position"
        :class="{
          'saved-team-formation__position--occupied': !!gotchi,
          'saved-team-formation__position--gotchi-unavailable': gotchi && unavailableGotchiIds?.includes('' + gotchi.id)
        }"
      >
        <template v-if="gotchi">
          <div
            class="saved-team-formation__position-image"
            :style="{
              '--image-url': gotchi.svgFront ? `url(${escapeUrl(gotchi.svgFront)})` : undefined
            }"
          />
          <SiteIcon
            v-if="gotchi.id === team.leader"
            name="special-leader"
            class="saved-team-formation__position-leader-badge-icon"
          />
          <div
            v-if="gotchi.specialId"
            class="saved-team-formation__position-special"
            :style="{
              '--special-color-background': `var(--c-special-${gotchi.specialId})`
            }"
          />
          <ItemImage
            v-if="gotchi.item"
            :imageUrl="gotchi.item.image"
            :rarity="gotchi.item.rarity"
            :imageSize="1.25"
            :paddingY="0.05"
            :paddingX="0"
            class="saved-team-formation__position-item"
          />
          <div
            v-else
            class="saved-team-formation__position-item-empty"
          >
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .saved-team-formation__row {
    display: flex;
  }
  /* offset height of second row */
  .saved-team-formation__row:nth-child(2) {
    margin-top: -3.125rem;
  }
  .saved-team-formation__position {
    --position-border-width: 2px;
    --position-border-color: transparent;
    border: var(--position-border-width) solid var(--position-border-color);
    position: relative;
    flex: none;
    width: 3.125rem;
    height: 4.375rem;
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr);
  }
  .saved-team-formation__position--occupied {
    --position-border-color: var(--c-black);
    background: linear-gradient(180deg, var(--c-dark-purple) 0%, var(--c-black) 100%);
  }
  .saved-team-formation__position--gotchi-unavailable {
    opacity: 0.3;
    filter: grayscale(100%);
  }
  .saved-team-formation__position-image {
    height: 2.5rem;
    width: 100%;
    padding: 0.125rem;
    background-image: var(--image-url);
    background-origin: content-box;
    background-position: center;
    background-size: contain;
    background-repeat: no-repeat;
  }
  .saved-team-formation__position-leader-badge-icon {
    position: absolute;
    left: calc(0% - var(--position-border-width));
    top: calc(0% - var(--position-border-width));
    color: var(--c-light-yellow);
    background: var(--c-black);
  }
  .saved-team-formation__position-special {
    width: 100%;
    height: 0.25rem;
    background: var(--special-color-background, transparent);
  }
  .saved-team-formation__position-item-empty {
    margin: 0.7rem auto 0 auto;
    width: 0.75rem;
    height: 2px;
    background: var(--c-white);
    opacity: 0.25;
  }
</style>