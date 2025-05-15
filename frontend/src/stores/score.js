import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'
import baseService from '@/services/baseService'
import { showToast } from '@/utils/toast'
import api from '@/api/api'

export function createScoreStore(entity) {
  return defineStore(entity, () => {
    const items = ref([])
  
  

    

    return { items}
  })
}
