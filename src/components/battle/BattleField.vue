<script setup>
  import { computed } from 'vue'
  import BattleUnityPlayer from './BattleUnityPlayer.vue'
  import TeamFormation from '../team/TeamFormation.vue'
  import GotchiInFormation from '../team/GotchiInFormation.vue'
  import BattleVs from './BattleVs.vue'

  const props = defineProps({
    battle: {
      type: Object,
      default: null
    },
    emptyTeam1Name: {
      type: String,
      default: 'Unknown'
    },
    emptyTeam2Name: {
      type: String,
      default: 'Unknown'
    },
    showResult: {
      type: Boolean,
      default: false
    }
  })

  const team1 = computed(() => props.battle?.teams[0])
  const team2 = computed(() => props.battle?.teams[1])
  const battleLogsUrl = computed(() => props.battle?.logs ? props.battle.logs : null )

  const battleIsCompleted = computed(() => !!props.battle?.winnerId)
  const showTeam1Winner = computed(() => props.showResult && battleIsCompleted.value && props.battle.winnerId === team1.value?.id)
  const showTeam2Winner = computed(() => props.showResult && battleIsCompleted.value && props.battle.winnerId === team2.value?.id)
  const showTeam1Loser = computed(() => showTeam2Winner.value)
  const showTeam2Loser = computed(() => showTeam1Winner.value)
</script>

<template>
  <div
    v-if="battle"
    class="battle__field-container"
  >
    <div
      class="battle__teams-header"
      :class="{
        'battle__teams-header--with-before-slots': $slots['before-team-1'] || $slots['before-team-2']
      }"
    >
      <div
        v-if="$slots['before-team-1'] || $slots['before-team-2']"
        class="battle__before-team-formation"
      >
        <slot name="before-team-1"></slot>
      </div>
      <div
        class="battle__team-name word-break"
        :class="{
          'battle__team-name--na': !team1
        }"
      >
        <span
          v-if="showTeam1Winner"
          class="battle__team-name-icon"
        >
          🏆
        </span>
        {{ team1?.name || emptyTeam1Name }}
        <div
          v-if="showTeam1Winner || showTeam1Loser"
          class="battle__team-name-suffix"
        >
          ({{ showTeam1Winner ? 'Winner' : 'Loser' }})
        </div>
      </div>
      <BattleVs
        class="battle__teams-vs"
        :style="{
          visibility: team1 && team2 ? 'visible' : 'hidden'
        }"
      />
      <div
        class="battle__team-name word-break"
        :class="{
          'battle__team-name--na': !team2
        }"
      >
        <span
          v-if="showTeam2Winner"
          class="battle__team-name-icon"
        >
          🏆
        </span>
        {{ team2?.name || emptyTeam2Name }}
        <div
          v-if="showTeam2Winner || showTeam2Loser"
          class="battle__team-name-suffix"
        >
          ({{ showTeam2Winner ? 'Winner' : 'Loser' }})
        </div>
      </div>
      <div
        v-if="$slots['before-team-1'] || $slots['before-team-2']"
        class="battle__before-team-formation"
      >
        <slot name="before-team-2"></slot>
      </div>
    </div>

    <div class="battle__field">
      <div class="battle__team-formation">
        <TeamFormation
          :team="team1"
        >
          <template #position>
            <GotchiInFormation
              emptyMode="blank"
              variant="small"
            />
          </template>
          <template #gotchi="{ gotchi }">
            <GotchiInFormation
              :gotchi="gotchi"
              :isLeader="gotchi.id === team1.leader"
              :teamId="team1.id"
              variant="small"
              withStatsPopup
              withSpecialInfoBadge
            />
          </template>
          <template #no-team>
            <slot name="empty-team-1" />
          </template>
        </TeamFormation>
      </div>
      <div
        class="battle__display"
        :class="{
          'battle__display--not-ready': !battleLogsUrl
        }"
      >
        <template v-if="!battleLogsUrl">
          <slot name="not-started">
            Result not available yet
          </slot>
        </template>
        <BattleUnityPlayer
          v-else
          :logsUrl="battleLogsUrl"
        />
      </div>
      <div class="battle__team-formation">
        <TeamFormation
          :team="team2"
          reverseRows
        >
          <template #position>
            <GotchiInFormation
              emptyMode="blank"
              variant="small"
            />
          </template>
          <template #gotchi="{ gotchi }">
            <GotchiInFormation
              :gotchi="gotchi"
              :isLeader="gotchi.id === team2.leader"
              :teamId="team2.id"
              variant="small"
              withStatsPopup
              withSpecialInfoBadge
            />
          </template>
          <template #no-team>
            <slot name="empty-team-2" />
          </template>
        </TeamFormation>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .battle__teams-header {
    margin-top: 0.5rem;
    margin-bottom: 1.8rem;

    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    gap: 1.5rem;
    align-items: center;
  }
  .battle__teams-header--with-before-slots {
    grid-template-columns: 12.5rem minmax(0, 1fr) auto minmax(0, 1fr) 12.5rem;
  }
  .battle__team-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: right;

    font-size: 1.5rem;
    line-height: 1.75rem;
    letter-spacing: 0.045rem;
    font-weight: bold;
  }
  .battle__team-name--na {
    color: var(--c-black);
  }
  .battle__teams-vs + .battle__team-name {
    text-align: left;
  }
  .battle__team-name-icon {
    margin-right: 0.75rem;
  }
  .battle__team-name-suffix {
    font-size: 1.25rem;
    line-height: 1.5rem;
    font-weight: normal;
  }


  .battle__field {
    min-height: 31.375rem;
    display: grid;
    grid-template-columns: minmax(12.5rem, max-content) 1fr minmax(12.5rem, max-content);
    column-gap: 1rem;
  }
  .battle__display {
    /* don't use flex or grid display for centering here because then the unity player doesn't grow when width increases. */
  }
  .battle__display--not-ready {
    display: grid;
    place-items: center;
    background: radial-gradient(50% 50.00% at 50% 50.00%, #421F89 0%, #150B4D 100%);
    font-size: 1.5rem;
  }

</style>