import { defineStore } from 'pinia'
import { ref } from 'vue'
import projectService from '@/services/projectService'
import { showToast } from '@/utils/toast'

export function createProjectStore(entity="projects") {
  return defineStore(entity, () => {
    const items = ref([])
    const total = ref()

    const fetchItemsForStudent = async (student_id = null, course_id = null, page = 1, limit = 10, search = '') => {
      const data = await projectService(entity).fetchAll(null,student_id,course_id,page, limit, search)
      items.value = data.items
      total.value = data.total
      
    }
    const fetchItemsForTeacher = async (teacher_id = null,student_id=null, course_id = null, page = 1, limit = 10, search = '') => {
      const data = await projectService(entity).fetchAll(teacher_id,student_id,course_id,page, limit, search)
      items.value = data.items
      total.value = data.total
      
      }
      
    const fetchItems = async (page = 1, limit = 10, search = '') => {
      const data = await projectService(entity).fetchAll(null,null,null,page, limit, search)
      items.value = data.items
      total.value = data.total
    }

   const addItem = async (itemData ,type) => {
      await projectService(entity).create(itemData, type)
      showToast("Thêm thành công!", "success");
    }

    const updateItem = async (id,itemData ,type) => {
      await projectService(entity).update(id,itemData,type)
      showToast("Cập nhật thành công!", "success");
    }

    const deleteItem = async (ids,obj_id,type) => {
      await projectService(entity).delete(type,obj_id,ids)
      showToast("Xoá thành công!", "success");
    }

    

    return { items, total, fetchItems,fetchItemsForStudent,fetchItemsForTeacher,addItem,updateItem,deleteItem }
  })
}
