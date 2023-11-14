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
  max-width: 27rem;
  word-break: break-word;
  padding: 1rem;
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
