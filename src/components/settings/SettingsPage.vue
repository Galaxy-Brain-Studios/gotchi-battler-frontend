<script setup>
  import useSettings from '../../data/useSettings'
  import SiteHeading from '../common/SiteHeading.vue'
  import VolumeSelect from './VolumeSelect.vue'

  const { musicVolume, sfxVolume } = useSettings()

</script>

<template>
  <div class="settings-main">
    <h1>Settings</h1>
    <div>
      <SiteHeading
        :level="2"
        class="settings-subheading"
      >
        Audio
      </SiteHeading>

      <div class="setting-label">
        Music Volume
      </div>
      <VolumeSelect
        v-model="musicVolume"
      />

      <div class="setting-label">
        SFX Volume
      </div>
      <VolumeSelect
        v-model="sfxVolume"
      />
    </div>
  </div>
</template>

<style scoped>
  h1 {
    margin: 0 0 2.88rem 0;
    text-align: center;
    font-size: 2.5rem;
    font-weight: bold;
    line-height: 3rem;
    letter-spacing: 0.075rem;
  }
  .settings-main {
    border-radius: 1.5rem;
    padding: 2.5rem;
    color: var(--c-white);
    background: linear-gradient(180deg, #6027E2 0%, #4C2399 98.33%);
  }
  .setting-label {
    opacity: 0.7;
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0.03rem;
  }
</style>