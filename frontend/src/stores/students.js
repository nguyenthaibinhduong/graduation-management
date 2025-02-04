import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useStudentStore = defineStore('student', () => {
  const students = ref([])

  // Lấy danh sách sinh viên
  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:3034/api/v1/students')
      students.value = response.data.data.items
    } catch (error) {
      console.error('Lỗi khi tải danh sách sinh viên:', error)
    }
  }

  // Thêm sinh viên mới
  const addStudent = async (studentData) => {
    try {
      const response = await axios.post('http://localhost:3034/api/v1/students', studentData)
      if (response.status === 201) {
        students.value.push(response.data.data)  // Thêm vào danh sách
        console.log('Sinh viên đã được thêm thành công!')
      }
    } catch (error) {
      console.error('Lỗi khi thêm sinh viên:', error)
    }
  }

  // Cập nhật thông tin sinh viên
  const updateStudent = async (studentId, updatedData) => {
    try {
      const response = await axios.put(`http://localhost:3034/api/v1/students/${studentId}`, updatedData)
      if (response.status === 200) {
        // Tìm và cập nhật lại thông tin sinh viên
        const index = students.value.findIndex(student => student.id === studentId)
        if (index !== -1) {
          students.value[index] = response.data.data
        }
        console.log('Thông tin sinh viên đã được cập nhật!')
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật sinh viên:', error)
    }
  }

  // Xóa sinh viên
  const deleteStudent = async (studentId) => {
    try {
      const response = await axios.delete(`http://localhost:3034/api/v1/students/${studentId}`)
      if (response.status === 200) {
        // Xóa sinh viên khỏi danh sách
        students.value = students.value.filter(student => student.id !== studentId)
        console.log('Sinh viên đã được xóa thành công!')
      }
    } catch (error) {
      console.error('Lỗi khi xóa sinh viên:', error)
    }
  }

  return { students, fetchStudents, addStudent, updateStudent, deleteStudent }
})
