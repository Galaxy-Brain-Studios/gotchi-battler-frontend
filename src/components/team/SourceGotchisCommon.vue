<script setup>
  import orderBy from 'lodash.orderby'
  import { ref, computed } from 'vue'
  import SiteTextField from '../common/SiteTextField.vue'
  import SiteSelect from '../common/SiteSelect.vue'

  const props = defineProps({
    gotchis: {
      type: Array,
      default: null
    },
    fetchStatus: {
      type: Object,
      required: true
    }
  })

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

  const gotchisAnnotated = computed(() => {
    if (!props.gotchis) { return null }
    return props.gotchis.map(g => ({
      ...g,
      onchainIdString: `${g.onchainId}`,
      nameLowercase: g.name?.toLowerCase() || ''
    }))
  })
  const gotchisToDisplay = computed(() => {
    if (!gotchisAnnotated.value) { return null }
    let filtered = gotchisAnnotated.value
    if (query.value) {
      const q = query.value.toLowerCase()
      filtered = filtered.filter(gotchi => {
        if (gotchi.onchainIdString === q) { return true }
        if (gotchi.nameLowercase.includes(q)) { return true }
        return false
      })
    }
    let [sortAttribute, sortDirection] = resultSort.value.split('_')
    const sorted = orderBy(filtered, [g => g[sortAttribute]], [sortDirection])
    return sorted
  })
</script>

<template>
  <div
    v-if="gotchis?.length"
    class="create-team-source__search"
  >
    <SiteTextField
      v-model="query"
      placeholder="Search gotchis"
      search
      subtle
    />
  </div>
  <div v-if="gotchis?.length">
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
  <div class="create-team-source__items-available word-break">
    <div v-if="fetchStatus.loading">
      Loading...
    </div>
    <div v-else-if="fetchStatus.error">
      {{ fetchStatus.errorMessage }}
    </div>
    <template v-else-if="fetchStatus.loaded">
      <div v-if="!gotchisToDisplay?.length">
        No gotchis found.
      </div>
      <slot
        name="gotchis"
        :gotchisToDisplay="gotchisToDisplay"
      >Display {{ gotchisToDisplay.length }} gotchis</slot>
    </template>
  </div>
</template>