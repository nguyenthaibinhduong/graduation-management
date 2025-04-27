// stores/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/api/api'
import router from '@/router'
import { showToast } from '@/utils/toast'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: localStorage.getItem('isAuthenticated') == true,
  }),
  actions: {
    setAuth(status) {
      this.isAuthenticated = status
      localStorage.setItem('isAuthenticated', status)
    },
    async login(username, password, captcha) {
      try {
        const apiAuth = axios.create({
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        })
        const response = await apiAuth.post('http://localhost:3034/api/v1/auth/login', {
          username,
          password,
          captcha
        })
        this.token = response.data.access_token
        this.user = response.data.user
        localStorage.setItem('token', this.token)
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
        showToast('Đăng nhập thành công', 'success')
      } catch (error) {
        showToast(error.response?.data?.message, 'error')
      }
    },
    async refreshAccessToken() {
      const response = await axios.post(
        'http://localhost:3034/api/v1/auth/refresh-token',
        {},
        { withCredentials: true }
      )

      if (response.data.access_token) {
        this.token = response.data.access_token
        localStorage.setItem('token', response.data.access_token) // Lưu token mới
        return response.data.access_token
      }
    },
    async logout_kk() {
      try {
        const token = localStorage.getItem('token')
        if (token) {
          await axios.post(
            'http://localhost:3034/api/v1/auth/logout',
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        }
      } catch (error) {
        console.error('Error during logout:', error)
      } finally {
        this.token = null
        this.user = null
        this.isAuthenticated = false
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('token')
        router.push('/login')
      }
    },
    logout() {
      this.token = null
      this.user = null
      this.isAuthenticated = false
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('token')
      router.push('/login')
    },

    async fetchUser() {
      if (this.token) {
        try {
          const response = await api.get('auth/me')
          this.user = response.data
        } catch (error) {
          console.error('Failed to fetch user:', error)
          this.logout()
        }
      }
    },

    async updatePassword(oldPassword, newPassword) {
      try {
        const response = await api.put('auth/change-password', {
          oldPassword,
          newPassword,
        })
        showToast(response.data.message, 'success')
      } catch (error) {
        showToast(error.response?.data?.message, 'error')
        console.error('Error updating password:', error)
      }
    },
  },
})


