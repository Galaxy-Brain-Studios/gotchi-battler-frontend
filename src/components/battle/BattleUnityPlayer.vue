<script setup>
  import { ref, watch } from 'vue'
  import useStatus from '../../utils/useStatus'
  import battlesService from '../../data/battlesService';
  import UnityPlayer from './UnityPlayer.vue'
  import SiteError from '../common/SiteError.vue'

  const props = defineProps({
    id: {
      type: String,
      required: true
    }
  })

  const logs = ref(null);
  const { status: fetchStatus, setLoading, reset: resetFetch } = useStatus()

  async function fetchBattleLogs(id) {
    const [isStale, setLoaded, setError] = setLoading()
    try {
      const result = await battlesService.fetchBattleLogs(id)
      if (isStale()) { return; }
      logs.value = result
      setLoaded()
    } catch (e) {
      setError(e.message)
    }
  }

  watch(
    () => props.id,
    () => {
      if (props.id) {
        fetchBattleLogs(props.id)
      } else {
        resetFetch()
      }
    },
    { immediate: true }
  )
</script>

<template>
  <div
    v-if="fetchStatus.loading"
    class="battle-logs-message"
  >
    Loading...
  </div>
  <div
    v-if="fetchStatus.error"
    class="battle-logs-message"
  >
    <SiteError>
      Error fetching battle logs:
      {{ fetchStatus.errorMessage }}
    </SiteError>
  </div>
  <UnityPlayer
    v-else-if="fetchStatus.loaded && logs"
    :logs="logs"
  />
</template>

<style scoped>
  .battle-logs-message {
    display: grid;
    place-items: center;
    height: 100%;
  }
</style>