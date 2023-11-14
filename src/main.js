import './assets/main.css'

import { DEV_MODE } from './appEnv'
import { makeServer } from "./mirage/server"
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import FloatingVue from 'floating-vue'
import { theme as sitePopupHoverMenuTheme } from './components/common/sitePopupHoverMenuTheme'
import { theme as sitePopupDropdownTheme } from './components/common/sitePopupDropdownTheme'

if (DEV_MODE) {
  window.mirageServer = makeServer()
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(FloatingVue, {
  themes: {
    'site-hover-menu-theme': sitePopupHoverMenuTheme,
    'site-dropdown-theme': sitePopupDropdownTheme
  }
})

app.mount('#app')
