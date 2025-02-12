import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/api'

export const useUserStore = defineStore('user', () => {
  const users = ref([])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      users.value = response.data.data.items
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
    }
  }

  return { users, fetchUsers }
})
