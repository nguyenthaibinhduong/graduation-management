<template>
  <div class="flex min-h-screen bg-transparent py-8 justify-center">
    <Card class="w-full">
      <template #title>
        <div class="w-full flex justify-between items-center pb-6">
          <h2 class="text-xl font-bold text-blue-800">Chi tiết Đề Tài</h2>
        </div>
      </template>
      <template #content>
        <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Tên đề tài:</label>
            <span>{{ project.title || 'Chưa cập nhật' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Mô tả:</label>
            <span>{{ project.description || 'Chưa cập nhật' }}</span>
          </div>
          <div class="flex items-center gap-2 col-span-2">
            <label class="font-semibold text-gray-700">Nội dung:</label>
            <span v-html="project.content || 'Chưa cập nhật'"></span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Giáo viên hướng dẫn:</label>
            <span>{{ project.teacher?.user?.fullname || 'Chưa xác định' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Sinh viên thực hiện:</label>
            <span>{{ project.student?.user?.fullname || 'Chưa xác định' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Học kỳ:</label>
            <span>{{ project.course?.name || 'Chưa xác định' }}</span>
          </div>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Trạng thái:</label>
            <span :class="statusClass(project.status)">
              {{ statusLabel(project.status) }}
            </span>
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { ref, onMounted, watchEffect } from 'vue'
import { useRoute } from 'vue-router'
import { useProjectStore } from '@/stores/store'
import { useAuthStore } from '@/stores/auth'
import { Card } from 'primevue'

const authStore = useAuthStore()
const projectStore = useProjectStore()
const project = ref(null)
const route = useRoute()

const statusLabel = (status) => {
  const statuses = {
    propose: 'Đề xuất',
    pending: 'Đang chờ',
    approve: 'Đã duyệt',
  }
  return statuses[status] || 'Không xác định'
}

const statusClass = (status) => {
  const classes = {
    propose: 'bg-blue-100 text-blue-700 px-2 py-1 rounded',
    pending: 'bg-yellow-100 text-yellow-700 px-2 py-1 rounded',
    approve: 'bg-green-100 text-green-700 px-2 py-1 rounded',
  }
  return classes[status] || ''
}

onMounted(async () => {
  try {
    await authStore.fetchUser()

    const user = authStore.user
    if (!user) throw new Error('Không thể lấy thông tin người dùng')

    const projectId = route.params.id
    const objId = user.teacher?.id || user.student?.id
    await projectStore.findItem(projectId, objId, user.role)
  } catch (error) {
    console.error('Có lỗi xảy ra:', error)
  }
})

watchEffect(() => {
  project.value = projectStore.item
})
</script>
