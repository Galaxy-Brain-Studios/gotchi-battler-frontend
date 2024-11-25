<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import SiteHeading from '../common/SiteHeading.vue'
  import SiteButtonBox from '@/components/common/SiteButtonBox.vue'
  import SiteButton from '@/components/common/SiteButton.vue'
  import SiteButtonGroup from '@/components/common/SiteButtonGroup.vue'
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
    <SiteHeading>Battle Analyser</SiteHeading>

    <form
      class="analyser-search"
      @submit.prevent="doSearch"
    >
      <SiteButtonGroup class="analyser-search__button-group">
        <SiteButtonBox
          grouped="start"
          small
        >
          <input
            v-model="searchId"
            id="analyser-search-field"
            type="search"
            placeholder="Enter Battle ID"
            class="analyser-search__input"
          >
        </SiteButtonBox>
        <SiteButton
          type="submit"
          class="analyser-search__submit"
        >
          Search Battle
        </SiteButton>
      </SiteButtonGroup>
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
  .analyser-search {
    margin-top: 2.5rem;
  }
  /* override default SiteButtonGroup grid layout */
  .analyser-search__button-group {
    grid-template-columns: minmax(10rem, 1fr) auto;
    align-items: stretch;
  }
  .analyser-search__button-container {
    position: relative; /* bring above the container's :before background so the border-left shows */
    display: flex; /* so it can fill the grid cell */
    border-left: 2px solid var(--button-color-border);
  }
  .analyser-search__input {
    width: 100%;
    margin-top: 0.4rem;
    outline-offset: 0.4rem;
    border: none;
    padding-left: 0.5rem;
    background: transparent;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
  .analyser-search__input::placeholder {
    color: var(--c-white);
    opacity: 0.6;
  }
  .analyser-search__submit {
    margin-left: 1rem;
  }
</style>
