// stores/auth.js
import { defineStore } from 'pinia'
import axios from 'axios'
import api from '@/api/api'
import router from '@/router'
import { showToast } from '@/utils/toast'
import { generateHeaders } from '@/api/apiKeyEncrypt'
const API_URL = import.meta.env.VITE_API_URL
const headersAuth = generateHeaders();
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
            ...headersAuth
          },
          withCredentials: true,
        })
        const response = await apiAuth.post(API_URL+'/auth/login', {
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
        API_URL+'/auth/refresh-token',
        {},
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            ...headersAuth
          },
        }
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
            API_URL+'/auth/logout',
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                ...headersAuth
               }
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
      window.location.href = '/login';
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


