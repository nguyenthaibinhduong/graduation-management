import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/api'

export const useStudentStore = defineStore('student', () => {
  const students = ref([])
  const total = ref([])

const fetchStudents = async (page = 1, limit = 10, search = '') => {
  const params = { page, limit };
    if (search) params.search = search;
    const { data } = await api.get('/students', { params });
    students.value = data.data.items;
    total.value = data.data.total;
};



  const addStudent = async (studentData) => {
    try {
      await api.post('/students', studentData)
      await fetchStudents()
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create student')
    }
  }

  const updateStudent = async (id,studentData) => {
    try {
      await api.put(`/students/${id}`, studentData)
      await fetchStudents()
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update student')
    }
  }

  const deleteStudent = async (id) => { 
    try {
      await api.delete(`/students/${id}`)
      await fetchStudents()
    } catch (error) { 
      throw new Error(error.response?.data?.message || 'Failed to delete student')
    }
  }

  return { students ,total, fetchStudents, addStudent ,deleteStudent,updateStudent}
})
