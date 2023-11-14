<script setup>
  import BracketStatusBadge from './BracketStatusBadge.vue'

  defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })
</script>

<template>
  <div
    v-if="!tournament?.brackets.length"
    class="brackets-list__empty"
  >
    No brackets in this tournament.
  </div>
  <ol
    v-else
    class="brackets-list list-reset"
  >
    <li
      v-for="bracket in tournament.brackets"
      :key="bracket.id"
      class="bracket"
      :class="{
        'bracket--is-finale': bracket.isFinale
      }"
    >
      <div class="bracket__primary">
        <div
          v-if="bracket.isFinale"
          class="bracket__icon"
        >
          🏆
        </div>
        <div class="bracket__name word-break">
          <RouterLink
            :to="{ name: 'tournament-bracket', params: { id: tournament.id, bracketId: bracket.id } }"
            class="extended-target link-reset link-reset--hover-underline"
          >
            {{ bracket.name }}
          </RouterLink>
        </div>
        <BracketStatusBadge
          :bracket="bracket"
        />
      </div>
      <div class="bracket__secondary">
        <div class="bracket__num-teams">
          {{ bracket.numberOfTeams }}
          {{ bracket.numberOfTeams === 1 ? 'Entrant' : 'Entrants' }}
        </div>
        <div
          v-if="bracket.rules"
          class="bracket__rules word-break"
        >
          {{ bracket.rules }}
        </div>
      </div>
    </li>
  </ol>
</template>

<style scoped>
  .brackets-list__empty {
    color: var(--c-white);
    font-size: 1.5rem;
  }
  .brackets-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  .bracket {
    position: relative;
    --bracket-color-border-opacity: 0.5;
    --bracket-color-background-opacity: 0.5;
    --bracket-color-border-rgb: var(--c-light-blue-rgb);
    --bracket-color-background-rgb: var(--c-medium-blue-rgb);
    --bracket-color-border: rgba(var(--bracket-color-border-rgb), var(--bracket-color-border-opacity));
    --bracket-color-background: rgba(var(--bracket-color-background-rgb), var(--bracket-color-background-opacity));
  }
  .bracket:hover {
    --bracket-color-border-opacity: 1;
    --bracket-color-background-opacity: 1;
  }
  .bracket:focus-within {
    --bracket-color-border-opacity: 1;
    --bracket-color-background-opacity: 1;
  }
  .bracket,
  .bracket__primary,
  .bracket__secondary {
    display: flex;
    align-items: center;
  }
  .bracket,
  .bracket__secondary  {
    gap: 1.5rem;
  }
  .bracket__primary{
    gap: 1rem;
  }
  .bracket {
    justify-content: space-between;
    border: 3px solid var(--bracket-color-border);
    padding: 1.5rem;
    background-color: var(--bracket-color-background);
    text-transform: uppercase;
  }
  .bracket--is-finale {
    --bracket-color-border-rgb: var(--c-light-purple-rgb);
    --bracket-color-background-rgb: var(--c-medium-purple-rgb);
  }
  .bracket__icon,
  .bracket__status,
  .bracket__num-teams {
    flex: none;
  }
  .bracket__icon {
    font-size: 2rem;
    line-height: 1.5rem;
  }
  .bracket__name,
  .bracket__rules {
    flex: 1 1 auto;
  }
  .bracket__name {
    font-size: 1.125rem;
    line-height: 1.5rem;
    letter-spacing: 0.03375rem;
  }
  .bracket__secondary {
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
    opacity: 0.6;
  }
</style>