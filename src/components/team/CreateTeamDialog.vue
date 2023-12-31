<script setup>
  import { DEV_MODE } from '../../appEnv'
  import orderBy from 'lodash.orderby'
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useTournamentTeams from '../../data/useTournamentTeams'
  import VueDraggable from 'vuedraggable'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteError from '../common/SiteError.vue'
  import FormationPatternSelect from './FormationPatternSelect.vue'
  import FORMATION_PATTERNS from './formationPatterns.json'
  import TeamFormation from './TeamFormation.vue'
  import GotchiInFormation from './GotchiInFormation.vue'
  import GotchiSpecial from './GotchiSpecial.vue'
  import GotchiSpecialSelect from './GotchiSpecialSelect.vue'
  import GotchiDetailsDialog from './GotchiDetailsDialog.vue'
  import GotchiStats from './GotchiStats.vue'
  import LeaderSlotSelect from './LeaderSlotSelect.vue'

  const ROW_NAMES = ['front', 'back']

  const EDIT_MODES = {
    CREATE: 'create',
    REPLACE: 'replace',
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

  const isEditMode = computed(() => props.mode === EDIT_MODES.EDIT)
  const canChangeName = computed(() => !isEditMode.value)

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
        // not connected, can't create or edit a team
        emit('update:isOpen', false)
      }
    },
    { immediate: true }
  )

  const availableGotchis = computed(() => {
    if (isEditMode.value) {
      // editing an existing team: use the gotchis from the team
      if (!props.team?.gotchis) { return null }
      return props.team.gotchis
    } else {
      // use the list of gotchis available to this address
      if (!myGotchisFetchStatus.value.loaded){ return null }
      return myGotchis.value
    }
  })

  const availableGotchisById = computed(() => {
    if (!availableGotchis.value) { return {} }
    return Object.fromEntries(availableGotchis.value.map(item => [item.id, item]))
  })

  // List of available gotchis
  const query = ref('')
  const sortOptions = [
    {
      id: 'brs_desc',
      label: 'Rarity Score'
    },
    {
      id: 'id_asc',
      label: 'Token ID'
    },
    {
      id: 'xp_desc',
      label: 'XP'
    },
    {
      id: 'speed_desc',
      label: 'Speed'
    },
    {
      id: 'health_desc',
      label: 'Health'
    },
    {
      id: 'accuracy_desc',
      label: 'Accuracy'
    },
    {
      id: 'evade_desc',
      label: 'Evasiveness'
    },
    {
      id: 'physical_desc',
      label: 'Physical Power'
    },
    {
      id: 'magic_desc',
      label: 'Magic Power'
    },
    {
      id: 'armor_desc',
      label: 'Armor'
    },
    {
      id: 'resist_desc',
      label: 'Resistance'
    },
    {
      id: 'crit_desc',
      label: 'Critical Hit'
    }
  ]
  const resultSort = ref(sortOptions[0].id)
  const allGotchis = computed(() => {
    if (!availableGotchis.value) { return null }
    return availableGotchis.value.map(g => ({
      ...g,
      nameLowercase: g.name?.toLowerCase() || ''
    }))
  })
  const results = computed(() => {
    if (!allGotchis.value) { return null }
    let filtered = allGotchis.value
    if (query.value) {
      const q = query.value.toLowerCase()
      filtered = filtered.filter(gotchi => {
        if (gotchi.onchainId === q) { return true }
        if (gotchi.nameLowercase.includes(q)) { return true }
        return false
      })
    }
    let [sortAttribute, sortDirection] = resultSort.value.split('_')
    const sorted = orderBy(filtered, [g => g[sortAttribute]], [sortDirection])
    return sorted
  })

  // Form data storage
  const teamName = ref('')
  const teamFormation = ref({
    front: [null, null, null, null, null],
    back: [null, null, null, null, null]
  })
  const selectedFormationPatternId = ref('1')
  const selectedLeaderSlot = ref('1')
  const specialByGotchiId = ref({})

  function clearTeamGotchis () {
    teamFormation.value = {
      front: [null, null, null, null, null],
      back: [null, null, null, null, null]
    }
    specialByGotchiId.value = {}
  }

  // If the available gotchis changes, remove any invalid ones from the team
  watch(
    () => availableGotchis.value,
    () => {
      if (!availableGotchis.value) {
        clearTeamGotchis()
        return
      }
      for (const key of ROW_NAMES) {
        const row = teamFormation.value[key]
        for (let i = 0; i < row.length; i++) {
          const gotchiId = row[i]
          if (gotchiId !== null && !availableGotchisById.value[gotchiId]) {
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
        back: [...newTeam.formation.back]
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
      } else {
        // unexpected case
        console.error('New pattern not found')
      }
    }
  )

  watch(
    () => availableGotchisById.value,
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
    if (!results.value) { return null }
    const gotchiIds = [
      ...teamFormation.value.front,
      ...teamFormation.value.back
    ].flat().filter(id => !!id)
    return gotchiIds.map(id => availableGotchisById.value[id])
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

  const NUM_GOTCHIS_IN_TEAM = 5

  const validationError = computed(() => {
    const teamData = teamToSave.value
    if (!teamData.name) {
      return 'Please provide a name for your team.'
    }
    if (teamData.gotchis?.length !== NUM_GOTCHIS_IN_TEAM) {
      return `Please choose ${NUM_GOTCHIS_IN_TEAM} gotchis for your team.`
    }
    if (!teamData.leader) {
      return 'Please select a leader slot.'
    }
    if (!teamData.gotchis.every(g => !!g.specialId)) {
      return 'Please select a class for all gotchis in your team.'
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
    back: [[], [], [], [], []]
  })

  function removeAllGotchisFromFormation () {
    teamFormation.value = {
      front: [null, null, null, null, null],
      back: [null, null, null, null, null]
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

  function addGotchiToFormation ({ gotchiId, row, positionIndex }) {
    const existingGotchiId = teamFormation.value[row][positionIndex]
    if (existingGotchiId && existingGotchiId !== gotchiId) {
      removeGotchiFromFormation(existingGotchiId)
    }
    teamFormation.value[row][positionIndex] = gotchiId
  }

  for (let rowKey of ROW_NAMES) {
    const row = draggableTargets.value[rowKey]
    for (let positionIndex = 0; positionIndex < row.length; positionIndex++) {
      watch(
        () => draggableTargets.value[rowKey][positionIndex],
        (newTargetArray) => {
          if (newTargetArray.length) {
            // dropped a gotchi into this position
            removeGotchiFromFormation(newTargetArray[0].id)
            addGotchiToFormation({ gotchiId: newTargetArray[0].id, row: rowKey, positionIndex })
            // now clear this target array
            row[positionIndex] = []
          }
        }
      )
    }
  }

  function addGotchiToSlot ({ gotchiId, slotNumber }) {
    removeGotchiFromFormation(gotchiId)
    for (const key of ROW_NAMES) {
      const row = selectedFormationPattern.value[key]
      for (let i = 0; i < row.length; i++) {
        if (row[i] === slotNumber) {
          teamFormation.value[key][i] = gotchiId
          return
        }
      }
    }
  }

  function onMoveFromAvailable (event) {
    // prevent dragging/moving within the available gotchis list
    if (event.to.classList.contains('create-team__gotchis-results')){
      return false
    }
  }

  // Store ID of gotchi to display in a details dialog.
  // The gotchi must be present in the list of gotchis.
  // When it's set and we have gotchi details, open the dialog.
  // When the details dialog is closed, clear the stored gotchi ID.
  const displayGotchiId = ref(null)
  const displayGotchi = computed(() => {
    if (!displayGotchiId.value || !availableGotchisById.value) { return null }
    return {
      ...availableGotchisById.value[displayGotchiId.value],
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

  function autofill () {
    teamName.value = 'Auto-filled Team'
    removeAllGotchisFromFormation()
    let added = 0
    for (let i = 0; i < availableGotchis.value.length; i++) {
      const gotchi = availableGotchis.value?.[i]
      if (gotchi && !differentTeamForGotchi.value[gotchi.id]) {
        addGotchiToSlot({
          gotchiId: gotchi.id,
          slotNumber: ++added
        })
        if (gotchi.availableSpecials.length > 1 && !specialByGotchiId.value[gotchi.id]) {
          specialByGotchiId.value[gotchi.id] = gotchi.availableSpecials[0]
        }
        if (added === 5) {
          return
        }
      }
    }
  }
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="large"
    strict
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <template #title>
      <span style="text-transform: capitalize;">{{ mode }}</span>
      Team
    </template>

    <SiteError
      v-if="showError && errorMessage"
      class="create-team-error"
    >
      {{ errorMessage }}
    </SiteError>

    <SiteError
      v-if="showValidationError && validationError"
      class="create-team-error create-team-error--validation"
    >
      {{ validationError }}
    </SiteError>

    <div
      class="create-team"
      :class="{
        'create-team--is-dragging': isDragging
      }"
    >
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
      <section class="create-team__formation-pattern">
        <label class="create-team__section-label">
          2. Select formation:
        </label>
        <FormationPatternSelect
          v-model="selectedFormationPatternId"
        />
      </section>
      <section class="create-team__formation">
        <TeamFormation
          :team="teamToDisplay"
          withRowLabels
        >
          <template #position="{ row, position }">
            <div
              class="create-team__formation-placeholder"
            >
              <template v-if="selectedFormationPattern?.[row][position - 1]">
                <GotchiInFormation
                  emptyMode="placeholder"
                  variant="large"
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
              />
            </div>
          </template>
          <template #gotchi="{ gotchi, row, position }">
            <GotchiInFormation
              :gotchi="{ ...gotchi, specialId: specialByGotchiId[gotchi.id] }"
              variant="large"
              :slotNumber="selectedFormationPattern[row][position - 1]"
              :isLeader="teamToDisplay.leader === gotchi.id"
              isRemovable
              isSelectable
              @remove="removeGotchiFromFormation(gotchi.id)"
              @select="displayGotchiId = gotchi.id"
            >
              <template #after-name>
                <div
                  class="create-team__formation-special"
                  :class="{
                    'create-team__formation-special--interactive': gotchi.canSelectSpecial
                  }"
                >
                  <GotchiSpecial
                    v-if="!gotchi.canSelectSpecial && specialByGotchiId[gotchi.id]"
                    :id="specialByGotchiId[gotchi.id]"
                    :forSpecialShowClass="true"
                  />
                  <GotchiSpecialSelect
                    v-if="gotchi.canSelectSpecial"
                    :key="`${gotchi.id}_${row}_${position}`"
                    v-model="specialByGotchiId[gotchi.id]"
                    :availableSpecials="gotchi.availableSpecials"
                  />
                </div>
              </template>
            </GotchiInFormation>
          </template>
        </TeamFormation>
      </section>
      <section class="create-team__gotchis">
        <label class="create-team__section-label">
          3. Drag 5 Gotchi to team grid
        </label>
        <div class="create-team__gotchis-search">
          <SiteTextField
            v-model="query"
            placeholder="Search gotchis"
            search
            subtle
          />
        </div>
        <div class="create-team__gotchis-sort">
          Sort by:
          <SiteSelect v-model="resultSort">
            <option
              v-for="option in sortOptions"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </option>
          </SiteSelect>
        </div>
        <div class="create-team__gotchis-available word-break">
          <div
            v-if="myGotchisFetchStatus.loading"
            class="create-team__gotchis-loading"
          >
            Loading...
          </div>
          <div
            v-if="myGotchisFetchStatus.error"
            class="create-team__gotchis-error"
          >
            {{ myGotchisFetchStatus.errorMessage }}
          </div>
          <template v-else-if="availableGotchis">
            <div
              v-if="!results?.length"
              class="create-team__gotchis-empty"
            >
              No gotchis found.
            </div>
            <VueDraggable
              v-model="results"
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
                      class="button-reset"
                      style="display: block;"
                    >
                      <img
                        :src="element.svgFront"
                        :alt="`${element.name} #${element.id}`"
                        class="create-team__gotchis-result-image"
                        loading="lazy"
                      />
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
                              @click="addGotchiToSlot({ gotchiId: element.id, slotNumber: i })"
                            >
                              {{ i }}
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
        </div>
      </section>
      <section class="create-team__leader">
        <label class="create-team__section-label">
          4. Choose leader slot:
        </label>
        <LeaderSlotSelect
          v-model="selectedLeaderSlot"
        />
      </section>
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
    <GotchiDetailsDialog
      v-if="displayGotchi"
      v-model:isOpen="displayGotchiDialogIsOpen"
      :gotchi="displayGotchi"
      :isLeader="displayGotchi.id === teamToDisplay.leader"
    />
  </SiteDialog>
</template>

<style scoped>
  .create-team-error {
    /* ensure error is visible even if scrolled down in the dialog */
    position: sticky;
    top: 0;
    z-index: 2;

    margin-bottom: 1.5rem;
  }

  .create-team {
    margin: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  @media (min-width: 1300px) {
    .create-team {
      margin: 0;
      display: grid;
      grid-template-columns: minmax(0, auto) minmax(0, 1fr) minmax(0, auto);
      grid-template-rows: auto minmax(0, 1fr) auto;
      gap: 2rem;
    }
  }

  .create-team__formation-pattern,
  .create-team__gotchis {
    grid-column: 2 / span 2;
  }
  .create-team__formation {
    grid-row: 2 / span 2;
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

  .create-team__formation-special {
    display: inline-block;
    margin-top: 0.5rem;
  }
  .create-team__formation-special--interactive {
    position: relative;
    z-index: 1; /* bring above the gotchi click area */
  }

  .create-team__gotchis {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    grid-template-rows: auto minmax(0, 1fr);
    column-gap: 1rem;
    row-gap: 0.5rem;
    align-items: center;
  }
  .create-team__gotchis .create-team__section-label {
    margin-bottom: 0;
  }
  .create-team__gotchis-search {
    max-width: 200px;
  }
  .create-team__gotchis-available {
    align-self: stretch;
    padding: 1rem;
    grid-column: 1 / 4;
    border: 2px solid var(--c-black);
    overflow-y: auto;
    max-height: 24rem;
    background: rgba(var(--c-black-rgb), 0.25);
  }
  .create-team__gotchis-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, 6rem);
    column-gap: 1.2rem;
    row-gap: 1rem;
    user-select: none;
  }
  .create-team__gotchis-result--not-draggable {
    opacity: 0.3;
    filter: grayscale(100%);
  }
  .create-team__gotchis-result-image {
    width: 6rem;
    height: 6rem;
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


  .create-team__submit {
    display: grid;
    align-items: end;
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
    position: relative; /* bring above an existing gotchi */
    z-index: 1; /* bring above an existing gotchi */
    height: 100%;
    display: grid;
    place-content: center;
  }
  .create-team__formation-position-target .create-team__gotchis-draggable--chosen img {
    width: 4.5rem;
    height: 4.5rem;
  }
</style>