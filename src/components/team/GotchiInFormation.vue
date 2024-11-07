<script setup>
  import GotchiSpecial from '../team/GotchiSpecial.vue'
  import GotchiSpecialWithInfo from '../team/GotchiSpecialWithInfo.vue'
  import GotchiStats from './GotchiStats.vue'
  import SiteIcon from '../common/SiteIcon.vue'
  import SitePopupHoverMenu from '../common/SitePopupHoverMenu.vue'

  const EMPTY_MODES = {
    BLANK: 'blank',
    DISABLED: 'disabled',
    PLACEHOLDER: 'placeholder'
  }

  defineProps({
    gotchi: {
      type: Object,
      default: null
    },
    emptyMode: {
      type: String,
      default: 'blank'
    },
    isLeader: {
      type: Boolean,
      default: false
    },
    teamId: {
      type: Number,
      default: null
    },
    isSelectable: {
      type: Boolean,
      default: false
    },
    isRemovable: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'large'
    },
    slotNumber: {
      type: [String, Number],
      default: null
    },
    warning: {
      type: Boolean,
      default: false
    },
    withItemBadge: {
      type: Boolean,
      default: false
    },
    withSpecialBadge: {
      type: Boolean,
      default: false
    },
    withSpecialInfoBadge: {
      type: Boolean,
      default: false
    },
    /* Do not use in combination with isSelectable; isSelectable will take priority. */
    withStatsPopup: {
      type: Boolean,
      default: false
    }
  });
</script>

<template>
  <div
    v-if="!gotchi"
    class="gotchi-in-formation-placeholder"
    :class="{
      'gotchi-in-formation-placeholder--variant-large': variant === 'large',
      'gotchi-in-formation-placeholder--variant-small': variant === 'small',
      [`gotchi-in-formation-placeholder--mode-${emptyMode}`]: emptyMode,
      'gotchi-in-formation-placeholder--with-item-badge': withItemBadge,
      'gotchi-in-formation-placeholder--with-special-badge': withSpecialBadge || withSpecialInfoBadge
    }"
  >
    <img
      v-if="emptyMode === EMPTY_MODES.PLACEHOLDER"
      src="./placeholder-gotchi.svg"
      class="gotchi-in-formation-placeholder__gotchi"
    />
    <div
      v-if="slotNumber || isLeader"
      class="gotchi-in-formation__top-left-badges"
    >
      <div
        v-if="slotNumber"
        class="gotchi-in-formation__slot-number"
      >
        {{ slotNumber }}
      </div>
      <div
        v-if="isLeader"
        class="gotchi-in-formation__leader-badge"
      >
        <SiteIcon
          name="special-leader"
          class="gotchi-in-formation__leader-badge-icon"
        />
        <template v-if="variant === 'large'">
          Leader
        </template>
      </div>
    </div>
  </div>
  <div
    v-else
    class="gotchi-in-formation"
    :class="{
      'gotchi-in-formation--variant-large': variant === 'large',
      'gotchi-in-formation--variant-small': variant === 'small',
      'gotchi-in-formation--with-warning': warning,
      'gotchi-in-formation-placeholder--with-item-badge': withItemBadge,
      'gotchi-in-formation-placeholder--with-special-badge': withSpecialBadge || withSpecialInfoBadge
    }"
  >
    <button
      v-if="isSelectable"
      type="button"
      class="button-reset extended-target"
      @click="$emit('select');"
    >
      <img
        :src="gotchi.svgFront"
        class="gotchi-in-formation__image"
        alt="select gotchi"
      />
    </button>
    <SitePopupHoverMenu
      v-else-if="withStatsPopup"
    >
      <button
        type="button"
        class="button-reset"
      >
        <img
          :src="gotchi.svgFront"
          class="gotchi-in-formation__image"
          alt="show gotchi stats"
        />
      </button>
      <template #popper>
        <div class="gotchi-in-formation__stats-popup">
          <div class="gotchi-in-formation__stats-popup-header">
            {{ gotchi.name }} #{{ gotchi.onchainId || gotchi.id }}
          </div>
          <GotchiStats
            :gotchi="gotchi"
            variant="small"
          />
        </div>
      </template>
    </SitePopupHoverMenu>
    <img
      v-else
      :src="gotchi.svgFront"
      class="gotchi-in-formation__image"
      alt="gotchi image"
    />
    <div
      v-if="slotNumber || isLeader"
      class="gotchi-in-formation__top-left-badges"
    >
      <div
        v-if="slotNumber"
        class="gotchi-in-formation__slot-number"
      >
        {{ slotNumber }}
      </div>
      <div
        v-if="isLeader"
        class="gotchi-in-formation__leader-badge"
      >
        <SiteIcon
          name="special-leader"
          class="gotchi-in-formation__leader-badge-icon"
        />
        <template v-if="variant === 'large'">
          Leader
        </template>
      </div>
    </div>
    <button
      v-if="isRemovable"
      type="button"
      class="button-reset gotchi-in-formation__remove-button"
      title="Remove"
      @click="$emit('remove')"
    >
      <SiteIcon
        name="close"
        :width="0.9"
        :height="0.9"
        alt="Remove gotchi"
      />
    </button>
    <SiteIcon
      v-if="warning"
      name="warning"
      class="gotchi-in-formation__warning-icon"
    />
    <div
      v-if="withItemBadge || withSpecialBadge || withSpecialInfoBadge"
      class="gotchi-in-formation__badges-container"
    >
      <div
        v-if="withItemBadge"
        class="gotchi-in-formation__item-badge-container"
      >
        <slot name="item">
          {{ gotchi.itemId }}
        </slot>
      </div>
      <div
        v-if="withSpecialBadge || withSpecialInfoBadge"
        class="gotchi-in-formation__special-badge-container"
      >
        <slot name="special">
          <component
            v-if="gotchi.specialId"
            :is="withSpecialBadge ? GotchiSpecial : GotchiSpecialWithInfo"
            :id="gotchi.specialId"
            :forSpecialShowClass="true"
            variant="small"
            fullWidth
          />
        </slot>
      </div>
    </div>
    <div
      class="gotchi-in-formation__name"
    >
      {{ gotchi.name || `#${gotchi.onchainId || gotchi.id}` }}
      <div>
        <slot name="after-name">
        </slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .gotchi-in-formation,
  .gotchi-in-formation-placeholder {
    --gotchi-in-formation-small-width: calc(6.25rem - 2px);
    --gotchi-in-formation-small-height: calc(6.25rem - 2px - 0.5rem);
    --gotchi-in-formation__item-badge-height: 1.5rem;
    --gotchi-in-formation__special-badge-height: 1.25rem;
    --gotchi-in-formation__badges-height: 0px; /* need size unit for calc to work */
    --gotchi-in-formation__name-height: 0.625rem;
    position: relative;
    padding: 0 0.5rem;

    display: grid;
    grid-template-rows: minmax(0, 1fr);
  }
  .gotchi-in-formation--with-item-badge,
  .gotchi-in-formation-placeholder--with-item-badge {
    --gotchi-in-formation__badges-height: var(--gotchi-in-formation__item-badge-height);
  }
  .gotchi-in-formation--with-special-badge,
  .gotchi-in-formation-placeholder--with-special-badge {
    --gotchi-in-formation__badges-height: var(--gotchi-in-formation__special-badge-height);
  }
  .gotchi-in-formation--with-special-badge.gotchi-in-formation--with-item-badge,
  .gotchi-in-formation-placeholder--with-special-badge.gotchi-in-formation-placeholder--with-item-badge {
    --gotchi-in-formation__badges-height: calc(var(--gotchi-in-formation__special-badge-height) + var(--gotchi-in-formation__item-badge-height));
  }

  .gotchi-in-formation--variant-large,
  .gotchi-in-formation-placeholder--variant-large {
    width: 15rem;
    min-height: var(--gotchi-in-formation-small-width);
  }
  .gotchi-in-formation--variant-small,
  .gotchi-in-formation-placeholder--variant-small {
    width: var(--gotchi-in-formation-small-width);
    min-height: calc(var(--gotchi-in-formation-small-height) + var(--gotchi-in-formation__name-height) + var(--gotchi-in-formation__badges-height));
  }
  .gotchi-in-formation-placeholder {
    place-items: center;
  }
  .gotchi-in-formation-placeholder--mode-placeholder {
    background: rgba(32, 68, 185, 0.2);
  }
  .gotchi-in-formation-placeholder__gotchi {
    width: 4rem;
    opacity: 0.2;
  }
  .gotchi-in-formation-placeholder--mode-disabled {
    background-image:
      linear-gradient(to top left,
        rgba(0, 0, 0, 0) 0%,
        rgba(0, 0, 0, 0) calc(50% - 1.2px),
        rgba(0, 0, 0, 1) 50%,
        rgba(0, 0, 0, 0) calc(50% + 1.2px),
        rgba(0, 0, 0, 0) 100%);
  }

  .gotchi-in-formation {
    background-color: var(--c-white);
    background: linear-gradient(180deg, var(--c-dark-purple) 0%, var(--c-black) 100%);
    color: var(--c-white);

    align-items: center;
    column-gap: 0.5rem;
  }
  .gotchi-in-formation--with-warning {
    background: linear-gradient(rgba(243, 106, 87, 1), rgba(137, 46, 33, 1));
  }
  .gotchi-in-formation--variant-large {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .gotchi-in-formation--variant-small {
    grid-template-columns: 1fr;
    justify-items: center;
  }
  .gotchi-in-formation__top-left-badges {
    position: absolute;
    left: 0;
    top: 0;
    height: 1rem;
    display: flex;
    gap: 0.1rem;
  }
  .gotchi-in-formation__top-left-badges > * {
    background: var(--c-black);
    color: var(--c-white);
  }
  .gotchi-in-formation__slot-number {
    width: 1rem;
    text-align: center;
    line-height: 1rem;
    font-size: 0.875rem;
    letter-spacing: 0.06265rem;
  }
  .gotchi-in-formation__leader-badge {
    padding: 0 0.25rem;
    display: grid;
    grid-template-columns: auto auto;
    column-gap: 0.25rem;
    align-items: center;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
  .gotchi-in-formation--variant-small .gotchi-in-formation__leader-badge,
  .gotchi-in-formation-placeholder--variant-small .gotchi-in-formation__leader-badge {
    padding: 0 0.05rem 0 0;
    column-gap: 0;
  }
  .gotchi-in-formation__leader-badge-icon {
    width: 1rem;
    color: var(--c-light-yellow);
  }

  .gotchi-in-formation__remove-button {
    /* raise above the extended click area */
    z-index: 1;
    position: absolute;
    top: 0;
    right: 0;
    width: 1rem;
    height: 1rem;
    display: grid;
    place-items: center;
    background: var(--c-black);
    color: var(--c-white);
  }

  .gotchi-in-formation__warning-icon {
    position: absolute;
    left: 0.25rem;
    top: 1.2rem;
  }

  .gotchi-in-formation__badges-container {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    /* raise above the extended click area */
    z-index: 1;
    /* don't let the badge extend the size of the gotchi container */
    max-width: 100%;
    overflow: hidden;
  }

  .gotchi-in-formation__image {
    width: 4.5rem;
    height: 4.5rem;
  }
  .gotchi-in-formation__name {
    margin-bottom: 0.5rem;
    color: var(--c-white);
    font-size: 1rem;
    line-height: 1.25rem;
    letter-spacing: 0.03rem;
    font-weight: bold;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .gotchi-in-formation--variant-small .gotchi-in-formation__name {
    max-width: var(--gotchi-in-formation-small-width);
    font-weight: normal;
    font-size: 0.75rem;
    line-height: var(--gotchi-in-formation__name-height);
  }
  .gotchi-in-formation--variant-small .gotchi-in-formation__badges-container + .gotchi-in-formation__name {
    padding-bottom: var(--gotchi-in-formation__badges-height);
  }

  .gotchi-in-formation__stats-popup {
    font-size: 0.875rem;
    line-height: 1.5rem;
    letter-spacing: 0.02625rem;
  }
  .gotchi-in-formation__stats-popup-header {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    letter-spacing: 0.03rem;
    font-weight: bold;
  }
</style>