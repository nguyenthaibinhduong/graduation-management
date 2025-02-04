import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'user',
      component: () => import('../views/UserView.vue'),
    },
    {
      path: '/student',
      name: 'student',
      component: () => import('../views/StudentView.vue'),
    },
  ],
})

export default router
