<script setup>
  import SiteHeading from '../common/SiteHeading.vue'
  import { useAccountStore } from '../../data/accountStore'
  import { setBaseUrl } from '../../data/api'
  import { storeToRefs } from 'pinia'

  const accountStore = useAccountStore()
  const { fakeConnect } = storeToRefs(accountStore)
  function setFakeAddress (address) {
    fakeConnect.value = address
  }

  function shutdownMirage () {
    window.mirageServer.shutdown()
  }

  function skipServerSignatureChecks () {
    window.skipDevServerSignatureCheck = true
  }
</script>

<template>
  <main>
    <SiteHeading>Dev Config</SiteHeading>

    <div style="display: grid; row-gap: 1rem;">
      <div>
        By default this site uses a fake Mirage server with test data.
        <br>Optionally configure its behaviour on <code>window.mirageConfig</code>.
        <br>
        <button
          type="button"
          @click="shutdownMirage"
        >
          Use API
        </button>
        Click this button to turn off Mirage, and test with real server endpoints.
        <br>
        <button
          type="button"
          @click="setBaseUrl('http://localhost:8888')"
        >
          Set API to localhost:8888
        </button>
        <br>
        <button
          type="button"
          @click="setBaseUrl('https://gotchi-battler-backend-v1-5-76ns3tfg6q-ew.a.run.app')"
        >
          Set API to https://gotchi-battler-backend-v1-5-76ns3tfg6q-ew.a.run.app
        </button>
        <br>
        <button
          type="button"
          @click="skipServerSignatureChecks"
        >
          Skip server-side signature checks
        </button>
        Click this button to tell the server (both real/Mirage) to allow any submitted signature.
      </div>
      <div>
        To test with a hardcoded address, click one below, and then Connect.
        <br>(Remember to also click 'Use API' if you want to use the real server)
      </div>
      <div>
        <button
          type="button"
          @click="setFakeAddress('0xBfe09443556773958bae1699b786d8E9680B5571')"
        >
          Set address '0xBfe09443556773958bae1699b786d8E9680B5571'
        </button>
        (3 gotchis)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0x05EBFf07711A5B6042c27FDaa683a5c6D55b6684')"
        >
          Set address '0x05EBFf07711A5B6042c27FDaa683a5c6D55b6684'
        </button>
         (6 gotchis)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0xf1d88980505e00db65609ec5420f40c3eb1b77fd')"
        >
          Set address '0xf1d88980505e00db65609ec5420f40c3eb1b77fd'
        </button>
         (31 gotchis)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0xaF4Fe811ffA1BF1f7de8FDAa9F706487C882aEd0')"
        >
          Set address '0xaF4Fe811ffA1BF1f7de8FDAa9F706487C882aEd0'
        </button>
         (0 gotchis)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0xd8D4BDb89D64B7A2971Dc987DD67F101fea6c7D8')"
        >
          Set address '0xd8D4BDb89D64B7A2971Dc987DD67F101fea6c7D8'
        </button>
         (mumbai test with many gotchis)
      </div>
    </div>
  </main>
</template>