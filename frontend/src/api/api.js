import { useAuthStore } from "@/stores/auth";
import axios from "axios";

const API_URL = "http://localhost:3034/api/v1";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Lấy token từ localStorage khi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


let refreshStatus = null

// Xử lý khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) return Promise.reject(error.response.data.message || "Lỗi");

    const { status } = error.response;
    const originalRequest = error.config;
    const authStore = useAuthStore(); // Nếu dùng Pinia trong Vue
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; 
      if (!refreshStatus) {
        refreshStatus = authStore
        .refreshAccessToken()
        .then(() => {
          api.defaults.headers.Authorization = `Bearer ${authStore.token}`;
          })
          .catch(() => {
          console.log('Phiên đăng nhập hết hạn');
          authStore.logout();
          })
        .finally(() => {
          refreshStatus= null
        })
      }
      
      return refreshStatus.then(() => {
        return api(originalRequest);
      });
      

    }

    return Promise.reject(error.response.data.message || "Lỗi");
  }
);


export default api;
