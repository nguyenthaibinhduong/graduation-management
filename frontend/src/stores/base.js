import { defineStore } from 'pinia'
import { ref } from 'vue'
import baseService from '@/services/baseService'
import { showToast } from '@/utils/toast'

export function createBaseStore(entity) {
  return defineStore(entity, () => {
    const items = ref([])
    const total = ref()
    const item = ref([])
    const fetchItems = async (page = 1, limit = 10, search = '',filters) => {
      const data = await baseService(entity).fetchAll(page, limit, search,filters)
      items.value = data.items
      total.value = data.total
      
    }

    const findItem = async (id) => {
      if (id) {
        const data = await baseService(entity).getById(id)
        item.value = data
      }
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
    

    return { items,item, total, fetchItems, addItem, updateItem, deleteItem,findItem }
  })
}
