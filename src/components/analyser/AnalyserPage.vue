<script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import SiteHeading from '../common/SiteHeading.vue'
  import SiteIcon from '@/components/common/SiteIcon.vue'
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
        <label for="analyser-search-field">
          <SiteButtonBox grouped="start">
            <div class="analyser-search__label">
              Battle Analyser
            </div>
          </SiteButtonBox>
          <div class="sr-only">
            (Enter Battle ID)
          </div>
        </label>
        <SiteButtonBox grouped="middle">
          <input
            v-model="searchId"
            id="analyser-search-field"
            type="search"
            placeholder="Enter Battle ID"
            class="analyser-search__input"
          >
        </SiteButtonBox>
        <div class="analyser-search__button-container">
          <SiteButton
            type="submit"
            grouped="end"
          >
            <div class="sr-only">
              Submit
            </div>
            <SiteIcon
              name="search"
              :width="2"
              :height="2"
            />
          </SiteButton>
        </div>
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
    grid-template-columns: minmax(0, auto) minmax(10rem, 1fr) auto;
    align-items: stretch;
  }
  .analyser-search label {
    position: relative; /* bring above the container's :before background so the border-right shows */
    display: flex; /* so it can fill the grid cell */
    border-right: 2px solid var(--button-color-border);
  }
  .analyser-search__button-container {
    position: relative; /* bring above the container's :before background so the border-left shows */
    display: flex; /* so it can fill the grid cell */
    border-left: 2px solid var(--button-color-border);
  }
  .analyser-search__label {
    padding: 0 0.5rem;
    color: var(--c-white);
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 0.045rem;
    line-height: 2rem;
    text-transform: uppercase;
  }
  .analyser-search__input {
    width: 100%;
    outline-offset: 0.8rem;
    border: none;
    color: var(--c-white);
    background: transparent;
    font-size: 1rem;
    line-height: 2rem;
    letter-spacing: 0.03rem;
  }
  .analyser-search__input::placeholder {
    color: var(--c-white);
    opacity: 0.6;
  }
</style>
