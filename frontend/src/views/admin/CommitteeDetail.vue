<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Chi tiết Hội đồng</h1>
      <router-link
        to="/committee-management"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Quay lại
      </router-link>
    </div>

    <!-- General Information Section -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Thông tin chung</h2>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-sm text-gray-500">Tên hội đồng</p>
          <p class="text-base font-medium text-gray-800">{{ committee?.name }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Trạng thái</p>
          <span
            :class="{
              'bg-blue-100 text-blue-700': committee.status === 'active',
              'bg-red-100 text-red-700': committee.status === 'inactive',
            }"
            class="px-3 py-1 rounded-full text-sm font-medium"
          >
            {{ committee.status === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động' }}
          </span>
        </div>
        <div>
          <p class="text-sm text-gray-500">Khoa</p>
          <p class="text-base font-medium text-gray-800">{{ committee?.department?.name }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Học kỳ</p>
          <p class="text-base font-medium text-gray-800">{{ committee?.course?.name }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Thời gian bắt đầu</p>
          <p class="text-base font-medium text-gray-800">
            {{ formatDate(committee.time_start) }}
          </p>
        </div>
        <div>
          <p class="text-sm text-gray-500">Thời gian kết thúc</p>
          <p class="text-base font-medium text-gray-800">
            {{ formatDate(committee.time_end) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Teachers Section -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Danh sách Giáo viên</h2>
      <DataTableCustom
        :block="['toolbar', 'add', 'export', 'action', 'selectOne', 'selectAll']"
        :data="committee.teachers"
        :columns="[
          { field: 'code', header: 'Mã giáo viên' },
          { field: 'user.fullname', header: 'Họ và tên' },
          { field: 'user.email', header: 'Email' },
          { field: 'user.phone', header: 'Số điện thoại' },
        ]"
      />
    </div>

    <!-- Projects Section -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-4">Danh sách Đề tài</h2>
      <DataTableCustom
        :block="['toolbar', 'add', 'export', 'action', 'selectOne', 'selectAll']"
        :data="committee.projects"
        :columns="[
          { field: 'title', header: 'Tên đề tài' },
          { field: 'description', header: 'Mô tả' },
          { field: 'status', header: 'Trạng thái' },
        ]"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCommitteeStore } from '@/stores/store'
import DataTableCustom from '@/components/list/DataTableCustom.vue'

const route = useRoute()
const committeeStore = useCommitteeStore()
const committee = ref({})

onMounted(async () => {
  const encodedId = route.params.id
  await committeeStore.findItem(encodedId)
  committee.value = committeeStore.item ?? {}
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>
