import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/views/NotFound.vue')
    },
    {
      path: '/',
      name: 'home',
      component: Home,
      props: true,
      // props: route => ({...route.params, address: route.params.address}),
      children: [
      //   {
      //     path: '/:address',
      //     name: 'address',
      //     component: () => import('@/views/TopicPanel.vue'),
      //   },
        // {
        //   path: '/:address/:topic',
        //   name: 'address-and-topic',
        //   component: () => import('@/views/Property.vue'),
        // },
      ]
    },
    {
      path: '/:address',
      name: 'address',
      component: Home,
      // component: () => import('@/views/TopicPanel.vue'),
    },
    {
      path: '/:address/:topic',
      name: 'address-and-topic',
      component: Home,
      // component: () => import('@/views/TopicPanel.vue'),
    },
    {
      path: '/not-found',
      name: 'not-found',
      component: Home,
    }
  ]
})

export default router
