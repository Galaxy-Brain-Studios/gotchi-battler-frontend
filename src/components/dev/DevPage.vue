<script setup>
  import { useAccountStore, requireLoginSession } from '../../data/accountStore'
  import sessionService from '../../data/sessionService'
  import { setBaseUrl } from '../../data/api'
  import shopContract from '../../data/shopContract'
  import { storeToRefs } from 'pinia'

  const accountStore = useAccountStore()
  const { fakeConnect } = storeToRefs(accountStore)
  function setFakeAddress (address) {
    fakeConnect.value = address
  }

  function shutdownMirage () {
    window.mirageServer.shutdown()
  }

  function enableMockContract () {
    window.mockContractConfig.enable = true
  }
  function disableMockContract () {
    window.mockContractConfig.enable = false
  }

  function setShopContractToTest () {
    shopContract.setAddressInDevMode(shopContract.POLYGON_TEST_CONTRACT_ADDRESS)
  }
  function setShopContractToProd () {
    shopContract.setAddressInDevMode(shopContract.POLYGON_PROD_CONTRACT_ADDRESS)
  }
  function logShopContractAddress () {
    console.log('shop contract', shopContract.getAddress())
  }

  function doLogout () {
    sessionService.logout()
  }
</script>

<template>
  <main>
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
        <button
          type="button"
          @click="setBaseUrl('https://127.0.0.1:10889')"
        >
          Set API to https://127.0.0.1:10889
        </button>
        <br>
        <button
          type="button"
          @click="setBaseUrl('https://gotchi-battler-backend-76ns3tfg6q-ew.a.run.app')"
        >
          Set API to https://gotchi-battler-backend-76ns3tfg6q-ew.a.run.app
        </button>
      </div>
      <div>
        <button
          type="button"
          @click="requireLoginSession(() => console.log('signed in'))()"
        >
          Request signed session
        </button>
      </div>
      <div>
        <button
          type="button"
          @click="doLogout"
        >
          Logout on server (test expired/invalid session)
        </button>
      </div>
      <div>
        By default this site does NOT submit real contract reads/writes, it uses a simple simulated interaction.
        <br>Enable/disable real contract calls (polygon RPC) below:
        <br><button
          type="button"
          @click="enableMockContract"
        >
          Use mock contract calls
        </button> (optionally configure behaviour on <code>window.mockContractConfig</code>)
        <br><button
          type="button"
          @click="disableMockContract"
        >
          Use real RPC contract calls
        </button>
      </div>
      <div>
        Shop contract:
        <br><button
          type="button"
          @click="setShopContractToTest"
        >
          Use Polygon TEST contract address
        </button> ({{ shopContract.POLYGON_TEST_CONTRACT_ADDRESS}})
        <br><button
          type="button"
          @click="setShopContractToProd"
        >
          Use Polygon PROD contract address
        </button> ({{ shopContract.POLYGON_PROD_CONTRACT_ADDRESS}})
        <br><button
          type="button"
          @click="logShopContractAddress"
        >
          Log shop contract address to console
        </button>
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
        (3 gotchis, many items)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0x05EBFf07711A5B6042c27FDaa683a5c6D55b6684')"
        >
          Set address '0x05EBFf07711A5B6042c27FDaa683a5c6D55b6684'
        </button>
         (6 gotchis, few items)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0xf1d88980505e00db65609ec5420f40c3eb1b77fd')"
        >
          Set address '0xf1d88980505e00db65609ec5420f40c3eb1b77fd'
        </button>
         (31 gotchis, 1 item)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0xaF4Fe811ffA1BF1f7de8FDAa9F706487C882aEd0')"
        >
          Set address '0xaF4Fe811ffA1BF1f7de8FDAa9F706487C882aEd0'
        </button>
         (0 gotchis, 2 items)
      </div>

      <div>
        <button
          type="button"
          @click="setFakeAddress('0xd8D4BDb89D64B7A2971Dc987DD67F101fea6c7D8')"
        >
          Set address '0xd8D4BDb89D64B7A2971Dc987DD67F101fea6c7D8'
        </button>
         (mumbai test with many gotchis, no items)
      </div>
    </div>
  </main>
</template>