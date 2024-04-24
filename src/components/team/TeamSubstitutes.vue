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
    }
  })

  const gotchisById = computed(() => {
    if (!props.team?.gotchis) { return {} }
    return Object.fromEntries(props.team.gotchis.map(gotchi => [gotchi.id, gotchi]))
  })

  const gotchisInSubstitutes = computed(() => {
    if (!props.team?.formation) { return null }
    return (props.team.formation.substitutes || []).map((gotchiId, index) => ({
      position: index + 1,
      gotchi: gotchisById.value[gotchiId]
    })).filter(entry => !!entry.gotchi)
  })

  const selectedGotchiPosition = computed(() => {
    if (!gotchisInSubstitutes.value || !props.selectedGotchiId) { return null }
    return gotchisInSubstitutes.value.find(item => item.gotchi.id === props.selectedGotchiId)
  })
</script>

<template>
  <section
    class="team-substitutes"
    aria-label="Substitutes"
  >
    <div
      class="team-substitutes__row-header"
    >
      Substitutes
    </div>
    <div
      v-for="n in 2"
      :key="n"
      class="team-substitutes__position"
      :style="{
        '--team-substitutes-position': n
      }"
    >
      <slot
        name="position"
        :position="n"
      />
    </div>
    <div
      v-for="entry in gotchisInSubstitutes"
      :key="entry.gotchi.id"
      class="team-substitutes__gotchi"
      :style="{
        '--team-substitutes-position': entry.position
      }"
    >
      <slot
        name="gotchi"
        :gotchi="gotchisById[entry.gotchi.id]"
        :position="entry.position"
      />
    </div>
    <div
      v-if="selectedGotchiPosition"
      class="team-substitutes__position team-substitutes__position--selected"
      :style="{
        '--team-substitutes-position': selectedGotchiPosition.position
      }"
    />
  </section>
</template>

<style scoped>
  .team-substitutes {
    margin: 1px;
    display: grid;
    grid-template-columns: auto repeat(2, auto);
    max-width: fit-content;
  }

  .team-substitutes__row-header {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
    margin-bottom: 1rem;
    text-align: center;
    font-size: 1rem;
    line-height: 1rem;
    letter-spacing: 0.03rem;
    opacity: 0.6;
    text-transform: uppercase;
  }
  .team-substitutes__position {
    outline: 2px solid var(--c-black);
    outline-offset: -1px;
    min-height: 6.25rem;
  }
  .team-substitutes__position,
  .team-substitutes__gotchi {
    position: relative;
    padding: 1px;
    grid-row: 1 / 2;
    grid-column: calc(var(--team-substitutes-position) + 1) / span 1;
  }
  .team-substitutes__gotchi {
    display: grid;
  }
  .team-substitutes__position--selected {
    position: relative;
    outline: 4px solid var(--c-light-yellow);
    outline-offset: -2px;
    /* this needs to render on top of any gotchi elements, but must not prevent interaction */
    z-index: 1;
    pointer-events: none;
  }

  .team-substitutes__row-header {
    writing-mode: vertical-lr;
    rotate: 180deg;
    margin: 0;
    padding-left: 0.8rem;
    font-size: 0.75rem;
    letter-spacing: 0.0225rem;
  }
</style>