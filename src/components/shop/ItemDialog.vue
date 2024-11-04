<script setup>
  import { ref, computed, watch } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useAccountStore } from '../../data/accountStore'
  import useShop from '../../data/useShop'
  import { GHST_MULTIPLIER, GHST_MULTIPLIER_BIGINT } from '../../data/erc20Constants'
  import useStatus from '../../utils/useStatus'
  import SiteDialog from '../common/SiteDialog.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SiteButtonPrimary from '../common/SiteButtonPrimary.vue'
  import SiteError from '../common/SiteError.vue'
  import SiteConnectWallet from '../site/SiteConnectWallet.vue'
  import ItemCount from './ItemCount.vue'

  defineEmits(['update:isOpen'])

  const props = defineProps({
    isOpen: {
      type: Boolean,
      default: true
    },
    item: {
      type: Object,
      required: true
    }
  })

  const store = useAccountStore()
  const { isConnected, address: connectedAddress } = storeToRefs(store)

  const { status: buyStatus, setLoading: setBuying, reset: resetBuying } = useStatus()
  const boughtAtBlockNumber = ref(null)

  // If address or item changes, abort any in-progress buy and remove old buy record
  watch(
    () => [connectedAddress.value, props.item?.id],
    () => {
      resetBuying()
      boughtAtBlockNumber.value = null
    }
  )

  const canBuy = computed(() => {
    if (!isConnected.value) { return false }
    if (!props.item?.id) { return false }
    if (!props.item?.cost > 0) { return false }
    return true
  })
  const buyNumber = ref(1)
  const buyInteger = computed(() => Math.floor(buyNumber.value))
  const totalBuyCost = computed(() => props.item.cost * buyInteger.value)

  const canStartBuy = computed(() => {
    if (!canBuy.value) { return false }
    if (buyStatus.value.loading) { return false }
    if (totalBuyCost.value > 0) { return true }
    return false
  })

  const { getGhstAllowance, approveGhst, buyItem } = useShop()

  const hasGhstAllowance = async function () {
    console.log("Check GHST allowance is at least", totalBuyCost.value)
    const bigintAllowance = await getGhstAllowance(connectedAddress.value)
    console.log("Got allowance", bigintAllowance, "which rounds down to ", bigintAllowance / GHST_MULTIPLIER_BIGINT)
    const bigintTotalBuyCost = BigInt(totalBuyCost.value * GHST_MULTIPLIER)
    if (bigintAllowance < bigintTotalBuyCost) {
      return false
    }
    return true
  }

  const startBuy = async function () {
    if (!canStartBuy.value) { return }
    const [isStale, setFinishedBuying, setError] = setBuying()
    try {
      let allowanceOk = await hasGhstAllowance()
      if (!allowanceOk) {
        try {
          await approveGhst(BigInt(totalBuyCost.value * GHST_MULTIPLIER))
        } catch (e) {
          throw new Error('Error approving GHST: ' + e.message)
        }
        if (isStale()) { return }
        // The user might have changed the amount approved, so check the allowance again.
        allowanceOk = await hasGhstAllowance()
        if (!allowanceOk) {
          throw new Error('Not enough GHST allowance.')
        }
      }
      let blockNumber = 0
      try {
        const result = await buyItem({ itemId: props.item.id, amount: buyInteger.value })
        blockNumber = result.blockNumber
      } catch (e) {
        throw new Error('Error buying item: ' + e.message)
      }
      if (isStale()) { return }
      boughtAtBlockNumber.value = blockNumber
      setFinishedBuying()
    } catch (e) {
      setError(e.message || 'Error buying item')
    }
  }


  const escapeUrl = url => CSS.escape(url)
</script>

<template>
  <SiteDialog
    :isOpen="isOpen"
    variant="medium"
    lightMode
    @update:isOpen="$emit('update:isOpen', $event)"
  >
    <div class="item-dialog">
      <div
        class="item-dialog__image"
        :style="{
         '--image-url': `url(${escapeUrl(item.image || '')})`
        }"
      />
      <div class="item-dialog__details">
        <div class="item-dialog__name">
          {{ item.name }}
        </div>
        <div class="item-dialog__rarity">
          {{ item.rarity }}
        </div>
        <div class="item-dialog__description">
          {{ item.description }}
        </div>
        <ItemCount
          :itemId="item.id"
          :blockNumber="boughtAtBlockNumber"
          class="item-dialog__own-count"
        />
      </div>
      <div class="item-dialog__buy-selection">
        <div class="item-dialog__price">
          <div class="item-dialog__buy-selection-label">
            Price:
          </div>
          <div class="item-dialog__ghst-price">
            <SiteIcon
              name="token-ghst"
              :width="2"
              :height="2"
            />
            <span>{{ item.cost }} GHST</span>
          </div>
        </div>
        <div
          v-if="canBuy"
          class="item-dialog__buy-count"
        >
          <div class="item-dialog__buy-selection-label">
            Count:
          </div>
          <div class="item-dialog__buy-count-input">
            <input
              v-model="buyNumber"
              type="number"
              min="1"
              step="1"
              :readonly="buyStatus.loading"
            />
          </div>
        </div>
      </div>
      <div class="item-dialog__buy-actions">
        <SiteConnectWallet
          v-if="!isConnected"
        />
        <template v-else-if="canBuy">
          <SiteButtonPrimary
            compact
            :disabled="!canStartBuy"
            @click="startBuy"
          >
            Buy for {{ totalBuyCost }} GHST
          </SiteButtonPrimary>
        </template>
        <SiteError
          v-if="buyStatus.error"
          small
        >
          {{ buyStatus.errorMessage }}
        </SiteError>
      </div>
    </div>
  </SiteDialog>    
</template>

<style scoped>
  .item-dialog {
    color: var(--c-black);
    line-height: 1.5rem;
  }

  .item-dialog {
    --item-image-width: 15rem;
    display: grid;
    grid-template-areas:
      "image"
      "details"
      "buy-selection"
      "buy-actions";
    row-gap: 1.5rem;
  }
  .item-dialog__image {
    grid-area: image;
  }
  .item-dialog__details {
    grid-area: details;
  }
  .item-dialog__buy-selection {
    grid-area: buy-selection;
  }
  .item-dialog__buy-actions {
    grid-area: buy-actions;
  }

  @media (min-width: 650px) {
    .item-dialog {
      grid-template-areas:
        "image details"
        "buy-selection buy-actions";
      column-gap: 1.5rem;
      grid-template-columns: var(--item-image-width) minmax(0, 1fr);
    }
  }

  @media (min-width: 850px) {
    .item-dialog {
      grid-template-areas:
        "image details details"
        "image buy-selection buy-actions";
      grid-template-columns: var(--item-image-width) minmax(0, auto) minmax(0, 1fr);
    }
    .item-dialog__buy-actions {
      margin-left: 0.5rem;
    }
  }


  .item-dialog__image {
    width: var(--item-image-width);
    height: var(--item-image-width);
    border-radius: 1rem;
    background-color: var(--c-black);
    background-image: var(--image-url);
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
  }

  .item-dialog__name {
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 0.045rem;
  }
  .item-dialog__rarity {
    margin-top: 0.25rem;
    font-size: 1.125rem;
    text-transform: capitalize;
  }
  .item-dialog__description {
    margin-top: 0.5rem;
    font-size: 1rem;
  }

  .item-dialog__own-count {
    margin-top: 0.5rem;
  }

  .item-dialog__buy-selection {
    display: flex;
    gap: 2.5rem;
    align-items: flex-start;
  }
  .item-dialog__buy-selection > * {
    flex: none;
  }
  .item-dialog__ghst-price {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  .item-dialog__ghst-price > * {
    flex: none;
  }
  .item-dialog__buy-selection-label {
    margin-bottom: 0.5rem;
    color: rgba(0, 0, 0, 0.5);
    font-size: 1rem;
  }
  .item-dialog__ghst-price {
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 0.03rem;
  }
  .item-dialog__buy-count-input {
    font-size: 1rem;
    letter-spacing: 0.03rem;
  }

  .item-dialog__buy-count-input input {
    width: 3rem;
    line-height: 1.5rem;
  }

  .item-dialog__buy-actions {
    display: grid;
    place-content: center;
    gap: 1rem;
  }

</style>