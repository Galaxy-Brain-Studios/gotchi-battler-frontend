<script setup>
  import { storeToRefs } from 'pinia'
  import { useBattleStore } from '../../data/battleStore'
  import { formatDateTime } from '../../utils/date'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteButtonWhiteLink from '../common/SiteButtonWhiteLink.vue'
  import BattleField from './BattleField.vue'

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: null
    },
    startDate: {
      type: Object,
      default: null
    }
  })

  const store = useBattleStore(props.id)()
  const { battle, fetchStatus } = storeToRefs(store)
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="large"
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <template #header="{ dialogTitleId }">
      <div class="battle__dialog-header">
        <h1
          :id="dialogTitleId"
          class="battle__title"
        >
          🏆 Tournament
          Match #{{ id }}
        </h1>
        <div class="battle__date">
          <template v-if="battle?.status !== 'completed'">
            Starting
          </template>
          <template v-else>
            Started
          </template>
          <template v-if="startDate">
            {{ formatDateTime(startDate) }}
          </template>
          <template v-else>
            (Unknown Date)
          </template>
        </div>
        <div
          v-if="battle?.winnerId"
          class="battle__link-analyser"
        >
          <SiteButtonWhiteLink
            :to="{ name: 'analyser', params: { id } }"
            target="_blank"
          >
            <div class="battle__link-analyser-content">
              Analytics
              <SiteIcon name="new-window" />
            </div>
          </SiteButtonWhiteLink>
        </div>
      </div>
    </template>
    <div
      v-if="fetchStatus.loading"
      class="battle__loading"
    >
      Loading...
    </div>
    <div
      v-if="fetchStatus.error"
      class="battle__error"
    >
      {{ fetchStatus.errorMessage }}
    </div>
    <template v-else-if="fetchStatus.loaded">
      <BattleField
        :battle="battle"
      />
    </template>
  </SiteDialog>
</template>

<style scoped>
  .battle__dialog-header {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    justify-content: flex-start;
  }
  .battle__title,
  .battle__date {
    flex: 0 1 auto;
  }
  .battle__link-analyser {
    flex: none;
  }

  .battle__title {
    color: var(--c-bright-yellow);
    font-size: 1.5rem;
    line-height: 2rem;
    letter-spacing: 0.045rem;
  }
  .battle__date {
    line-height: 1.5rem;
    color: var(--c-medium-pink);
  }
  .battle__link-analyser-content {
    display: flex;
    align-items: center;
    column-gap: 0.5rem;
    text-transform: none;
  }
</style>