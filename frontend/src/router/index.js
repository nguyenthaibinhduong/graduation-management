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
import StudentProjectDoing from '@/views/student/StudentProjectDoing.vue'
import NotFound from '@/views/error/NotFound.vue'
import CommitteeDetail from '@/views/admin/CommitteeDetail.vue'
// Tự động import các component khi cần thiết (lazy-load)

const routes = [
  { path: '/login', name: 'login', component: LoginView },
  {
    path: '/',
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
    //Trang cho tất cả 
      { path: '/', component: DashboardView },
      { path: '/user-detail/:id', component: DetailProfileView },
      { path: '/project-detail/:id', component: ProjectDetailView },
      { path: '/profile', component: ProfileView },
      // Trang cho admin
      { path: '/student-manangerment', component: StudentView , meta: { roles: ['admin'] }},
      { path: '/group-manangerment-admin', component: GroupView , meta: { roles: ['admin'] }},
      { path: '/teacher-manangerment', component: TeacherView , meta: { roles: ['admin'] }},
      { path: '/course-manangerment', component: CourseView , meta: { roles: ['admin'] }},
      { path: '/enrollment-sessions-manangerment', component: EnrollmentView , meta: { roles: ['admin'] }},
      { path: '/evaluation-form-manangerment', component: EvaluationFormView , meta: { roles: ['admin'] }},
      { path: '/evaluation-form-detail/:id', component: EvaluationFormDetail , meta: { roles: ['admin'] }},
      { path: '/project-manangerment', component: ProjectView , meta: { roles: ['admin'] }},
      { path: '/account-manangerment', component: UserView , meta: { roles: ['admin'] }},
      { path: '/department-major-manangerment', component: MajorDepartmentView , meta: { roles: ['admin'] }},
      { path: '/committee-management', component: CommitteeView , meta: { roles: ['admin'] }},
      { path: '/score/:id', component: ScoreView, meta: { roles: ['admin'] } },
      { path: '/committee-management/:id', component: CommitteeDetail , meta: { roles: ['admin'] }},
      //Trang cho teacher
      { path: '/teacher-project', component: TeacherProjectView ,meta: { roles: ['teacher'] } },
      //Trang cho student
      { path: '/group-manangerment', component: StudentGroup ,meta: { roles: ['student'] } },
      { path: '/student-project', component: StudentProjectView , meta: { roles: ['student'] }},
      { path: '/student-project-public', component: StudentProjectPublic ,meta: { roles: ['student'] }},
      { path: '/student-project-doing', component: StudentProjectDoing ,meta: { roles: ['student'] }},
      
      //Nếu sai đuòng dẫn hoặc không đúng role
      { path: '/not-found', component: NotFound },
      
    ],
  },
  {
    path: '/:catchAll(.*)',
    redirect: '/not-found',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const authStore = useAuthStore()
  await authStore.fetchUser();
  const userRole = authStore.user?.role
  if (to.meta.requiresAuth && !token) {
    return next('/login')
  }
   if (to?.meta?.roles && !to.meta?.roles?.includes(userRole)) {
    return next('/not-found')
  }
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    try {
      const res = await axios.post('http://localhost:3034/api/v1/auth/verify-token', { token })
      if (res.status === 201) {
        authStore.setAuth(true)
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
            return next()
          }
        } catch (refreshError) {
          authStore.setAuth(false)
          localStorage.removeItem('token')
          return next('/login')
        }
      } else {
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
