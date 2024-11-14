<script setup>
  import useSearchGotchis from '../../data/useSearchGotchis'
  import SiteTextField from '../common/SiteTextField.vue'
  import SourceGotchisCommon from './SourceGotchisCommon.vue'

  const { gotchis, fetchGotchisStatus, query } = useSearchGotchis()
</script>

<template>
  <div>
    <SiteTextField
      v-model="query"
      placeholder="Search by Gotchi name or ID"
      search
      subtle
    />
  </div>
  <SourceGotchisCommon
    :gotchis="gotchis"
    :fetchStatus="fetchGotchisStatus"
  >
    <template #gotchis="slotProps">
      <slot
        name="gotchis"
        v-bind="slotProps"
      />
    </template>
  </SourceGotchisCommon>
</template>