<script setup>
  import SiteIcon from './SiteIcon.vue';

  defineProps({
    icon: {
      type: String,
      default: null
    },
    grouped: {
      type: String,
      default: null
    },
    active: {
      type: Boolean,
      default: false
    },
    small: {
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
    class="site-button__container site-button__container--interactive"
    :class="{
      'site-button__container--is-active': active,
      'site-button__container--small': small,
      'site-button__container--is-grouped': !!grouped,
      'site-button__container--is-grouped--start': grouped === 'start',
      'site-button__container--is-grouped--middle': grouped === 'middle',
      'site-button__container--is-grouped--end': grouped === 'end'
    }"
  >
    <button
      class="site-button__button button-reset"
      :class="{
        'site-button--has-icon': icon
      }"
      :type="type"
    >
      <SiteIcon
        v-if="icon"
        :name="icon"
        :size="1.5"
        class="site-button__icon"
      />
      <slot />
    </button>
  </div>
</template>

<style>
/* global styles, as they're shared with SiteButtonLink */
.site-button__container {
  --button-color-border: #49DBFB;
  --button-corner-size: 0.5rem;
  --button-shadow-size: 0.2rem;
  --button-color-text: var(--c-white);
  --button-color-background: #004E79;
  --button-background--active:
    linear-gradient(180deg, rgba(5, 174, 187, 0.42) 0%, #01A5B1 100%)
    var(--color-background);
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
  --button-clip-path--start: polygon(
    0 var(--button-corner-size),
    var(--button-corner-size) var(--button-corner-size),
    var(--button-corner-size) 0,
    100% 0,
    100% 100%,
    var(--button-corner-size) 100%,
    var(--button-corner-size) calc(100% - var(--button-corner-size)),
    0 calc(100% - var(--button-corner-size))
  );
  --button-clip-path--end: polygon(
    0 0,
    calc(100% - var(--button-corner-size)) 0,
    calc(100% - var(--button-corner-size)) var(--button-corner-size),
    100%  var(--button-corner-size),
    100% calc(100% - var(--button-corner-size)),
    calc(100% - var(--button-corner-size)) calc(100% - var(--button-corner-size)),
    calc(100% - var(--button-corner-size)) 100%,
    0 100%
  );
  --button-clip-path--inner: polygon(
    var(--button-corner-size) 0,
    calc(100% - var(--button-corner-size)) 0,
    calc(100% - var(--button-corner-size)) 100%,
    var(--button-corner-size) 100%
  );
  --button-clip-path: var(--button-clip-path--full);

  --button-filter-shadow--full: drop-shadow(0px 0px var(--button-shadow-size) var(--button-color-border));
  --button-filter-borders--full:
    drop-shadow(0px 2px 0px var(--button-color-border))
    drop-shadow(2px 0px 0px var(--button-color-border))
    drop-shadow(-2px 0px 0px var(--button-color-border))
    drop-shadow(0px -2px 0px var(--button-color-border));
  --button-filter-borders--start:
    drop-shadow(0px 2px 0px var(--button-color-border))
    drop-shadow(-2px 0px 0px var(--button-color-border))
    drop-shadow(0px -2px 0px var(--button-color-border));
  --button-filter-borders--middle:
    drop-shadow(0px 2px 0px var(--button-color-border))
    drop-shadow(0px -2px 0px var(--button-color-border));
  --button-filter-borders--end:
    drop-shadow(0px 2px 0px var(--button-color-border))
    drop-shadow(2px 0px 0px var(--button-color-border))
    drop-shadow(0px -2px 0px var(--button-color-border));
  --button-filter-borders--vertical-start:
    drop-shadow(0px 2px 0px var(--button-color-border))
    drop-shadow(2px 0px 0px var(--button-color-border))
    drop-shadow(-2px 0px 0px var(--button-color-border))
    drop-shadow(0px -2px 0px var(--button-color-border));
  --button-filter-borders--vertical-middle:
    drop-shadow(0px 2px 0px rgba(255,255,255,0))
    drop-shadow(0px -2px 0px rgba(255,255,255,0))
    drop-shadow(-2px 0px 0px var(--button-color-border))
    drop-shadow(2px 0px 0px var(--button-color-border));
  --button-filter-borders--vertical-end:
    drop-shadow(0px 2px 0px var(--button-color-border))
    drop-shadow(2px 0px 0px var(--button-color-border))
    drop-shadow(-2px 0px 0px var(--button-color-border));
  --button-filter-borders: var(--button-filter-borders--full);
  --button-filter: var(--button-filter-borders);

  display: grid;
  filter: var(--button-filter);
}
.site-button__container--interactive {
  --button-filter: var(--button-filter-borders) var(--button-filter-shadow--full);
}
.site-button__container--interactive:hover {
  --button-shadow-size: 0.5rem;
}
.site-button__container--interactive:focus-within {
  --button-color-border: #FFD020;
}
.site-button__container--is-active {
  --button-color-border: #FFD020;
}

.site-button__button {
  display: block;
  clip-path: var(--button-clip-path);
  outline-color: transparent;
  border: none;
  padding: 1rem;
  background-color: var(--button-color-background);
  text-align: center;
  font-size: 1rem;
  line-height: 1.125rem;
  letter-spacing: 0.03rem;
  text-transform: uppercase;
  color: var(--button-color-text);
}

.site-button__container--small {
  --button-corner-size: 0.25rem;
}
.site-button__container--small .site-button__button {
  padding: calc((2rem - 1.125rem - (2px * 2)) / 2) 0.5rem; /* final height: 2rem, subtract line-height and borders to get padding */
  font-size: 0.875rem;
  line-height: 1.125rem;
  letter-spacing: 0.02625rem;
}

.site-button__button--link:link,
.site-button__button--link:visited,
.site-button__button--link:hover,
.site-button__button--link:focus,
.site-button__button--link:active {
  color: var(--button-color-text);
}

.site-button--has-icon {
  display: flex;
  align-items: center;
  column-gap: 0.5rem;
}

.site-button__button:focus,
.site-button__container--is-active .site-button__button {
  background: var(--button-background--active);
}

.site-button__icon {
  flex: none;
}

/* overrides for buttons in groups */
.site-button__container--is-grouped {
  --button-filter: var(--button-filter-borders);
  --button-color-text: rgba(255, 255, 255, 0.6);
}
.site-button__container--is-grouped.site-button__container--is-active {
  z-index: 1;
  --button-color-text: var(--c-white);
}
.site-button__container--is-grouped:hover,
.site-button__container--is-grouped:focus-within {
  --button-color-text: var(--c-white);
}
.site-button__container--is-grouped .site-button__button:focus-visible {
  outline: none;
}
.site-button__container--is-grouped:not(.site-button__container--is-active) .site-button__button:focus {
  background: var(--button-color-background);
}
.site-button__container--is-grouped--start {
  --button-clip-path: var(--button-clip-path--start);
  --button-filter-borders: var(--button-filter-borders--start);
  /* clip to hide flat edge because top and bottom box shadow borders can show through */
  clip-path: polygon(
    -1rem -1rem,
    calc(100% - 2px) calc(-1 * 1rem),
    calc(100% - 2px) calc(100% + 1rem),
    -1rem calc(100% + 1rem)
  );
}
.site-button__container--is-grouped--middle {
  --button-clip-path: none;
  --button-filter-borders: var(--button-filter-borders--middle);
  clip-path: polygon(
    2px -1rem,
    calc(100% - 2px) calc(-1 * 1rem),
    calc(100% - 2px) calc(100% + 1rem),
    2px calc(100% + 1rem)
  );
}
.site-button__container--is-grouped--end {
  --button-clip-path: var(--button-clip-path--end);
  --button-filter-borders: var(--button-filter-borders--end);
  clip-path: polygon(
    2px -1rem,
    calc(100% + 1rem) calc(-1 * 1rem),
    calc(100% + 1rem) calc(100% + 1rem),
    2px calc(100% + 1rem)
  );
}
.site-button__container--is-grouped.site-button__container--is-active {
  --button-clip-path: var(--button-clip-path--full);
  --button-filter-borders: var(--button-filter-borders--full);
  clip-path: none;
}
.site-button__container--is-grouped--vertical.site-button__container--is-active {
  position: relative; /* to ensure z-index works to bring it above others */
}
.site-button__container--is-grouped--vertical:not(.site-button__container--is-active) {
  --button-clip-path: var(--button-clip-path--inner);
}

/* workaround to avoid border color bleeding through inbetween buttons */
.site-button__container--is-grouped--vertical:not(.site-button__container--is-active) {
  position: relative;
}
/* workaround to avoid fine horizontal lines of border color bleeding through inbetween buttons: place a button-coloured layer behind the buttons */
.site-button__container--is-grouped--vertical:not(.site-button__container--is-active)::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--button-corner-size);
  right: var(--button-corner-size);
  background-color: var(--button-color-background);
}

.site-button__container--is-grouped--vertical-start:not(.site-button__container--is-active) {
  --button-filter-borders: var(--button-filter-borders--vertical-start);
}
.site-button__container--is-grouped--vertical-middle:not(.site-button__container--is-active) {
  --button-filter-borders: var(--button-filter-borders--vertical-middle);
}
.site-button__container--is-grouped--vertical-end:not(.site-button__container--is-active) {
  --button-filter-borders: var(--button-filter-borders--vertical-end);
}

</style>