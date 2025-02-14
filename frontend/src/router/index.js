import { useAuthStore } from '@/stores/auth';
import { createRouter, createWebHistory } from 'vue-router';

// Tự động import các component khi cần thiết (lazy-load)
const views = import.meta.glob('../views/*.vue');

const routes = [
  { path: "/login", name: "login", component: views["../views/LoginView.vue"] },
  { path: "/", name: "user", component: views["../views/UserView.vue"], meta: { requiresAuth: true } },
  { path: "/student", name: "student", component: views["../views/StudentView.vue"], meta: { requiresAuth: true } },
  { path: "/teacher", name: "teacher", component: views["../views/TeacherView.vue"], meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware kiểm tra đăng nhập
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.token) return next("/login");
  next();
});

export default router;
