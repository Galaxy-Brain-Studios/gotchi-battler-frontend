<script setup>
  import { ref, computed, watch } from 'vue'
  import debounce from 'lodash.debounce'
  import orderBy from 'lodash.orderby'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import { useTournamentStore } from '../../data/tournamentStore'
  import SiteCheckbox from '../common/SiteCheckbox.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteTable from '../common/SiteTable.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import BattleDialog from '../battle/BattleDialog.vue'

  const props = defineProps({
    tournamentId: {
      type: Number,
      required: true
    }
  })

  const tournamentStore = useTournamentStore(props.tournamentId)()
  tournamentStore.fetchFullBrackets()
  const {
    tournament,
    fetchStatus: tournamentFetchStatus,
    fullBrackets,
    fullBracketsFetchStatus
  } = storeToRefs(tournamentStore)

  const store = useAccountStore()
  const { isConnected, address } = storeToRefs(store)

  const onlyShowMine = ref(false)
  const onlyShowCompleted = ref(false)

  const showWinners = ref(false)

  watch(
    () => isConnected.value,
    () => {
      if (isConnected.value) {
        // If user has just connected, enable onlyShowMine
        // If user has just disconnected, disable onlyShowMine
        onlyShowMine.value = !!isConnected.value
      }
    },
    { immediate: true }
  )

  const exactTeamName = ref('')

  const query = ref('')
  const debouncedQuery = ref('')
  function setQuery () {
    debouncedQuery.value = query.value
  }
  const debouncedSetQuery = debounce(setQuery, 200)

  const numToShow = ref(10)

  const myTeamIds = computed(() => {
    if (!isConnected.value || !address.value) { return [] }
    if (!tournament.value?.teams) { return [] }
    const addressLc = address.value.toLowerCase()
    return tournament.value.teams.filter(team => team.owner.toLowerCase() === addressLc).map(team => team.id)
  })

  const myTeamIdsLookup = computed(() => Object.fromEntries(Object.values(myTeamIds.value).map(id => [id, true])))

  const battles = computed(() => {
    if (!fullBrackets.value || !tournament.value) { return [] }
    const teamsById = Object.fromEntries(tournament.value.teams.map(team => [team.id, team]))
    const result = fullBrackets.value.map(bracket => {
      return bracket.rounds.map(round => {
        // Only return battles that have at least one team
        return round.battles.filter(b => b.team1Id || b.team2Id).map(battle => ({
          ...battle,
          team1Name: teamsById[battle.team1Id]?.name || '',
          team2Name: teamsById[battle.team2Id]?.name || '',
          bracketName: bracket.name,
          roundName: round.name,
          startDate: round.startDate
        }))
      }).flat()
    }).flat()
    return orderBy(result, ['startDate'], ['asc'])
  })

  const filteredBattles = computed(() => {
    if (!battles.value?.length) { return [] }
    let result = battles.value
    if (onlyShowCompleted.value) {
      result = result.filter(b => b.winnerId)
    }
    if (isConnected.value && onlyShowMine.value) {
      if (myTeamIds.value.length) {
        const myTeams = myTeamIds.value
        result = result.filter(({ team1Id, team2Id }) => team1Id && myTeams.includes(team1Id) || team2Id && myTeams.includes(team2Id))
      } else {
        result = []
      }
    }
    if (exactTeamName.value) {
      result = result.filter(battle => battle.team1Name === exactTeamName.value || battle.team2Name === exactTeamName.value)
    }
    if (query.value) {
      const q = query.value
      const qLower = q.toLowerCase()
      result = result.filter(battle => `${battle.code}` === q || `${battle.id}` === q || battle.team1Name.toLowerCase().includes(qLower) || battle.team2Name.toLowerCase().includes(qLower))
    }
    return result
  })
  const battlesToDisplay = computed(() => {
    if (!filteredBattles.value) { return null }
    return filteredBattles.value.slice(0, numToShow.value)
  })

  function loadMore () {
    numToShow.value += 10
  }
  const canLoadMore = computed(() => filteredBattles.value?.length > numToShow.value)


  const filterBattlesForTeam = function (teamName) {
    exactTeamName.value = teamName
    query.value = ''
  }


  const battleDialogIsOpen = ref(false)
  const displayBattle = ref(null)
  const showBattle = function (battle) {
    displayBattle.value = battle
    battleDialogIsOpen.value = true
  }
</script>

<template>
  <div>
    <div
      v-if="fullBracketsFetchStatus.loading || tournamentFetchStatus.loading"
      class="tournament-battles__loading"
    >
      Loading...
    </div>
    <div
      v-if="fullBracketsFetchStatus.error || tournamentFetchStatus.error"
      class="tournament-battles__error"
    >
      {{ fullBracketsFetchStatus.errorMessage || tournamentFetchStatus.errorMessage }}
    </div>
    <template v-else-if="fullBracketsFetchStatus.loaded && tournamentFetchStatus.loaded">
      <div
        v-if="!battles?.length"
        class="tournament-battles__empty"
      >
        No battles in this tournament.
      </div>
      <div v-else>
      <div class="tournament-battles__header">
        <SiteCheckbox
          v-if="isConnected"
          v-model="onlyShowMine"
        >
          My matches only
        </SiteCheckbox>
        <SiteCheckbox
          v-model="onlyShowCompleted"
        >
          Completed Battles only
        </SiteCheckbox>
        <SiteCheckbox
          v-model="showWinners"
        >
          Reveal Winners
        </SiteCheckbox>
        <div class="tournament-battles__search">
          <SiteTextField
            v-model="query"
            search
            subtle
            placeholder="Find Battle ID/Team name"
            class="tournament-battles__search-field"
            @input="debouncedSetQuery"
          />
        </div>
        <div
          v-if="exactTeamName"
          class="tournament-battles__exact-team-filter"
        >
          <span>
            Battles for: <b class="word-break">{{ exactTeamName }}</b>
          </span>
          <SiteButtonIcon
            label="Remove filter"
            iconName="close"
            @click="exactTeamName = ''"
          />
        </div>
      </div>
        <div
          v-if="!battlesToDisplay.length"
          class="tournament-battles__empty"
        >
          No battles found.
        </div>
        <SiteTable
          v-else
          variant="card"
          class="tournament-battles__table"
        >
          <thead>
            <tr>
              <th>
                <span>Round</span>
              </th>
              <th>
                <span>Bracket</span>
              </th>
              <th>
                <span>Team 1</span>
              </th>
              <th>
                <span>Team 2</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="battle in battlesToDisplay"
              :key="battle.id"
              class="battle-row"
            >
              <td class="battle-round">
                <a
                  href="#"
                  class="link-reset extended-target"
                  @click.prevent="showBattle(battle)"
                >
                  {{ battle.roundName }}
                </a>
              </td>
              <td>
                {{ battle.bracketName }}
              </td>
              <td
                class="word-break battle-team"
                :class="{
                  'battle-team--winner': showWinners && battle.winnerId && (battle.winnerId === battle.team1Id),
                  'battle-team--mine': myTeamIdsLookup[battle.team1Id]
                }"
              >
                <a
                  href="#"
                  class="battle-team-name link-reset link-reset--hover-underline"
                  @click.prevent="filterBattlesForTeam(battle.team1Name)"
                >
                  {{ battle.team1Name }}
                </a>
              </td>
              <td
                class="word-break battle-team"
                :class="{
                  'battle-team--winner': showWinners && battle.winnerId && (battle.winnerId === battle.team2Id),
                  'battle-team--mine': myTeamIdsLookup[battle.team2Id]
                }"
              >
                <a
                  href="#"
                  class="battle-team-name link-reset link-reset--hover-underline"
                  @click.prevent="filterBattlesForTeam(battle.team2Name)"
                >
                  {{ battle.team2Name }}
                </a>
              </td>
            </tr>
          </tbody>
        </SiteTable>
        <div class="tournament-battles__footer">
          <SiteButton
            v-if="canLoadMore"
            @click="loadMore"
          >
            Load More Battles
          </SiteButton>
        </div>
        <BattleDialog
          v-if="displayBattle"
          :key="displayBattle.id"
          v-model:isOpen="battleDialogIsOpen"
          :id="displayBattle.id"
          :startDate="displayBattle.startDate"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.tournament-battles__empty {
  color: var(--c-white);
  font-size: 1.5rem;
}
.tournament-battles__header {
  margin-bottom: 1.75rem;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}
.tournament-battles__search-field {
  flex: none;
}

.tournament-battles__exact-team-filter {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.tournament-battles__footer {
  display: grid;
  place-items: center;
}

.battle-row {
  position: relative;
}
.battle-row:hover {
  --site-table-card-border-color-opacity: 1;
  --site-table-card-background-color-opacity: 1;
}
.battle-row:has(a:focus-visible) {
  --site-table-card-border-color-opacity: 1;
  --site-table-card-background-color-opacity: 1;
}

.battle-round {
  white-space: nowrap;
}
.battle-team--mine {
  color: var(--c-bright-yellow);
}
.battle-team--winner {
  font-weight: bold;
}
.battle-team--winner::before {
  content: '🥇';
  margin-right: 0.25rem;
  font-size: 1.25rem;
}
.battle-team-name {
  position: relative;
  z-index: 1;
}
</style>