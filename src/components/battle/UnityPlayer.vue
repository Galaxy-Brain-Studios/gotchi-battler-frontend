<script setup>
  // import loaderUrlDev from './unity/Build/build.loader.js?url'
  // import dataUrlDev from './unity/Build/build.data?url'
  // import frameworkUrlDev from './unity/Build/build.framework.js?url'
  // import codeUrlDev from './unity/Build/build.wasm?url'
  // import loaderUrlProd from './unity/BuildProd/Build.loader.js?url'
  // import dataUrlProd from './unity/BuildProd/Build.data.br?url'
  // import frameworkUrlProd from './unity/BuildProd/Build.framework.js.br?url'
  // import codeUrlProd from './unity/BuildProd/Build.wasm.br?url'
  import loaderUrlNew from './unity/Build15/Build.loader.js?url'
  import dataUrlNew from './unity/Build15/Build.data.br?url'
  import frameworkUrlNew from './unity/Build15/Build.framework.js.br?url'
  import codeUrlNew from './unity/Build15/Build.wasm.br?url'
  
  // const loaderUrl = import.meta.env.MODE === 'production' ? loaderUrlProd : loaderUrlDev
  // const dataUrl = import.meta.env.MODE === 'production' ? dataUrlProd : dataUrlDev
  // const frameworkUrl = import.meta.env.MODE === 'production' ? frameworkUrlProd : frameworkUrlDev
  // const codeUrl = import.meta.env.MODE === 'production' ? codeUrlProd : codeUrlDev

  const loaderUrl = loaderUrlNew
  const dataUrl = dataUrlNew
  const frameworkUrl = frameworkUrlNew
  const codeUrl = codeUrlNew

  import uniqueId from 'lodash.uniqueid'
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  import useStatus from '../../utils/useStatus'
  import useSettings from '../../data/useSettings'
  import SiteError from '../common/SiteError.vue'

  const props = defineProps({
    logs: {
      type: Object,
      required: true
    }
  })
  const { musicVolume, sfxVolume } = useSettings()
  console.log('TODO use volume settings', musicVolume.value - 0, sfxVolume.value - 0)

  // Unity player requires the canvas element to have an HTML ID
  const canvasId = ref(uniqueId('unity-player-canvas'))
  const canvas = ref(null)

  const { status: playerStatus, setLoading: setLoading, reset: resetStatus } = useStatus()

  function unityShowBanner(msg, type) {
    console.log('unityShowBanner', { msg, type })
    if (type === 'error') {
      resetStatus()
      // eslint-disable-next-line no-unused-vars
      const [isStale, setLoaded, setError] = setLoading()
      setError('Error loading player')
    }
    // type could be 'warning', ignoring that
  }

  const myUnityInstance = ref(null)

  onMounted(() => {
    // console.log('UnityPlayer onMounted')
    const [isStale, setLoaded, setError] = setLoading()
    let script = document.getElementById('unityloader')
    if (!script) {
      script = document.createElement("script")
      script.src = loaderUrl
      document.body.appendChild(script)
    }
    script.onload = () => {
      const config = {
        dataUrl,
        frameworkUrl,
        codeUrl,
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "GotchiBattler",
        productVersion: "0.1.0",
        showBanner: unityShowBanner,
      }
      if (!window.createUnityInstance) {
        console.error('window.createUnityInstance is missing')
        setError('Error loading player')
        return
      }
      window.createUnityInstance(canvas.value, config).then(unityInstance => {
        if (isStale()){ return }
        setLoaded()
        myUnityInstance.value = unityInstance

        console.log("TODO send volume settings to unity instance", musicVolume.value - 0, sfxVolume.value - 0)
        // unityInstance.SendMessage('BattleReplayer', 'SetMusicVolume', musicVolume.value - 0)
        // unityInstance.SendMessage('BattleReplayer', 'SetSfxVolume', sfxVolume.value - 0)

        const battleLogAsText = JSON.stringify(props.logs)
        // console.log('show logs', { logs: props.logs, battleLogAsText })
        // unityInstance.SendMessage('BattleManager', 'StartBattle', battleLogAsText)
        unityInstance.SendMessage('BattleReplayer', 'LoadBattle', battleLogAsText)
      }).catch((message) => {
        if (isStale()){ return }
        console.error('Error creating unity instance', message);
        setError('Error loading player')
      });
    }
  })

  onBeforeUnmount(() => {
    // console.log('UnityPlayer onBeforeUnmount')
    resetStatus()
    if (myUnityInstance.value) {
      myUnityInstance.value.Quit().then(() => {
        // console.log('Unity Instance finished Quit')
      })
      myUnityInstance.value = null
    }
  })
</script>
<template>
  <div class="unity-player-container">
    <canvas
      :id="canvasId"
      ref="canvas"
      width=960
      height=600
      tabindex="-1"
    ></canvas>
    <div
      v-if="playerStatus.loading"
      class="unity-player__loading"
    >
      Loading...
    </div>
    <SiteError
      v-if="playerStatus.error"
      class="unity-player__error"
    >
      {{ playerStatus.errorMessage }}
    </SiteError>
  </div>
</template>

<style scoped>
  .unity-player-container {
    height: 100%;
    display: grid;
    align-items: center; /* vertically align */
  }
  .unity-player__loading,
  .unity-player__error,
  canvas {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
    justify-self: center; /* horizontally center, this works while also allowing size to grow */
  }

  canvas {
    --unity-player-width: 960;
    --unity-player-height: 600;
    aspect-ratio: var(--unity-player-width) / var(--unity-player-height);
    width: 100%;
    max-width: calc(var(--unity-player-width) * 1px);
  }
</style>