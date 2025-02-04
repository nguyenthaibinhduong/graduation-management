import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useUserStore = defineStore('user', () => {
  const users = ref([])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:3034/api/v1/users')
      users.value = response.data.data.items
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error)
    }
  }

  return { users, fetchUsers }
})
