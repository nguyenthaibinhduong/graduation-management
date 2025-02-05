import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:3034/api/v1/students' })

export const useStudentStore = defineStore('student', () => {
  const students = ref([])

  const fetchStudents = async () => {
    try {
      students.value = (await api.get('/')).data.data.items
    } catch (error) {
      console.error(error)
    }
  }

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

  return { students, fetchStudents, addStudent ,deleteStudent,updateStudent}
})
