<script setup>
  import SourceGotchisCommon from './SourceGotchisCommon.vue'

  defineProps({
    incomingTeamGotchis: {
      type: Object,
      default: null
    }
  })
</script>

<template>
  <SourceGotchisCommon
    v-if="incomingTeamGotchis"
    :gotchis="incomingTeamGotchis"
    :fetchStatus="{ loaded: true }"
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