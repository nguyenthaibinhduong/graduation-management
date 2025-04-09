<template>
  <div class="flex min-h-screen bg-transparent">
    <Card class="w-full">
      <template #title>
        <div class="w-full flex justify-between items-center pb-10">
          <h2 class="text-xl font-bold text-blue-800">Thông tin tài khoản</h2>
          <Button label="Chỉnh sửa" icon="pi pi-pencil" class="btn-submit" @click="visibleLeft = true" />
        </div>
      </template>
      <template #content>
        <div class="grid grid-cols-1 gap-4">
          <!-- Personal Information -->
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2">Thông tin cá nhân</h3>

          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Họ và tên:</label>
            <span>{{ authStore.user?.fullname || 'Chưa cập nhật' }}</span>
          </div>
          <!-- User info Teacher/Student-->
          <template v-if="authStore.user?.role === 'student'">
            <div class="flex items-center gap-2">
              <label class="font-semibold text-gray-700">Mã số sinh viên:</label>
              <span>{{ authStore.user?.username }}</span>
            </div>
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
            <span>{{ dayjs(authStore.user?.birth_date).format("MM/DD/YYYY") || 'Chưa cập nhật' }}</span>
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
            <span>{{ dayjs(authStore.user?.created_at).format("MM/DD/YYYY") }}</span>
          </div>
          <div class="flex items-center gap-2">
            <label class="font-semibold text-gray-700">Ngày cập nhật:</label>
            <span>{{ dayjs(authStore.user?.updated_at).format("MM/DD/YYYY") }}</span>
          </div>
        </div>

      </template>
    </Card>
  </div>
  <MyDrawer class="w-full" title="thông tin cá nhân" v-model:visible="visibleLeft" position="right" :closable="false"
    :isEditing="isEditing" :onCancel="cancelForm">
    <h1>Đưa form vào đây</h1>
  </MyDrawer>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { Card, Button } from 'primevue'
import MyDrawer from '@/components/drawer/MyDrawer.vue'
// Fetch user data
const authStore = useAuthStore()
const visibleLeft = ref(false)
const isEditing = ref(true)


onMounted(() => {
  authStore.fetchUser()
})

const cancelForm = () => {
  visibleLeft.value = false
}

</script>
