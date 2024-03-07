<script setup>
  import { computed } from 'vue'

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
    reverseRows: {
      type: Boolean,
      default: false
    },
    horizontal: {
      type: Boolean,
      default: false
    }
  })

  const gotchisById = computed(() => {
    if (!props.team?.gotchis) { return {} }
    return Object.fromEntries(props.team.gotchis.map(gotchi => [gotchi.id, gotchi]))
  })

  const gotchisInFormation = computed(() => {
    if (!props.team?.formation) { return null }
    return [
      ...props.team.formation.back.map((gotchiId, index) => ({
        row: 'back',
        position: index + 1,
        gotchi: gotchisById.value[gotchiId]
      })),
      ...props.team.formation.front.map((gotchiId, index) => ({
        row: 'front',
        position: index + 1,
        gotchi: gotchisById.value[gotchiId]
      })),
    ].filter(entry => !!entry.gotchi)
  })

  const selectedGotchiPosition = computed(() => {
    if (!gotchisInFormation.value || !props.selectedGotchiId) { return null }
    return gotchisInFormation.value.find(item => item.gotchi.id === props.selectedGotchiId)
  })

  const rowLabels = computed(() => {
    if (props.reverseRows) { return ['Front', 'Back'] }
    return ['Back', 'Front']
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
        :gotchi="gotchisById[entry.gotchi.id]"
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
    font-size: 0.875rem;
    letter-spacing: 0.02625rem;
  }
</style>