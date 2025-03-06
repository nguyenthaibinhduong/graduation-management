import DefaultLayout from '@/layouts/DefaultLayout.vue';
import { useAuthStore } from '@/stores/auth';
import StudentView from '@/views/StudentView.vue';
import TeacherView from '@/views/TeacherView.vue';
import UserView from '@/views/UserView.vue';
import ProfileView from '@/views/ProfileView.vue';
import { createRouter, createWebHistory } from 'vue-router';

// Tự động import các component khi cần thiết (lazy-load)
const views = import.meta.glob('../views/*.vue');

const routes = [
  { path: "/login", name: "login", component: views["../views/LoginView.vue"] },
  {
    path: "/",
    component: DefaultLayout,
    meta: { requiresAuth: true },
    children: [
      { path: "/", component: UserView },
      { path: "/student", component: StudentView },
      { path: "/teacher", component: TeacherView },
      { path: "/profile", component: ProfileView },
    ]
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware kiểm tra đăng nhập
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem("token")) return next("/login");
  next();
});

export default router;
