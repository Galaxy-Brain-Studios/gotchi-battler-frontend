<script>
  import { PopperWrapper } from 'floating-vue'

  export default {
    ...PopperWrapper,
    name: 'SitePopupHoverMenu',
    vPopperTheme: 'site-hover-menu-theme'
  }
</script>

<style>
.v-popper--theme-site-hover-menu-theme .v-popper__inner {
  --site-popup-hover-menu-padding: 1rem;
  max-width: 27rem;
  word-break: break-word;
  padding: var(--site-popup-hover-menu-padding);
  border-radius: 0px;
  border: 2px solid var(--c-white);
  background: var(--c-black);
  color: var(--c-white);
}
.v-popper--theme-site-hover-menu-theme .v-popper__arrow-outer {
  border-color: var(--c-white);
}
.v-popper--theme-site-hover-menu-theme .v-popper__arrow-inner {
  border-color: var(--c-black);
}
</style>
