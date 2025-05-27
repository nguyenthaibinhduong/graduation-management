import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'

import api from '@/api/api'

export function createAnalystStore(entity) {
  return defineStore(entity, () => {
      const items = ref()
    const fetchItems = async () => {

      const  data  = await api.post(`/${entity}`, {})
        if (data) {
            items.value=data.data
      }
    }


    return {
        items,
        fetchItems
    }
  })
}
