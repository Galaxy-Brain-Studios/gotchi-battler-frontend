<script setup>
  import { hierarchy, tree } from 'd3-hierarchy'
  import { ref, computed, watch } from 'vue'
  import { RouterLink } from 'vue-router'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import { formatRelativeDateTime, formatDateTime } from '../../utils/date'
  import useHorizontalDragScroll from '../../utils/useHorizontalDragScroll'
  import SiteButtonWhite from '../common/SiteButtonWhite.vue'
  import SiteButtonWhiteBox from '../common/SiteButtonWhiteBox.vue'
  import SiteButtonIcon from '../common/SiteButtonIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import RoundPrize from './RoundPrize.vue'

  const props = defineProps({
    tournamentId: {
      type: String,
      required: true
    },
    bracketId: {
      type: [String, Number],
      required: true
    },
    isFinale: {
      type: Boolean,
      default: false
    },
    rounds: {
      type: Array,
      required: true
    },
    teams: {
      type: Array,
      required: true
    },
    /* optionally provide map of battle ID => battle (local) code, to display battles from previous brackets */
    battleCodes: {
      type: Object,
      default: null
    },
    /* optionally provide map of battle ID => bracket ID, to display links to battles from previous brackets */
    battleBracketIds: {
      type: Object,
      default: null
    },
    /* optionally provide next bracket details */
    nextBracketId: {
      type: [String, Number],
      default: null
    },
    nextBracketName: {
      type: String,
      default: null
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
      if (newIndex !== null) {
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
    revealedRoundIndex.value = props.rounds.length - 1
  }

  const roundIdsWithRevealedTeams = computed(() => {
    let revealToIndex = revealedRoundIndex.value === null ? -1 : revealedRoundIndex.value
    return props.rounds.slice(0, revealToIndex + 2).map(round => round.id)
  })
  const roundIdsWithRevealedWinners = computed(() => {
    // We want to reveal winners up to and including the revealedRoundIndex, which may be 0
    let revealToIndex = revealedRoundIndex.value
    if (revealToIndex !== null) {
      return props.rounds.slice(0, revealToIndex + 1).map(round => round.id)
    }
    return []
  })

  const container = ref(null)
  useHorizontalDragScroll(container)

  // set up tree dimensions (will be used as rems)
  const NODE_WIDTH = 10
  const NODE_HEIGHT = 3
  const NODE_GAP_X = 1.5
  const NODE_GAP_Y = 1

  const teamsById = computed(() => Object.fromEntries(props.teams.map(team => [team.id, team])))

  const treeResult = computed(() => {
    if (!props.rounds?.[0]?.battles?.length) { return null }
    const myAddress = isConnected.value && address.value
    // construct the tree from the 'root' node i.e. the final round
    const battleNodesById = {}
    for (const round of props.rounds) {
      const hasRevealedTeams = roundIdsWithRevealedTeams.value.includes(round.id)
      const hasRevealedWinners = roundIdsWithRevealedWinners.value.includes(round.id)
      for (const battle of round.battles) {
        let teams = null
        // we only display teams if the round teams have been revealed, or if the team is coming in from another bracket
        if (hasRevealedTeams || [battle.fromExternalBattles[0] || battle.fromExternalBattles[1]]) {
          const team1IdToShow = (hasRevealedTeams || battle.fromExternalBattles[0]) ? battle.team1Id : null
          const team2IdToShow = (hasRevealedTeams || battle.fromExternalBattles[1]) ? battle.team2Id : null
          teams = [team1IdToShow, team2IdToShow].map(teamId => (teamId && {
            id: teamId,
            name: teamsById.value[teamId]?.name,
            owner: teamsById.value[teamId]?.owner,
            isMine: (myAddress && teamsById.value[teamId]?.owner === myAddress) || false
          } || null))
        }
        battleNodesById[battle.id] = {
          id: battle.id,
          code: battle.code,
          fromBattles: battle.fromBattles,
          fromExternalBattles: battle.fromExternalBattles,
          teams,
          hasATeam: (battle.team1Id !== null),
          isBye: (battle.winnerId !== null) && ((battle.team1Id !== null && battle.team2Id === null) || (battle.team1Id === null && battle.team2Id !== null)),
          winner: hasRevealedWinners ? battle.winnerId : null,
          winnerIsMine: hasRevealedWinners ? (teams?.[0]?.id === battle.winnerId && teams[0].isMine) || teams?.[1]?.id === battle.winnerId && teams[1].isMine : null,
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
    rootNodes[0].isRootBattle = true

    let hierarchyRoot = rootNodes[0]

    // If there is a next bracket, add it as the ultimate root of the tree
    if (props.nextBracketId && props.nextBracketName) {
      hierarchyRoot = {
        id: 'next_bracket' + hierarchyRoot.id, // unique id to avoid Vue caching elements between different brackets
        isNextBracket: true,
        bracket: {
          id: props.nextBracketId,
          name: props.nextBracketName
        },
        children: rootNodes,
        fromBattles: [rootNodes[0].id, null]
      }
    } else if (props.isFinale) {
      // If this is the final bracket, add a Winner as the ultimate root of the tree
      const winningTeam = hierarchyRoot.winner && hierarchyRoot.teams?.find(team => team?.id === hierarchyRoot.winner) || null
      hierarchyRoot = {
        id: 'winner_node' + hierarchyRoot.id,
        isWinnerNode: true,
        winner: hierarchyRoot.winner,
        teams: winningTeam ? [winningTeam] : [],
        children: rootNodes,
        fromBattles: [rootNodes[0].id, null]
      }
    }


    const dataForTree = hierarchy(hierarchyRoot)

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

    // The generated tree is symmetrical.
    // Now we want to align nodes to the top of the diagram, so people can see the winners with less scrolling.
    // The vertical spacing is the same, we just want to shift each column (round) upwards so that
    // the first node in each round is top-aligned.
    // Do this by subtracting the space between the top of the canvas and the first node in each Round column.
    let lastRound = null
    let topOffsetForRound = 0
    for (const node of allNodes) {
      if (node.data.round !== lastRound) {
        lastRound = node.data.round
        topOffsetForRound = node.displayY
      }
      node.displayY -= topOffsetForRound
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
            fromTop: fromY < toY,
            isFromMyWinner: fromNode.data.winnerIsMine
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
    if (props.isFinale) {
      const node = nodesById[hierarchyRoot.id]
      roundPositions['winner'] = {
        displayX: node.displayX
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

  const hasPreviousBracketBattles = computed(() => {
    if (!props.rounds?.[0]?.battles) { return false }
    return props.rounds[0].battles.some(battle => battle.fromBattles?.[0] || battle.fromBattles?.[1])
  })

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
    :class="{
      'bracket-diagram--with-previous-bracket-battles': hasPreviousBracketBattles
    }"
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
        <div class="bracket-diagram__round-header">
          <div>
            <div class="bracket-diagram__round-name word-break">
              {{ round.name }}
            </div>
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
            <div
              v-if="round.loserPrize"
              class="bracket-diagram__round-prize"
            >
              <RoundPrize
                :prize="round.loserPrize"
                :size="0.875"
                class="bracket-diagram__round-prize-amount"
              />
              <SitePopupHoverMenu class="bracket-diagram__round-prize-info">
                <SiteButtonIcon
                  iconName="info"
                  label="about"
                />
                <template #popper>
                  This is the prize the teams will win if they lose in this round
                </template>
              </SitePopupHoverMenu>
            </div>
          </div>
          <div v-if="round.status === 'completed' && !roundIdsWithRevealedWinners.includes(round.id)">
            <SiteButtonWhite
              small
              active
              @click="revealRound(index)"
            >
              Show
            </SiteButtonWhite>
          </div>
        </div>
      </div>
      <div
        v-if="isFinale"
        class="bracket-diagram__round"
        :class="{
          [`bracket-diagram__round--status-${rounds[rounds.length - 1].status}`]: true
        }"
        :style="{
          '--bd-round-display-x': `${treeResult.roundPositions['winner']?.displayX}rem`,
        }"
      >
        <div class="bracket-diagram__round-header">
          <div>
            <div class="bracket-diagram__round-name">
              Winner
            </div>
            <div
              v-if="rounds[rounds.length - 1].winnerPrize"
              class="bracket-diagram__round-prize"
            >
              <RoundPrize
                :prize="rounds[rounds.length - 1].winnerPrize"
                :size="0.875"
                class="bracket-diagram__round-prize-amount"
              />
            </div>
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
          'bracket-diagram__tree-node--empty': !node.data.teams?.length,
          'bracket-diagram__tree-node--next-bracket': node.data.isNextBracket,
          'bracket-diagram__tree-node--finale-winner': node.data.isWinnerNode
        }"
        :style="{
          '--bd-tree-node-display-x': `${node.displayX}rem`,
          '--bd-tree-node-display-y': `${node.displayY}rem`,
          '--bd-tree-node-x': `${-node.x}rem`,
          '--bd-tree-node-y': `${-node.y}rem`
        }"
      >
        <RouterLink
          v-if="node.data.isNextBracket && node.data.bracket"
          :to="{ name: 'tournament-bracket', params: { id: tournamentId, bracketId: node.data.bracket.id } }"
          class="link-reset link-reset--hover-underline word-break bracket-diagram__next-bracket"
        >
          {{ node.data.bracket.name }}
        </RouterLink>
        <RouterLink
          v-if="!node.data.isBye && !node.data.isWinnerNode && node.data.teams?.[0] || node.data.teams?.[1]"
          :to="{ name: 'tournament-bracket', params: { id: tournamentId, bracketId, battleId: node.data.id } }"
          class="link-reset bracket-diagram__battle-id"
          @click="node.data.isRootBattle && node.data.round.status === 'completed' && revealFinalRound()"
        >
          <span>
            #{{ node.data.code || node.data.id }}
          </span>
          <SiteButtonWhiteBox
            small
          >
            VIEW
          </SiteButtonWhiteBox>
        </RouterLink>
        <template
          v-for="(team, index) in node.data.teams"
          :key="`${node.data.id}_team${index}`"
        >
          <div
            class="bracket-diagram__team"
            :class="{
              'bracket-diagram__team--mine': team?.isMine,
              'bracket-diagram__team--empty': !team,
              'bracket-diagram__team--winner': node.data.winner && team ? team.id === node.data.winner : false,
              'bracket-diagram__team--loser': node.data.winner && team ? team.id !== node.data.winner : false
            }"
          >
            <div
              v-if="isConnected && address && team?.owner === address"
              class="sr-only"
            >
              (My team)
            </div>
            <div class="bracket-diagram__team-name">{{ team?.name || (node.data.hasATeam ? '-' : '?') }}</div>
          </div>
          <div
            v-if="node.data.round?.roundStage === 0 && node.data.fromBattles[index]"
            class="bracket-diagram__previous-bracket-battle"
            :class="{
              [`bracket-diagram__previous-bracket-battle--${index + 1}`]: true
            }"
          >
            <RouterLink
              :to="{ name: 'tournament-bracket', params: { id: tournamentId, bracketId: battleBracketIds[node.data.fromBattles[index]] } }"
              class="link-reset link-reset--hover-underline bracket-diagram__previous-bracket-battle-link"
            >
              <div>
                #{{ battleCodes[node.data.fromBattles[index]] }}
              </div>
            </RouterLink>
          </div>
        </template>
      </div>
      <div
        v-for="connector in treeResult.connectors"
        :key="connector.id"
        class="bracket-diagram__connector"
        :class="{
          'bracket-diagram__connector--from-top': connector.fromTop,
          'bracket-diagram__connector--from-bottom': !connector.fromTop,
          'bracket-diagram__connector--from-my-winner': connector.isFromMyWinner
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
  .bracket-diagram__round {
    width: var(--bd-tree-node-width);
    min-height: 4rem; /* vertical round header height */
  }
  .bracket-diagram__round:not(:first-child) {
    position: absolute;
    top: 0;
    left: var(--bd-round-display-x);
  }

  .bracket-diagram__tree,
  .bracket-diagram__tree *,
  .bracket-diagram__tree *::before,
  .bracket-diagram__tree *::after  {
    box-sizing: border-box;
  }

  .bracket-diagram__tree {
    --bd-border-width: 2px;
    --bd-color-border: rgb(93, 87, 192);

    margin-top: 2em;
    position: relative;
    width: var(--bd-tree-width);
    height: var(--bd-tree-height);
  }

  .bracket-diagram--with-previous-bracket-battles {
    padding-left: 4rem;
  }
  .bracket-diagram__previous-bracket-battle {
    --bd-previous-bracket-battle-color: var(--bd-color-border);
    position: absolute;
    left: -4rem;
    width: 3rem;
    height: calc(var(--bd-tree-node-height) / 2 + var(--bd-border-width) / 2);
    border: var(--bd-border-width) solid var(--bd-previous-bracket-battle-color);
    padding-left: 0.4rem;
    padding-right: 0.4rem;
    color: var(--bd-previous-bracket-battle-color);
    font-size: 0.75rem;
    line-height: 1.4rem;
    white-space: nowrap;
  }
  .bracket-diagram__previous-bracket-battle--2 {
    top: calc(var(--bd-tree-node-height) / 2 - var(--bd-border-width) / 2);
  }
  .bracket-diagram__previous-bracket-battle::after {
    content: '';
    position: absolute;
    right: calc(-1rem - var(--bd-border-width));
    top: calc(var(--bd-tree-node-height) / 4 - var(--bd-border-width) / 2);
    width: calc(1rem + var(--bd-border-width));
    height: var(--bd-border-width);
    background: var(--bd-previous-bracket-battle-color);
  }
  .bracket-diagram__team--mine + .bracket-diagram__previous-bracket-battle {
    --bd-previous-bracket-battle-color: var(--c-light-yellow);
    z-index: 1;
  }

  .bracket-diagram__previous-bracket-battle-link:hover {
    color: var(--c-white);
  }
  .bracket-diagram__previous-bracket-battle-link:hover::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background: rgba(var(--c-black-rgb), 0.75);
  }
  .bracket-diagram__previous-bracket-battle-link > div {
    position: relative; /* above before-background */
  }

  .bracket-diagram__tree-node {
    position: absolute;
    left: var(--bd-tree-node-display-x);
    top: var(--bd-tree-node-display-y);
    width: var(--bd-tree-node-width);
    height: var(--bd-tree-node-height);
  }

  .bracket-diagram__connector {
    position: absolute;
    left: var(--bd-connector-start-x);
    top: var(--bd-connector-start-y);
    width: calc(var(--bd-connector-width) /  2);
    height: calc(var(--bd-connector-height));
    border-right: var(--bd-border-width) solid var(--bd-color-border);
  }
  .bracket-diagram__connector--from-top {
    border-top: var(--bd-border-width) solid var(--bd-color-border);
  }
  .bracket-diagram__connector--from-bottom {
    border-bottom: var(--bd-border-width) solid var(--bd-color-border);
  }
  .bracket-diagram__connector--from-my-winner {
    --bd-color-border: var(--c-light-yellow);
  }
  .bracket-diagram__connector--from-my-winner::after {
    z-index: 1;
  }
  .bracket-diagram__connector::after {
    content: '';
    display: block;
    position: absolute;
    left: calc(var(--bd-connector-width) /  2 - var(--bd-border-width));
    width: calc(var(--bd-connector-width) /  2 + var(--bd-border-width));
    height: var(--bd-border-width);
    background: var(--bd-color-border);
  }
  .bracket-diagram__connector--from-top::after {
    top: 100%;
  }
  .bracket-diagram__connector--from-bottom::after {
    top: 0;
  }

  /* styling */
  .bracket-diagram__tree-node {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .bracket-diagram__tree-node--next-bracket {
    align-items: center;
    justify-content: center;
    height: auto; /* override fixed height, allow this node to expand downwards for long bracket names */
  }
  .bracket-diagram__next-bracket {
    flex: 0 1 auto;
    min-height: 0;
    overflow: hidden;
    padding: 0.5rem; /* put padding on the link, so the hover underline doesn't get hidden in the overflow */
    text-align: center;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: bold;
    color: var(--c-light-yellow);
    text-transform: uppercase;
  }
  .bracket-diagram__battle-id {
    opacity: 0;

    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 1;

    display: grid;
    place-items: center;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 0.7rem;

    padding: 0.5rem 0.7rem;
    background: rgba(var(--c-black-rgb), 0.75);
  }
  .bracket-diagram__battle-id:hover {
    opacity: 1;
  }
  .bracket-diagram__battle-id:focus-visible {
    opacity: 1;
  }
  .bracket-diagram__battle-id span {
    max-width: 100%;
    white-space: nowrap;
    overflow: hidden;

    color: var(--c-white);
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .bracket-diagram__team {
    height: 50%;
    flex: 1 1 auto;
    display: flex;
    align-items: center;
    padding: 0 0 0 0.5rem;
  }
  .bracket-diagram__tree-node--empty {
    border: var(--bd-border-width) solid var(--bd-color-border);
  }
  .bracket-diagram__team:not(.bracket-diagram__team--winner):not(.bracket-diagram__team--mine) {
    border: var(--bd-border-width) solid var(--bd-color-border);
    border-bottom-width: 0;
  }
  .bracket-diagram__team ~ .bracket-diagram__team:not(.bracket-diagram__team--winner):not(.bracket-diagram__team--mine) {
    border-top-width: 0;
    border-bottom-width: var(--bd-border-width);
  }
  .bracket-diagram__team-name {
    flex: 1 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    font-size: 0.8125rem;
    line-height: 1rem;
  }
  .bracket-diagram__team--winner {
    font-weight: bold;
    color: var(--c-light-yellow);
    background: var(--bd-color-border);
  }
  .bracket-diagram__team--winner::after {
    content: '🏆';
    font-size: 0.875rem;
    line-height: 0.875rem;
    padding-right: 0.25rem;
  }
   .bracket-diagram__tree-node--finale-winner .bracket-diagram__team--winner::after {
    content: '';
   }
  .bracket-diagram__tree-node--finale-winner::before {
    content: '🏆';
    position: absolute;
    font-size: 1.5rem;
    line-height: var(--bd-tree-node-height);
    padding-left: 0.5rem;
  }
  .bracket-diagram__tree-node--finale-winner .bracket-diagram__team--winner {
    padding-left: 2.75rem;
  }
  .bracket-diagram__team--empty,
  .bracket-diagram__team--loser {
    color: rgb(146, 141, 237);
  }
  .bracket-diagram__team--mine {
    background: var(--c-light-yellow);
    color: var(--c-black);
  }

  .bracket-diagram__round-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 1rem;
  }
  .bracket-diagram__round-header div:nth-child(2) {
    align-self: center;
  }
  .bracket-diagram__round-name {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    line-height: 1rem;
    text-transform: uppercase;
  }
  .bracket-diagram__round-status {
    font-size: 0.875rem;
    line-height: 1rem;
  }
  .bracket-diagram__round-prize {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
  .bracket-diagram__round-prize > * {
    flex: none;
  }
  .bracket-diagram__round-prize-info {
    line-height: 0.7rem;
  }
  .bracket-diagram__round--status-completed .bracket-diagram__round-name,
  .bracket-diagram__round--status-active .bracket-diagram__round-name {
    font-weight: bold;
  }
  .bracket-diagram__round--status-upcoming {
    opacity: 0.5;
  }
</style>