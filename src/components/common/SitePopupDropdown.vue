<script>
  import { PopperWrapper } from 'floating-vue'

  export default {
    ...PopperWrapper,
    name: 'SitePopupDropdown',
    vPopperTheme: 'site-dropdown-theme'
  }
</script>

<style>
.v-popper--theme-site-dropdown-theme .v-popper__inner {
  max-width: 35rem;
  word-break: break-word;
  padding: 0;
  border-radius: 0px;
  border: 2px solid var(--c-white);
  background: var(--c-white);
  color: var(--c-black);
}
.v-popper--theme-site-dropdown-theme .v-popper__arrow-outer {
  border-color: var(--c-white);
}
.v-popper--theme-site-dropdown-theme .v-popper__arrow-inner {
  border-color: var(--c-white);
}
</style>
