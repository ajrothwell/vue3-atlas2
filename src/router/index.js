import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      props: true,
      // props: route => ({...route.params, address: route.params.address}),
      children: [
        {
          path: '/:address',
          name: 'address',
          component: () => import('@/views/AddressShow.vue'),
        },
        {
          path: '/:address/:topic',
          name: 'address-and-topic',
          component: () => import('@/views/AddressShow.vue'),
        },
      ]
    },
    // {
    //   path: '/:address',
    //   name: 'address',
    //   component: () => import('@/views/AddressShow.vue'),
    // },
    // {
    //   path: '/:address/:topic',
    //   name: 'address-and-topic',
    //   component: () => import('@/views/AddressShow.vue'),
    // },
    // {
    //   path: '/about',
    //   name: 'about',
    //   // route level code-splitting
    //   // this generates a separate chunk (About.[hash].js) for this route
    //   // which is lazy-loaded when the route is visited.
    //   component: () => import('../views/AboutView.vue')
    // }
  ]
})

export default router
