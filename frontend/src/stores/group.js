import { defineStore } from 'pinia'
import { ref } from 'vue'
import baseService from '@/services/baseService'
import { showToast } from '@/utils/toast'
import api from '@/api/api'

export function createGroupStore(entity) {
  return defineStore(entity, () => {
    const items = ref([])
    const total = ref()
      const item = ref([])
      const group= ref([]) 
    const fetchItems = async (page = 1, limit = 10, search = '') => {
      const data = await baseService(entity).fetchAll(page, limit, search)
      items.value = data.items
      total.value = data.total
      
    }

    const findItem = async (id) => {
      if (id) {
        const data = await baseService(entity).getById(id)
        item.value = data
      }
      }
      
    const getMyGroup = async () => {
        const { data } = await api.post(`/groups/get-my-group`)
        group.value = data.data
    }

    const addItem = async (itemData ) => {

      await baseService(entity).create(itemData)
      await fetchItems()
      showToast("Tạo nhóm thành công!", "success");
    }

    const updateItem = async (id, itemData) => {
      await baseService(entity).update(id, itemData)
      await fetchItems()
      showToast("Cập nhật thành công!", "success");
    }

    const deleteItem = async (id) => {
      await baseService(entity).delete(id)
      await fetchItems()
      showToast("Xóa thành công!", "success");
      }
      

    

    return { items,item, total,group, fetchItems, addItem, updateItem, deleteItem,findItem,getMyGroup }
  })
}
