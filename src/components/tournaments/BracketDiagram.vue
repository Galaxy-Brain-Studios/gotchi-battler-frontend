<script setup>
  import { hierarchy, tree } from 'd3-hierarchy'
  import { ref, computed, watch } from 'vue'
  import { RouterLink } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import { formatRelativeDateTime, formatDateTime } from '../../utils/date'
  import useHorizontalDragScroll from '../../utils/useHorizontalDragScroll'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteButtonSmall from '../common/SiteButtonSmall.vue'

  const props = defineProps({
    tournamentId: {
      type: String,
      required: true
    },
    bracketId: {
      type: [String, Number],
      required: true
    },
    rounds: {
      type: Array,
      required: true
    },
    teams: {
      type: Array,
      required: true
    }
  })

  const accountStore = useAccountStore()
  const { isConnected, address } = storeToRefs(accountStore)

  const revealedRoundIndex = ref(null)

  const getRevealedRoundIndexKey = function({ tournamentId, bracketId }) {
    return `revealedRoundIndex__${tournamentId}__${bracketId}`
  }
  // Initialize revealedRoundIndex for the bracket
  watch(
    () => ({ tournamentId: props.tournamentId, bracketId: props.bracketId }),
    subject => {
      const key = getRevealedRoundIndexKey(subject)
      const storedIndexString = localStorage.getItem(key)
      revealedRoundIndex.value = storedIndexString ? (storedIndexString - 0) : null
    },
    { immediate: true }
  )
  // Store revealedRoundIndex for later
  watch(
    () => revealedRoundIndex.value,
    newIndex => {
      const key = getRevealedRoundIndexKey({ tournamentId: props.tournamentId, bracketId: props.bracketId })
      if (newIndex) {
        localStorage.setItem(key,`${newIndex}`)
      } else {
        localStorage.removeItem(key)
      }
    }
  )

  const revealRound = function (roundIndex) {
    revealedRoundIndex.value = roundIndex
  }
  const revealFinalRound = function () {
    revealedRoundIndex.value = props.rounds.length
  }

  const roundIdsWithRevealedTeams = computed(() => {
    let revealToIndex = revealedRoundIndex.value || 0
    return props.rounds.slice(0, revealToIndex + 1).map(round => round.id)
  })
  const roundIdsWithRevealedWinners = computed(() => {
    // We only want to reveal winners up to (but not including) the revealedRoundIndex
    let revealToIndex = revealedRoundIndex.value
    if (revealToIndex) {
      return props.rounds.slice(0, revealToIndex).map(round => round.id)
    }
    return []
  })

  const container = ref(null)
  useHorizontalDragScroll(container)

  // set up tree dimensions (will be used as rems)
  const NODE_WIDTH = 20
  const NODE_HEIGHT = 5
  const NODE_GAP_X = 3
  const NODE_GAP_Y = 0.5

  const teamsById = computed(() => Object.fromEntries(props.teams.map(team => [team.id, team])))

  const treeResult = computed(() => {
    if (!props.rounds?.[0]?.battles?.length) { return null }
    // construct the tree from the 'root' node i.e. the final round
    const battleNodesById = {}
    for (const round of props.rounds) {
      const hasRevealedTeams = roundIdsWithRevealedTeams.value.includes(round.id)
      const hasRevealedWinners = roundIdsWithRevealedWinners.value.includes(round.id)
      for (const battle of round.battles) {
        battleNodesById[battle.id] = {
          id: battle.id,
          fromBattles: battle.fromBattles,
          teams: hasRevealedTeams && [battle.team1Id, battle.team2Id].map(teamId => (teamId && {
            id: teamId,
            name: teamsById.value[teamId]?.name,
            owner: teamsById.value[teamId]?.owner
          } || null)),
          hasATeam: (battle.team1Id !== null),
          isBye: (battle.winnerId !== null) && ((battle.team1Id !== null && battle.team2Id === null) || (battle.team1Id === null && battle.team2Id !== null)),
          winner: hasRevealedWinners ? battle.winnerId : null,
          round,
          children: []
        }
      }
    }
    const battles = Object.values(battleNodesById)
    for (const battle of battles) {
      for (const fromBattleId of battle.fromBattles) {
        if (fromBattleId && battleNodesById[fromBattleId]) {
          battle.children.push(battleNodesById[fromBattleId])
        }
      }
    }
    const rootNodes = props.rounds[props.rounds.length - 1].battles.map(battle => battleNodesById[battle.id]);
    if (rootNodes.length !== 1) {
      console.log('Unexpected round structure: expected a tree with a single root node but found', { rootNodes })
    }
    rootNodes[0].isFinale = true
    const dataForTree = hierarchy(rootNodes[0])
    const configuredTree = tree()
      .nodeSize([NODE_HEIGHT + NODE_GAP_Y, NODE_WIDTH + NODE_GAP_X]) // reverse height and width because we will be rotating the tree
      .separation((a, b) => {
        // controls vertical space between nodes. https://d3js.org/d3-hierarchy/tree#tree_separation
        return a.parent === b.parent ? 1 : 1.1
      })
    const treeWithPositions = configuredTree(dataForTree)
    const allNodes = treeWithPositions.descendants()

    // tree is generated with the root at the bottom middle, and leaves along the top.
    // we want the root on the right middle, and the leaves down the left side.
    // The d3 tree also treats the bottom-middle root as 0,0
    // but we want a 0,0 origin.

    const xs = allNodes.map(node => node.x)
    const ys = allNodes.map(node => node.y)
    const maxX = Math.max(...xs)
    const minX = Math.min(...xs)
    const maxY = Math.max(...ys)
    const minY = Math.min(...ys)
    for (const node of allNodes) {
      node.displayX = -node.y + maxY
      node.displayY = node.x - minX
    }

    const nodesById = Object.fromEntries(allNodes.map(node => [node.data.id, node]))
    const connectors = []
    for (const node of allNodes) {
      for (const fromBattleId of node.data.fromBattles) {
        if (fromBattleId && nodesById[fromBattleId]) {
          const fromNode = nodesById[fromBattleId]
          const fromY = fromNode.displayY + NODE_HEIGHT / 2
          const toY = node.displayY + NODE_HEIGHT / 2
          const startY = Math.min(fromY, toY)
          const endY = Math.max(fromY, toY)
          const startX = fromNode.displayX + NODE_WIDTH
          const endX = node.displayX
          connectors.push({
            id: `${fromNode.data.id}--${node.data.id}`,
            status: fromNode.data.round.status,
            round: fromNode.data.round,
            startX,
            startY,
            width: Math.abs(startX - endX),
            height: Math.abs(startY - endY),
            fromTop: fromY < toY
          })
        }
      }
    }

    const roundPositions = {}
    for (const round of props.rounds) {
      const battle = round.battles[0]
      if (battle) {
        const node = nodesById[battle.id]
        roundPositions[round.id] = {
          displayX: node.displayX
        }
      }
    }

    return {
      nodes: allNodes,
      connectors,
      width: maxY - minY + NODE_WIDTH,
      height: maxX - minX + NODE_HEIGHT,
      roundPositions
    }
  })

  function getRoundNumberText (i) {
    let j = i % 10,
        k = i % 100;
    if (j == 1 && k != 11) {
        return i + 'st';
    }
    if (j == 2 && k != 12) {
        return i + 'nd';
    }
    if (j == 3 && k != 13) {
        return i + 'rd';
    }
    return i + 'th';
  }

  const nowDate = Date.now()
  function isFutureDate (date) {
    return date > nowDate
  }
</script>

<template>
  <div
    v-if="treeResult"
    ref="container"
    class="bracket-diagram"
    :style="{
      '--bd-tree-node-width': `${NODE_WIDTH}rem`,
      '--bd-tree-node-height': `${NODE_HEIGHT}rem`,
    }"
  >
    <div class="bracket-diagram__rounds">
      <div
        v-for="(round, index) in rounds"
        :key="round.id"
        class="bracket-diagram__round"
        :class="{
          [`bracket-diagram__round--status-${round.status}`]: true
        }"
        :style="{
          '--bd-round-display-x': `${treeResult.roundPositions[round.id]?.displayX}rem`,
        }"
      >
        <div class="bracket-diagram__round-name">
          {{ round.name }}
        </div>
        <div style="display: flex; column-gap: 1rem">
          <div
            v-if="round.startDate"
            class="bracket-diagram__round-status"
          >
            <template v-if="round.status === 'completed'">
              Finished
            </template>
            <template v-else-if="isFutureDate(round.startDate)">
              Starting in {{ formatRelativeDateTime(round.startDate) }}
            </template>
            <template v-else>
              Start: {{ formatDateTime(round.startDate) }}
            </template>
          </div>
          <div>
            <SiteButtonSmall
              v-if="index > 0 && round.status === 'completed' && !roundIdsWithRevealedTeams.includes(round.id)"
              @click="revealRound(index)"
            >
              Show
            </SiteButtonSmall>
          </div>
        </div>
      </div>
    </div>
    <div
      class="bracket-diagram__tree"
      :style="{
        '--bd-tree-width': `${treeResult.width}rem`,
        '--bd-tree-height': `${treeResult.height}rem`
      }"
    >
      <div
        v-for="node in treeResult.nodes"
        :key="node.data.id"
        class="bracket-diagram__tree-node"
        :class="{
          [`bracket-diagram__tree-node--status-${node.data.round.status}`]: true,
          'bracket-diagram__tree-node--winner-hidden': node.data.round.status === 'completed' && !roundIdsWithRevealedWinners.includes(node.data.round.id),
          'bracket-diagram__tree-node--clickable': !node.data.isBye
        }"
        :style="{
          '--bd-tree-node-display-x': `${node.displayX}rem`,
          '--bd-tree-node-display-y': `${node.displayY}rem`,
          '--bd-tree-node-x': `${-node.x}rem`,
          '--bd-tree-node-y': `${-node.y}rem`
        }"
      >
        <div
          v-if="!node.data.isBye"
          class="bracket-diagram__battle-id"
        >
          <RouterLink
            :to="{ name: 'tournament-bracket', params: { id: tournamentId, bracketId, battleId: node.data.id } }"
            class="link-reset link-reset--hover-underline extended-target"
            @click="node.data.isFinale && node.data.round.status === 'completed' && revealFinalRound()"
          >
            {{ node.data.id?.substring(0, 6) }}
          </RouterLink>
        </div>
        <div
          v-for="(team, index) in node.data.teams"
          :key="`${node.data.id}_team${index}`"
          class="bracket-diagram__team"
          :class="{
            'bracket-diagram__team--empty': !team,
            'bracket-diagram__team--winner': node.data.winner && team ? team.id === node.data.winner : false,
            'bracket-diagram__team--loser': node.data.winner && team ? team.id !== node.data.winner : false
          }"
        >
          <SiteIcon
            v-if="isConnected && address && team?.owner === address"
            name="star"
            aria-label="(My team)"
          />
          <div class="bracket-diagram__team-name">{{ team?.name || (node.data.hasATeam ? '-' : '?') }}</div>
        </div>
      </div>
      <div
        v-for="connector in treeResult.connectors"
        :key="connector.id"
        class="bracket-diagram__connector"
        :class="{
          [`bracket-diagram__connector--status-${connector.status}`]: true,
          'bracket-diagram__connector--winner-hidden': connector.round.status === 'completed' && !roundIdsWithRevealedWinners.includes(connector.round.id),
          'bracket-diagram__connector--from-top': connector.fromTop,
          'bracket-diagram__connector--from-bottom': !connector.fromTop
        }"
        :style="{
          '--bd-connector-start-x': `${connector.startX}rem`,
          '--bd-connector-start-y': `${connector.startY}rem`,
          '--bd-connector-height': `${connector.height}rem`,
          '--bd-connector-width': `${connector.width}rem`
        }"
      />
    </div>
  </div>
</template>

<style scoped>
  /* scrolling container */
  .bracket-diagram {
    max-width: 100%;
    overflow: auto;
    padding-bottom: 2em;
    user-select: none;
    cursor: grab;
  }

  /* positioning */
  .bracket-diagram__rounds {
    position: relative;
  }
  .bracket-diagram__round:not(:first-child) {
    position: absolute;
    top: 0;
    left: var(--bd-round-display-x);
    width: var(--bd-tree-node-width);
  }

  .bracket-diagram__tree,
  .bracket-diagram__tree *,
  .bracket-diagram__tree *::before,
  .bracket-diagram__tree *::after  {
    box-sizing: border-box;
  }

  .bracket-diagram__tree {
    margin-top: 2em;
    position: relative;
    width: var(--bd-tree-width);
    height: var(--bd-tree-height);
  }
  .bracket-diagram__tree-node {
    position: absolute;
    left: var(--bd-tree-node-display-x);
    top: var(--bd-tree-node-display-y);
    width: var(--bd-tree-node-width);
    height: var(--bd-tree-node-height);
    border: 3px solid white;
  }

  .bracket-diagram__connector {
    position: absolute;
    left: var(--bd-connector-start-x);
    top: var(--bd-connector-start-y);
    width: calc(var(--bd-connector-width) /  2);
    height: calc(var(--bd-connector-height));
    border-right: 3px solid var(--bd-color-border);
  }
  .bracket-diagram__connector--from-top {
    border-top: 3px solid var(--bd-color-border);
  }
  .bracket-diagram__connector--from-bottom {
    border-bottom: 3px solid var(--bd-color-border);
  }
  .bracket-diagram__connector::after {
    content: '';
    display: block;
    position: absolute;
    left: calc(var(--bd-connector-width) /  2);
    width: calc(var(--bd-connector-width) /  2);
    height: 3px;
    background: var(--bd-color-border);
  }
  .bracket-diagram__connector--from-top::after {
    top: 100%;
  }
  .bracket-diagram__connector--from-bottom::after {
    top: 0;
  }
  .bracket-diagram__connector--from-top + .bracket-diagram__connector--from-bottom::after {
    display: none;
  }

  /* styling */
  .bracket-diagram__tree-node--clickable:hover {
    --bd-color-border-opacity: 1;
    --bd-color-background-opacity: 1;
  }
  .bracket-diagram__tree-node--clickable:focus-within {
    --bd-color-border-opacity: 1;
    --bd-color-background-opacity: 1;
  }
  .bracket-diagram__tree-node--status-completed,
  .bracket-diagram__connector--status-completed {
    --bd-color-border-opacity: 0.5;
    --bd-color-background-opacity: 0.5;
    --bd-color-border: rgba(var(--c-light-blue-rgb), var(--bd-color-border-opacity));
    --bd-color-background: rgba(var(--c-medium-blue-rgb), var(--bd-color-background-opacity));
  }
  .bracket-diagram__tree-node--status-started,
  .bracket-diagram__connector--status-started,
  .bracket-diagram__tree-node--winner-hidden,
  .bracket-diagram__connector--winner-hidden {
    --bd-color-border-opacity: 0.7;
    --bd-color-background-opacity: 0.7;
    --bd-color-border: rgba(var(--c-light-yellow-rgb), var(--bd-color-border-opacity));
    --bd-color-background: rgba(var(--c-medium-yellow-rgb), var(--bd-color-background-opacity));
    --bd-color-text-on-border: #332383;
  }
  .bracket-diagram__tree-node--status-upcoming,
  .bracket-diagram__connector--status-upcoming {
    --bd-color-border-opacity: 0.6;
    --bd-color-background-opacity: 0.6;
    --bd-color-border: rgba(var(--c-light-purple-rgb), var(--bd-color-border-opacity));
    --bd-color-background: rgba(var(--c-medium-purple-rgb), var(--bd-color-background-opacity));
  }

  .bracket-diagram__tree-node {
    border: 3px solid var(--bd-color-border);
    background-color: var(--bd-color-background);
    padding: 0.7rem 1rem;
  }
  .bracket-diagram__battle-id {
    float: right;
    margin-top: -0.7rem;
    margin-right: -1rem;
    padding: 0.3rem 0.5rem;
    background-color: var(--bd-color-border);
    color: var(--bd-color-text-on-border, var(--c-white));
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .bracket-diagram__team {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  .bracket-diagram__team-name {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 1rem;
    line-height: 1.5rem;
  }
  .bracket-diagram__battle-id + .bracket-diagram__battle-id {
    margin-top: 0.25rem;
  }
  .bracket-diagram__team--empty {
    color: var(--bd-color-border);
  }
  .bracket-diagram__team--winner {
    font-weight: bold;
  }
  .bracket-diagram__team--loser {
    opacity: 0.6;
    text-decoration: line-through;
  }

  .bracket-diagram__round-name {
    margin-bottom: 0.5rem;
    font-size: 2rem;
    line-height: 2.5rem;
  }
  .bracket-diagram__round-status {
    font-size: 1.125rem;
    line-height: 1.5rem;
  }
  .bracket-diagram__round--status-completed {
    opacity: 0.6;
  }
  .bracket-diagram__round--status-active .bracket-diagram__round-name {
    font-weight: bold;
  }
  .bracket-diagram__round--status-upcoming {
    opacity: 0.5;
  }
  .bracket-diagram__round--status-upcoming .bracket-diagram__round-name {
    color: var(--c-light-purple);
  }
</style>