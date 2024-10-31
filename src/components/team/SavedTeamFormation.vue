<script setup>
  import { computed } from 'vue'
  import SiteIcon from '../common/SiteIcon.vue'

  const props = defineProps({
    team: {
      type: Object,
      required: true
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
          'saved-team-formation__position--occupied': !!gotchi
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
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .saved-team-formation__row {
    display: flex;
  }
  .saved-team-formation__position {
    --position-border-width: 2px;
    --position-border-color: transparent;
    border: var(--position-border-width) solid var(--position-border-color);
    position: relative;
    flex: none;
    width: 2.5rem;
    height: 2.5rem;
    display: grid;
    place-items: center;
  }
  .saved-team-formation__position--occupied {
    --position-border-color: var(--c-black);
    background: linear-gradient(180deg, var(--c-dark-purple) 0%, var(--c-black) 100%);
  }
  .saved-team-formation__position-image {
    height: 2rem;
    width: 2rem;
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
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
    position: absolute;
    left: 0;
    right: 0;
    bottom: calc(0% - var(--position-border-width));
    height: var(--position-border-width);
    background: var(--special-color-background, transparent);
  }
</style>