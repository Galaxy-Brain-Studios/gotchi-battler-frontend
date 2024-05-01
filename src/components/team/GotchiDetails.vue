<script setup>
  import { ref, computed, watch} from 'vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import GotchiSpecialWithInfo from './GotchiSpecialWithInfo.vue'
  import GotchiTraitIcon from './GotchiTraitIcon.vue'
  import GotchiStats from './GotchiStats.vue'

  const props = defineProps({
    gotchi: {
      type: Object,
      required: true
    },
    isLeader: {
      type: Boolean,
      default: false
    },
    teamId: {
      type: Number,
      default: null
    }
  })

  const sides = ['front', 'right', 'back', 'left']
  const displayGotchiSvgSide = ref(sides[0])
  function navImage (direction) {
    const currentIndex = sides.indexOf(displayGotchiSvgSide.value)
    const newIndex = (currentIndex + direction + sides.length) % sides.length
    displayGotchiSvgSide.value = sides[newIndex]
  }

  watch(
    () => props.gotchi,
    () => displayGotchiSvgSide.value = sides[0]
  )

  const displayGotchi = computed(() => {
    if (!props.gotchi) { return null }
    const gotchi = props.gotchi

    return {
      ...gotchi,
      display: {
        gotchiSvgUrls: {
          front: gotchi.svgFront,
          back: gotchi.svgBack,
          left: gotchi.svgLeft,
          right: gotchi.svgRight,
        },
        attributes: [
          {
            label: 'Rarity Score',
            value: gotchi.brs
          },
          {
            label: 'Kinship',
            value: gotchi.kinship
          },
          {
            label: 'Level',
            value: `${gotchi.level} (${gotchi.xp}XP)`
          }
        ],
        traits: [
          {
            id: 'NRG',
            value: gotchi.nrg
          },
          {
            id: 'AGG',
            value: gotchi.agg
          },
          {
            id: 'SPK',
            value: gotchi.spk
          },
          {
            id: 'BRN',
            value: gotchi.brn
          },
          {
            id: 'EYS',
            value: gotchi.eys
          },
          {
            id: 'EYC',
            value: gotchi.eyc
          }
        ]
      }
    }
  })
</script>

<template>
  <section
    v-if="displayGotchi"
    class="display-gotchi"
    aria-labelledby="display-gotchi__name"
  >
    <div class="display-gotchi__id">
      #{{ displayGotchi.onchainId || displayGotchi.id }}
    </div>
    <div
      class="display-gotchi__images"
    >
      <button
        type="button"
        class="display-gotchi__image-nav button-reset"
        @click="navImage(-1)"
      >
        <SiteIcon
          name="chevron-left"
          class="display-gotchi__image-nav-icon"
        />
      </button>
      <img
        :key="displayGotchi.display.gotchiSvgUrls[displayGotchiSvgSide]"
        class="display-gotchi__image"
        :src="displayGotchi.display.gotchiSvgUrls[displayGotchiSvgSide]"
        alt="image of gotchi"
      />
      <button
        type="button"
        class="display-gotchi__image-nav button-reset"
        @click="navImage(+1)"
      >
        <SiteIcon
          name="chevron-right"
          class="display-gotchi__image-nav-icon"
          alt="turn gotchi image"
        />
      </button>
      <div class="display-gotchi__side-indicators">
        <div
          v-for="i in 4"
          :key="i"
          class="display-gotchi__side-indicator"
          :style="{
            '--display-gotchi__side-indicator-index': i
          }"
        />
        <div
          class="display-gotchi__side-indicator display-gotchi__side-indicator--active"
          :style="{
            '--display-gotchi__side-indicator-index': sides.indexOf(displayGotchiSvgSide) + 1
          }"
        />
      </div>
    </div>
    <div class="display-gotchi__summary">
      <div
        id="display-gotchi__name"
        class="display-gotchi__name word-break"
      >
        {{ displayGotchi.name }}
      </div>
      <div class="display-gotchi__specials">
        <GotchiSpecialWithInfo
          v-if="displayGotchi.specialId"
          :id="displayGotchi.specialId"
          variant="large"
        />
        <GotchiSpecialWithInfo
          v-if="isLeader"
          :id="displayGotchi.specialId"
          :forSpecial="false"
          variant="large"
        />
      </div>
      <dl class="display-gotchi__attributes dl-reset" aria-label="Gotchi attributes">
        <div
          v-for="entry in displayGotchi.display.attributes"
          :key="entry.label"
          class="display-gotchi__attribute"
        >
          <dt>
            {{ entry.label }}
          </dt>
          <dd>
            {{ entry.value }}
          </dd>
        </div>
      </dl>
      <dl class="display-gotchi__traits dl-reset" aria-label="Gotchi traits">
        <div
          v-for="entry in displayGotchi.display.traits"
          :key="entry.id"
          class="display-gotchi__trait"
        >
          <dt>
            <GotchiTraitIcon :trait="entry.id" />
          </dt>
          <dd>{{ entry.value }}</dd>
        </div>
      </dl>
    </div>
    <GotchiStats
      :gotchi="displayGotchi"
      variant="large"
      class="display-gotchi__stats"
      aria-label="Gotchi game stats"
    />
  </section>
</template>

<style scoped>
  .display-gotchi {
    position: relative;
    display: grid;
    grid-template-columns: repeat(2, minmax(21rem, 1fr));
    row-gap: 1.5rem;
  }

  .display-gotchi__id {
    position: absolute;
    top: 0.5rem;
    left: 0.75rem;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
    color: var(--c-white);
  }

  .display-gotchi__images {
    height: 15rem;
    display: grid;
    grid-template-columns: auto 14rem auto;
    place-items: center;
    background: linear-gradient(180deg, var(--c-dark-purple) 0%, var(--c-black) 100%);
  }
  .display-gotchi__image-nav {
    padding: 1rem;
  }
  .display-gotchi__image-nav-icon {
    width: 1.25rem;
    height: 0.75rem;
    color: var(--c-white);
  }
  .display-gotchi__image {
    height: 14rem;
    width: 14rem;
  }
  .display-gotchi__side-indicators {
    grid-column: 2 / span 1;
    align-self: end;
    margin-bottom: 0.5rem;
    display: grid;
    grid-auto-flow: column;
    column-gap: 0.375rem;
  }
  .display-gotchi__side-indicator {
    border-radius: 50%;
    width: 0.375rem;
    height: 0.375rem;
    background: var(--c-white);
    grid-row: 1 / span 1;
    grid-column: var(--display-gotchi__side-indicator-index) / span 1;
  }
  .display-gotchi__side-indicator:not(.display-gotchi__side-indicator--active) {
    opacity: 0.2;
  }

  .display-gotchi__summary {
    margin-left: 1.75rem;
    align-self: center;
  }

  .display-gotchi__name {
    margin-bottom: 1rem;
    font-size: 2rem;
    line-height: 2.5rem;
    letter-spacing: 0.06rem;
    font-weight: bold;
  }

  .display-gotchi__specials {
    margin-bottom: 1rem;
    display: flex;
    flex-wrap: wrap;
    column-gap: 0.2rem;
  }

  .display-gotchi__attributes {
    margin-bottom: 1rem;
    display: grid;
    row-gap: 0.25rem;
  }
  .display-gotchi__attribute {
    height: 1.5rem;
    display: grid;
    grid-template-columns: auto 1fr;
    column-gap: 1rem;
    align-items: center;
  }
  .display-gotchi__attribute dt {
    font-size: 0.875rem;
    line-height: 1.5rem;
    opacity: 0.5;
    text-transform: uppercase;
  }
  .display-gotchi__attribute dd {
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
    font-weight: bold;
  }

  .display-gotchi__stats,
  .display-gotchi__traits {
    grid-column: 1 / 3;
  }

  .display-gotchi__traits {
    align-self: end;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
  }
  .display-gotchi__trait {
    display: grid;
    grid-template-columns: 1fr 1fr;
    column-gap: 0.5rem;
    align-items: center;
  }
  .display-gotchi__trait dt {
    line-height: 0.1rem;
    text-align: right;
  }
  .display-gotchi__trait dd {
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
</style>