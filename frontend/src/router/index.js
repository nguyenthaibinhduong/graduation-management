import DefaultLayout from '@/layouts/DefaultLayout.vue'
import StudentView from '@/views/StudentView.vue'
import TeacherView from '@/views/TeacherView.vue'
import UserView from '@/views/UserView.vue'
import axios from 'axios'
import ProfileView from '@/views/ProfileView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Tự động import các component khi cần thiết (lazy-load)
const views = import.meta.glob('../views/*.vue')

const routes = [
  { path: '/login', name: 'login', component: views['../views/LoginView.vue'] },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '/', component: UserView },
      { path: '/student', component: StudentView },
      { path: '/teacher', component: TeacherView },
      { path: '/profile', component: ProfileView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      const res = await axios.post('http://localhost:3034/api/v1/auth/verify-token', { token })
      if (res.status === 201) {
        authStore.setAuth(true)
        console.log('Token hợp lệ')
        return next()
      }
    } catch (error) {
      // Kiểm tra nếu lỗi có response và status là 409
      if (error.response && error.response.status === 409) {
        try {
          const refreshRes = await axios.post(
            'http://localhost:3034/api/v1/auth/refresh-token',
            {},
            { withCredentials: true }
          )
          if (refreshRes.status === 201 && refreshRes.data.access_token) {
            localStorage.setItem('token', refreshRes.data.access_token)
            authStore.setAuth(true)
            console.log('Token mới hợp lệ sau refresh')
            return next()
          }
        } catch (refreshError) {
          console.error('Không thể refresh token:', refreshError)
          authStore.setAuth(false)
          localStorage.removeItem('token')
          return next('/login')
        }
      } else {
        console.error('Không thể xác thực token:', error)
        authStore.setAuth(false)
        localStorage.removeItem('token')
        return next('/login')
      }
    }
  }

  // Nếu route không yêu cầu xác thực hoặc đã được xác thực trước đó,
  // cho phép điều hướng tiếp tục.
  next()
})

export default router
