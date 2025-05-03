import DefaultLayout from '@/layouts/DefaultLayout.vue'
import StudentView from '@/views/admin/StudentView.vue'
import TeacherView from '@/views/admin/TeacherView.vue'
import UserView from '@/views/admin/UserView.vue'
import axios from 'axios'
import ProfileView from '@/views/auth/ProfileView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/dashboard/DashboardView.vue'
import LoginView from '@/views/auth/LoginView.vue'
import MajorDepartmentView from '@/views/admin/MajorDepartmentView.vue'
import CourseView from '@/views/admin/CourseView.vue'
import EnrollmentView from '@/views/admin/EnrollmentView.vue'
import TeacherProjectView from '@/views/teacher/TeacherProjectView.vue'
import ProjectView from '@/views/admin/ProjectView.vue'
import ProjectDetailView from '@/views/project/ProjectDetailView.vue'
import EvaluationFormView from '@/views/admin/EvaluationFormView.vue'
import StudentProjectView from '@/views/student/StudentProjectView.vue'
import StudentGroup from '@/views/student/group/StudentGroup.vue'
import ScoreView from '@/views/teacher/ScoreView.vue'
import EvaluationFormDetail from '@/views/admin/EvaluationFormDetail.vue'
import StudentProjectPublic from '@/views/student/StudentProjectPublic.vue'
import DetailProfileView from '@/views/admin/DetailProfileView.vue'
import CommitteeView from '@/views/admin/CommitteeView.vue'
import GroupView from '@/views/admin/GroupView.vue'
// Tự động import các component khi cần thiết (lazy-load)

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '/', component: DashboardView },
      { path: '/user-detail/:id', component: DetailProfileView },
      { path: '/student-manangerment', component: StudentView },
      { path: '/group-manangerment-admin', component: GroupView },
      { path: '/teacher-manangerment', component: TeacherView },
      { path: '/course-manangerment', component: CourseView },
      { path: '/enrollment-sessions-manangerment', component: EnrollmentView },
      { path: '/evaluation-form-manangerment', component: EvaluationFormView },
      { path: '/evaluation-form-detail/:id', component: EvaluationFormDetail },
      { path: '/project-manangerment', component: ProjectView },
      { path: '/profile', component: ProfileView },
      { path: '/account-manangerment', component: UserView },
      { path: '/department-major-manangerment', component: MajorDepartmentView },
      { path: '/teacher-project', component: TeacherProjectView },
      { path: '/committee-management', component: CommitteeView },
      { path: '/group-manangerment', component: StudentGroup },
      { path: '/student-project', component: StudentProjectView },
      { path: '/student-project-public', component: StudentProjectPublic },
      { path: '/project-detail/:id', component: ProjectDetailView },
      { path: '/score/:id', component: ScoreView },
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
            {
              withCredentials: true,
            }
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
