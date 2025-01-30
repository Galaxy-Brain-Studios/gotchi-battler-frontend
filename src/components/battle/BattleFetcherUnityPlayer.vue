<script setup>
  import { ref, watch } from 'vue'
  import useStatus from '../../utils/useStatus'
  import battlesService from '../../data/battlesService';
  import UnityPlayer from './UnityPlayer.vue'
  import SiteError from '../common/SiteError.vue'

  const props = defineProps({
    logsUrl: {
      type: String,
      required: true
    }
  })

  const logs = ref(null);
  const { status: fetchStatus, setLoading, reset: resetFetch } = useStatus()

  async function fetchBattleLogs(logsUrl) {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await battlesService.fetchBattleLogs(logsUrl)
      if (isStale()) { return; }
      logs.value = result
      setLoaded()
    } catch (e) {
      setError(e.message)
    }
  }

  watch(
    () => props.logsUrl,
    () => {
      if (props.logsUrl) {
        fetchBattleLogs(props.logsUrl)
      } else {
        resetFetch()
      }
    },
    { immediate: true }
  )

  const playerWidth = 1280
  const playerHeight = 720
</script>

<template>
  <div
    v-if="fetchStatus.loading"
    class="battle-logs-message"
    :style="{
      '--battle-player-width': playerWidth,
      '--battle-player-height': playerHeight
    }"
  >
    Loading data...
  </div>
  <div
    v-else-if="fetchStatus.error"
    class="battle-logs-message"
    :style="{
      '--battle-player-width': playerWidth,
      '--battle-player-height': playerHeight
    }"
  >
    <SiteError>
      Error fetching battle logs:
      {{ fetchStatus.errorMessage }}
    </SiteError>
  </div>
  <UnityPlayer
    v-else-if="fetchStatus.loaded && logs"
    :logs="logs"
    :playerWidth="playerWidth"
    :playerHeight="playerHeight"
  />
</template>

<style scoped>
  .battle-logs-message {
    display: grid;
    place-items: center;
    height: 100%;
    /* take up the same size as the unity player, to avoid layout resizing */
    aspect-ratio: var(--battle-player-width) / var(--battle-player-height);
    width: 100%;
    max-width: calc(var(--battle-player-width) * 1px);
  }
</style>