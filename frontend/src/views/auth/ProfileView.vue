<template>
  <div class="flex min-h-screen bg-transparent">
    <Card class="w-full">
      <template #title>
        <h2 class="text-xl font-bold text-blue-800">Thông tin tài khoản</h2>
      </template>
      <template #content>
        <div class="grid grid-cols-1 gap-4">
          <!-- Personal Information -->
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin cá nhân</h3>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">MSSV:</label>
            <span>{{ authStore.user?.username }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Họ và tên:</label>
            <span>{{ authStore.user?.fullname || 'Chưa cập nhật' }}</span>
          </div>
          <!-- User info Teacher/Student-->
          <template v-if="authStore.user?.role === 'student'">
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Khoa:</label>
              <span>{{ authStore.user?.student?.department?.name || 'Chưa cập nhật' }}</span>
            </div>
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Ngành:</label>
              <span>{{ authStore.user?.student?.major?.name || 'Chưa cập nhật' }}</span>
            </div>
          </template>
          <template v-if="authStore.user?.role === 'teacher'">
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Học vị:</label>
              <span>{{ authStore.user?.teacher?.degree || 'Chưa cập nhật' }}</span>
            </div>
          </template>
          <!--  -->
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày sinh:</label>
            <span>{{ formatDate(authStore.user?.birth_date) || 'Chưa cập nhật' }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Địa chỉ:</label>
            <span>{{ authStore.user?.address || 'Chưa cập nhật' }}</span>
          </div>

          <!-- Contact Information -->
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin liên hệ</h3>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Email:</label>
            <span>{{ authStore.user?.email }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Số điện thoại:</label>
            <span>{{ authStore.user?.phone || 'Chưa cập nhật' }}</span>
          </div>

          <!-- Account Information -->
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Vai trò:</label>
            <span>
              {{
                authStore.user?.role === 'student'
                  ? 'Sinh viên'
                  : authStore.user?.role === 'teacher'
                  ? 'Giảng viên'
                  : 'Quản trị viên'
              }}
            </span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày tạo:</label>
            <span>{{ formatDate(authStore.user?.created_at) }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày cập nhật:</label>
            <span>{{ formatDate(authStore.user?.updated_at) }}</span>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <Button
            label="Chỉnh sửa"
            icon="pi pi-pencil"
            class="p-button-outlined p-button-primary"
          />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Card, Button } from 'primevue'

// Fetch user data
const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchUser()
})

// Format date utility
const formatDate = (date) => {
  if (!date) return null
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('vi-VN', options)
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
