<script setup>
  import { formatDateTime } from '../../utils/date'
  import SiteIcon from '../common/SiteIcon.vue'

  defineProps({
    tournament: {
      type: Object,
      required: true
    }
  })
</script>

<template>
  <div>
    <section>
      <h2>Information</h2>
      <dl class="dl-reset">
        <dt>Tournament Name</dt>
        <dd class="word-break">{{ tournament.name }}</dd>

        <dt>Tournament Address</dt>
        <dd class="word-break">
          <a
            v-if="tournament.address"
            :href="`https://polygonscan.com/address/${encodeURIComponent(tournament.address)}`"
            target="_blank"
            class="tournament-overview__address-link link-reset link-reset--hover-underline"
          >
            {{ tournament.address }}
            <SiteIcon
              name="new-window"
              :width="0.8"
              :height="0.8"
            />
          </a>
        </dd>

        <dt>Registration Open</dt>
        <dd>{{ formatDateTime(tournament.registrationDate) }}</dd>

        <dt>Registration Close</dt>
        <dd>{{ formatDateTime(tournament.startDate) }}</dd>
      </dl>
    </section>

    <section>
      <h2>Rules</h2>
      <dl class="dl-reset">
        <dt>Bracket Type Name</dt>
        <dd>{{ tournament.isDoubleElim ? 'Double Elimination' : 'Single Elimination' }}</dd>

        <dt>Round Duration</dt>
        <dd>{{ tournament.roundDuration }} Hours</dd>

        <dt>Maximum Team BRS</dt>
        <dd>{{ tournament.maxTeamBrs || 'Unlimited' }}</dd>

        <dt>Maximum Gotchi BRS</dt>
        <dd>{{ tournament.maxGotchiBrs || 'Unlimited' }}</dd>

        <dt>Maximum Item Level</dt>
        <dd class="tournament-overview__max-item-level">{{ tournament.maxItemLevel || 'godlike' }}</dd>
      </dl>
    </section>
  </div>
</template>

<style scoped>
  section + section {
    margin-top: 2rem;
  }
  h2 {
    margin-top: 0;
    text-transform: uppercase;
  }
  dl {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    border: 1px solid var(--c-medium-blue);
  }
  
  dt, dd {
    border: 1px solid var(--c-medium-blue);
    padding: 1rem;
    background: rgba(var(--c-medium-blue-rgb), 0.35);
    line-height: 1.5rem;
  }
  dt {
    color: rgba(var(--c-white-rgb), 0.6);
  }
  dd {
    font-size: 1.25rem;
  }
  .tournament-overview__max-item-level {
    text-transform: capitalize;
  }
  .tournament-overview__address-link {
    display: inline-flex;
    align-items: center;
    column-gap: 0.5rem;
  }
  .tournament-overview__address-link > svg {
    flex: none;
  }
</style>