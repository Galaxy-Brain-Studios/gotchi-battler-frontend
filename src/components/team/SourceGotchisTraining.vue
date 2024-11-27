<script setup>
  import useTrainingGotchis from '../../data/useTrainingGotchis'
  import SourceGotchisCommon from './SourceGotchisCommon.vue'

  const { fetchGotchis, gotchis, fetchGotchisStatus } = useTrainingGotchis()
  fetchGotchis()
</script>

<template>
  <SourceGotchisCommon
    :gotchis="gotchis"
    :fetchStatus="fetchGotchisStatus"
    enableSearch
  >
    <template #gotchis="slotProps">
      <slot
        name="gotchis"
        v-bind="slotProps"
      />
    </template>
  </SourceGotchisCommon>
</template>