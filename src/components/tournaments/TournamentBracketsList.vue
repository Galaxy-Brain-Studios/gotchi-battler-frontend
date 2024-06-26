<script setup>
  import { computed } from 'vue'
  import SiteTable from '../common/SiteTable.vue'
  import BracketStatusBadge from './BracketStatusBadge.vue'

  const props = defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })

  const bracketsToDisplay = computed(() => props.tournament.brackets || [])
</script>

<template>
  <div
    v-if="!tournament?.brackets.length"
    class="brackets-list__empty"
  >
    No brackets in this tournament.
  </div>
  <template v-else>
    <div v-if="!bracketsToDisplay.length">
      No brackets found.
    </div>
    <SiteTable
      v-else
      variant="card"
    >
      <tbody>
        <tr
          v-for="bracket in bracketsToDisplay"
          :key="bracket.id"
          class="bracket"
          :class="{
            'bracket--is-finale': bracket.isFinale
          }"
        >
          <td>
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
            </div>
          </td>
          <td class="site-table--no-grow">
            <div class="bracket__status">
              <BracketStatusBadge
                :bracket="bracket"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </SiteTable>
  </template>
</template>

<style scoped>
  .brackets-list__empty {
    color: var(--c-white);
    font-size: 1.5rem;
  }
  .bracket {
    position: relative;
    text-transform: uppercase;
  }
  .bracket td {
    vertical-align: middle;
  }
  .bracket--is-finale {
    --site-table-card-border-color-rgb: var(--c-light-purple-rgb);
    --site-table-card-background-color-rgb: var(--c-medium-purple-rgb);
  }
  .bracket:hover {
    --site-table-card-border-color-opacity: 1;
    --site-table-card-background-color-opacity: 1;
  }
  .bracket:focus-within {
    --site-table-card-border-color-opacity: 1;
    --site-table-card-background-color-opacity: 1;
  }
  .bracket__primary {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .bracket__status {
    white-space: nowrap;
  }

  .bracket__icon {
    flex: none;
  }
  .bracket__icon {
    font-size: 2rem;
    line-height: 1.5rem;
  }
  .bracket__name {
    flex: 1 1 auto;
  }
  .bracket__name {
    font-size: 1rem;
    line-height: 1.125rem;
    letter-spacing: 0.03rem;
  }
  .bracket__status {
    display: flex;
    justify-content: flex-end;
  }
</style>