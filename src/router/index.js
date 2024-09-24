import { DEV_MODE } from '../appEnv'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../components/home/HomePage.vue'
import NotFoundPage from '../components/site/NotFoundPage.vue'

const devRoutes = []
if (DEV_MODE) {
  devRoutes.push(
    {
      path: '/dev',
      name: 'dev',
      component: () => import('../components/dev/DevPage.vue')
    }
  )
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../components/settings/SettingsPage.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      props: true,
      component: () => import('../components/profile/ProfilePage.vue'),
      children: [
        {
          path: ':address',
          name: 'profile-address',
          props: true,
          redirect: to => ({ name: 'profile-teams', params: { address: to.params.address } }),
          children: [
            {
              path: 'teams',
              name: 'profile-teams',
              props: true,
              component: () => import('../components/profile/ProfileTeams.vue'),
            },
            {
              path: 'inventory',
              name: 'profile-inventory',
              props: true,
              component: () => import('../components/profile/ProfileInventory.vue'),
            },
            {
              path: 'badges',
              name: 'profile-badges',
              props: true,
              component: () => import('../components/profile/ProfileBadges.vue'),
            }
          ]
        }
      ]
    },
    {
      path: '/tournaments',
      name: 'tournaments',
      redirect: {
        name: 'tournaments-type',
        params: {
          type: 'all'
        }
      },
      children: [
        {
          path: 'type/:type',
          name: 'tournaments-type',
          props: true,
          component: () => import('../components/tournaments/TournamentsPage.vue')
        },
        {
          path: 'id/:id',
          name: 'tournament',
          redirect: to => ({ name: 'tournament-tab', params: { id: to.params.id, tab: 'brackets' } }),
          children: [
            {
              path: 'tab/:tab/:teamId?/:teamMode?',
              name: 'tournament-tab',
              props: true,
              component: () => import('../components/tournaments/TournamentPage.vue')
            },
            {
              path: 'bracket/:bracketId/:battleId?',
              name: 'tournament-bracket',
              props: true,
              component: () => import('../components/tournaments/TournamentBracketPage.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/training',
      name: 'training',
      component: () => import('../components/training/TrainingPage.vue')
    },
    {
      path: '/tools',
      name: 'tools',
      redirect: () => ({ name: 'analyser' }),
      children: [
        {
          path: 'analyser/:id?',
          name: 'analyser',
          props: true,
          component: () => import('../components/analyser/AnalyserPage.vue')
        },
        {
          path: 'simulator',
          name: 'simulator',
          component: () => import('../components/simulator/SimulatorPage.vue')
        }
      ]
    },
    {
      path: '/shop',
      name: 'shop',
      component: () => import('../components/shop/ShopPage.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../components/about/AboutPage.vue')
    },
    ...devRoutes,
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundPage
    }
  ]
})

export default router
