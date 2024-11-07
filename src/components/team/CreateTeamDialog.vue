<script setup>
  import { DEV_MODE } from '../../appEnv'
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useTournamentTeams from '../../data/useTournamentTeams'
  import { getEmbeddedGotchisFromFormation } from '../../data/teamUtils'
  import profileService from '../../data/profileService'
  import useStatus from '../../utils/useStatus'
  import VueDraggable from 'vuedraggable'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteButton from '../common/SiteButton.vue'
  import SiteButtonGroup from '../common/SiteButtonGroup.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteSelect from '../common/SiteSelect.vue'
  import SiteError from '../common/SiteError.vue'
  import FormationPatternSelect from './FormationPatternSelect.vue'
  import FORMATION_PATTERNS from './formationPatterns.json'
  import TeamFormation from './TeamFormation.vue'
  import TeamSubstitutes from './TeamSubstitutes.vue'
  import GotchiInFormation from './GotchiInFormation.vue'
  import GotchiSpecial from './GotchiSpecial.vue'
  import GotchiSpecialSelect from './GotchiSpecialSelect.vue'
  import GotchiItemSlot from '../team/GotchiItemSlot.vue'
  import GotchiDetailsDialog from './GotchiDetailsDialog.vue'
  import GotchiStats from './GotchiStats.vue'
  import LeaderSlotSelect from './LeaderSlotSelect.vue'
  import SourceGotchisMy from './SourceGotchisMy.vue'
  import SourceGotchisTraining from './SourceGotchisTraining.vue'
  import SourceGotchisTeam from './SourceGotchisTeam.vue'
  import SourceSavedTeams from './SourceSavedTeams.vue'
  import SourceGotchisSearch from './SourceGotchisSearch.vue'
  import SourceItemsUnlimited from './SourceItemsUnlimited.vue'

  const ROW_NAMES = ['front', 'back']
  const ALL_ROW_NAMES = [...ROW_NAMES, 'substitutes']

  const EDIT_MODES = {
    CREATE: 'create',
    CREATE_TRAINING: 'create_training',
    EDIT_TRAINING: 'edit_training',
    EDIT: 'edit',
    EDIT_PROFILE_SAVED: 'edit_profile_saved'
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
  const emit = defineEmits(['update:isOpen', 'update:team', 'savedProfileTeam'])

  const deconstructEmbeddedGotchiFromSlot = function (gotchiEmbedded) {
    if (!gotchiEmbedded) { return null }
    const { specialId, itemId, ...gotchi } = gotchiEmbedded
    return {
      gotchi,
      specialId,
      itemId
    }
  }
  const constructEmbeddedGotchiFromSlot = function (slot) {
    if (!slot?.gotchiId) { return null }
    const gotchi = teamGotchisById.value[slot.gotchiId]
    if (!gotchi) { return null }
    return {
      ...gotchi,
      specialId: slot.specialId,
      itemId: slot.itemId
    }
  }

  const incomingTeamGotchis = computed(() => {
    if (!props.team?.formation) { return null }
    // extract all gotchi objects from the incoming team formation
    return [
      ...props.team.formation.back,
      ...props.team.formation.front,
      ...props.team.formation.substitutes
    ].filter(gotchi => !!gotchi)
    .map(g => deconstructEmbeddedGotchiFromSlot(g).gotchi)
  })

  const modeLabel = computed(() => {
    if (props.mode === EDIT_MODES.CREATE_TRAINING) { return 'Create'; }
    if (props.mode === EDIT_MODES.EDIT_TRAINING) { return 'Customize'; }
    if (props.mode === EDIT_MODES.EDIT_PROFILE_SAVED) { return 'Edit Saved'; }
    return props.mode
  })

  const isEditMode = computed(() => props.mode === EDIT_MODES.EDIT)
  const myGotchisAllowed = computed(() => [EDIT_MODES.CREATE, EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode))
  const trainingGotchisAllowed = computed(() => [EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode))
  const searchGotchisAllowed = computed(() => [EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode))
  const onlyMyGotchisAllowed = computed(() => [EDIT_MODES.CREATE].includes(props.mode))
  const onlyTeamGotchisAllowed = computed(() => [EDIT_MODES.EDIT].includes(props.mode))

  const savedTeamsAvailable = computed(() => [EDIT_MODES.CREATE, EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode))

  const unlimitedItemsAvailable = computed(() => [EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode))
  // const myItemsAvailable = computed(() => [EDIT_MODES.CREATE, EDIT_MODES.EDIT].includes(props.mode))

  const canChangeName = computed(() => !isEditMode.value)
  const withSubstitutes = computed(() => [EDIT_MODES.CREATE, EDIT_MODES.EDIT].includes(props.mode))
  const enableDuplicates = computed(() => [EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode))

  const primarySaveLabel = computed(() => {
    if ([EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING].includes(props.mode)) {
      return 'Use Team'
    }
    if ([EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode)) {
      return 'Update'
    }
    return 'Save Team'
  })

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
  const gotchiIdsInDifferentTeams = computed(() => Object.keys(differentTeamForGotchi.value))

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

  const SOURCE_TYPE = {
    GOTCHI: 'gotchi',
    TEAM: 'team',
    ITEM: 'item'
  }
  const SOURCE_TYPE_LABELS = {
    [SOURCE_TYPE.GOTCHI]: 'Gotchis',
    [SOURCE_TYPE.TEAM]: 'Saved Teams',
    [SOURCE_TYPE.ITEM]: 'Items'
  }
  const SOURCES_BY_TYPE = {
    [SOURCE_TYPE.GOTCHI]: [
      {
        id: 'my',
        label: 'My Gotchis',
        component: SourceGotchisMy,
        type: SOURCE_TYPE.GOTCHI
      },
      {
        id: 'training',
        label: 'Training Gotchis',
        component: SourceGotchisTraining,
        type: SOURCE_TYPE.GOTCHI
      },
      {
        id: 'team',
        label: 'Team Gotchis',
        component: SourceGotchisTeam,
        props: { incomingTeamGotchis: true },
        type: SOURCE_TYPE.GOTCHI
      },
      {
        id: 'searchgotchis',
        label: 'Find Gotchi',
        component: SourceGotchisSearch,
        type: SOURCE_TYPE.GOTCHI
      }
    ],
    [SOURCE_TYPE.TEAM]: [
      {
        id: 'savedteams',
        label: 'Saved Teams',
        component: SourceSavedTeams,
        props: { onlyMyGotchisAllowed: true, unavailableGotchiIds: true, savedTeamsLastChanged: true },
        type: SOURCE_TYPE.TEAM
      }
    ],
    [SOURCE_TYPE.ITEM]: [
      {
        id: 'unlimiteditems',
        label: 'Items',
        component: SourceItemsUnlimited,
        type: SOURCE_TYPE.ITEM
      }
    ]
  }
  const SOURCES_BY_ID = Object.fromEntries(Object.values(SOURCES_BY_TYPE).flat().map(s => [s.id, s]))

  const availableSources = computed(() => {
    const sources = []
    const addSource = function (sourceId) {
      sources.push(SOURCES_BY_ID[sourceId])
    }
    if (myGotchisAllowed.value) {
      addSource('my')
    }
    if (trainingGotchisAllowed.value) {
      addSource('training')
    }
    if (onlyTeamGotchisAllowed.value) {
      addSource('team')
    }
    if (savedTeamsAvailable.value) {
      addSource('savedteams')
    }
    if (searchGotchisAllowed.value) {
      addSource('searchgotchis')
    }
    if (unlimitedItemsAvailable.value) {
      addSource('unlimiteditems')
    }
    return sources
  })
  const availableSourcesIds = computed(() => availableSources.value.map(s => s.id))

  const availableSourcesByType = computed(() => {
    const sourcesByType = Object.fromEntries(Object.values(SOURCE_TYPE).map(type => [type, []]))
    for (const source of availableSources.value) {
      sourcesByType[source.type].push(source)
    }
    return sourcesByType
  })

  const availableSourceTypeTabs = computed(() => {
    const typeTabs = []
    const typeEntries = Object.entries(availableSourcesByType.value)
    for (let i = 0; i < typeEntries.length; i++) {
      const [type, sources] = typeEntries[i]
      if (sources.length) {
        typeTabs.push({
          id: type,
          label: SOURCE_TYPE_LABELS[type],
          sources
        })
      }
    }
    if (typeTabs.length > 1) {
      for (let i = 0; i < typeTabs.length; i++) {
        typeTabs[i].grouped = i === 0 ? 'start' : i === typeTabs.length - 1 ? 'end' : 'middle'
      }
    }
    return typeTabs
  })

  const selectedSourceId = ref(null)
  watch(
    () => [myGotchisAllowed.value, address.value, trainingGotchisAllowed.value],
    () => {
      if (!selectedSourceId.value || !availableSourcesIds.value.includes(selectedSourceId.value)) {
        selectedSourceId.value = availableSources.value[0].id
      }
    },
    { immediate: true }
  )

  const activeSourceTypeTab = computed(() => availableSourceTypeTabs.value.find(tab => tab.id === sourceComponentType.value))

  const sourceComponent = computed(() => {
    return SOURCES_BY_ID[selectedSourceId.value]?.component || 'div'
  })

  const sourceComponentType = computed(() => {
    return SOURCES_BY_ID[selectedSourceId.value]?.type
  })

  const sourceComponentProps = computed(() => {
    const propsRequested = SOURCES_BY_ID[selectedSourceId.value]?.props
    const propsToProvide = {}
    if (propsRequested) {
      if (propsRequested.incomingTeamGotchis) {
        propsToProvide.incomingTeamGotchis = incomingTeamGotchis.value
      }
      if (propsRequested.onlyMyGotchisAllowed) {
        propsToProvide.onlyMyGotchisAllowed = onlyMyGotchisAllowed.value
      }
      if (propsRequested.unavailableGotchiIds) {
        propsToProvide.unavailableGotchiIds = gotchiIdsInDifferentTeams.value
      }
      if (propsRequested.savedTeamsLastChanged) {
        propsToProvide.savedTeamsLastChanged = savedTeamsLastChanged.value
      }
    }
    return propsToProvide
  })


  // Form data storage
  const teamName = ref('')

  const selectedFormationPatternId = ref('1')
  const selectedFormationPattern = computed(() => FORMATION_PATTERNS.find(pattern => pattern.id === selectedFormationPatternId.value))

  // teamSlots hold objects { gotchiId, specialId, itemId }
  const teamSlots = ref({
    main: [null, null, null, null, null], // Correspond to formation's slots, which are named 1,2,3,4,5 but stored in 0-based indexes here
    substitutes: [null, null] // formation's named slots are 1,2
  })
  const teamSlotsGotchiIds = computed(() => Object.values(teamSlots.value).flat().map(slot => slot?.gotchiId).filter(id => !!id))
  function clearTeamSlots () {
    teamSlots.value = {
      main: [null, null, null, null, null],
      substitutes: [null, null]
    }
    // also clear teamGotchis objects:
    // this is important when loading teams with generated gotchi IDs that might be the same as the previous gotchis
    // and needs to be done synchronously as the cleanTeamGotchis watcher won't trigger in time
    teamGotchis.value = []
  }

  // teamGotchis has full gotchi objects, used to look up gotchi details based on a gotchi id
  const teamGotchis = ref([])
  const teamGotchisById = computed(() => {
    if (!teamGotchis.value) { return {} }
    return Object.fromEntries(teamGotchis.value.map(g => [g.id, g]))
  })
  const addGotchiObjectToTeam = function (gotchi) {
    if (!teamGotchisById.value[gotchi.id]) {
      teamGotchis.value.push(gotchi)
    }
  }
  // call this to remove teamGotchis that are not present in the teamSlots
  const cleanTeamGotchis = function () {
    const newTeamGotchis = teamGotchis.value.filter(gotchi => teamSlotsGotchiIds.value.includes(gotchi.id))
    if (newTeamGotchis.length !== teamGotchis.value.length) {
      teamGotchis.value = newTeamGotchis
    }
  }
  watch(
    () => teamSlotsGotchiIds.value,
    cleanTeamGotchis
  )

  const selectedLeaderSlot = ref('1')
  const leaderGotchiId = computed(() => selectedLeaderSlot.value ? teamSlots.value.main[selectedLeaderSlot.value - 1]?.gotchiId || null : null)

  let lastGeneratedGotchiId = 2000000
  const generateUniqueGotchiId = function () {
    const existingIds = teamSlotsGotchiIds.value
    let newId = lastGeneratedGotchiId + 1
    while (existingIds.includes(newId)) {
      newId++
    }
    lastGeneratedGotchiId = newId
    return newId
  }

  function removeGotchiFromSlotsById (gotchiId) {
    let foundGotchiSlot = null
    for (const key in teamSlots.value) {
      const slots = teamSlots.value[key]
      for (let i = 0; i < slots.length; i++) {
        if (slots[i]?.gotchiId === gotchiId) {
          foundGotchiSlot = slots[i]
          slots[i] = null
        }
      }
    }
    return foundGotchiSlot
  }

  function removeGotchiFromSlot ({ type, slotNumber }) {
    if (!teamSlots.value[type]) { return }
    teamSlots.value[type][slotNumber - 1] = null
  }

  function addGotchiToSlot ({ gotchi, type, slotNumber, restoring }) {
    const duplicatesEnabled = enableDuplicates.value
    // console.log('addGotchiToSlot', { type, slotNumber, gotchi, duplicatesEnabled, restoring })

    // remove existing matching gotchi
    // (can do even if duplicates are enabled, as duplicates should still have unique ids in this team)
    const removedSlot = removeGotchiFromSlotsById(gotchi.id)

    // Provided gotchi object might include embedded special and/or item
    const { specialId: embeddedSpecialId, itemId: embeddedItemId, gotchi: gotchiObject } = deconstructEmbeddedGotchiFromSlot(gotchi)

    // if duplicates are allowed, generate a new id for this gotchi, which will only be used on the frontend
    // (server will assign its own gotchi ids upon saving)
    // But if we're restoring a saved team, don't generate new IDs:
    // we can assume they will already be unique, and
    // we need to preserve the saved ids so the leader ID can be matched up.
    if (duplicatesEnabled && !restoring ) {
      gotchiObject.id = generateUniqueGotchiId()
    }

    // Selected special:
    // - if only one is available to this gotchi, that takes priority
    // - if the provided gotchi has a specialId embedded that is valid, use that
    // - if there was a selection in the just-removed slot reuse that ('move' gotchi)
    // - otherwise unselected
    let specialId = null
    if (gotchi.availableSpecials?.length === 1) {
      specialId = gotchi.availableSpecials[0]
    } else {
      if (embeddedSpecialId && gotchi.availableSpecials.includes(embeddedSpecialId)) {
        specialId = embeddedSpecialId
      } else if (removedSlot?.specialId) {
        specialId = removedSlot.specialId
      }
    }

    // Selected item:
    // - if the provided gotchi has a itemId embedded that is valid, use that
    let itemId = null
    if (embeddedItemId) {
      // TODO check if this item is available to use
      itemId = embeddedItemId
    }

    teamSlots.value[type][slotNumber - 1] = {
      gotchiId: gotchiObject.id,
      specialId,
      itemId
    }
    addGotchiObjectToTeam(gotchiObject)
    // console.log({ teamSlots: teamSlots.value })
  }


  // In tournaments, can only use a restricted list of gotchis, so if this changes, remove any invalid ones from the team.
  watch(
    () => [onlyMyGotchisAllowed.value, onlyTeamGotchisAllowed.value, myGotchis.value, incomingTeamGotchis.value],
    () => {
      if (!(onlyMyGotchisAllowed.value || onlyTeamGotchisAllowed.value)) { return }
      if (onlyMyGotchisAllowed.value && !myGotchisFetchStatus.value.loaded) { return }
      const allowedGotchis = onlyMyGotchisAllowed.value ? myGotchis.value : incomingTeamGotchis.value
      if (!allowedGotchis) {
        clearTeamSlots()
        return
      }
      const allowedGotchiIds = allowedGotchis.map(g => g.id)
      for (const slots of Object.values(teamSlots.value) ) {
        for (let i = 0; i < slots.length; i++) {
          const gotchiId = slots[i]?.gotchiId
          if (gotchiId !== null && !allowedGotchiIds.includes(gotchiId)) {
            slots[i] = null
          }
        }
      }
    }
  )

  function addItemToSlot ({ item, type, slotNumber, restoring }) {
    console.log('addItemToSlot', { type, slotNumber, item, restoring })
    const slot = teamSlots.value[type][slotNumber - 1]
    if (!slot?.gotchiId) {
      console.error('cannot add item to empty slot', { type, slotNumber })
      return
    }
    slot.itemId = item.id
  }

  function removeItemFromSlot ({ type, slotNumber }) {
    const slot = teamSlots.value[type][slotNumber - 1]
    slot.itemId = null
  }


  // Sync incoming team data
  function loadTeam (newTeam) {
    if (!newTeam) { return }
    const pattern = findMatchingFormationPattern(newTeam.formation)
    if (!pattern) {
      // if we don't recognise the formation pattern, don't load the team
      return
    }
    teamName.value = newTeam.name || ''
    selectedFormationPatternId.value = pattern.id
    console.log('Sync incoming team data', { newTeam, pattern })
    // translate incoming formation (front, back, substitutes) into slots (main, substitutes) and teamGotchis (objects)
    clearTeamSlots()
    for (const row of ROW_NAMES) {
      const formationRow = pattern[row]
      for (let i = 0; i < formationRow.length; i++) {
        const slotNumber = formationRow[i]
        if (slotNumber) {
          const gotchi = newTeam.formation[row][i]
          if (gotchi && !differentTeamForGotchi.value[gotchi.id]) {
            addGotchiToSlot({ gotchi, type: 'main', slotNumber, restoring: true })
          }
        }
      }
    }
    if (newTeam.formation.substitutes) {
      for (let i = 0; i < newTeam.formation.substitutes.length; i++) {
        const slotNumber = i + 1
        const gotchi = newTeam.formation.substitutes[i]
        if (gotchi && !differentTeamForGotchi.value[gotchi.id]) {
          addGotchiToSlot({ gotchi, type: 'substitutes', slotNumber, restoring: true })
        }
      }
    }
    console.log('synced gotchis into slots', teamSlots.value, teamGotchis.value)

    let leaderSlotNumber = 1
    if (newTeam.leader) {
      const leaderSlotIndex = teamSlots.value.main.findIndex(slot => slot?.gotchiId === newTeam.leader)
      if (leaderSlotIndex !== -1) {
        leaderSlotNumber = leaderSlotIndex + 1
      }
    }
    selectedLeaderSlot.value = `${leaderSlotNumber}`
    console.log('synced leader', { leaderId: newTeam.leader, leaderSlot: selectedLeaderSlot.value })
  }

  watch(
    () => props.team,
    (newTeam) => {
      loadTeam(newTeam)
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

  const teamFormation = computed(() => {
    const result = {}
    for (const key of ROW_NAMES) {
      const resultRow = result[key] = []
      const patternRow = selectedFormationPattern.value[key]
      for (let i = 0; i < patternRow.length; i++){
        const slotNumber = patternRow[i]
        if (slotNumber) {
          resultRow.push(constructEmbeddedGotchiFromSlot(teamSlots.value.main[slotNumber - 1]))
        } else {
          resultRow.push(null)
        }
      }
    }
    return {
      ...result,
      substitutes: teamSlots.value.substitutes.map(constructEmbeddedGotchiFromSlot)
    }
  })

  const teamToDisplay = computed(() => {
    return {
      name: teamName.value,
      formation: teamFormation.value,
      leader: leaderGotchiId.value
    }
  })

  // Validating and saving the team
  const teamToSave = computed(() => {
    return {
      name: teamName.value?.trim(),
      formation: teamFormation.value,
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
    ].flat().filter(g => !!g).length
    if (numGotchisInActiveRows !== REQUIRED_NUM_GOTCHIS_IN_ACTIVE_ROWS) {
      return `Please choose ${REQUIRED_NUM_GOTCHIS_IN_ACTIVE_ROWS} gotchis for your team.`
    }
    if (!teamData.leader) {
      return 'Please select a leader slot.'
    }
    const allGotchis = getEmbeddedGotchisFromFormation(teamData.formation)
    if (!allGotchis.every(g => !!g.specialId)) {
      return 'Please select a class for all gotchis in your team.'
    }
    // If editing a team during a tournament, keep all the same gotchis
    if (isEditMode.value) {
      if (allGotchis.length !== incomingTeamGotchis.value?.length) {
        return 'Please keep all gotchis in your team (or substitutes).'
      }
    }
    return false
  })
  const showError = ref(false)
  const showValidationError = ref(false)
  const showProfileTeamError = ref(false)
  const showSaveProfileTeamSuccess = ref(false)
  watch(
    () => teamToSave.value,
    () => {
      showError.value = false
      showValidationError.value = false
      showProfileTeamError.value = false
      showSaveProfileTeamSuccess.value = false
    }
  )

  const hideError = function () {
    if (showError.value) {
      showError.value = false
    } else if (showValidationError.value) {
      showValidationError.value = false
    } else if (showProfileTeamError.value) {
      showProfileTeamError.value = false
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


  const canSaveProfileTeam = computed(() =>
    !!address.value &&
    [EDIT_MODES.CREATE, EDIT_MODES.CREATE_TRAINING, EDIT_MODES.EDIT_TRAINING, EDIT_MODES.EDIT_PROFILE_SAVED].includes(props.mode)
  )
  const { status: submitProfileTeamStatus, setLoading: setProfileTeamLoading } = useStatus()

  const savedTeamsLastChanged = ref(Date.now())

  async function saveProfileTeam () {
    if (validationError.value) {
      showValidationError.value = true
      return
    }

    showProfileTeamError.value = true
    const teamData = teamToSave.value

    const [isStale, setLoaded, setError] = setProfileTeamLoading()
    try {
      await profileService.createTeam({
        owner: address.value,
        ...teamData
      })
      if (isStale()) { return; }
      setLoaded()
      showSaveProfileTeamSuccess.value = true
      setTimeout(() => showSaveProfileTeamSuccess.value = false, 5000)
      savedTeamsLastChanged.value = Date.now()
      emit('savedProfileTeam')
    } catch (e) {
      setError(e.message)
    }
  }

  function loadSavedTeam (team) {
    loadTeam(team)
  }

  // Moving gotchis from available list to the formation

  const findDroppedTargetSlot = function (rowKey, positionIndex) {
    let targetSlotType = 'main'
    let targetSlotNumber = null
    if (rowKey === 'substitutes') {
      targetSlotType = 'substitutes'
      targetSlotNumber = positionIndex + 1
    } else {
      targetSlotNumber = selectedFormationPattern.value[rowKey]?.[positionIndex]
    }
    return {
      targetSlotType,
      targetSlotNumber
    }
  }

  const isDraggingGotchi = ref(false)

  const draggableTargets = ref({
    front: [[], [], [], [], []],
    back: [[], [], [], [], []],
    substitutes: [[], []]
  })

  for (let rowKey of ALL_ROW_NAMES) {
    const row = draggableTargets.value[rowKey]
    for (let positionIndex = 0; positionIndex < row.length; positionIndex++) {
      watch(
        () => draggableTargets.value[rowKey][positionIndex],
        (newTargetArray) => {
          if (newTargetArray.length) {
            // dropped a gotchi into this position
            const gotchi = newTargetArray[0]
            // console.log('handle dropped gotchi', { gotchi, rowKey, positionIndex })
            // TODO Extra features:
            // a) dragging within the formation to move a gotchi between slots

            // Determine the target slot corresponding to the row/position
            const { targetSlotType, targetSlotNumber } = findDroppedTargetSlot(rowKey, positionIndex)
            if (!targetSlotNumber) {
              console.error('Dropped gotchi but unable to find target slot')
              return
            }
            // add the dropped gotchi to the target slot
            addGotchiToSlot({ gotchi, type: targetSlotType, slotNumber: targetSlotNumber })
            // now clear this target array
            row[positionIndex] = []
          }
        }
      )
    }
  }

  function onMoveGotchiFromAvailable (event) {
    // prevent dragging/moving within the available gotchis list
    if (event.to.classList.contains('create-team__gotchis-results')){
      return false
    }
  }


  // Moving items from available list to gotchis in the formation

  const occupiedMainSlotNumbers = computed(() => {
    const result = []
    const mainSlots = teamSlots.value.main
    for (let i = 0; i < mainSlots.length; i++) {
      if (mainSlots[i]) {
        result.push(i + 1)
      }
    }
    return result
  })

  const isDraggingItem = ref(false)
  const draggableItemTargets = ref({
    front: [[], [], [], [], []],
    back: [[], [], [], [], []],
    substitutes: [[], []]
  })

    for (let rowKey of ALL_ROW_NAMES) {
    const row = draggableItemTargets.value[rowKey]
    for (let positionIndex = 0; positionIndex < row.length; positionIndex++) {
      watch(
        () => draggableItemTargets.value[rowKey][positionIndex],
        (newTargetArray) => {
          if (newTargetArray.length) {
            // dropped an item into this position
            const item = newTargetArray[0]
            // console.log('handle dropped item', { item, rowKey, positionIndex })

            // Determine the target slot corresponding to the row/position
            const { targetSlotType, targetSlotNumber } = findDroppedTargetSlot(rowKey, positionIndex)
            if (!targetSlotNumber) {
              console.error('Dropped item but unable to find target slot')
              return
            }
            // add the dropped item to the target slot
            addItemToSlot({ item, type: targetSlotType, slotNumber: targetSlotNumber })
            // now clear this target array
            row[positionIndex] = []
          }
        }
      )
    }
  }


  function onMoveItemFromAvailable (event) {
    // prevent dragging/moving within the available items list
    if (event.to.classList.contains('create-team__items-results')){
      return false
    }
  }


  // Store slot of gotchi to display in a details dialog.
  // When it's set and we have gotchi details, open the dialog.
  // When the details dialog is closed, clear the stored gotchi ID.
  const displayGotchiSlot = ref(null) // { type, slotNumber }
  const displayGotchi = computed(() => {
    if (!displayGotchiSlot.value) { return null }
    const { type, slotNumber } = displayGotchiSlot.value
    const slot = teamSlots.value[type]?.[slotNumber - 1]
    return constructEmbeddedGotchiFromSlot(slot)
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
        displayGotchiSlot.value = null
      }
    }
  )

  function autofill () {
    teamName.value = 'Auto-filled Team'
    clearTeamSlots()
    const availableGotchis = myGotchis.value || []
    let added = 0
    for (let i = 0; i < availableGotchis.length; i++) {
      const gotchi = availableGotchis[i]
      if (gotchi && !differentTeamForGotchi.value[gotchi.id]) {
        addGotchiToSlot({
          gotchi: {
            ...gotchi,
            specialId: gotchi.availableSpecials[0],
            itemId: null
          },
          type: 'main',
          slotNumber: ++added
        })
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
    variant="full"
    strict
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <div
      v-if="(showError && errorMessage) || (showValidationError && validationError) || (showProfileTeamError && submitProfileTeamStatus.errorMessage)"
      class="create-team-error"
    >
      <SiteError>
        <div class="create-team-error__content">
          <template v-if="(showError && errorMessage)">
            {{ errorMessage }}
          </template>
          <template v-else-if="(showValidationError && validationError)">
            {{ validationError }}
          </template>
          <template v-else>
            {{ submitProfileTeamStatus.errorMessage }}
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
        'create-team--is-dragging-gotchi': isDraggingGotchi,
        'create-team--is-dragging-item': isDraggingItem
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
            v-if="availableSourceTypeTabs.length > 1"
            :numButtons="availableSourceTypeTabs.length"
            class="create-team__select-source-type"
          >
            <SiteButton
              v-for="tab in availableSourceTypeTabs"
              :key="tab.id"
              :grouped="tab.grouped"
              :active="sourceComponentType === tab.id"
              @click="selectedSourceId = tab.sources[0].id"
            >
              {{ tab.label }}
            </SiteButton>
          </SiteButtonGroup>
          <div
            v-if="activeSourceTypeTab.sources.length > 1"
            class="create-team__select-source"
          >
            <SiteSelect v-model="selectedSourceId">
              <option
                v-for="source in activeSourceTypeTab.sources"
                :key="source.id"
                :value="source.id"
              >
                {{ source.label }}
              </option>
            </SiteSelect>
          </div>
          <component
            v-if="sourceComponent && sourceComponentType === SOURCE_TYPE.GOTCHI"
            :is="sourceComponent"
            v-bind="sourceComponentProps"
          >
            <template #gotchis="{ gotchisToDisplay }">
              <VueDraggable
                :list="gotchisToDisplay"
                item-key="id"
                :group="{ name: 'gotchis', pull: 'clone', put: false }"
                tag="ol"
                class="list-reset create-team__gotchis-results"
                ghost-class="create-team__gotchis-draggable--ghost"
                chosen-class="create-team__gotchis-draggable--chosen"
                drag-class="create-team__gotchis-draggable--drag"
                filter=".create-team__gotchis-result--not-draggable"
                :move="onMoveGotchiFromAvailable"
                @start="isDraggingGotchi = true"
                @end="isDraggingGotchi = false"
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
                        <div class="create-team__source-result-popup">
                          <div class="create-team__source-result-popup-header">
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
                            <div class="create-team__source-result-popup-footer">
                              <div>
                                Add to slot:
                                <button
                                  v-for="i in 5"
                                  :key="i"
                                  type="button"
                                  class="button-reset create-team__source-result-popup-slot-button"
                                  :class="{
                                    'create-team__source-result-popup-slot-button--selected': teamSlots.main[i -1]?.gotchiId === element.id
                                  }"
                                  @click="addGotchiToSlot({ gotchi: element, type: 'main', slotNumber: i })"
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
                                  class="button-reset create-team__source-result-popup-slot-button"
                                  :class="{
                                    'create-team__source-result-popup-slot-button--selected': teamSlots.substitutes[i - 1]?.gotchiId === element.id
                                  }"
                                  @click="addGotchiToSlot({ gotchi: element, type: 'substitutes', slotNumber: i })"
                                >
                                  S{{ i }}
                                </button>
                              </div>
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
          <component
            v-else-if="sourceComponent && sourceComponentType === SOURCE_TYPE.TEAM"
            :is="sourceComponent"
            v-bind="sourceComponentProps"
          >
            <template #actions="{ team }">
              <SiteButton
                small
                @click="loadSavedTeam(team)"
              >
                Apply
              </SiteButton>
            </template>
          </component>
          <component
            v-else-if="sourceComponent && sourceComponentType === SOURCE_TYPE.ITEM"
            :is="sourceComponent"
            v-bind="sourceComponentProps"
          >
            <template #items="{ itemsToDisplay }">
              <VueDraggable
                :list="itemsToDisplay"
                item-key="id"
                :group="{ name: 'items', pull: 'clone', put: false }"
                tag="ol"
                class="list-reset create-team__items-results"
                ghost-class="create-team__items-draggable--ghost"
                chosen-class="create-team__items-draggable--chosen"
                drag-class="create-team__items-draggable--drag"
                filter=".create-team__items-result--not-draggable"
                :move="onMoveItemFromAvailable"
                @start="isDraggingItem = true"
                @end="isDraggingItem = false"
              >
                <template #item="{ element }">
                  <li
                    class="create-team__items-result"
                  >
                    <SitePopupHoverMenu>
                      <button
                        type="button"
                        class="button-reset create-team__items-result-button"
                      >
                        <img
                          :src="element.image"
                          alt=""
                          class="create-team__items-result-image"
                          loading="lazy"
                        />
                        <div class="create-team__items-result-label">
                          <div class="create-team__items-result-name">
                            {{ element.name }}
                          </div>
                          <div class="create-team__items-result-quantity">
                            Quantity: {{ element.quantity }}
                          </div>
                        </div>
                      </button>

                      <template #popper>
                        <div class="create-team__source-result-popup">
                          <div class="create-team__source-result-popup-header">
                            {{ element.name }}
                          </div>
                          <div class="create-team__items-result-popup-description">
                            {{ element.description }}
                          </div>
                          <div class="create-team__source-result-popup-footer">
                            <template v-if="!occupiedMainSlotNumbers.length">
                              You can assign items after adding gotchis to the team.
                            </template>
                            <template v-else>
                              Add to slot:
                              <button
                                v-for="i in occupiedMainSlotNumbers"
                                :key="i"
                                type="button"
                                class="button-reset create-team__source-result-popup-slot-button"
                                :class="{
                                  'create-team__items-common-popup-slot-button--selected': teamSlots.main[i -1]?.gotchiId === element.id
                                }"
                                @click="addItemToSlot({ item: element, type: 'main', slotNumber: i })"
                              >
                                {{ i }}
                              </button>
                            </template>
                          </div>
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
                      withSpecialBadge
                      withItemBadge
                      :slotNumber="selectedFormationPattern[row][position - 1]"
                      :isLeader="`${selectedLeaderSlot}` === `${selectedFormationPattern[row][position - 1]}`"
                    />
                    <VueDraggable
                      v-model="draggableTargets[row][position - 1]"
                      item-key="id"
                      :group="{ name: `target_${row}_${position - 1}`, pull: false, put: ['gotchis'] }"
                      tag="ol"
                      class="list-reset create-team__formation-position-gotchi-target"
                    >
                      <template #item><!-- not needed as we remove gotchis from this list after dropping --></template>
                    </VueDraggable>
                  </template>
                  <GotchiInFormation
                    v-else
                    emptyMode="disabled"
                    variant="small"
                    withSpecialBadge
                    withItemBadge
                  />
                </div>
              </template>
              <template #gotchi="{ gotchi, row, position }">
                <GotchiInFormation
                  :gotchi="gotchi"
                  variant="small"
                  withSpecialBadge
                  withItemBadge
                  :slotNumber="selectedFormationPattern[row][position - 1]"
                  :isLeader="teamToDisplay.leader === gotchi.id"
                  isRemovable
                  isSelectable
                  :warning="gotchi.availableSpecials?.length > 1 && !gotchi.specialId"
                  @remove="removeGotchiFromSlot({ type: 'main', slotNumber: selectedFormationPattern[row][position - 1] })"
                  @select="displayGotchiSlot = { type: 'main', slotNumber: selectedFormationPattern[row][position - 1] }"
                >
                  <template #item>
                    <GotchiItemSlot
                      :itemId="gotchi.itemId"
                      @remove="removeItemFromSlot({ type: 'main', slotNumber: selectedFormationPattern[row][position - 1] })"
                    />
                  </template>
                  <template
                    v-if="gotchi.availableSpecials?.length > 1"
                    #special
                  >
                    <GotchiSpecialSelect
                      v-model="teamSlots.main[selectedFormationPattern[row][position - 1] - 1].specialId"
                      :availableSpecials="gotchi.availableSpecials"
                      fullWidth
                    />
                  </template>
                </GotchiInFormation>
                <VueDraggable
                  v-model="draggableItemTargets[row][position - 1]"
                  item-key="id"
                  :group="{ name: `targetItem_${row}_${position - 1}`, pull: false, put: ['items'] }"
                  tag="ol"
                  class="list-reset create-team__formation-position-item-target"
                >
                  <template #item><!-- not needed as we remove items from this list after dropping --></template>
                </VueDraggable>
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
                    withSpecialBadge
                    withItemBadge
                    :slotNumber="`S${position}`"
                  />
                  <VueDraggable
                    v-model="draggableTargets.substitutes[position - 1]"
                    item-key="id"
                    :group="{ name: `target_substitutes_${position - 1}`, pull: false, put: ['gotchis'] }"
                    tag="ol"
                    class="list-reset create-team__formation-position-gotchi-target"
                  >
                    <template #item><!-- not needed as we remove gotchis from this list after dropping --></template>
                  </VueDraggable>
                </div>
              </template>
              <template #gotchi="{ gotchi, position }">
                <GotchiInFormation
                  :gotchi="gotchi"
                  variant="small"
                  withSpecialBadge
                  withItemBadge
                  :slotNumber="`S${position}`"
                  isRemovable
                  isSelectable
                  :warning="gotchi.availableSpecials?.length > 1 && !gotchi.specialId"
                  @remove="removeGotchiFromSlot({ type: 'substitutes', slotNumber: position })"
                  @select="displayGotchiSlot = { type: 'substitutes', slotNumber: position }"
                >
                  <template #item>
                    <GotchiItemSlot
                      :itemId="gotchi.itemId"
                      @remove="removeItemFromSlot({ type: 'substitutes', slotNumber: position })"
                    />
                  </template>
                  <template
                    v-if="gotchi.availableSpecials?.length > 1"
                    #special
                  >
                    <GotchiSpecialSelect
                      v-model="teamSlots.substitutes[position - 1].specialId"
                      :availableSpecials="gotchi.availableSpecials"
                      fullWidth
                    />
                  </template>
                </GotchiInFormation>
                <VueDraggable
                  v-model="draggableItemTargets.substitutes[position - 1]"
                  item-key="id"
                  :group="{ name: `targetItem_substitutes_${position - 1}`, pull: false, put: ['items'] }"
                  tag="ol"
                  class="list-reset create-team__formation-position-item-target"
                >
                  <template #item><!-- not needed as we remove items from this list after dropping --></template>
                </VueDraggable>
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
          <div
            v-if="canSaveProfileTeam"
            class="create-team__submit--profile"
          >
            <div
              v-if="showSaveProfileTeamSuccess"
              class="create-team__submit-saved-team"
            >
              <SiteIcon name="check" />
              <span>Saved Team</span>
            </div>
            <SiteButton
              v-else-if="submitProfileTeamStatus.loading"
              disabled
            >
              Saving...
            </SiteButton>
            <SiteButton
              v-else
              icon="favorite"
              @click="saveProfileTeam"
            >
              Add to Saved Teams
            </SiteButton>
          </div>
          <div class="create-team__submit--main">
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
              {{ primarySaveLabel }}
            </SiteButtonPrimary>
          </div>
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
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
    align-items: center;
    justify-content: space-between;
  }

  .create-team__submit-saved-team {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 1rem;
    line-height: 1.5rem;
    font-weight: bold;
    color: var(--c-white);
    text-transform: uppercase;
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
    grid-template-columns: auto minmax(0, 1fr) auto;
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
  .create-team__select-source-type {
    grid-column: 1 / 4;
    margin: 0 4px 1rem;
  }
  .create-team__gotchis .create-team__section-label {
    margin-bottom: 0;
  }
  :deep(.create-team-source__search) {
    max-width: 200px;
  }
  :deep(.create-team-source__connect-wallet) {
    grid-column: 1 / 4;
    padding-top: 1rem;
    align-self: flex-start;
    display: grid;
    place-items: center;
  }
  :deep(.create-team-source__items-available) {
    align-self: stretch;
    padding: 1rem;
    grid-column: 1 / 4;
    border: 2px solid var(--c-black);
    overflow-y: auto;
    background: rgba(var(--c-black-rgb), 0.25);
  }
  :deep(.site-sign-in) {
    grid-column: 1 / 4;
  }
  .create-team__gotchis-results {
    --source-result-border-width: 2px;
    --source-result-border-color: var(--c-black);
    display: grid;
    grid-template-columns: repeat(auto-fill, 6rem);
    column-gap: 1.5rem;
    row-gap: 1.5rem;
    user-select: none;
  }
  .create-team__gotchis-results .v-popper--shown {
    --source-result-border-color: var(--c-white);
  }
  .create-team__gotchis-result-button {
    display: block;
    max-width: 100%;
    border: var(--source-result-border-width) solid var(--source-result-border-color);
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

  .create-team__source-result-popup {
    display: grid;
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .create-team__source-result-popup-header {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    letter-spacing: 0.03rem;
    font-weight: bold;
  }
  .create-team__source-result-popup-footer {
    --cancel-popup-padding: calc(-1 * var(--site-popup-hover-menu-padding));
    margin: 1rem var(--cancel-popup-padding) var(--cancel-popup-padding) var(--cancel-popup-padding);
    padding: 0.5rem var(--site-popup-hover-menu-padding);
    background: var(--c-white);
    color: var(--c-black);
  }
  .create-team__source-result-popup-slot-button {
    margin-right: 0.7rem;
    width: 2.5rem;
    border: 2px solid var(--c-black);
    padding: 0.5rem;
    background: transparent;
    color: var(--c-black);
    font-size: 1.125rem;
    line-height: 1.5rem;
  }
  .create-team__source-result-popup-slot-button--selected,
  .create-team__source-result-popup-slot-button:hover {
    background: var(--c-black);
    color: var(--c-white);
  }


  /* drag-and-drop styles (gotchi) */

  .create-team__formation-display,
  .create-team__substitutes-display {
    /* some magic numbers so we can size the dragged item to fit inside the target formation position containers */
    --formation-position-height: 9rem;
    --formation-position-width: 6.125rem;
  }

  /* drop target in formation */
  .create-team__formation-position-gotchi-target {
    width: 100%;
    height: 100%;
  }
  .create-team--is-dragging-gotchi .create-team__formation-position-gotchi-target {
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
  .create-team__formation-position-gotchi-target .create-team__gotchis-draggable--chosen {
    height: 100%;
    display: grid;
    place-content: center;
  }
  :deep(.team-formation__position):has(.create-team__gotchis-draggable--chosen) {
    z-index: 2; /* bring position container - which contains the preview item - above an existing gotchi */
  }
  .create-team__formation-position-gotchi-target .create-team__gotchis-draggable--chosen button {
    width: var(--formation-position-width);
    height: var(--formation-position-height);
    border: none;
  }
  .create-team__formation-position-gotchi-target .create-team__gotchis-draggable--chosen .create-team__gotchis-result-name,
  .create-team__formation-position-gotchi-target .create-team__gotchis-draggable--chosen .create-team__gotchis-result-special,
  .create-team__formation-position-gotchi-target .create-team__gotchis-draggable--chosen .create-team__gotchis-result-available-specials {
    display: none;
  }


  .create-team__items-results {
    --source-result-border-width: 2px;
    --source-result-border-color: var(--c-black);
    display: grid;
    grid-template-columns: repeat(auto-fill, calc(8rem + 2 * var(--source-result-border-width)));
    column-gap: 1.5rem;
    row-gap: 1.5rem;
    user-select: none;
  }
  .create-team__items-results .v-popper--shown {
    --source-result-border-color: var(--c-white);
  }
  .create-team__items-result-button {
    display: block;
    max-width: 100%;
    border: var(--source-result-border-width) solid var(--source-result-border-color);
  }
  .create-team__items-result--not-draggable {
    opacity: 0.3;
    filter: grayscale(100%);
  }
  .create-team__items-result-image {
    display: block;
    width: 8rem;
    height: 8rem ;
  }
  .create-team__items-result-label {
    padding: 0.5rem 0.25rem;
    background: var(--c-white);
    color: var(--c-black);
    font-size: 0.75rem;
    line-height: 1rem;
    text-transform: uppercase;
  }
  .create-team__items-result-name {
    font-weight: bold;
  }
  .create-team__items-result-quantity {
    opacity: 0.5;
  }
  .create-team__items-result-popup-description {
   font-size: 0.875rem;
   font-weight: normal;
   line-height: 1.25rem;
  }

  /* drag-and-drop styles (item) */

  /* drop target in formation */
  .create-team--is-dragging-item .create-team__formation-position-item-target {
    position: absolute; /* bring above an existing gotchi */
    width: calc(100% - 2px); /* inset to avoid covering the position borders */
    height: calc(100% - 2px);
    left: 1px;
    top: 1px;
    z-index: 2; /* bring above an existing gotchi */
    background: rgba(var(--c-light-yellow-rgb), 0.3);
  }

  /* the item being dragged, in its original list */
  .create-team__items-draggable--ghost {
    opacity: 0.5;
  }

  /* the item being dragged, preview in the target list before dropping */
  .create-team__formation-position-item-target .create-team__items-draggable--chosen {
    height: var(--formation-position-height);
    width: var(--formation-position-width);
    border: none;
  }
  .create-team__formation-position-item-target .create-team__items-draggable--chosen .create-team__items-result-image {
    width: var(--formation-position-width);
    height: var(--formation-position-width);
    opacity: 0.5;
  }
  .create-team__formation-position-item-target .create-team__items-draggable--chosen .create-team__items-result-label {
    padding: 0.25rem;
  }
  .create-team__formation-position-item-target .create-team__items-draggable--chosen .create-team__items-result-quantity {
    display: none;
  }
</style>