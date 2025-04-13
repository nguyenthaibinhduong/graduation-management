import { defineStore } from 'pinia'
import { ref } from 'vue'
import baseService from '@/services/baseService'
import { showToast } from '@/utils/toast'

export function createBaseStore(entity) {
  return defineStore(entity, () => {
    const items = ref([])
    const total = ref()

    const fetchItems = async (page = 1, limit = 10, search = '') => {
      const data = await baseService(entity).fetchAll(page, limit, search)
      items.value = data.items
      total.value = data.total
      
    }

    const addItem = async (itemData ) => {

      await baseService(entity).create(itemData)
      await fetchItems()
      showToast("Thêm thành công!", "success");
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
    

    return { items, total, fetchItems, addItem, updateItem, deleteItem }
  })
}
