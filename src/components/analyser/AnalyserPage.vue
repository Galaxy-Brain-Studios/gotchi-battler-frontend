<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import SiteIcon from '@/components/common/SiteIcon.vue'
  import AnalyserBattle from './AnalyserBattle.vue'

  const router = useRouter()

  const props = defineProps({
    id: {
      type: String,
      default: ''
    },
  })

  const searchId = ref(props.id || '')

  const doSearch = function () {
    router.push({ name: 'analyser', params: { id: searchId.value } })
  }
</script>
<template>
  <div>
    <form
      class="analyser-search"
      @submit.prevent="doSearch"
    >
      <label for="analyser-search-field">
        Battle Analyser
      </label>
      <input
        v-model="searchId"
        id="analyser-search-field"
        type="search"
        placeholder="Enter Battle ID"
      >
      <button
        type="submit"
        class="analyser-search__button"
      >
        <div class="sr-only">
          Submit
        </div>
        <SiteIcon
          name="search"
        />
      </button>
    </form>
    <AnalyserBattle
      v-if="id"
      :key="id"
      :id="id"
      class="analyser-battle"
    />
  </div>
</template>

<style scoped>
</style>
