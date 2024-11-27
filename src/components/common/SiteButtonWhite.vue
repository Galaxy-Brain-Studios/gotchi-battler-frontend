<script setup>
  defineProps({
    small: {
      type: Boolean,
      default: false
    },
    active: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'button'
    }
  })
</script>

<template>
  <div
    class="site-button-white__container site-button-white__container--interactive"
    :class="{
      'site-button-white__container--small': small,
      'site-button-white__container--is-active': active
    }"
  >
    <div class="site-button-white__corner site-button-white__corner-1" />
    <div class="site-button-white__corner site-button-white__corner-2" />
    <div class="site-button-white__corner site-button-white__corner-3" />
    <div class="site-button-white__corner site-button-white__corner-4" />
    <button
      class="site-button-white__button button-reset"
      :type="type"
      :disabled="disabled"
    >
      <slot />
    </button>
  </div>
</template>

<style>
/* global styles, as they're shared with SiteButtonWhiteBox */
.site-button-white__container {
  --button-corner-size: 0.5rem;
  --button-border-width: 2px;
  --button-color-border: var(--c-white);
  --button-color-text: var(--c-white);
  --button-color-background: rgba(0, 0, 0, 0);
  --button-color-focus: var(--c-light-blue);

  --button-clip-path--full: polygon(
    0 var(--button-corner-size),
    var(--button-corner-size) var(--button-corner-size),
    var(--button-corner-size) 0,
    calc(100% - var(--button-corner-size)) 0,
    calc(100% - var(--button-corner-size)) var(--button-corner-size),
    100%  var(--button-corner-size),
    100% calc(100% - var(--button-corner-size)),
    calc(100% - var(--button-corner-size)) calc(100% - var(--button-corner-size)),
    calc(100% - var(--button-corner-size)) 100%,
    var(--button-corner-size) 100%,
    var(--button-corner-size) calc(100% - var(--button-corner-size)),
    0 calc(100% - var(--button-corner-size))
  );
  --button-clip-path: var(--button-clip-path--full);

  clip-path: var(--button-clip-path);
  position: relative;
}
.site-button-white__container--small {
  --button-corner-size: 0.25rem;
}
.site-button-white__container--interactive:hover {
  box-shadow: inset 0 0 12px var(--button-color-border);
}
.site-button-white__container--interactive:focus-within {
  box-shadow: inset 0 0 12px var(--button-color-border), inset 0 0 15px var(--button-color-focus);
}

.site-button-white__container--link:not(.site-button-white__container--is-active) {
  --button-color-border: transparent;
  opacity: 0.7;
}
.site-button-white__container:not(.site-button-white__container--link):not(.site-button-white__container--is-active):not(:hover) {
  --button-color-border: transparent;
  opacity: 0.7;
}

.site-button-white__button {
  display: block;
  width: 100%;
  outline-color: transparent;
  border: var(--button-border-width) solid var(--button-color-border);
  padding: calc(0.75rem - var(--button-border-width)) 2.5rem;
  background: var(--button-color-background);
  color: var(--button-color-text);
  font-size: 1rem;
  letter-spacing: 0.03rem;
  line-height: 1.5rem;
  font-weight: bold;
  text-transform: uppercase;
}
.site-button-white__container--small .site-button-white__button {
  padding: calc(0.5rem - var(--button-border-width)) 1rem;
  font-size: 0.75rem;
  line-height: 1rem;
}

.site-button-white__button--link {
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  text-underline-offset: 0.4rem;
}
.site-button-white__button--link:link,
.site-button-white__button--link:visited,
.site-button-white__button--link:hover,
.site-button-white__button--link:focus,
.site-button-white__button--link:active {
  color: var(--button-color-text);
}
.site-button-white__container--link:not(.site-button-white__container--is-active) .site-button-white__button--link {
  font-weight: normal;
}
.site-button-white__container--link:not(.site-button-white__container--is-active) .site-button-white__button--link:hover {
  text-decoration: underline;
}
.site-button-white__button--link:focus-visible {
  text-decoration: underline;
}

.site-button-white__corner {
  position: absolute;
  width: calc(var(--button-corner-size) + var(--button-border-width));
  height: calc(var(--button-corner-size) + var(--button-border-width));
  background: var(--button-color-border);
}
.site-button-white__corner-1 {
  top: 0;
  left: 0;
}
.site-button-white__corner-2 {
  top: 0;
  right: 0;
}
.site-button-white__corner-3 {
  bottom: 0;
  right: 0;
}
.site-button-white__corner-4 {
  bottom: 0;
  left: 0;
}
</style>