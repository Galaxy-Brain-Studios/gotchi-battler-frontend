<script setup>
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import SiteConnectWallet from '../site/SiteConnectWallet.vue'
  import CommonSavedTeams from '../profile/CommonSavedTeams.vue'
  import SiteIcon from '../common/SiteIcon.vue'

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
    <template #after="{ teams }">
      <div
        v-if="teams?.length > 3"
        class="create-team-source__after"
      >
        Manage teams through your
        <RouterLink
          :to="{ name: 'profile-teams', params: { address } }"
          target="_blank"
          class="link-reset create-team-source__profile-teams-link"
        >
          Profile page &gt; Saved Teams
          <SiteIcon
            name="new-window"
            :width="0.8"
            :height="0.8"
          />
        </RouterLink>
      </div>
    </template>
  </CommonSavedTeams>
</template>

<style scoped>
  .create-team-source__after {
    margin-top: 0.25rem;
    border-radius: 2px;
    border: 1px solid var(--c-medium-blue);
    padding: 0.5rem 1rem;
    background: rgba(var(--c-light-blue-rgb), 0.2);
  }
  .create-team-source__profile-teams-link {
    display: inline-flex;
    align-items: center;
    column-gap: 0.5rem;

    font-weight: bold;
    text-decoration: underline;
    text-underline-offset: 0.3em;
  }
  .create-team-source__profile-teams-link > svg {
    margin-top: 0.1rem;
  }
</style>
