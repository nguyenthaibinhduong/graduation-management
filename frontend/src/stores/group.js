import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'
import baseService from '@/services/baseService'
import { showToast } from '@/utils/toast'
import api from '@/api/api'

export function createGroupStore(entity) {
  return defineStore(entity, () => {
    const items = ref([])
    const total = ref()
      const item = ref([])
      const group= ref([]) 
    const invite = ref([]) 
    const fetchItems = async (status, department_id, page = 1, limit = 10, search = '', orderBy = 'asc') => {
      const params = {
        status,
        department_id,
        page,
        limit,
        search,
        orderBy,
      };

      const { data } = await api.get(`/groups`, { params });
        if (data) {
          items.value = data.data.items;
          total.value = data.data.total;
        }
        
    };


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

    const getMyInvite = async () => {
        const { data } = await api.post(`/groups/get-my-invite`)
       invite.value = data.data
    }

    const respondToInvite = async (param, type = 'accept') => {
      const { data } = await api.post(`/groups/invite-response/${type}`, param)
      if (data) {
        const msg = type === "accept" ? "Tham gia nhóm thành công" : "Từ chối nhóm thàng công";
        showToast(msg, "success");
      }
      
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
      

    

    return { items,item, invite,total,group, fetchItems, addItem, updateItem, deleteItem,findItem,getMyGroup ,getMyInvite,respondToInvite}
  })
}
