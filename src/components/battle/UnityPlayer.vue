<script setup>
  // import loaderUrl15 from './unity/Build15/Build.loader.js?url'
  // import dataUrl15 from './unity/Build15/Build.data.br?url'
  // import frameworkUrl15 from './unity/Build15/Build.framework.js.br?url'
  // import codeUrl15 from './unity/Build15/Build.wasm.br?url'

  const gameBuildUrl = 'https://storage.googleapis.com/gotchi-battler-live_game/builds/WebGL'
  const unityVersion = 'Test2'
  const loaderUrl20 = `${gameBuildUrl}/${unityVersion}/Build.loader.js`
  const dataUrl20 = `${gameBuildUrl}/${unityVersion}/Build.data.br`
  const frameworkUrl20 = `${gameBuildUrl}/${unityVersion}/Build.framework.js.br`
  const codeUrl20 = `${gameBuildUrl}/${unityVersion}/Build.wasm.br`

  const loaderUrl = loaderUrl20
  const dataUrl = dataUrl20
  const frameworkUrl = frameworkUrl20
  const codeUrl = codeUrl20

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

        const audioSettings = {
          Audio: {
            MusicVolume: musicVolume.value ? musicVolume.value - 0 : 1,
            SfxVolume: sfxVolume.value ? sfxVolume.value - 0 : 1
          }
        }
        console.log("Sending settings to unity instance", audioSettings)
        unityInstance.SendMessage('BattleReplayer', 'LoadSettings', JSON.stringify(audioSettings))

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