import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3034/api/v1/students' })

export const useStudentStore = defineStore('student', () => {
  const students = ref([])
  const total = ref([])

const fetchStudents = async (page = 1, limit = 10, search = '') => {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    const { data } = await api.get('/', { params });
    students.value = data.data.items;
    total.value = data.data.total; 
  } catch (error) {
    console.error("Lỗi khi lấy danh sách sinh viên:", error);
  }
};



  const addStudent = async (studentData) => {
    try {
      await api.post('/', studentData)
      await fetchStudents()
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create student')
    }
  }

  const updateStudent = async (id,studentData) => {
    try {
      await api.put(`/${id}`, studentData)
      await fetchStudents()
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update student')
    }
  }

  const deleteStudent = async (id) => { 
    try {
      await api.delete(`/${id}`)
      await fetchStudents()
    } catch (error) { 
      throw new Error(error.response?.data?.message || 'Failed to delete student')
    }
  }

  return { students ,total, fetchStudents, addStudent ,deleteStudent,updateStudent}
})
