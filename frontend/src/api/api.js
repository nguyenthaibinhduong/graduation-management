import { useAuthStore } from '@/stores/auth'
import { showToast } from '@/utils/toast'
import axios from 'axios'

const API_URL = 'http://localhost:3034/api/v1'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

// Lấy token từ localStorage khi request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

let refreshStatus = null

// Xử lý khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) return Promise.reject(error.response.data.message || 'Lỗi')

    const { status } = error.response
    const originalRequest = error.config
    const authStore = useAuthStore() // Nếu dùng Pinia trong Vue

    if (status === 409) {
      if (!originalRequest._retry) {
        originalRequest._retry = true
        if (!refreshStatus) {
          refreshStatus = authStore
            .refreshAccessToken()
            .then(() => {
              api.defaults.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
            })
            .catch(() => {
              showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'Lỗi ')
              authStore.logout()
            })
            .finally(() => {
              refreshStatus = null
            })
        }

        return refreshStatus.then(() => {
          return api(originalRequest)
        })
      }
      const messages = error.response?.data?.message

      if (Array.isArray(messages)) {
        // Nếu messages là một mảng, duyệt qua từng lỗi
        messages.forEach((msg) => showToast(msg, 'error','Lỗi'))
      } else {
        showToast(messages, 'error','Lỗi')
      }
      return Promise.reject('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }

    if (status === 402) {
      showToast('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.', 'error','Lỗi')
      authStore.logout()
      return Promise.reject('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
    }
    if (status === 400) {
      const messages = error.response?.data?.message

      if (Array.isArray(messages)) {
        // Nếu messages là một mảng, duyệt qua từng lỗi
        messages.forEach((msg) => showToast(msg, 'error','Lỗi'))
      } else {
        showToast(messages || 'Dữ liệu không hợp lệ.', 'error','Lỗi')
      }

      return Promise.reject('Dữ liệu không hợp lệ.')
    }
    if (status === 403) {
      authStore.logout()
      showToast(
        error.response?.data?.message || 'Bạn không có quyền truy cập vào tính năng này.',
        'error','Lỗi'
      )
      return Promise.reject('Bạn không có quyền truy cập vào tính năng này.')
    }
    if (status === 404) {
      showToast(
        error.response?.data?.message || 'Bạn không có quyền truy cập vào tính năng này.',
        'error','Lỗi'
      )
      return Promise.reject('Không tìm thấy trang bạn yêu cầu.')
    }
    if (status === 500) {
      showToast(error.response?.data?.message || 'Đã xảy ra lỗi trong hệ thống.', 'error','Lỗi')
      return Promise.reject('Đã xảy ra l��i trong hệ thống.')
    }

    return Promise.reject(error.response.data.message || 'Lỗi')
  }
)

export default api
