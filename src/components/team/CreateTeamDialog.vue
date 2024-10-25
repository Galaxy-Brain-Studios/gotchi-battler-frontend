<script setup>
  import { DEV_MODE } from '../../appEnv'
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useTournamentTeams from '../../data/useTournamentTeams'
  import VueDraggable from 'vuedraggable'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonGroup from '../common/SiteButtonGroup.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteError from '../common/SiteError.vue'
  import FormationPatternSelect from './FormationPatternSelect.vue'
  import FORMATION_PATTERNS from './formationPatterns.json'
  import TeamFormation from './TeamFormation.vue'
  import TeamSubstitutes from './TeamSubstitutes.vue'
  import GotchiInFormation from './GotchiInFormation.vue'
  import GotchiSpecial from './GotchiSpecial.vue'
  import GotchiSpecialSelect from './GotchiSpecialSelect.vue'
  import GotchiDetailsDialog from './GotchiDetailsDialog.vue'
  import GotchiStats from './GotchiStats.vue'
  import LeaderSlotSelect from './LeaderSlotSelect.vue'
  import SourceGotchisMy from './SourceGotchisMy.vue'
  import SourceGotchisTraining from './SourceGotchisTraining.vue'
  import SourceGotchisTeam from './SourceGotchisTeam.vue'

  const ROW_NAMES = ['front', 'back']
  const ALL_ROW_NAMES = [...ROW_NAMES, 'substitutes']

  const EDIT_MODES = {
    CREATE: 'create',
    CREATE_TRAINING: 'create_training',
    EDIT_TRAINING: 'edit_training',
    EDIT: 'edit'
  }
  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: false
    },
    mode: {
      type: String,
      required: true
    },
    tournamentId: {
      type: Number,
      default: null
    },
    team: {
      type: Object,
      default: null
    },
    closeOnSave: {
      type: Boolean,
      default: false
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    errorMessage: {
      type: String,
      default: null
    }
  })
  const emit = defineEmits(['update:isOpen', 'update:team'])

  const incomingTeamGotchis = computed(() => props.team?.gotchis || null)

  const modeLabel = computed(() => {
    if (props.mode === EDIT_MODES.CREATE_TRAINING) { return 'Create'; }
    if (props.mode === EDIT_MODES.EDIT_TRAINING) { return 'Customize'; }
    return props.mode
  })

  const isEditMode = computed(() => props.mode === EDIT_MODES.EDIT)
  const myGotchisAllowed = computed(() => [EDIT_MODES.CREATE, EDIT_MODES.CREATE_TRAINING].includes(props.mode))
  const trainingGotchisAllowed = computed(() => [EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING].includes(props.mode))
  const onlyMyGotchisAllowed = computed(() => [EDIT_MODES.CREATE].includes(props.mode))
  const onlyTeamGotchisAllowed = computed(() => [EDIT_MODES.EDIT].includes(props.mode))

  const canChangeName = computed(() => !isEditMode.value)
  const withSubstitutes = computed(() => [EDIT_MODES.CREATE, EDIT_MODES.EDIT].includes(props.mode))

  // Fetch existing teams in tournament
  const { fetchTeams, teams } = useTournamentTeams()
  watch(
    () => props.tournamentId,
    (newId) => {
      if (isEditMode.value) {
        // editing an existing team: can't change the gotchis, so don't care about tournaments
        return
      }
      if (newId) {
        fetchTeams(newId)
      }
    },
    { immediate: true }
  )
  const differentTeamForGotchi = computed(() => {
    const teamByGotchiId = {}
    if (teams.value) {
      for (const team of teams.value) {
        if (team.id === props.team?.id) {
          continue
        }
        for (const gotchiId of team.gotchiIds) {
          teamByGotchiId[gotchiId] = team
        }
      }
    }
    return teamByGotchiId
  })

  // Fetch available gotchis for the connected account
  const store = useAccountStore()
  const { address, myGotchis, myGotchisFetchStatus } = storeToRefs(store)
  watch(
    () => address.value,
    (newAddress) => {
      if (newAddress) {
        if (isEditMode.value) {
          // editing an existing team: can't change the gotchis
          return
        }
        store.fetchMyGotchis()
      } else {
        // If editing a training team, we don't need to be connected
        if ([EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING].includes(props.mode)) {
          return;
        }
        // not connected, can't create or edit a team
        emit('update:isOpen', false)
      }
    },
    { immediate: true }
  )

  const selectedSource = ref('my') // 'my', 'training', 'team'
  watch(
    () => [myGotchisAllowed.value, address.value, trainingGotchisAllowed.value],
    () => {
      selectedSource.value = myGotchisAllowed.value && address.value ? 'my' : trainingGotchisAllowed.value ? 'training' : 'team'
    },
    { immediate: true }
  )

  const SOURCES = [
    {
      id: 'my',
      label: 'My Gotchis',
      component: SourceGotchisMy
    },
    {
      id: 'training',
      label: 'Training Gotchis',
      component: SourceGotchisTraining
    },
    {
      id: 'team',
      label: 'Team Gotchis',
      component: SourceGotchisTeam,
      props: { incomingTeamGotchis: true }
    }
  ]
  const SOURCES_BY_ID = Object.fromEntries(SOURCES.map(s => [s.id, s]))

  const sourceComponent = computed(() => {
    return SOURCES_BY_ID[selectedSource.value]?.component || 'div'
  })

  const sourceComponentProps = computed(() => {
    const propsRequested = SOURCES_BY_ID[selectedSource.value]?.props
    const propsToProvide = {}
    if (propsRequested) {
      if (propsRequested.incomingTeamGotchis) {
        propsToProvide.incomingTeamGotchis = incomingTeamGotchis.value
      }
    }
    return propsToProvide
  })

  const availableSources = computed(() => {
    const sources = []
    if (myGotchisAllowed.value) {
      sources.push(SOURCES_BY_ID['my'])
    }
    if (trainingGotchisAllowed.value) {
      sources.push(SOURCES_BY_ID['training'])
    }
    if (onlyTeamGotchisAllowed.value) {
      sources.push(SOURCES_BY_ID['team'])
    }
    return sources
  })
  const availableSourceTabs = computed(() => availableSources.value.map((source, i, sources) => ({
    ...source,
    grouped: sources.length > 0 ? ( i === 0 ? 'start' : i === sources.length - 1 ? 'end' : 'middle') : false
  })))


  const teamGotchis = ref([])
  watch(
    () => incomingTeamGotchis.value,
    () => {
      if (incomingTeamGotchis.value) {
        teamGotchis.value = [].concat(incomingTeamGotchis.value)
      } else {
        teamGotchis.value = []
      }
    },
    { immediate: true }
  )
  const teamGotchisById = computed(() => {
    if (!teamGotchis.value) { return {} }
    return Object.fromEntries(teamGotchis.value.map(g => [g.id, g]))
  })
  const addGotchiObjectToTeam = function (gotchi) {
    if (!teamGotchisById.value[gotchi.id]) {
      teamGotchis.value.push(gotchi)
    }
  }

  // Form data storage
  const teamName = ref('')
  const teamFormation = ref({
    front: [null, null, null, null, null],
    back: [null, null, null, null, null],
    substitutes: [null, null]
  })
  const selectedFormationPatternId = ref('1')
  const selectedLeaderSlot = ref('1')
  const specialByGotchiId = ref({})

  function clearTeamGotchis () {
    teamFormation.value = {
      front: [null, null, null, null, null],
      back: [null, null, null, null, null],
      substitutes: [null, null]
    }
    specialByGotchiId.value = {}
  }

  // In tournaments, can only use a restricted list of gotchis, so if this changes, remove any invalid ones from the team.
  watch(
    () => [onlyMyGotchisAllowed.value, onlyTeamGotchisAllowed.value, myGotchis.value, incomingTeamGotchis.value],
    () => {
      if (!(onlyMyGotchisAllowed.value || onlyTeamGotchisAllowed.value)) { return }
      if (onlyMyGotchisAllowed.value && !myGotchisFetchStatus.value.loaded) { return }
      const allowedGotchis = onlyMyGotchisAllowed.value ? myGotchis.value : incomingTeamGotchis.value
      if (!allowedGotchis) {
        clearTeamGotchis()
        return
      }
      const allowedGotchiIds = allowedGotchis.map(g => g.id)
      for (const key of ALL_ROW_NAMES) {
        const row = teamFormation.value[key]
        for (let i = 0; i < row.length; i++) {
          const gotchiId = row[i]
          if (gotchiId !== null && !allowedGotchiIds.includes(gotchiId)) {
            row[i] = null
          }
        }
      }
    }
  )

  // Sync incoming team data
  watch(
    () => props.team,
    (newTeam) => {
      if (!newTeam) { return }
      const pattern = findMatchingFormationPattern(newTeam.formation)
      if (!pattern) {
        // if we don't recognise the formation pattern, don't load the team
        return
      }
      teamName.value = newTeam.name || ''
      teamFormation.value = {
        front: [...newTeam.formation.front],
        back: [...newTeam.formation.back],
        substitutes: [...(newTeam.formation.substitutes || [])]
      }
      selectedFormationPatternId.value = pattern.id
      const leaderGotchisSlot = newTeam.leader ? findSlotForGotchi({ pattern, gotchiId: newTeam.leader, formation: newTeam.formation }) : null
      if (leaderGotchisSlot) {
        selectedLeaderSlot.value = `${leaderGotchisSlot}`
      }
      for (const gotchi of newTeam.gotchis) {
        if (gotchi.specialId) {
          specialByGotchiId.value[gotchi.id] = gotchi.specialId
        }
      }
    },
    { immediate: true }
  )

  function findMatchingFormationPattern (formation) {
    if (!formation || !formation.front || !formation.back) { return null }
    for (const pattern of FORMATION_PATTERNS) {
      let match = true
      for (const key of ROW_NAMES) {
        const patternRow = pattern[key]
        const formationRow = formation[key]
        for (let i = 0; i < patternRow.length; i++) {
          if (!!patternRow[i] !== !!formationRow[i]) {
            match = false
            break
          }
        }
        if (!match) { break }
      }
      if (match) {
        return pattern
      }
    }
    return null
  }
  function findSlotForGotchi ({ pattern, gotchiId, formation }) {
    for (const key of ROW_NAMES) {
      const patternRow = pattern[key]
      const formationRow = formation[key]
      for (let i = 0; i < patternRow.length; i++) {
        if (formationRow[i] === gotchiId) {
          return patternRow[i]
        }
      }
    }
    return null
  }

  // Derived data
  const selectedFormationPattern = computed(() => FORMATION_PATTERNS.find(pattern => pattern.id === selectedFormationPatternId.value))

  const gotchiIdBySlotNumber = computed(() => {
    const pattern = selectedFormationPattern.value
    const gotchis = []
    for (const key of ROW_NAMES) {
      const row = teamFormation.value[key]
      for (let i = 0; i < row.length; i++){
        const gotchiId = row[i]
        if (gotchiId) {
          gotchis.push({
            id: gotchiId,
            slotNumber: pattern[key][i]
          })
        }
      }
    }
    return Object.fromEntries(gotchis.map(g => [g.slotNumber, g.id]))
  })

  watch(
    () => selectedFormationPatternId.value,
    (newPatternId, oldPatternId) => {
      // move any gotchis from previous formation slots to new formation slots
      const newPattern = FORMATION_PATTERNS.find(p => p.id === newPatternId)
      const oldPattern = FORMATION_PATTERNS.find(p => p.id === oldPatternId)
      const gotchis = []
      const hasOldPattern = !!oldPattern
      for (const key of ROW_NAMES) {
        const row = teamFormation.value[key]
        for (let i = 0; i < row.length; i++){
          const gotchiId = row[i]
          if (gotchiId) {
            gotchis.push({
              id: gotchiId,
              slotNumber: hasOldPattern ? oldPattern[key][i] : (gotchis.length + 1)
            })
          }
        }
      }
      const gotchiBySlot = Object.fromEntries(gotchis.map(g => [g.slotNumber, g.id]))
      const substitutes = [].concat(teamFormation.value.substitutes)
      // clear formation
      removeAllGotchisFromFormation()

      if (newPattern) {
        // move gotchis in numbered slots to the same numbers in the new formation
        for (const key of ROW_NAMES) {
          const row = newPattern[key]
          for (let i = 0; i < row.length; i++){
            const slotNumber = row[i]
            if (slotNumber && gotchiBySlot[slotNumber]) {
              teamFormation.value[key][i] = gotchiBySlot[slotNumber]
            }
          }
        }
        // substitutes stay as they were
        teamFormation.value.substitutes = substitutes
      } else {
        // unexpected case
        console.error('New pattern not found')
      }
    }
  )

  watch(
    () => teamGotchisById.value,
    (newGotchisById) => {
      if (newGotchisById) {
        // add entries for specials for each gotchi.
        // if there is only one choice, enforce that one.
        // if there is a pre-existing choice for the gotchi (from loaded team), keep it.
        for (const gotchiId in newGotchisById ) {
          const gotchi = newGotchisById[gotchiId]
          if (gotchi.availableSpecials?.length === 1) {
            specialByGotchiId.value[gotchi.id] = gotchi.availableSpecials[0]
          } else if (!specialByGotchiId.value[gotchi.id]) {
            specialByGotchiId.value[gotchi.id] = null
          }
        }
      }
    },
    { immediate: true }
  )

  const gotchisInTeam = computed(() => {
    if (!teamGotchisById.value) { return null }
    const gotchiIds = [
      ...teamFormation.value.front,
      ...teamFormation.value.back,
      ...(teamFormation.value.substitutes || [])
    ].flat().filter(id => !!id)
    return gotchiIds.map(id => teamGotchisById.value[id])
  })

  const leaderGotchiId = computed(() => selectedLeaderSlot.value ? gotchiIdBySlotNumber.value[selectedLeaderSlot.value] || null : null)

  const teamToDisplay = computed(() => {
    const gotchis = gotchisInTeam.value?.map(gotchi => ({
      ...gotchi,
      canSelectSpecial: gotchi?.availableSpecials?.length > 1
    }))
    return {
      name: teamName.value,
      formation: teamFormation.value,
      gotchis,
      leader: leaderGotchiId.value
    }
  })

  // Validating and saving the team
  const teamToSave = computed(() => {
    const gotchis = gotchisInTeam.value?.map(gotchi => ({
      ...gotchi,
      specialId: specialByGotchiId.value[gotchi?.id]
    }))
    return {
      name: teamName.value?.trim(),
      formation: teamFormation.value,
      gotchis,
      leader: leaderGotchiId.value
    }
  })

  const REQUIRED_NUM_GOTCHIS_IN_ACTIVE_ROWS = 5

  const validationError = computed(() => {
    const teamData = teamToSave.value
    if (!teamData.name) {
      return 'Please provide a name for your team.'
    }
    // Require a full team for a battle (substitutes are optional)
    const numGotchisInActiveRows = [
      ...teamData.formation.front,
      ...teamData.formation.back
    ].flat().filter(id => !!id).length
    if (numGotchisInActiveRows !== REQUIRED_NUM_GOTCHIS_IN_ACTIVE_ROWS) {
      return `Please choose ${REQUIRED_NUM_GOTCHIS_IN_ACTIVE_ROWS} gotchis for your team.`
    }
    if (!teamData.leader) {
      return 'Please select a leader slot.'
    }
    if (!teamData.gotchis.every(g => !!g.specialId)) {
      return 'Please select a class for all gotchis in your team.'
    }
    // If editing a team during a tournament, keep all the same gotchis
    if (isEditMode.value) {
      if (teamData.gotchis.length !== props.team?.gotchis.length) {
        return 'Please keep all gotchis in your team (or substitutes).'
      }
    }
    return false
  })
  const showError = ref(false)
  const showValidationError = ref(false)
  watch(
    () => teamToSave.value,
    () => {
      showError.value = false
      showValidationError.value = false
    }
  )

  const hideError = function () {
    if (showError.value) {
      showError.value = false
    } else if (showValidationError.value) {
      showValidationError.value = false
    }
  }

  function saveTeam () {
    if (validationError.value) {
      showValidationError.value = true
      return
    }

    showError.value = true
    const teamData = teamToSave.value
    emit('update:team', teamData)
    if (props.closeOnSave) {
      emit('update:isOpen', false)
    }
  }


  // Moving gotchis from available list to the formation

  const isDragging = ref(false)

  const draggableTargets = ref({
    front: [[], [], [], [], []],
    back: [[], [], [], [], []],
    substitutes: [[], []]
  })

  function removeAllGotchisFromFormation () {
    teamFormation.value = {
      front: [null, null, null, null, null],
      back: [null, null, null, null, null],
      substitutes: [null, null]
    }
  }

  function removeGotchiFromFormation (gotchiId) {
    for (const key in teamFormation.value) {
      const row = teamFormation.value[key]
      for (let i = 0; i < row.length; i++) {
        if (row[i] === gotchiId) {
          row[i] = null
        }
      }
    }
  }

  function addGotchiToFormation ({ gotchi, row, positionIndex}) {
    const existingGotchiId = teamFormation.value[row][positionIndex]
    if (existingGotchiId && existingGotchiId !== gotchi.id) {
      removeGotchiFromFormation(existingGotchiId)
    }
    teamFormation.value[row][positionIndex] = gotchi.id
    addGotchiObjectToTeam(gotchi)
  }

  for (let rowKey of ALL_ROW_NAMES) {
    const row = draggableTargets.value[rowKey]
    for (let positionIndex = 0; positionIndex < row.length; positionIndex++) {
      watch(
        () => draggableTargets.value[rowKey][positionIndex],
        (newTargetArray) => {
          if (newTargetArray.length) {
            // dropped a gotchi into this position
            removeGotchiFromFormation(newTargetArray[0].id)
            addGotchiToFormation({ gotchi: newTargetArray[0], row: rowKey, positionIndex })
            // now clear this target array
            row[positionIndex] = []
          }
        }
      )
    }
  }

  function addGotchiToSlot ({ gotchi, slotNumber }) {
    removeGotchiFromFormation(gotchi.id)
    for (const key of ROW_NAMES) {
      const row = selectedFormationPattern.value[key]
      for (let i = 0; i < row.length; i++) {
        if (row[i] === slotNumber) {
          teamFormation.value[key][i] = gotchi.id
          addGotchiObjectToTeam(gotchi)
          return
        }
      }
    }
  }

  function addGotchiAsSubstitute ({ gotchi, position }) {
    removeGotchiFromFormation(gotchi.id)
    teamFormation.value.substitutes[position - 1] = gotchi.id
    addGotchiObjectToTeam(gotchi)
  }

  function onMoveFromAvailable (event) {
    // prevent dragging/moving within the available gotchis list
    if (event.to.classList.contains('create-team__gotchis-results')){
      return false
    }
  }

  // Store ID of gotchi to display in a details dialog.
  // The gotchi must be present in the list of team gotchis.
  // When it's set and we have gotchi details, open the dialog.
  // When the details dialog is closed, clear the stored gotchi ID.
  const displayGotchiId = ref(null)
  const displayGotchi = computed(() => {
    if (!displayGotchiId.value || !teamGotchisById.value) { return null }
    return {
      ...teamGotchisById.value[displayGotchiId.value],
      specialId: specialByGotchiId.value[displayGotchiId.value]
    }
  })
  const displayGotchiDialogIsOpen = ref(false)

  watch(
    () => displayGotchi.value,
    newGotchi => {
      displayGotchiDialogIsOpen.value = !!newGotchi
    }
  )
  watch(
    () => displayGotchiDialogIsOpen.value,
    newIsOpen => {
      if (!newIsOpen) {
        displayGotchiId.value = null
      }
    }
  )

  // TODO reimplement
  // function autofill () {
  //   teamName.value = 'Auto-filled Team'
  //   removeAllGotchisFromFormation()
  //   let added = 0
  //   for (let i = 0; i < availableGotchis.value.length; i++) {
  //     const gotchi = availableGotchis.value?.[i]
  //     if (gotchi && !differentTeamForGotchi.value[gotchi.id]) {
  //       addGotchiToSlot({
  //         gotchiId: gotchi.id,
  //         slotNumber: ++added
  //       })
  //       if (gotchi.availableSpecials.length > 1 && !specialByGotchiId.value[gotchi.id]) {
  //         specialByGotchiId.value[gotchi.id] = gotchi.availableSpecials[0]
  //       }
  //       if (added === 5) {
  //         return
  //       }
  //     }
  //   }
  // }
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="full"
    strict
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <div
      v-if="(showError && errorMessage) || (showValidationError && validationError)"
      class="create-team-error"
    >
      <SiteError>
        <div class="create-team-error__content">
          <template v-if="(showError && errorMessage)">
            {{ errorMessage }}
          </template>
          <template v-else>
            {{ validationError }}
          </template>
          <button
            type="button"
            class="button-reset create-team-error__close-button"
            @click="hideError"
          >
            <SiteIcon
              name="close"
              :width="1.5"
              :height="1.5"
            />
            <span class="sr-only">Ok</span>
          </button>
        </div>
      </SiteError>
    </div>

    <div
      class="create-team"
      :class="{
        'create-team--is-dragging': isDragging
      }"
    >
      <div class="create-team__container create-team__container-1">
        <div class="create-team__title">
          <SiteButton
            aria-label="Close dialog"
            class="create-team__title-close-button"
            icon="chevron-left"
            @click="$emit('update:isOpen', false)"
          />
          <h1 class="create-team__title-text">
            <span style="text-transform: capitalize;">{{ modeLabel }}</span>
            Team
          </h1>
        </div>
        <section class="create-team__gotchis">
          <SiteButtonGroup
            v-if="availableSourceTabs.length > 1"
            :numButtons="availableSourceTabs.length"
            class="create-team__gotchis-source"
          >
            <SiteButton
              v-for="tab in availableSourceTabs"
              :key="tab.id"
              :grouped="tab.grouped"
              :active="selectedSource === tab.id"
              @click="selectedSource = tab.id"
            >
              {{ tab.label }}
            </SiteButton>
          </SiteButtonGroup>
          <component
            v-if="sourceComponent"
            :is="sourceComponent"
            v-bind="sourceComponentProps"
          >
            <template #gotchis="{ gotchisToDisplay }">
              <VueDraggable
                :list="gotchisToDisplay"
                item-key="id"
                :group="{ name: 'available', pull: 'clone', put: false }"
                tag="ol"
                class="list-reset create-team__gotchis-results"
                ghost-class="create-team__gotchis-draggable--ghost"
                chosen-class="create-team__gotchis-draggable--chosen"
                drag-class="create-team__gotchis-draggable--drag"
                filter=".create-team__gotchis-result--not-draggable"
                :move="onMoveFromAvailable"
                @start="isDragging = true"
                @end="isDragging = false"
              >
                <template #item="{ element }">
                  <li
                    class="create-team__gotchis-result"
                    :class="{
                      'create-team__gotchis-result--not-draggable': !!differentTeamForGotchi[element.id]
                    }"
                  >
                    <SitePopupHoverMenu>
                      <button
                        type="button"
                        class="button-reset create-team__gotchis-result-button"
                      >
                        <img
                          :src="element.svgFront"
                          :alt="`${element.name} #${element.id}`"
                          class="create-team__gotchis-result-image"
                          loading="lazy"
                        />
                        <div class="create-team__gotchis-result-name">
                          {{ element.name || `#${element.onchainId || element.id}` }}
                        </div>
                        <GotchiSpecial
                          v-if="element.availableSpecials.length === 1"
                          :id="element.availableSpecials[0]"
                          forSpecialShowClass
                          fullWidth
                          class="create-team__gotchis-result-special"
                        />
                        <div
                          v-else-if="element.availableSpecials.length > 1"
                          class="create-team__gotchis-result-available-specials"
                        >
                          <GotchiSpecial
                            v-for="specialId in element.availableSpecials"
                            :key="specialId"
                            :id="specialId"
                            variant="icon"
                          />
                        </div>
                      </button>

                      <template #popper>
                        <div class="create-team__gotchis-result-popup">
                          <div class="create-team__gotchis-result-popup-header">
                            {{ element.name }} #{{ element.id }}
                          </div>
                          <div
                            v-if="differentTeamForGotchi[element.id]"
                          >
                            Already in a team in this tournament:
                            <br>
                            "{{ differentTeamForGotchi[element.id].name }}"
                            (#{{ differentTeamForGotchi[element.id].id }})
                          </div>
                          <template v-else>
                            <GotchiStats
                              :gotchi="element"
                              variant="small"
                              class="create-team__gotchis-result-popup-stats"
                            />
                            <div>
                              Add to:
                              <button
                                v-for="i in 5"
                                :key="i"
                                type="button"
                                class="button-reset create-team__gotchis-result-popup-slot-button"
                                :class="{
                                  'create-team__gotchis-result-popup-slot-button--selected': gotchiIdBySlotNumber[i] === element.id
                                }"
                                @click="addGotchiToSlot({ gotchi: element, slotNumber: i })"
                              >
                                {{ i }}
                              </button>
                            </div>
                            <div
                              v-if="withSubstitutes"
                              style="margin-top: 0.7rem"
                            >
                              Add as substitute:
                              <button
                                v-for="i in 2"
                                :key="i"
                                type="button"
                                class="button-reset create-team__gotchis-result-popup-slot-button"
                                :class="{
                                  'create-team__gotchis-result-popup-slot-button--selected': teamFormation.substitutes[i - 1] === element.id
                                }"
                                @click="addGotchiAsSubstitute({ gotchi: element, position: i })"
                              >
                                S{{ i }}
                              </button>
                            </div>
                          </template>
                        </div>
                      </template>
                    </SitePopupHoverMenu>
                  </li>
                </template>
              </VueDraggable>
            </template>
          </component>
        </section>
      </div>
      <div class="create-team__container create-team__container-2">
        <section class="create-team__name">
          <label
            for="create-team__name-input"
            class="create-team__section-label"
          >
            1. Team name:
          </label>
          <div>
            <template v-if="canChangeName">
              <SiteTextField
                id="create-team__name-input"
                v-model="teamName"
                placeholder="Team Name"
                style="width: 100%"
              />
              <button
                v-if="DEV_MODE"
                type="button"
                @click="autofill"
              >
                I feel lucky
              </button>
            </template>
            <template v-else>
              {{ teamName }}
            </template>
          </div>
        </section>
        <section class="create-team__leader">
          <label class="create-team__section-label">
            2. Choose leader slot:
          </label>
          <LeaderSlotSelect
            v-model="selectedLeaderSlot"
          />
        </section>
        <section class="create-team__formation-pattern">
          <label class="create-team__section-label">
            3. Select formation:
          </label>
          <FormationPatternSelect
            v-model="selectedFormationPatternId"
          />
        </section>
        <section class="create-team__formation">
          <label class="create-team__section-label">
            4. Drag at least 5 Gotchis into team
          </label>
          <div class="create-team__formation-display">
            <TeamFormation
              :team="teamToDisplay"
              withRowLabels
              withRowBoosts
              horizontal
              reverseRows
            >
              <template #position="{ row, position }">
                <div
                  class="create-team__formation-placeholder"
                >
                  <template v-if="selectedFormationPattern?.[row][position - 1]">
                    <GotchiInFormation
                      emptyMode="placeholder"
                      variant="small"
                      :slotNumber="selectedFormationPattern[row][position - 1]"
                      :isLeader="`${selectedLeaderSlot}` === `${selectedFormationPattern[row][position - 1]}`"
                    />
                    <VueDraggable
                      v-model="draggableTargets[row][position - 1]"
                      item-key="id"
                      :group="{ name: `target_${row}_${position - 1}`, pull: false, put: true }"
                      tag="ol"
                      class="list-reset create-team__formation-position-target"
                    >
                      <template #item><!-- not needed as we remove gotchis from this list after dropping --></template>
                    </VueDraggable>
                  </template>
                  <GotchiInFormation
                    v-else
                    emptyMode="disabled"
                    variant="small"
                  />
                </div>
              </template>
              <template #gotchi="{ gotchi, row, position }">
                <GotchiInFormation
                  :gotchi="{ ...gotchi, specialId: specialByGotchiId[gotchi.id] }"
                  variant="small"
                  :slotNumber="selectedFormationPattern[row][position - 1]"
                  :isLeader="teamToDisplay.leader === gotchi.id"
                  isRemovable
                  isSelectable
                  :warning="gotchi.canSelectSpecial && !specialByGotchiId[gotchi.id]"
                  withSpecialBadge
                  @remove="removeGotchiFromFormation(gotchi.id)"
                  @select="displayGotchiId = gotchi.id"
                >
                  <template
                    v-if="gotchi.canSelectSpecial"
                    #special
                  >
                    <GotchiSpecialSelect
                      v-model="specialByGotchiId[gotchi.id]"
                      :availableSpecials="gotchi.availableSpecials"
                      fullWidth
                    />
                  </template>
                </GotchiInFormation>
              </template>
            </TeamFormation>
          </div>
        </section>
        <section
          v-if="withSubstitutes"
          class="create-team__substitutes"
        >
          <div class="create-team__substitutes-display">
            <TeamSubstitutes
              :team="teamToDisplay"
            >
              <template #position="{ position }">
                <div
                  class="create-team__formation-placeholder"
                >
                  <GotchiInFormation
                    emptyMode="placeholder"
                    variant="small"
                    :slotNumber="`S${position}`"
                  />
                  <VueDraggable
                    v-model="draggableTargets.substitutes[position - 1]"
                    item-key="id"
                    :group="{ name: `target_substitutes_${position - 1}`, pull: false, put: true }"
                    tag="ol"
                    class="list-reset create-team__formation-position-target"
                  >
                    <template #item><!-- not needed as we remove gotchis from this list after dropping --></template>
                  </VueDraggable>
                </div>
              </template>
              <template #gotchi="{ gotchi, position }">
                <GotchiInFormation
                  :gotchi="{ ...gotchi, specialId: specialByGotchiId[gotchi.id] }"
                  variant="small"
                  :slotNumber="`S${position}`"
                  isRemovable
                  isSelectable
                  :warning="gotchi.canSelectSpecial && !specialByGotchiId[gotchi.id]"
                  withSpecialBadge
                  @remove="removeGotchiFromFormation(gotchi.id)"
                  @select="displayGotchiId = gotchi.id"
                >
                  <template
                    v-if="gotchi.canSelectSpecial"
                    #special
                  >
                    <GotchiSpecialSelect
                      v-model="specialByGotchiId[gotchi.id]"
                      :availableSpecials="gotchi.availableSpecials"
                      fullWidth
                    />
                  </template>
                </GotchiInFormation>
              </template>
            </TeamSubstitutes>
          </div>
          <div class="create-team__substitutes-info">
            <label class="create-team__section-label">
              5. Choose substitutes <i>(optional)</i>
            </label>
            <div class="create-team__substitutes-help">
              Substitutes can be swapped into your team during the "Preparation" stage between rounds of the tournament.
              During a tournament you just need go to the Edit team dialog and switch Team players with substitutes.
            </div>
          </div>
        </section>
        <div
          v-if="isEditMode"
          class="create-team__edit-warning"
        >
          <SiteIcon
            name="warning"
            :width="1.5"
            :height="1.5"
          />
          <div>
            Your updates will be saved and applied at the end of the preparation round. Until then, no one <b>(including yourself!)</b> can see the changes made to the team to keep it secret.
          </div>
        </div>
        <div class="create-team__submit">
          <SiteButtonPrimary
            v-if="isSaving"
            disabled
          >
            Saving...
          </SiteButtonPrimary>
          <SiteButtonPrimary
            v-else
            @click="saveTeam"
          >
            Save Team
          </SiteButtonPrimary>
        </div>
      </div>
    </div>
    <GotchiDetailsDialog
      v-if="displayGotchi"
      v-model:isOpen="displayGotchiDialogIsOpen"
      :gotchi="displayGotchi"
      :isLeader="displayGotchi.id === teamToDisplay.leader"
    />
  </SiteDialog>
</template>

<style scoped>
  /* error overlays whole dialog */
  .create-team-error::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
  .create-team-error {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    display: grid;
    place-items: center;
  }
  .create-team-error__content {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: 1rem;
    align-items: center;
  }
  .create-team-error__close-button {
    line-height: 0.5rem;
    color: var(--c-black);
  }

  .create-team {
    margin: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .create-team__container-1,
  .create-team__container-2 {
    margin: 0 1rem;
  }
  .create-team__container-1 {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    row-gap: 2rem;
  }
  .create-team__container-2 {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    row-gap: 1.5rem;
    column-gap: 1.5rem;
  }

  @media (min-width: 1300px) {
    .create-team {
      height: 100%;
      margin: 0;
      display: grid;
      grid-template-columns: minmax(0, 1fr) 40rem;
      grid-template-rows: minmax(0, auto);
      gap: 0;
    }

    .create-team__container-1 {
      height: 100%; /* want this to be full height so the internal scrolling gotchis container can fill available height */
      margin: 0;
      padding: 0 1.8rem 1rem 1.8rem;
      display: grid;
      grid-template-rows: auto minmax(0, 1fr);

      border-right: 2px solid var(--c-black);
      background: var(--color-background);
      background-image: var(--site-background-image);
    }
    .create-team__container-2 {
      height: fit-content; /* this will be the scroll container but only if its contents are too tall */
      max-height: 100%;
      margin: 0;
      padding: 2rem 2.5rem 2rem 2.8rem;
      overflow: auto;
    }
  }

  .create-team__title {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    padding: 2rem 0 0 4px;
  }
  .create-team__title-close-button {
    flex: none;
  }
  .create-team__title-text {
    flex: 1 1 auto;
    margin: 0;
  }

  .create-team__name {
    grid-column: 1 / span 2;
  }

  .create-team__formation {
    grid-column: 1 / span 2;
  }
  @media (min-width: 1300px) {
    /* align the start of the grid with the common left margin, putting the row labels in the negative margin */
    /* only do this with the larger layout as it has more margin */
    .create-team__formation-display,
    .create-team__substitutes-display {
      margin-left: -1.8rem;
    }
  }

  .create-team__substitutes {
    grid-column: 1 / span 2;
    display: flex;
    column-gap: 1rem;
  }
  .create-team__substitutes-display {
    flex: none;
  }
  .create-team__substitutes-info {
    flex: 1 1 auto;
  }
  .create-team__substitutes-help {
    font-size: 0.75rem;
    line-height: 1.25rem;
    letter-spacing: 0.0225rem;
    opacity: 0.6;
  }

  .create-team__edit-warning {
    grid-column: 1 / span 2;
  }
  .create-team__edit-warning {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 1rem;

    border-radius: 1.5rem;
    padding: 0.8rem 1.2rem;
    background: #FAF1E6;
    color: rgba(204, 87, 0, 0.8);
    font-size: 0.9rem;
    line-height: 1.25rem;
    letter-spacing: 0.03rem;
  }

  .create-team__submit {
    grid-column: 1 / span 2;
    display: grid;
  }

  .create-team__section-label {
    display: block;
    margin-bottom: 1rem;
    font-size: 1rem;
    font-weight: bold;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }

  .create-team__formation-placeholder {
    height: 100%;
    display: grid;
    place-items: center;
  }
  /* both gotchi and drop target cover the full position */
  .create-team__formation-placeholder > * {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  .create-team__gotchis {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-rows: auto auto minmax(0, 1fr);
    column-gap: 1rem;
    row-gap: 0.5rem;
    align-items: center;
  }
  @media (max-width: 1299px) {
    .create-team__gotchis {
      max-height: 24rem;
    }
  }
  .create-team__gotchis-source {
    grid-column: 1 / 4;
    margin: 0 4px 1rem;
  }
  .create-team__gotchis .create-team__section-label {
    margin-bottom: 0;
  }
  :deep(.create-team__gotchis-search) {
    max-width: 200px;
  }
  :deep(.create-team__gotchis-connect-wallet) {
    padding-top: 1rem;
    display: grid;
    place-items: center;
  }
  :deep(.create-team__gotchis-available) {
    align-self: stretch;
    padding: 1rem;
    grid-column: 1 / 4;
    border: 2px solid var(--c-black);
    overflow-y: auto;
    background: rgba(var(--c-black-rgb), 0.25);
  }
  .create-team__gotchis-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, 6rem);
    column-gap: 1.5rem;
    row-gap: 1.5rem;
    user-select: none;
  }
  .create-team__gotchis-result-button {
    display: block;
    max-width: 100%;
    border: 1px solid var(--c-black);
    background: linear-gradient(180deg, var(--c-dark-purple) 0%, var(--c-black) 100%);
  }
  .create-team__gotchis-result--not-draggable {
    opacity: 0.3;
    filter: grayscale(100%);
  }
  .create-team__gotchis-result-image {
    width: 6rem;
    height: 6rem;
  }
  .create-team__gotchis-result-name {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding: 0 0.2rem 0.4rem;
    font-size: 0.75rem;
    line-height: 0.625rem;
    color: var(--c-white);
  }
  .create-team__gotchis-result-available-specials {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(1.5rem, 1fr));
  }
  .create-team__gotchis-result-popup {
    display: grid;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .create-team__gotchis-result-popup-header {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    letter-spacing: 0.03rem;
    font-weight: bold;
  }
  .create-team__gotchis-result-popup-stats {
    margin-bottom: 0.75rem;
  }
  .create-team__gotchis-result-popup-slot-button {
    margin-right: 0.7rem;
    width: 1.75rem;
    border: 2px solid white;
    padding: 0.25rem;
    background: transparent;
    color: white;
  }
  .create-team__gotchis-result-popup-slot-button--selected,
  .create-team__gotchis-result-popup-slot-button:hover {
    background: white;
    color: var(--c-black);
  }


  /* drag-and-drop styles */

  /* drop target in formation */
  .create-team__formation-position-target {
    width: 100%;
    height: 100%;
  }
  .create-team--is-dragging .create-team__formation-position-target {
    position: relative; /* bring above an existing gotchi */
    z-index: 1; /* bring above an existing gotchi */
    background: rgba(var(--c-light-yellow-rgb), 0.3);
  }

  /* the item being dragged, in its original list */
  .create-team__gotchis-draggable--ghost {
    opacity: 0.5;
  }

  /* the item being dragged, in all situations (original list, following cursor, clone in the target list) */
  .create-team__gotchis-draggable--chosen {
  }
  /* the item being dragged, following the cursor */
  .create-team__gotchis-draggable--drag {
  }
  /* the item being dragged, preview in the target list before dropping */
  .create-team__formation-position-target .create-team__gotchis-draggable--chosen {
    height: 100%;
    display: grid;
    place-content: center;
  }
  :deep(.team-formation__position):has(.create-team__gotchis-draggable--chosen) {
    z-index: 2; /* bring position container - which contains the preview item - above an existing gotchi */
  }
  .create-team__formation-position-target .create-team__gotchis-draggable--chosen button {
    width: 6.125rem;
    height: 7.5rem;
    border: none;
  }
  .create-team__formation-position-target .create-team__gotchis-draggable--chosen .create-team__gotchis-result-name,
  .create-team__formation-position-target .create-team__gotchis-draggable--chosen .create-team__gotchis-result-special,
  .create-team__formation-position-target .create-team__gotchis-draggable--chosen .create-team__gotchis-result-available-specials {
    display: none;
  }
</style>