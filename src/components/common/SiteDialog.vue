<script setup>
  import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
  import uniqueId from 'lodash.uniqueid'
  import A11yDialog from 'a11y-dialog'
  import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'
  import SiteIcon from './SiteIcon.vue'

  const props = defineProps({
    isOpen: { type: Boolean, default: false },
    variant: { type: String, default: 'large' },
    /* enable 'strict' to prevent clicks on backdrop closing dialog */
    strict: { type: Boolean, default: false }
  })

  const emit = defineEmits(['update:isOpen'])

  const dialogRef = ref(null)
  const dialogContentRef = ref(null)
  const dialogId = ref(uniqueId('site-dialog'))
  const dialogTitleId = ref(uniqueId('site-dialog-title'))

  const VARIANT = {
    LARGE: 'large',
    MEDIUM: 'medium',
    SCROLLING: 'scrolling'
  }

  let dialog = null

  onMounted(() => {
    if (dialogRef.value) {
      dialog = new A11yDialog(dialogRef.value)
      dialog.on('show', () => {
        disableBodyScroll(dialogContentRef.value)
        emit('update:isOpen', true)
      })
      dialog.on('hide', () => {
        enableBodyScroll(dialogContentRef.value)
        emit('update:isOpen', false)
      })
      if (props.isOpen) {
        dialog.show()
      }
    }
  })

  onBeforeUnmount(() => {
    if (dialog) {
      // don't use dialog.destroy(), it leaves behind DOM copies of the dialog
      clearAllBodyScrollLocks()
    }
  })

  watch(
    () => props.isOpen,
    (newIsOpen, oldIsOpen) => {
      if (!dialog) { return }
      if (newIsOpen && !oldIsOpen) {
        dialog.show()
      } else if (!newIsOpen && oldIsOpen) {
        dialog.hide()
      }
    }
  )
</script>

<template>
  <Teleport to="body">
    <div
      ref="dialogRef"
      :id="dialogId"
      :aria-labelledby="dialogTitleId"
      aria-hidden="true"
      class="site-dialog"
    >
      <div
        :data-a11y-dialog-hide="strict ? undefined : true"
        class="site-dialog__overlay"
      ></div>
      <div
        ref="dialogContentRef"
        role="document"
        class="site-dialog__dialog"
        :class="{
          'site-dialog__dialog--variant-scrolling': variant === VARIANT.SCROLLING,
          'site-dialog__dialog--variant-large': variant === VARIANT.LARGE,
          'site-dialog__dialog--variant-medium': variant === VARIANT.MEDIUM
        }"
      >
        <div
          v-if="[VARIANT.SCROLLING, VARIANT.LARGE].includes(variant)"
          class="site-dialog__header"
        >
          <div class="site-dialog__header-title">
            <slot
              name="header"
              :dialogTitleId="dialogTitleId"
            >
              <h1
                :id="dialogTitleId"
              >
                <slot name="title" />
              </h1>
            </slot>
          </div>
          <div class="site-dialog__header-close">
            <button
              type="button"
              data-a11y-dialog-hide
              aria-label="Close dialog"
              class="button-reset site-dialog__header-close-button"
            >
              <SiteIcon
                name="close"
                :width="2"
                :height="2"
                class="site-dialog__header-close-icon"
              />
            </button>
          </div>
        </div>
        <button
          v-else-if="variant === VARIANT.MEDIUM"
          type="button"
          data-a11y-dialog-hide
          aria-label="Close dialog"
          class="button-reset site-dialog__header-close-button"
        >
          <SiteIcon
            name="close"
            :width="2"
            :height="2"
            class="site-dialog__header-close-icon"
          />
        </button>
        <div class="site-dialog__body">
          <slot
            :dialogTitleId="dialogTitleId"
          />
        </div>
        <div
          v-if="variant === VARIANT.SCROLLING"
          class="site-dialog__footer"
        >
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style>
  /* Global styles, as these are teleported to the BODY */

  /* Adapted from https://a11y-dialog.netlify.app/usage/styling */
  /**
   * 1. Make the dialog container, and its child overlay spread across
   *    the entire window.
   */
  .site-dialog,
  .site-dialog__overlay {
    position: fixed; /* 1 */
    top: 0; /* 1 */
    right: 0; /* 1 */
    bottom: 0; /* 1 */
    left: 0; /* 1 */
  }

  /**
   * 1. Make sure the dialog container and all its descendants sits on
   *    top of the rest of the page.
   * 2. Make the dialog container a flex container to easily center the
   *    dialog.
   */
  .site-dialog {
    z-index: 2; /* 1 */
    display: flex; /* 2 */
  }

  /**
   * 1. Make sure the dialog container and all its descendants are not
   *    visible and not focusable when it is hidden.
   */
  .site-dialog[aria-hidden='true'] {
    display: none; /* 1 */
  }

  /**
   * 1. Make the overlay look like an overlay.
   */
  .site-dialog__overlay {
    backdrop-filter: blur(5px); /* 1 */
  }

  /**
   * 1. Vertically and horizontally center the dialog in the page.
   * 2. Make sure the dialog sits on top of the overlay.
   * 3. Make sure the dialog has an opaque background.
   */
  .site-dialog__dialog {
    --site-dialog-background: linear-gradient(180deg, #6027E2 0%, #3E1F6B 100%), #3E1F6B;
    --site-dialog-box-shadow: 0px 0px 24px 0px rgba(0, 0, 0, 0.25);
    --site-dialog-width: 90%;
    margin: auto; /* 1 */
    z-index: 2; /* 2 */
    position: relative; /* 2 */
    width: var(--site-dialog-width);
    max-width: calc(min(100% - 3rem, 1415px));
    max-height: calc(100% - 3rem);
    border: none; /* 3 */
    border-radius: 1.5rem;
    padding: 2rem 2rem 0 2rem;
    background: var(--site-dialog-background); /* 3 */
    box-shadow: var(--site-dialog-box-shadow);

    display: grid;
    grid-template-columns: minmax(0, 1fr);
  }

  .site-dialog__dialog--variant-scrolling {
    grid-template-rows: auto 1fr auto;
    padding: 0;
  }
  .site-dialog__dialog--variant-large {
    grid-template-rows: auto 1fr;
  }
  .site-dialog__dialog--variant-medium {
    --site-dialog-width: 55%;
    grid-template-rows: 1fr;
  }
  .site-dialog__body {
    overflow: auto;
    padding-bottom: 2rem; /* put the padding here, not on the __dialog, to avoid unwanted scrollbars on content in chrome */
  }
  /* 'scrolling' variant styles are full-bleed so padding is on inner elements instead of the container */
  .site-dialog__dialog--variant-scrolling .site-dialog__header {
    border-bottom: 4px solid var(--c-black);
    margin: 0;
    padding: 2rem;
  }
  .site-dialog__dialog--variant-scrolling .site-dialog__body {
    padding: 2rem;
    background: rgba(var(--c-black-rgb), 0.25);
  }
  .site-dialog__dialog--variant-scrolling .site-dialog__footer {
    box-shadow: 0px -12px 18px 0px rgba(0, 0, 0, 0.25);
    border-radius: 0 0 1.5rem 1.5rem;
    background: var(--site-dialog-background);
  }

  .site-dialog__header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 1.5rem;
    margin-bottom: 1rem;
  }
  .site-dialog__header-close-button {
    color: var(--c-white);
  }
  .site-dialog__header h1 {
    margin: 0;
    font-size: 2.5rem;
  }

  .site-dialog__dialog--variant-medium .site-dialog__header-close-button {
    position: absolute;
    top: -0.9rem;
    right: -0.9rem;
    display: grid;
    place-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 1.25rem;
    background: var(--c-white);
    color: rgba(47, 24, 120, 1);
  }
</style>
