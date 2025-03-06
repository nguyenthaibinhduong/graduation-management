import DefaultLayout from '@/layouts/DefaultLayout.vue';
import StudentView from '@/views/StudentView.vue';
import TeacherView from '@/views/TeacherView.vue';
import UserView from '@/views/UserView.vue';
import axios from 'axios';
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


router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.meta.requiresAuth) {
    if (!token) {
      return next("/login"); // Nếu không có token, buộc quay lại trang đăng nhập
    }

    try {
      const res = await axios.get("http://localhost:3034/api/v1/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res) {
        console.log("Token hợp lệ");
        return next(); // Dừng code ở đây nếu token hợp lệ
      } else {
        console.log("Token không hợp lệ");
        return next("/login");
      }

    } catch (error) {
      try {
        const { data: { token } } = await axios.post(
        'http://localhost:3034/api/v1/auth/refresh-token',
        {},
        { withCredentials: true }
      );
        console.log("Token đã được refresh");
        return next();
      } catch (error) { 
        console.log("Không thể refresh token");
        localStorage.removeItem("token");
        return next("/login"); 
      }
    }
  } 

  next(); 
});



export default router;
