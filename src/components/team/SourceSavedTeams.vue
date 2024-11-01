<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteConnectWallet from '../site/SiteConnectWallet.vue'
  import CommonSavedTeams from '../profile/CommonSavedTeams.vue'

  defineProps({
    onlyMyGotchisAllowed: {
      type: Boolean,
      default: false
    },
    unavailableGotchiIds: {
      type: Array,
      default: null
    },
    savedTeamsLastChanged: {
      type: Number,
      default: null
    }
  })

  const store = useAccountStore()
  const { address } = storeToRefs(store)

</script>

<template>
  <div
    v-if="!address"
    class="create-team-source__connect-wallet"
  >
    <SiteConnectWallet />
  </div>
  <CommonSavedTeams
    v-else
    :address="address"
    :onlyMyGotchisAllowed="onlyMyGotchisAllowed"
    :unavailableGotchiIds="unavailableGotchiIds"
    :savedTeamsLastChanged="savedTeamsLastChanged"
  >
    <template #actions="slotProps">
      <slot
        name="actions"
        v-bind="slotProps"
      />
    </template>
  </CommonSavedTeams>
</template>
