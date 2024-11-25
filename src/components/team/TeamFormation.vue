<script setup>
  import { computed } from 'vue'

  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'

  const props = defineProps({
    team: {
      type: Object,
      default: null
    },
    selectedGotchiId: {
      type: Number,
      default: null
    },
    withRowLabels: {
      type: Boolean,
      default: false
    },
    withRowBoosts: {
      type: Boolean,
      default: false
    },
    reverseRows: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  })

  const gotchisInFormation = computed(() => {
    if (!props.team?.formation) { return null }
    return [
      ...props.team.formation.back.map((gotchiEntry, index) => ({
        row: 'back',
        position: index + 1,
        gotchi: gotchiEntry
      })),
      ...props.team.formation.front.map((gotchiEntry, index) => ({
        row: 'front',
        position: index + 1,
        gotchi: gotchiEntry
      })),
    ].filter(entry => !!entry.gotchi)
  })

  const selectedGotchiPosition = computed(() => {
    if (!gotchisInFormation.value || !props.selectedGotchiId) { return null }
    return gotchisInFormation.value.find(item => item.gotchi.id === props.selectedGotchiId)
  })

  const rowLabels = computed(() => {
    const labels = ['Front', 'Back']
    if (props.reverseRows) { return labels }
    return labels.reverse();
  })

  const rowBoosts = computed(() => {
    const boosts = [
      {
        text: 'Gotchis in the front row get targeted first by attacks whilst receiving a 10% increase in attack and a 20% decrease in defence',
        color: '#FF5038'
      },
      null // nothing to show for back
    ]
    if (props.reverseRows) { return boosts }
    return boosts.reverse();
  })
</script>

<template>
  <section
    class="team-formation"
    :class="{
      'team-formation--reversed-rows': reverseRows,
      'team-formation--horizontal': horizontal,
      'team-formation--no-team': !team
    }"
    aria-label="Formation"
  >
    <template v-if="withRowLabels">
      <div
        v-for="label in rowLabels"
        :key="label"
        class="team-formation__row-header"
      >
        {{ label }}
      </div>
    </template>
    <div
      v-for="n in 5"
      :key="n"
      class="team-formation__position team-formation--back-row"
      :style="{
        '--team-formation-position': n
      }"
    >
      <slot
        name="position"
        row="back"
        :position="n"
      />
    </div>
    <div
      v-for="n in 5"
      :key="n"
      class="team-formation__position team-formation--front-row"
      :style="{
        '--team-formation-position': n
      }"
    >
      <slot
        name="position"
        row="front"
        :position="n"
      />
    </div>
    <div
      v-if="!team"
      class="team-formation__no-team"
    >
      <slot name="no-team" />
    </div>
    <div
      v-for="entry in gotchisInFormation"
      :key="entry.gotchi.id"
      class="team-formation__gotchi"
      :class="{
        'team-formation--back-row': entry.row === 'back',
        'team-formation--front-row': entry.row === 'front'
      }"
      :style="{
        '--team-formation-position': entry.position
      }"
    >
      <slot
        name="gotchi"
        :gotchi="entry.gotchi"
        :row="entry.row"
        :position="entry.position"
      />
    </div>
    <div
      v-if="selectedGotchiPosition"
      class="team-formation__position team-formation__position--selected"
      :class="{
        'team-formation--back-row': selectedGotchiPosition.row === 'back',
        'team-formation--front-row': selectedGotchiPosition.row === 'front'
      }"
      :style="{
        '--team-formation-position': selectedGotchiPosition.position
      }"
    />
    <template v-if="withRowBoosts">
      <div
        v-for="(boost, index) in rowBoosts"
        :key="index"
        class="team-formation__row-boost"
        :style="{
          'visibility': !boost ? 'hidden': undefined,
          '--boost-bg-color': boost?.color
        }"
      >
        <SitePopupHoverMenu
          v-if="boost"
          class="team-formation__row-boost-popup"
        >
          <SiteButtonIcon
            iconName="info"
            label="view row effects"
          />
          <template #popper>
            {{ boost.text }}
          </template>
        </SitePopupHoverMenu>
      </div>
    </template>
  </section>
</template>

<style scoped>
  .team-formation {
    margin: 1px;
    display: grid;
    grid-template-columns: auto auto;
    grid-template-rows: auto repeat(5, auto);
    max-width: fit-content;
  }

  .team-formation--no-team {
    background: rgba(21, 11, 76, 0.6);
  }
  .team-formation__row-header {
    grid-row: 1 / 2;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 1rem;
    line-height: 1rem;
    letter-spacing: 0.03rem;
    opacity: 0.6;
    text-transform: uppercase;
  }
  .team-formation__position {
    outline: 2px solid var(--c-black);
    outline-offset: -1px;
    min-height: 6.25rem;
  }
  .team-formation__position,
  .team-formation__gotchi {
    position: relative;
    padding: 1px;
    grid-row: calc(var(--team-formation-position) + 1) / span 1;
  }
  .team-formation--back-row,
  .team-formation--reversed-rows .team-formation--front-row {
    grid-column: 1 / span 1;
  }
  .team-formation--front-row,
  .team-formation--reversed-rows .team-formation--back-row {
    grid-column: 2 / span 1;
  }
  .team-formation__gotchi {
    display: grid;
  }
  .team-formation__position--selected {
    position: relative;
    outline: 4px solid var(--c-light-yellow);
    outline-offset: -2px;
    /* this needs to render on top of any gotchi elements, but must not prevent interaction */
    z-index: 1;
    pointer-events: none;
  }
  .team-formation__no-team {
    grid-row: 1 / 7;
    grid-column: 1 / 3;
    display: grid;
    place-items: center;
  }


  .team-formation--horizontal {
    writing-mode: vertical-lr;
  }
  .team-formation--horizontal > .team-formation__position,
  .team-formation--horizontal > .team-formation__gotchi {
    writing-mode: lr-tb;
  }
  .team-formation--horizontal > .team-formation__row-header {
    rotate: 180deg;
    margin: 0;
    padding-left: 0.8rem;
    font-size: 0.75rem;
    letter-spacing: 0.0225rem;
  }
  /* Boost styles only defined for horizontal formation so far */
  .team-formation--horizontal > .team-formation__row-boost {
    --boost-bg-color: #FF5038;
    position: relative;
    writing-mode: lr;
    justify-self: center;
    margin-left: 0.75rem;
    padding: 0.75rem 0.3rem 0.5rem;
    background-color: var(--boost-bg-color);
    color: var(--c-white);
  }
  .team-formation--horizontal > .team-formation__row-boost::before {
    --boost-arrow-height: 0.5rem;
    content: '';
    position: absolute;
    left: calc(-1 * var(--boost-arrow-height) + 1px);
    top: calc(50% - var(--boost-arrow-height));
    height: var(--boost-arrow-height);
    border-right: var(--boost-arrow-height) solid var(--boost-bg-color);
    border-top: var(--boost-arrow-height) solid transparent;
    border-bottom: var(--boost-arrow-height) solid transparent;
  }
</style>